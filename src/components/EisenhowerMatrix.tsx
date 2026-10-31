import React from 'react';
import { Task } from '../types';
import { soundFx } from '../utils/audio';
import { 
  AlertOctagon, 
  Target, 
  Clock, 
  Archive, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenDevCopilot: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

export const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({
  tasks,
  onSelectTask,
  onOpenDevCopilot,
  onToggleComplete,
}) => {
  // Q1: Urgente & Importante (P1)
  const q1Tasks = tasks.filter((t) => t.priority === 'p1');

  // Q2: Não Urgente, mas Estratégico (P2 - Alta prioridade / Arquitetura / Features)
  const q2Tasks = tasks.filter((t) => t.priority === 'p2');

  // Q3: Urgente, mas Operacional (P3 - Média / Hot fixes rápidos / DevOps)
  const q3Tasks = tasks.filter((t) => t.priority === 'p3');

  // Q4: Baixo Impacto / Backlog Gelado (P4 - Baixa)
  const q4Tasks = tasks.filter((t) => t.priority === 'p4');

  const quadrants = [
    {
      title: 'Q1: Crítico & Imediato',
      subtitle: 'Blockers, Vulnerabilidades e Falhas de Produção',
      icon: <AlertOctagon className="w-4 h-4 text-red-400" />,
      border: 'border-red-500/30',
      headerBg: 'bg-red-950/40 text-red-300',
      tasks: q1Tasks,
      badge: 'P1 CRÍTICA',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      advice: 'Aja agora. Não delegue nem adie.',
    },
    {
      title: 'Q2: Estratégico & Alto Impacto',
      subtitle: 'Arquitetura, Automação IA, Refatoração & Testes',
      icon: <Target className="w-4 h-4 text-cyan-400" />,
      border: 'border-cyan-500/30',
      headerBg: 'bg-cyan-950/40 text-cyan-300',
      tasks: q2Tasks,
      badge: 'P2 ALTA',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      advice: 'Zona de excelência do dev na Era da IA. Agende blocos de foco.',
    },
    {
      title: 'Q3: Operacional & Rotina',
      subtitle: 'Tarefas de manutenção, bumps de versão e suporte',
      icon: <Clock className="w-4 h-4 text-blue-400" />,
      border: 'border-blue-500/30',
      headerBg: 'bg-blue-950/40 text-blue-300',
      tasks: q3Tasks,
      badge: 'P3 MÉDIA',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      advice: 'Automatize com scripts ou resolva em lotes rápidos.',
    },
    {
      title: 'Q4: Baixo Impacto / Experimental',
      subtitle: 'Ideias secundárias e backlog de baixa prioridade',
      icon: <Archive className="w-4 h-4 text-slate-400" />,
      border: 'border-slate-700/50',
      headerBg: 'bg-slate-900/60 text-slate-300',
      tasks: q4Tasks,
      badge: 'P4 BAIXA',
      badgeColor: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      advice: 'Elimine ou mantenha em segundo plano.',
    },
  ];

  return (
    <div className="w-full space-y-4 pb-12">
      {/* Matrix Header Banner */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Matriz de Impacto e Priorização Dev (Eisenhower)
          </h2>
          <p className="text-xs text-slate-400">
            Organize suas tarefas de engenharia pelo impacto real no produto e urgência de entrega.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="text-cyan-400 font-bold">{q2Tasks.length}</span> tarefas estratégicas Q2
        </div>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {quadrants.map((quad, idx) => (
          <div
            key={idx}
            className={`bg-slate-950/80 rounded-2xl border ${quad.border} p-4 flex flex-col min-h-[380px] shadow-lg`}
          >
            {/* Header */}
            <div className={`p-3 rounded-xl ${quad.headerBg} mb-3 flex items-start justify-between gap-2`}>
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{quad.icon}</div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">{quad.title}</h3>
                  <p className="text-[11px] opacity-80">{quad.subtitle}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${quad.badgeColor}`}>
                {quad.tasks.length} tarefas
              </span>
            </div>

            {/* Strategic Advice */}
            <div className="text-[10px] text-slate-500 mb-2 italic px-1">
              💡 {quad.advice}
            </div>

            {/* Tasks in Quadrant */}
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
              {quad.tasks.length === 0 ? (
                <div className="h-32 border border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-slate-600 text-xs">
                  Nenhuma tarefa neste quadrante
                </div>
              ) : (
                quad.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-3 bg-slate-900/80 hover:bg-slate-900 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(task.id);
                        }}
                        className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            task.status === 'done' ? 'text-emerald-400' : 'text-slate-600'
                          }`}
                        />
                      </button>

                      <div className="min-w-0">
                        <h4
                          className={`text-xs font-semibold truncate ${
                            task.status === 'done'
                              ? 'line-through text-slate-500'
                              : 'text-slate-200 group-hover:text-cyan-300'
                          }`}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                          <span className="uppercase text-cyan-400">{task.category}</span>
                          <span>•</span>
                          <span>{task.estimatedHours}h est.</span>
                          {task.subtasks.length > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} checks
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Copilot Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playPop();
                        onOpenDevCopilot(task);
                      }}
                      title="Resolver com Antigravity Copilot"
                      className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 transition-colors shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
