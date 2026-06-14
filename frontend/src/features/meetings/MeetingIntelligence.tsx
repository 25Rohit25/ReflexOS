import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/api/axios';
import { Button } from '@/components/ui/Button';

interface TaskResponse {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface MeetingResponse {
  summary: string;
  actionItems: TaskResponse[];
}

export const MeetingIntelligence: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MeetingResponse | null>(null);

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await api.post(`/projects/${projectId}/ai/meeting`, {
        transcript
      });
      setResult(response.data);
      setTranscript('');
    } catch (err) {
      console.error('Failed to analyze meeting', err);
      // fallback error
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Meeting Intelligence 🎙️</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Paste your meeting transcripts below. The AI will summarize the meeting and automatically generate action items on your Task Board.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col h-[600px]">
          <h3 className="text-lg font-semibold mb-3 text-foreground">Raw Transcript</h3>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste transcript here...&#10;&#10;e.g.&#10;Alice: I will review the API design.&#10;Bob: Great, I'll update the database schema."
            className="flex-1 bg-background border border-input rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none mb-4"
            disabled={isAnalyzing}
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !transcript.trim()}
            className="w-full"
          >
            {isAnalyzing ? "Analyzing Meeting..." : "Analyze & Extract Action Items"}
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col h-[600px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3 text-foreground">AI Intelligence Report</h3>
          
          {isAnalyzing && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              <span className="animate-pulse">The AI is thinking...</span>
            </div>
          )}

          {!isAnalyzing && !result && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              <span className="opacity-50 text-center">Run an analysis to see the executive summary and extracted tasks.</span>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Executive Summary</h4>
                <div className="bg-muted/30 p-4 rounded-lg text-sm text-foreground leading-relaxed whitespace-pre-wrap border border-border">
                  {result.summary}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Action Items ({result.actionItems.length})</h4>
                <div className="space-y-2">
                  {result.actionItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tasks extracted.</p>
                  ) : (
                    result.actionItems.map(task => (
                      <div key={task.id} className="bg-background border border-border p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Added to Task Board</p>
                        </div>
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] uppercase font-bold rounded">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
