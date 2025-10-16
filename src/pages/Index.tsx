import { useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import ResultsDisplay from "@/components/ResultsDisplay";
import { GameSession, ADHDAnalysis } from "@/types/game";

const Index = () => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [analysis, setAnalysis] = useState<ADHDAnalysis | null>(null);

  const handleGameComplete = (session: GameSession) => {
    setGameSession(session);
    const analyzedResults = analyzeGameSession(session);
    setAnalysis(analyzedResults);
  };

  const handleRestart = () => {
    setGameSession(null);
    setAnalysis(null);
  };

  const analyzeGameSession = (session: GameSession): ADHDAnalysis => {
    const duration = session.endTime - session.startTime;
    const validClicks = session.clicks.filter(c => c.targetId && !c.isFalseClick);
    const reactionTimes = validClicks
      .map(c => c.reactionTime)
      .filter((rt): rt is number => rt !== undefined);

    // Calculate metrics
    const avgReactionTime = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    const rtVariance = reactionTimes.length > 1
      ? reactionTimes.reduce((sum, rt) => sum + Math.pow(rt - avgReactionTime, 2), 0) / reactionTimes.length
      : 0;
    const rtStdDev = Math.sqrt(rtVariance);

    const totalTargets = session.targets.length;
    const hits = validClicks.length;
    const misses = session.missedTargets;
    const falsePositives = session.falseClicks;

    const hitRate = totalTargets > 0 ? Math.round((hits / totalTargets) * 100) : 0;
    const missRate = totalTargets > 0 ? Math.round((misses / totalTargets) * 100) : 0;
    const falsePositiveRate = (hits + falsePositives) > 0
      ? Math.round((falsePositives / (hits + falsePositives)) * 100)
      : 0;

    // ADHD indicators
    const inattentionScore = Math.min(100, Math.round(
      (missRate * 0.6) + 
      (rtStdDev / 10) +
      ((avgReactionTime > 500 ? (avgReactionTime - 500) / 10 : 0))
    ));

    const impulsivityScore = Math.min(100, Math.round(
      (falsePositiveRate * 0.8) +
      ((avgReactionTime < 300 ? (300 - avgReactionTime) / 5 : 0))
    ));

    const hyperactivityScore = Math.min(100, Math.round(
      (falsePositiveRate * 0.5) +
      (rtStdDev / 8)
    ));

    const sustainedAttentionScore = Math.min(100, Math.round(
      (missRate * 0.5) +
      (rtStdDev / 12) +
      ((100 - hitRate) * 0.3)
    ));

    const overallScore = Math.round(
      (inattentionScore * 0.35) +
      (impulsivityScore * 0.25) +
      (hyperactivityScore * 0.2) +
      (sustainedAttentionScore * 0.2)
    );

    let adhdLikelihood: "High" | "Moderate" | "Low" | "Unlikely";
    if (overallScore >= 70) adhdLikelihood = "High";
    else if (overallScore >= 50) adhdLikelihood = "Moderate";
    else if (overallScore >= 30) adhdLikelihood = "Low";
    else adhdLikelihood = "Unlikely";

    // Generate indicators
    const getInattentionIndicators = () => {
      const indicators: string[] = [];
      if (missRate > 30) indicators.push("High frequency of missed targets");
      if (avgReactionTime > 500) indicators.push("Slower than average reaction time");
      if (rtStdDev > 150) indicators.push("Inconsistent response patterns");
      if (hitRate < 60) indicators.push("Difficulty maintaining focus on target");
      return indicators.length > 0 ? indicators : ["No significant inattention patterns detected"];
    };

    const getImpulsivityIndicators = () => {
      const indicators: string[] = [];
      if (falsePositiveRate > 20) indicators.push("High rate of impulsive responses");
      if (avgReactionTime < 300) indicators.push("Unusually fast reaction times suggesting premature responses");
      const veryFastClicks = reactionTimes.filter(rt => rt < 200).length;
      if (veryFastClicks > 3) indicators.push("Multiple instances of anticipatory clicking");
      return indicators.length > 0 ? indicators : ["Good impulse control demonstrated"];
    };

    const getHyperactivityIndicators = () => {
      const indicators: string[] = [];
      if (falsePositiveRate > 25) indicators.push("Excessive motor activity indicated by false clicks");
      if (rtStdDev > 200) indicators.push("Highly variable response patterns");
      if (session.clicks.length > totalTargets * 1.5) indicators.push("Restless clicking behavior observed");
      return indicators.length > 0 ? indicators : ["No hyperactivity patterns detected"];
    };

    const getSustainedAttentionIndicators = () => {
      const indicators: string[] = [];
      if (missRate > 25) indicators.push("Difficulty sustaining attention over time");
      if (rtStdDev > 180) indicators.push("Declining consistency throughout task");
      
      // Check if performance deteriorated over time
      const firstHalfClicks = validClicks.slice(0, Math.floor(validClicks.length / 2));
      const secondHalfClicks = validClicks.slice(Math.floor(validClicks.length / 2));
      const firstHalfAvg = firstHalfClicks.length > 0
        ? firstHalfClicks.reduce((sum, c) => sum + (c.reactionTime || 0), 0) / firstHalfClicks.length
        : 0;
      const secondHalfAvg = secondHalfClicks.length > 0
        ? secondHalfClicks.reduce((sum, c) => sum + (c.reactionTime || 0), 0) / secondHalfClicks.length
        : 0;
      
      if (secondHalfAvg > firstHalfAvg * 1.2) {
        indicators.push("Performance decline noted in second half of assessment");
      }
      
      return indicators.length > 0 ? indicators : ["Good sustained attention throughout task"];
    };

    // Generate recommendations
    const recommendations: string[] = [];
    if (overallScore >= 50) {
      recommendations.push("Consider consulting with a healthcare professional specializing in ADHD for comprehensive evaluation");
      recommendations.push("Keep a journal tracking attention difficulties and their impact on daily activities");
    }
    if (inattentionScore > 50) {
      recommendations.push("Implement organizational strategies such as checklists and reminders");
      recommendations.push("Break tasks into smaller, manageable segments");
    }
    if (impulsivityScore > 50) {
      recommendations.push("Practice mindfulness and pause techniques before responding");
      recommendations.push("Consider cognitive behavioral therapy for impulse control");
    }
    if (sustainedAttentionScore > 50) {
      recommendations.push("Use timers and structured breaks to maintain focus");
      recommendations.push("Minimize distractions in work/study environments");
    }
    if (overallScore < 30) {
      recommendations.push("Results suggest no significant ADHD patterns");
      recommendations.push("Continue maintaining healthy attention practices");
    }

    const consistency = rtStdDev < 100 ? "Excellent" : rtStdDev < 150 ? "Good" : rtStdDev < 200 ? "Fair" : "Variable";
    const pattern = avgReactionTime < 350 ? "Fast responder" : avgReactionTime < 450 ? "Average responder" : "Deliberate responder";

    return {
      overallScore,
      adhdLikelihood,
      categories: {
        inattention: {
          score: inattentionScore,
          description: inattentionScore > 60
            ? "Significant patterns of inattention observed"
            : inattentionScore > 40
            ? "Moderate inattention indicators present"
            : "Attention levels within normal range",
          indicators: getInattentionIndicators(),
        },
        impulsivity: {
          score: impulsivityScore,
          description: impulsivityScore > 60
            ? "Notable impulsive response patterns detected"
            : impulsivityScore > 40
            ? "Some impulsivity indicators observed"
            : "Good impulse control maintained",
          indicators: getImpulsivityIndicators(),
        },
        hyperactivity: {
          score: hyperactivityScore,
          description: hyperactivityScore > 60
            ? "Hyperactive response patterns identified"
            : hyperactivityScore > 40
            ? "Mild hyperactivity indicators present"
            : "Motor control within expected range",
          indicators: getHyperactivityIndicators(),
        },
        sustainedAttention: {
          score: sustainedAttentionScore,
          description: sustainedAttentionScore > 60
            ? "Challenges with sustained attention observed"
            : sustainedAttentionScore > 40
            ? "Moderate sustained attention concerns"
            : "Good sustained attention capacity",
          indicators: getSustainedAttentionIndicators(),
        },
      },
      reactionTimeAnalysis: {
        average: avgReactionTime,
        consistency,
        pattern,
      },
      accuracyMetrics: {
        hitRate,
        missRate,
        falsePositiveRate,
      },
      recommendations,
      clinicalNotes: `Assessment completed over ${Math.round(duration / 1000)} seconds with ${totalTargets} target presentations. 
Performance analysis reveals ${adhdLikelihood.toLowerCase()} likelihood of ADHD-related attention patterns based on 
reaction time consistency (${consistency.toLowerCase()}), accuracy metrics (${hitRate}% hit rate), and response control 
(${falsePositiveRate}% false positive rate).

Key observations: ${avgReactionTime}ms average reaction time with ${Math.round(rtStdDev)}ms standard deviation indicates 
${consistency.toLowerCase()} response consistency. The ${pattern.toLowerCase()} profile combined with behavioral patterns 
suggests ${adhdLikelihood === "High" || adhdLikelihood === "Moderate" 
  ? "further professional evaluation may be beneficial" 
  : "no immediate concerns regarding ADHD symptoms"}.

This screening tool measures sustained attention, impulse control, and response variability which are core components 
in ADHD assessment. However, clinical diagnosis requires comprehensive evaluation including developmental history, 
symptom duration, and functional impairment across multiple settings.`,
    };
  };

  if (analysis && gameSession) {
    return <ResultsDisplay analysis={analysis} onRestart={handleRestart} />;
  }

  return <GameCanvas onGameComplete={handleGameComplete} />;
};

export default Index;
