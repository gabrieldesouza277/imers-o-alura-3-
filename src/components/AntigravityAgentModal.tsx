import React, { useState } from 'react';
import { Task, TaskPriority, TaskCategory } from '../types';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  X, 
  Layers, 
  Terminal, 
  Cpu, 
  Database, 
  Shield, 
  Activity, 
  CheckCircle2, 
  Loader2, 
  Clock, 
  Code2, 
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';

interface AntigravityAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (newTasks: Task[]) => void;
}

const PRESET_GOALS = [
  'Implementar autenticação OAuth2 com JWT e rotação de Refresh Token',
  'Configurar pipeline CI/CD no Cloud Run com Dockerfile multi-stage',
  'Criar sistema de cache distribuído com Redis e métricas Prometheus',
  'Refatorar banco de dados PostgreSQL com índices e queries otimizadas',
  'Construir serviço de streaming em tempo real com WebSockets e fallback',
  'Integrar Antigravity Agent para revisão automatizada de Pull Requests',
];

const AVAILABLE_STACK = [
  'TypeScript', 'React', 'Node.js', 'Express', 'Docker', 'PostgreSQL', 
  'Redis', 'Python', 'Cloud Run', 'Tailwind', 'GraphQL', 'Next.js', 'Vitest'
];

export const AntigravityAgentModal: React.FC<AntigravityAgentModalProps> = ({
  isOpen,
  onClose,
  onAddTasks,
}) => {
  const [objective, setObjective] = useState('');
  const [selectedTech, setSelectedTech] = useState<string[]>(['TypeScript', 'Node.js', 'Docker']);
  const [experienceLevel, setExperienceLevel] = useState<'junior' | 'pleno' | 'senior'>('senior');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTech = (tech: string) => {
    soundFx.playClick();
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleDecompose = async () => {
    if (!objective.trim()) return;

    soundFx.playZeroG();
    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedSummary(null);
    setGeneratedTasks([]);

    // Multi-stage simulated feedback for agent proof-of-work
    setLoadingStep(1);
    const stepInterval = setInterval(() => {
      setLoadingStep((s) => (s < 3 ? s + 1 : s));
    }, 1200);

    try {
      const response = await fetch('/api/antigravity/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective,
          techStack: selectedTech,
          experienceLevel,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao processar com Antigravity Agent.');
      }

      const data = await response.json();
      setGeneratedSummary(data.summary || 'Decomposição de engenharia gerada com sucesso.');

      const mappedTasks: Task[] = (data.tasks || []).map((t: any, idx: number) => ({
        id: `ai-task-${Date.now()}-${idx}`,
        title: t.title,
        description: t.description || '',
        status: 'todo',
        priority: (['p1', 'p2', 'p3', 'p4'].includes(t.priority) ? t.priority : 'p2') as TaskPriority,
        category: (['frontend', 'backend', 'devops', 'ai', 'database', 'security', 'testing'].includes(t.category)
          ? t.category
          : 'backend') as TaskCategory,
        tags: Array.isArray(t.tags) ? t.tags : selectedTech.slice(0, 3),
        estimatedHours: typeof t.estimatedHours === 'number' ? t.estimatedHours : 2,
        subtasks: Array.isArray(t.subtasks)
          ? t.subtasks.map((st: string, sIdx: number) => ({
              id: `st-ai-${Date.now()}-${sIdx}`,
              title: st,
              completed: false,
            }))
          : [],
        codeSnippetPreview: t.codeSnippetPreview,
        createdAt: new Date().toISOString(),
      }));

      setGeneratedTasks(mappedTasks);
      setSelectedIndices(new Set(mappedTasks.map((_, i) => i)));
      soundFx.playComplete();
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error(err);
      setErrorMessage(err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectTask = (index: number) => {
    soundFx.playClick();
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleApplyTasks = () => {
    const tasksToAdd = generatedTasks.filter((_, idx) => selectedIndices.has(idx));
    if (tasksToAdd.length === 0) return;

    soundFx.playComplete();
    confetti({ particleCount: 60, spread: 80 });
    onAddTasks(tasksToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-950 rounded-3xl border border-cyan-500/40 w-full max-w-3xl overflow-hidden shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Google Antigravity Agent
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Dev na Era da IA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Decomponha metas complexas em tarefas de engenharia executáveis, com estimativas e checklist.
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Objective Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Meta ou Épico de Desenvolvimento:</span>
              <span className="text-[11px] text-cyan-400 font-normal">Ex: Microsserviço, Migração, CI/CD</span>
            </label>
            <textarea
              rows={3}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Descreva o que deseja construir (ex: 'Criar pipeline CI/CD no Cloud Run com Dockerfile multi-stage e testes automatizados no GitHub Actions')..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Metas sugeridas para Dev na Era da IA:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_GOALS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    soundFx.playClick();
                    setObjective(preset);
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors text-left"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Stack Tecnológica Envolvida:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_STACK.map((tech) => {
                const isSelected = selectedTech.includes(tech);
                return (
                  <button
                    key={tech}
                    onClick={() => toggleTech(tech)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {tech}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience level & Action trigger */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-850">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Nível do Squad:</span>
              {(['junior', 'pleno', 'senior'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setExperienceLevel(lvl)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium uppercase transition-colors ${
                    experienceLevel === lvl
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              disabled={isLoading || !objective.trim()}
              onClick={handleDecompose}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Decompondo com Antigravity...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Decompor Meta com Antigravity Agent</span>
                </>
              )}
            </button>
          </div>

          {/* Loading States indicator */}
          {isLoading && (
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-cyan-500/30 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>
                  {loadingStep === 1
                    ? 'Agente Antigravity conectando ao ambiente e analisando arquitetura...'
                    : loadingStep === 2
                    ? 'Determinando dependências técnicas, prioridades P1-P4 e horas...'
                    : 'Gerando checklist de validação e snippets de código...'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-700"
                  style={{ width: `${(loadingStep / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Error notice */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Generated Results Review */}
          {generatedTasks.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in">
              {generatedSummary && (
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200">
                  <strong>Estratégia Arquitetural:</strong> {generatedSummary}
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Tarefas Propostas ({selectedIndices.size}/{generatedTasks.length} selecionadas):
                </h3>
                <button
                  onClick={() => {
                    if (selectedIndices.size === generatedTasks.length) {
                      setSelectedIndices(new Set());
                    } else {
                      setSelectedIndices(new Set(generatedTasks.map((_, i) => i)));
                    }
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  {selectedIndices.size === generatedTasks.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                </button>
              </div>

              <div className="space-y-3">
                {generatedTasks.map((task, idx) => {
                  const isChecked = selectedIndices.has(idx);
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleSelectTask(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-slate-900/90 border-cyan-500/40'
                          : 'bg-slate-950 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                              isChecked
                                ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                                : 'border-slate-700 bg-slate-900'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {task.priority.toUpperCase()}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-950 text-cyan-400 border border-slate-800">
                              {task.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" /> ~{task.estimatedHours}h
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-semibold text-white">
                            {task.title}
                          </h4>

                          <p className="text-xs text-slate-400 leading-relaxed">
                            {task.description}
                          </p>

                          {/* Subtasks checklist preview */}
                          {task.subtasks.length > 0 && (
                            <div className="pt-1 space-y-1">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">
                                Checklist:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-400">
                                {task.subtasks.map((st) => (
                                  <div key={st.id} className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    <span className="truncate">{st.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {generatedTasks.length > 0 && (
          <div className="p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              {selectedIndices.size} tarefas prontas para serem inseridas no quadro.
            </span>
            <button
              onClick={handleApplyTasks}
              disabled={selectedIndices.size === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Adicionar Selecionadas ao Quadro</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
