import { useEffect, useState, useRef, useCallback } from "react";
import { Target, ClickData, GameSession } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface GameCanvasProps {
  onGameComplete: (session: GameSession) => void;
}

const GAME_DURATION = 60000; // 60 seconds
const TARGET_LIFETIME = 1500; // 1.5 seconds
const TARGET_SPAWN_INTERVAL = 1200; // 1.2 seconds
const MIN_REACTION_TIME = 100; // Minimum realistic reaction time
const TOTAL_TARGETS = Math.floor(GAME_DURATION / TARGET_SPAWN_INTERVAL);

export default function GameCanvas({ onGameComplete }: GameCanvasProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [clicks, setClicks] = useState<ClickData[]>([]);
  const [missedTargets, setMissedTargets] = useState(0);
  const [falseClicks, setFalseClicks] = useState(0);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const startTimeRef = useRef<number>(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // Use refs to track latest values for game completion
  const targetsRef = useRef<Target[]>([]);
  const clicksRef = useRef<ClickData[]>([]);
  const missedTargetsRef = useRef<number>(0);
  const falseClicksRef = useRef<number>(0);

  // Update refs whenever state changes
  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  useEffect(() => {
    clicksRef.current = clicks;
  }, [clicks]);

  useEffect(() => {
    missedTargetsRef.current = missedTargets;
  }, [missedTargets]);

  useEffect(() => {
    falseClicksRef.current = falseClicks;
  }, [falseClicks]);

  const generateRandomPosition = useCallback(() => {
    const padding = 60;
    const container = gameContainerRef.current;
    if (!container) return { x: 50, y: 50 };
    
    const maxX = container.clientWidth - padding * 2;
    const maxY = container.clientHeight - padding * 2;
    
    return {
      x: Math.random() * maxX + padding,
      y: Math.random() * maxY + padding,
    };
  }, []);

  const spawnTarget = useCallback(() => {
    const position = generateRandomPosition();
    const newTarget: Target = {
      id: `target-${Date.now()}-${Math.random()}`,
      ...position,
      spawnTime: Date.now(),
    };
    
    setTargets(prev => [...prev, newTarget]);
    
    // Remove target after lifetime
    setTimeout(() => {
      setTargets(prev => {
        const target = prev.find(t => t.id === newTarget.id);
        if (target && !target.clicked) {
          setMissedTargets(m => m + 1);
        }
        return prev.filter(t => t.id !== newTarget.id);
      });
    }, TARGET_LIFETIME);
  }, [generateRandomPosition]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStarted) return;
    
    const rect = gameContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const clickTime = Date.now();
    
    // Check if click hit any target
    const hitTarget = targets.find(target => {
      const distance = Math.sqrt(
        Math.pow(clickX - target.x, 2) + Math.pow(clickY - target.y, 2)
      );
      return distance <= 30 && !target.clicked; // 30px radius
    });
    
    if (hitTarget) {
      const reactionTime = clickTime - hitTarget.spawnTime;
      
      // Check for impulsive (too fast) clicks
      if (reactionTime < MIN_REACTION_TIME) {
        setFalseClicks(f => f + 1);
      } else {
        setScore(s => s + 1);
      }
      
      setTargets(prev =>
        prev.map(t =>
          t.id === hitTarget.id
            ? { ...t, clicked: true, reactionTime }
            : t
        )
      );
      
      setClicks(prev => [
        ...prev,
        {
          x: clickX,
          y: clickY,
          timestamp: clickTime,
          targetId: hitTarget.id,
          reactionTime,
          isFalseClick: reactionTime < MIN_REACTION_TIME,
        },
      ]);
      
      // Remove clicked target
      setTimeout(() => {
        setTargets(prev => prev.filter(t => t.id !== hitTarget.id));
      }, 200);
    } else {
      // False click (no target)
      setFalseClicks(f => f + 1);
      setClicks(prev => [
        ...prev,
        {
          x: clickX,
          y: clickY,
          timestamp: clickTime,
          isFalseClick: true,
        },
      ]);
    }
  }, [gameStarted, targets]);

  const startGame = useCallback(() => {
    setShowInstructions(false);
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(countdownInterval);
        setGameStarted(true);
        startTimeRef.current = Date.now();
        spawnTarget();
      }
    }, 1000);
  }, [spawnTarget]);

  useEffect(() => {
    if (!gameStarted) return;

    const spawnInterval = setInterval(spawnTarget, TARGET_SPAWN_INTERVAL);
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = (elapsed / GAME_DURATION) * 100;
      setProgress(newProgress);
      
      if (elapsed >= GAME_DURATION) {
        clearInterval(spawnInterval);
        clearInterval(progressInterval);
        
        // Use refs to get the latest values
        const session: GameSession = {
          targets: targetsRef.current.map(t => ({ ...t })),
          clicks: [...clicksRef.current],
          missedTargets: missedTargetsRef.current,
          falseClicks: falseClicksRef.current,
          startTime: startTimeRef.current,
          endTime: Date.now(),
        };
        
        onGameComplete(session);
      }
    }, 100);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(progressInterval);
    };
  }, [gameStarted, spawnTarget, onGameComplete]);

  if (showInstructions) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] p-8 max-w-2xl w-full border border-border">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              ADHD Attention Screening
            </h1>
            <p className="text-muted-foreground">Interactive assessment tool for attention patterns</p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">1</span>
                How It Works
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Circular targets will appear randomly on screen for 1.5 seconds. Click them as quickly and accurately as possible.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm">2</span>
                What We Measure
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Reaction time and consistency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Accuracy and impulse control</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Sustained attention over 60 seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Pattern analysis for ADHD indicators</span>
                </li>
              </ul>
            </div>

            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <span className="font-semibold">Important:</span> This is a screening tool, not a diagnostic test. 
                Results should be discussed with a qualified healthcare professional.
              </p>
            </div>
          </div>

          <Button 
            onClick={startGame} 
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-[var(--shadow-game)]"
          >
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  if (countdown > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/30">
        <div className="text-center">
          <div className="text-9xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
            {countdown}
          </div>
          <p className="text-xl text-muted-foreground mt-4">Get ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Game Stats Header */}
      <div className="absolute top-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-b border-border p-4 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{score}</div>
                <div className="text-xs text-muted-foreground">Hits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{missedTargets}</div>
                <div className="text-xs text-muted-foreground">Missed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{falseClicks}</div>
                <div className="text-xs text-muted-foreground">False Clicks</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">
                Progress
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Game Canvas */}
      <div
        ref={gameContainerRef}
        onClick={handleClick}
        className="absolute inset-0 cursor-crosshair"
        style={{ paddingTop: '80px' }}
      >
        {targets.map(target => (
          <div
            key={target.id}
            className={`absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
              target.clicked ? 'scale-0' : 'scale-100'
            }`}
            style={{
              left: `${target.x}px`,
              top: `${target.y}px`,
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-game)] animate-pulse flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
