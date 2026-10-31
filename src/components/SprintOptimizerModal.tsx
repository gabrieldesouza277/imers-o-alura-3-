import React, { useState, useEffect } from 'react';
import { Task, SprintOptimizationResult } from '../types';
import { soundFx } from '../utils/audio';
import { 
  Zap, 
  X, 
  Loader2, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ArrowRight,
  Flame
} from 'lucide-react';

interface SprintOptimizerModalProps {
  isOpen: boolean;
  tasks: Task[];
  onClose: () => void;
  onSelectTask: (task: Task) => void;
}

export const SprintOptimizerModal: React.FC<SprintOptimizerModalProps> = ({
  isOpen,
  tasks,
  onClose,
  onSelectTask,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [optimization, setOptimization] = useState<SprintOptimizationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !optimization) {
      handleRunOptimization();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunOptimization = async () => {
    soundFx.playPop();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/antigravity/optimize-sprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Falha ao analisar sprint.');
      }

      const data: SprintOptimizationResult = await response.json();
      setOptimization(data);
      soundFx.playComplete();
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'Erro ao otimizar sprint com Antigravity.');
    } finally {
      setIsLoading(false);
    }
  };

  const recommendedTasks = (optimization?.recommendedOrderIds || [])
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is Task => Boolean(t));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-950 rounded-3xl border border-amber-500/40 w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Otimizador de Sprint Antigravity
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Dev Flow State
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Diagnóstico de gargalos, ordenação por valor de entrega e recomendações de fluxo de trabalho.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-xs font-mono text-amber-300">
                Antigravity Agent calculando dependências críticas e ordenando sprint...
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {optimization && !isLoading && (
            <div className="space-y-6 animate-in fade-in">
              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" /> Diagnóstico Executivo da Sprint
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {optimization.executiveSummary}
                </p>
              </div>

              {/* Recommended Focus Strategy */}
              {optimization.focusStrategy && (
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 space-y-1.5">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-cyan-400" /> Estratégia de Foco Recomendada
                  </h4>
                  <p className="text-xs text-cyan-100 leading-relaxed">
                    {optimization.focusStrategy}
                  </p>
                </div>
              )}

              {/* Top Recommended Tasks to tackle */}
              {recommendedTasks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-400" /> Próximas 3 Tarefas de Maior Impacto:
                  </h4>
                  <div className="space-y-2">
                    {recommendedTasks.map((task, i) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          onSelectTask(task);
                          onClose();
                        }}
                        className="p-3 bg-slate-900/90 hover:bg-slate-900 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            #{i + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 uppercase">
                                {task.priority}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">
                                {task.category}
                              </span>
                            </div>
                            <h5 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                              {task.title}
                            </h5>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono text-slate-400">
                            ~{task.estimatedHours}h
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Productivity tips in AI Era */}
              {optimization.devProductivityTips && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Dicas de Produtividade (Dev na Era da IA)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {optimization.devProductivityTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleRunOptimization}
            disabled={isLoading}
            className="text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50"
          >
            Regerar Análise
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
