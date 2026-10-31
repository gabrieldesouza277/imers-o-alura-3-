import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '../types';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Code2, 
  ChevronRight, 
  ChevronLeft, 
  CheckSquare, 
  MoreVertical,
  Shield,
  Layers,
  Cpu,
  Database,
  Terminal,
  Activity,
  Trash2
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onSelectTask: (task: Task) => void;
  onOpenNewTaskModalWithStatus: (status: TaskStatus) => void;
  onOpenDevCopilot: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

interface ColumnDef {
  id: TaskStatus;
  title: string;
  badgeColor: string;
  borderColor: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'todo', title: 'A Fazer (Backlog)', badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-600/40', borderColor: 'border-slate-800' },
  { id: 'in_progress', title: 'Em Progresso (Coding)', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', borderColor: 'border-cyan-900/30' },
  { id: 'review', title: 'Em Revisão (PR)', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30', borderColor: 'border-amber-900/30' },
  { id: 'done', title: 'Concluído (Shipped)', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', borderColor: 'border-emerald-900/30' },
];

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; icon: React.ReactNode; color: string }> = {
  frontend: { label: 'Frontend', icon: <Layers className="w-3 h-3" />, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' },
  backend: { label: 'Backend', icon: <Terminal className="w-3 h-3" />, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40' },
  devops: { label: 'DevOps', icon: <Activity className="w-3 h-3" />, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
  ai: { label: 'AI Agent', icon: <Cpu className="w-3 h-3" />, color: 'text-purple-400 bg-purple-950/40 border-purple-800/40' },
  database: { label: 'Database', icon: <Database className="w-3 h-3" />, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' },
  security: { label: 'Security', icon: <Shield className="w-3 h-3" />, color: 'text-red-400 bg-red-950/40 border-red-800/40' },
  testing: { label: 'Testing', icon: <CheckSquare className="w-3 h-3" />, color: 'text-pink-400 bg-pink-950/40 border-pink-800/40' },
};

const PRIORITY_BADGES: Record<TaskPriority, { label: string; bg: string; text: string }> = {
  p1: { label: 'P1 CRÍTICA', bg: 'bg-red-500/20', text: 'text-red-400 border-red-500/30' },
  p2: { label: 'P2 ALTA', bg: 'bg-orange-500/20', text: 'text-orange-400 border-orange-500/30' },
  p3: { label: 'P3 MÉDIA', bg: 'bg-blue-500/20', text: 'text-blue-400 border-blue-500/30' },
  p4: { label: 'P4 BAIXA', bg: 'bg-slate-500/20', text: 'text-slate-400 border-slate-500/30' },
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateTaskStatus,
  onSelectTask,
  onOpenNewTaskModalWithStatus,
  onOpenDevCopilot,
  onDeleteTask,
  onToggleSubtask,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStatus: TaskStatus) => {
    if (draggedTaskId) {
      onUpdateTaskStatus(draggedTaskId, targetStatus);
      if (targetStatus === 'done') {
        soundFx.playComplete();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } else {
        soundFx.playPop();
      }
      setDraggedTaskId(null);
    }
  };

  const cycleStatus = (taskId: string, current: TaskStatus, direction: 'next' | 'prev') => {
    const order: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
    const idx = order.indexOf(current);
    let nextIdx = direction === 'next' ? idx + 1 : idx - 1;
    if (nextIdx < 0) nextIdx = 0;
    if (nextIdx > order.length - 1) nextIdx = order.length - 1;

    const nextStatus = order[nextIdx];
    if (nextStatus !== current) {
      onUpdateTaskStatus(taskId, nextStatus);
      if (nextStatus === 'done') {
        soundFx.playComplete();
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      } else {
        soundFx.playClick();
      }
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-12">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        const columnHours = columnTasks.reduce((acc, t) => acc + t.estimatedHours, 0);

        return (
          <div
            key={column.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
            className={`flex flex-col bg-slate-900/60 backdrop-blur-md rounded-2xl border ${column.borderColor} p-3.5 min-h-[550px] transition-all`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${column.badgeColor}`}>
                  {columnTasks.length}
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {column.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-mono">
                  {columnHours}h
                </span>
                <button
                  onClick={() => onOpenNewTaskModalWithStatus(column.id)}
                  title={`Adicionar tarefa em ${column.title}`}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Task Cards Container */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {columnTasks.length === 0 ? (
                <div className="h-36 border border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-slate-600 text-xs">
                  <p>Nenhuma tarefa nesta etapa</p>
                  <button
                    onClick={() => onOpenNewTaskModalWithStatus(column.id)}
                    className="mt-2 text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const catConfig = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.backend;
                  const priorityConfig = PRIORITY_BADGES[task.priority];
                  const totalSubtasks = task.subtasks.length;
                  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className={`group relative bg-slate-950/80 hover:bg-slate-950 rounded-xl border border-slate-800/80 hover:border-cyan-500/40 p-3.5 shadow-md hover:shadow-cyan-500/10 transition-all cursor-grab active:cursor-grabbing ${
                        task.status === 'done' ? 'opacity-75' : ''
                      }`}
                    >
                      {/* Priority & Category Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${priorityConfig.bg} ${priorityConfig.text}`}
                          >
                            {priorityConfig.label}
                          </span>
                          <span
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${catConfig.color}`}
                          >
                            {catConfig.icon}
                            {catConfig.label}
                          </span>
                        </div>

                        {/* Status Nav Arrows */}
                        <div className="flex items-center opacity-40 group-hover:opacity-100 transition-opacity">
                          {task.status !== 'todo' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cycleStatus(task.id, task.status, 'prev');
                              }}
                              title="Mover para coluna anterior"
                              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {task.status !== 'done' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cycleStatus(task.id, task.status, 'next');
                              }}
                              title="Avançar status"
                              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Click to edit */}
                      <h4
                        onClick={() => onSelectTask(task)}
                        className={`text-xs font-semibold text-slate-100 hover:text-cyan-300 transition-colors cursor-pointer leading-snug mb-1.5 ${
                          task.status === 'done' ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Description excerpt */}
                      {task.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mb-2.5">
                          {task.description}
                        </p>
                      )}

                      {/* Code Snippet Tag Indicator if present */}
                      {task.codeSnippetPreview && (
                        <div className="mb-2 flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800/30 font-mono">
                          <Code2 className="w-3 h-3" />
                          <span>Snippet de Código incluído</span>
                        </div>
                      )}

                      {/* Subtasks Progress */}
                      {totalSubtasks > 0 && (
                        <div className="mb-2.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                            <span>Checklist ({completedSubtasks}/{totalSubtasks})</span>
                            <span>{Math.round((completedSubtasks / totalSubtasks) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all"
                              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                            />
                          </div>

                          {/* Quick subtask interactive list (first 2) */}
                          <div className="mt-1.5 space-y-1">
                            {task.subtasks.slice(0, 2).map((st) => (
                              <div
                                key={st.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleSubtask(task.id, st.id);
                                }}
                                className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                              >
                                {st.completed ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                ) : (
                                  <Circle className="w-3 h-3 text-slate-600 shrink-0" />
                                )}
                                <span className={`truncate ${st.completed ? 'line-through text-slate-500' : ''}`}>
                                  {st.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.2 rounded text-[9px] bg-slate-900 text-slate-400 border border-slate-800 font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Footer: Hours, Antigravity AI button, Delete */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] text-slate-500">
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{task.estimatedHours}h est.</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Dev Copilot Trigger */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundFx.playPop();
                              onOpenDevCopilot(task);
                            }}
                            title="Resolver com Antigravity Copilot"
                            className="flex items-center gap-1 px-2 py-1 rounded bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 hover:border-purple-600/60 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                            <span>Dev IA</span>
                          </button>

                          {/* Delete Card */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(task.id);
                            }}
                            title="Excluir tarefa"
                            className="p-1 text-slate-600 hover:text-red-400 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
