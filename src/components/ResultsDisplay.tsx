import { ADHDAnalysis } from "@/types/game";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Target, 
  Zap,
  Eye,
  Activity,
  FileText
} from "lucide-react";

interface ResultsDisplayProps {
  analysis: ADHDAnalysis;
  onRestart: () => void;
}

export default function ResultsDisplay({ analysis, onRestart }: ResultsDisplayProps) {
  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case "High": return "text-destructive";
      case "Moderate": return "text-warning";
      case "Low": return "text-info";
      case "Unlikely": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  const getLikelihoodBg = (likelihood: string) => {
    switch (likelihood) {
      case "High": return "bg-destructive/10 border-destructive/30";
      case "Moderate": return "bg-warning/10 border-warning/30";
      case "Low": return "bg-info/10 border-info/30";
      case "Unlikely": return "bg-success/10 border-success/30";
      default: return "bg-muted/10 border-border";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Assessment Results
          </h1>
          <p className="text-muted-foreground">Comprehensive behavioral analysis completed</p>
        </div>

        {/* Overall Score Card */}
        <Card className={`p-8 border-2 ${getLikelihoodBg(analysis.adhdLikelihood)} shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">ADHD Likelihood Assessment</h2>
              <p className="text-muted-foreground">Based on behavioral pattern analysis</p>
            </div>
            <div className={`text-5xl font-bold ${getLikelihoodColor(analysis.adhdLikelihood)}`}>
              {analysis.overallScore}%
            </div>
          </div>
          
          <div className="mb-4">
            <Progress value={analysis.overallScore} className="h-3" />
          </div>
          
          <div className="flex items-center gap-2">
            {analysis.adhdLikelihood === "High" || analysis.adhdLikelihood === "Moderate" ? (
              <AlertCircle className="w-5 h-5 text-warning" />
            ) : (
              <CheckCircle className="w-5 h-5 text-success" />
            )}
            <span className="text-lg font-semibold">
              Result: <span className={getLikelihoodColor(analysis.adhdLikelihood)}>
                {analysis.adhdLikelihood} Likelihood
              </span>
            </span>
          </div>
        </Card>

        {/* Category Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Inattention */}
          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Inattention</h3>
                <p className="text-sm text-muted-foreground">Focus and concentration patterns</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span>Score</span>
                <span className="font-semibold">{analysis.categories.inattention.score}%</span>
              </div>
              <Progress value={analysis.categories.inattention.score} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">{analysis.categories.inattention.description}</p>
            <ul className="space-y-2">
              {analysis.categories.inattention.indicators.map((indicator, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Impulsivity */}
          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Impulsivity</h3>
                <p className="text-sm text-muted-foreground">Response control analysis</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span>Score</span>
                <span className="font-semibold">{analysis.categories.impulsivity.score}%</span>
              </div>
              <Progress value={analysis.categories.impulsivity.score} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">{analysis.categories.impulsivity.description}</p>
            <ul className="space-y-2">
              {analysis.categories.impulsivity.indicators.map((indicator, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-warning mt-1">•</span>
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Hyperactivity */}
          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Hyperactivity</h3>
                <p className="text-sm text-muted-foreground">Movement and response patterns</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span>Score</span>
                <span className="font-semibold">{analysis.categories.hyperactivity.score}%</span>
              </div>
              <Progress value={analysis.categories.hyperactivity.score} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">{analysis.categories.hyperactivity.description}</p>
            <ul className="space-y-2">
              {analysis.categories.hyperactivity.indicators.map((indicator, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-secondary mt-1">•</span>
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Sustained Attention */}
          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Sustained Attention</h3>
                <p className="text-sm text-muted-foreground">Long-term focus capability</p>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span>Score</span>
                <span className="font-semibold">{analysis.categories.sustainedAttention.score}%</span>
              </div>
              <Progress value={analysis.categories.sustainedAttention.score} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">{analysis.categories.sustainedAttention.description}</p>
            <ul className="space-y-2">
              {analysis.categories.sustainedAttention.indicators.map((indicator, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h3 className="font-semibold">Reaction Time</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Average</span>
                <span className="font-semibold">{analysis.reactionTimeAnalysis.average}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Consistency</span>
                <span className="font-semibold">{analysis.reactionTimeAnalysis.consistency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pattern</span>
                <span className="font-semibold">{analysis.reactionTimeAnalysis.pattern}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-success" />
              <h3 className="font-semibold">Accuracy Metrics</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Hit Rate</span>
                  <span className="font-semibold">{analysis.accuracyMetrics.hitRate}%</span>
                </div>
                <Progress value={analysis.accuracyMetrics.hitRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Miss Rate</span>
                  <span className="font-semibold">{analysis.accuracyMetrics.missRate}%</span>
                </div>
                <Progress value={analysis.accuracyMetrics.missRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">False Positive Rate</span>
                  <span className="font-semibold">{analysis.accuracyMetrics.falsePositiveRate}%</span>
                </div>
                <Progress value={analysis.accuracyMetrics.falsePositiveRate} className="h-2" />
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-info" />
              <h3 className="font-semibold">Recommendations</h3>
            </div>
            <ul className="space-y-2">
              {analysis.recommendations.slice(0, 3).map((rec, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-info mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Clinical Notes */}
        <Card className="p-6 bg-muted/30 shadow-lg">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Clinical Analysis
          </h3>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
            {analysis.clinicalNotes}
          </p>
        </Card>

        {/* Full Recommendations */}
        {analysis.recommendations.length > 3 && (
          <Card className="p-6 shadow-lg">
            <h3 className="font-semibold text-lg mb-4">Detailed Recommendations</h3>
            <ul className="space-y-3">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="p-6 bg-warning/5 border-warning/30 shadow-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-2">Important Medical Disclaimer</p>
              <p className="text-muted-foreground leading-relaxed">
                This assessment is a screening tool designed to identify patterns that may be consistent with ADHD. 
                It is <strong>not a diagnostic instrument</strong> and should not replace professional medical evaluation. 
                If results suggest ADHD likelihood, please consult with a qualified healthcare provider, psychologist, 
                or psychiatrist for comprehensive evaluation and proper diagnosis. ADHD diagnosis requires thorough 
                clinical assessment including medical history, behavioral observations, and standardized diagnostic criteria.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-4">
          <Button 
            onClick={onRestart}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg"
          >
            Take Assessment Again
          </Button>
        </div>
      </div>
    </div>
  );
}
