import React, { useState } from 'react';
import { Task, CopilotSolution } from '../types';
import { soundFx } from '../utils/audio';
import { 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  ShieldCheck, 
  Lightbulb, 
  Loader2, 
  Send, 
  Save 
} from 'lucide-react';

interface DevCopilotModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateTaskSnippet: (taskId: string, snippet: string) => void;
}

export const DevCopilotModal: React.FC<DevCopilotModalProps> = ({
  task,
  onClose,
  onUpdateTaskSnippet,
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<CopilotSolution | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [snippetSaved, setSnippetSaved] = useState(false);

  if (!task) return null;

  const handleGenerateSolution = async () => {
    soundFx.playPop();
    setIsLoading(true);
    setErrorMessage(null);
    setCopiedCode(false);
    setSnippetSaved(false);

    try {
      const response = await fetch('/api/antigravity/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDescription: task.description,
          category: task.category,
          tags: task.tags,
          userQuery: userQuery.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Falha ao consultar Dev Copilot.');
      }

      const data: CopilotSolution = await response.json();
      setSolution(data);
      soundFx.playComplete();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao processar solicitação.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCodeToClipboard = () => {
    if (!solution?.implementationCode) return;
    navigator.clipboard.writeText(solution.implementationCode);
    setCopiedCode(true);
    soundFx.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const saveSnippetToTask = () => {
    if (!solution?.implementationCode) return;
    onUpdateTaskSnippet(task.id, solution.implementationCode);
    setSnippetSaved(true);
    soundFx.playClick();
    setTimeout(() => setSnippetSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-950 rounded-3xl border border-purple-500/40 w-full max-w-3xl overflow-hidden shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Antigravity Dev Copilot
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Resolução Autônoma
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Solução arquitetural, código de produção e comandos de terminal para sua tarefa.
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
          {/* Target Task Summary Card */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/40 uppercase">
                {task.category}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {task.priority.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {task.estimatedHours}h est.
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-white">
              {task.title}
            </h3>

            {task.description && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {task.description}
              </p>
            )}

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* User Prompt / Specific Question */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Orientação ou Dúvida Técnica Específica (Opcional):</span>
              <span className="text-[11px] text-purple-400">Ex: "Usar Zod para validação"</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Ex: Como lidar com race conditions? / Escreva a migração SQL correspondente..."
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
              />
              <button
                disabled={isLoading}
                onClick={handleGenerateSolution}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{solution ? 'Regerar' : 'Gerar Solução'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-xs font-mono text-purple-300">
                Antigravity Agent estruturando arquitetura e gerando código de produção...
              </p>
            </div>
          )}

          {/* Generated Solution */}
          {solution && !isLoading && (
            <div className="space-y-5 animate-in fade-in">
              {/* Architectural Advice */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-cyan-400" /> Recomendação Arquitetural Sênior
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {solution.architecturalAdvice}
                </p>
              </div>

              {/* Implementation Code */}
              {solution.implementationCode && (
                <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden space-y-0">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-purple-400" />
                      {solution.codeLanguage || 'código'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveSnippetToTask}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        {snippetSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{snippetSaved ? 'Salvo na Tarefa!' : 'Salvar no Card'}</span>
                      </button>
                      <button
                        onClick={copyCodeToClipboard}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copiado!' : 'Copiar Código'}</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto bg-slate-950 leading-relaxed max-h-[300px]">
                    <code>{solution.implementationCode}</code>
                  </pre>
                </div>
              )}

              {/* CLI Terminal Commands */}
              {solution.cliCommands && solution.cliCommands.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-amber-400" /> Comandos de Terminal
                  </h4>
                  <div className="space-y-1 font-mono text-xs">
                    {solution.cliCommands.map((cmd, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-950 text-slate-300 border border-slate-850 flex items-center justify-between"
                      >
                        <span className="text-cyan-400 mr-2">$</span>
                        <span className="flex-1 overflow-x-auto">{cmd}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(cmd);
                            soundFx.playClick();
                          }}
                          className="ml-2 text-slate-500 hover:text-white"
                          title="Copiar comando"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acceptance Criteria Checklist */}
              {solution.checklist && solution.checklist.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Checklist de Conclusão & Qualidade
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {solution.checklist.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Era Superpower Tip */}
              {solution.aiSuperpowerTip && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200">
                  <strong className="text-purple-300">⚡ Superpoder na Era da IA:</strong> {solution.aiSuperpowerTip}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
