import React, { useState, useMemo } from 'react';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Terminal, 
  Activity, 
  Cpu, 
  Database, 
  Shield, 
  CheckSquare, 
  Trash2,
  Code2
} from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onOpenDevCopilot: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onSelectTask,
  onToggleComplete,
  onOpenDevCopilot,
  onDeleteTask,
  onToggleSubtask,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'hours' | 'date'>('priority');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase()) ||
        task.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = selectedCategory === 'all' || task.category === selectedCategory;
      const matchPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      const matchStatus = selectedStatus === 'all' || task.status === selectedStatus;

      return matchSearch && matchCategory && matchPriority && matchStatus;
    }).sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { p1: 1, p2: 2, p3: 3, p4: 4 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === 'hours') {
        return b.estimatedHours - a.estimatedHours;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, search, selectedCategory, selectedPriority, selectedStatus, sortBy]);

  const handleToggle = (taskId: string, isDone: boolean) => {
    if (!isDone) {
      soundFx.playComplete();
      confetti({ particleCount: 30, spread: 50 });
    } else {
      soundFx.playClick();
    }
    onToggleComplete(taskId);
  };

  return (
    <div className="w-full space-y-4 pb-12">
      {/* Search and Filters Toolbar */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tarefas por título, descrição ou #tags..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="priority">Prioridade (P1 &rarr; P4)</option>
              <option value="hours">Horas Estimadas</option>
              <option value="date">Mais Recentes</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtros:
          </span>

          {/* Category Chips */}
          {['all', 'frontend', 'backend', 'devops', 'ai', 'database', 'security', 'testing'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'Todas Categorias' : cat.toUpperCase()}
            </button>
          ))}

          {/* Priority Chips */}
          <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />
          {['all', 'p1', 'p2', 'p3', 'p4'].map((pri) => (
            <button
              key={pri}
              onClick={() => setSelectedPriority(pri)}
              className={`px-2 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                selectedPriority === pri
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                  : 'bg-slate-950/60 text-slate-500 hover:text-slate-300 border border-slate-800'
              }`}
            >
              {pri === 'all' ? 'Todas P' : pri.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Task Rows List */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            Nenhuma tarefa encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'done';
            const isExpanded = expandedTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`p-4 transition-all hover:bg-slate-900/90 ${
                  isDone ? 'bg-slate-950/40' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox + Title + Meta */}
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleToggle(task.id, isDone)}
                      className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Priority Badge */}
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                            task.priority === 'p1'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : task.priority === 'p2'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : task.priority === 'p3'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {task.priority.toUpperCase()}
                        </span>

                        {/* Category Badge */}
                        <span className="px-2 py-0.2 rounded text-[10px] uppercase font-semibold bg-slate-950 text-cyan-400 border border-slate-800">
                          {task.category}
                        </span>

                        {/* Status */}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {task.status === 'done'
                            ? '✓ Concluído'
                            : task.status === 'in_progress'
                            ? '⚡ Em Progresso'
                            : task.status === 'review'
                            ? '👀 Em Revisão'
                            : '○ A Fazer'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => onSelectTask(task)}
                        className={`text-sm font-semibold cursor-pointer hover:text-cyan-300 transition-colors ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Tags & Snippet preview indicator */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}

                        {task.codeSnippetPreview && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 flex items-center gap-1">
                            <Code2 className="w-3 h-3" /> Código disponível
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions, Subtasks Toggle, Copilot */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {task.estimatedHours}h
                    </span>

                    {/* Antigravity AI Copilot */}
                    <button
                      onClick={() => onOpenDevCopilot(task)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-950/70 hover:bg-purple-900/70 text-purple-300 border border-purple-800/40 hover:border-purple-600/60 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                      <span className="hidden sm:inline">Resolver com IA</span>
                    </button>

                    {/* Expand Subtasks */}
                    {task.subtasks.length > 0 && (
                      <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Ver subtarefas"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}

                    {/* Delete Task */}
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-lg hover:bg-red-950/40 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Subtasks Section */}
                {isExpanded && task.subtasks.length > 0 && (
                  <div className="mt-3 pl-8 pr-4 py-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2 animate-in fade-in">
                    <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
                      <span>Subtarefas de Verificação</span>
                      <span className="font-mono text-cyan-400">
                        {task.subtasks.filter((s) => s.completed).length} / {task.subtasks.length} concluídas
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {task.subtasks.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => onToggleSubtask(task.id, st.id)}
                          className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-1"
                        >
                          {st.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <span className={st.completed ? 'line-through text-slate-500' : ''}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
