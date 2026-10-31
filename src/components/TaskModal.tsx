import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskCategory, TaskStatus, Subtask } from '../types';
import { soundFx } from '../utils/audio';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  Code2, 
  Tag 
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  task: Task | null;
  initialStatus?: TaskStatus;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const CATEGORIES: { id: TaskCategory; label: string }[] = [
  { id: 'backend', label: 'Backend' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'devops', label: 'DevOps / Cloud' },
  { id: 'ai', label: 'AI Agent' },
  { id: 'database', label: 'Database' },
  { id: 'security', label: 'Security' },
  { id: 'testing', label: 'Testing / QA' },
];

const PRIORITIES: { id: TaskPriority; label: string; desc: string; color: string }[] = [
  { id: 'p1', label: 'P1 - Crítica', desc: 'Blocker / Hotfix imediato', color: 'text-red-400 border-red-500/40 bg-red-950/30' },
  { id: 'p2', label: 'P2 - Alta', desc: 'Funcionalidade prioritária', color: 'text-orange-400 border-orange-500/40 bg-orange-950/30' },
  { id: 'p3', label: 'P3 - Média', desc: 'Evolução / Refatoração', color: 'text-blue-400 border-blue-500/40 bg-blue-950/30' },
  { id: 'p4', label: 'P4 - Baixa', desc: 'Melhoria opcional', color: 'text-slate-400 border-slate-600/40 bg-slate-900/40' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  task,
  initialStatus = 'todo',
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>('p2');
  const [category, setCategory] = useState<TaskCategory>('backend');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [codeSnippetPreview, setCodeSnippetPreview] = useState('');
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setCategory(task.category);
      setEstimatedHours(task.estimatedHours);
      setTags(task.tags || []);
      setSubtasks(task.subtasks || []);
      setCodeSnippetPreview(task.codeSnippetPreview || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setPriority('p2');
      setCategory('backend');
      setEstimatedHours(2);
      setTags(['Dev', 'TypeScript']);
      setSubtasks([]);
      setCodeSnippetPreview('');
    }
  }, [task, initialStatus, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
      soundFx.playClick();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    soundFx.playClick();
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt: Subtask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskTitle('');
    soundFx.playClick();
  };

  const handleToggleSubtask = (stId: string) => {
    setSubtasks(
      subtasks.map((st) =>
        st.id === stId ? { ...st, completed: !st.completed } : st
      )
    );
    soundFx.playClick();
  };

  const handleDeleteSubtask = (stId: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== stId));
    soundFx.playClick();
  };

  // Quick AI Subtask Generator
  const handleAutoGenerateSubtasks = async () => {
    if (!title.trim()) return;
    setIsGeneratingSubtasks(true);
    soundFx.playPop();

    try {
      const response = await fetch('/api/antigravity/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: title,
          taskDescription: description,
          category,
          tags,
          userQuery: 'Gere apenas um checklist de 3 a 5 subtarefas diretas de verificação e implementação.',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checklist && Array.isArray(data.checklist)) {
          const newGenerated: Subtask[] = data.checklist.map((item: string, idx: number) => ({
            id: `st-gen-${Date.now()}-${idx}`,
            title: item,
            completed: false,
          }));
          setSubtasks([...subtasks, ...newGenerated]);
          soundFx.playComplete();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedTask: Task = {
      id: task?.id || `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category,
      estimatedHours: Number(estimatedHours) || 1,
      tags,
      subtasks,
      codeSnippetPreview: codeSnippetPreview.trim() || undefined,
      createdAt: task?.createdAt || new Date().toISOString(),
    };

    soundFx.playComplete();
    onSave(updatedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-950 rounded-3xl border border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
        {/* Header */}
        <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white">
              {task ? 'Editar Tarefa Dev' : 'Criar Nova Tarefa'}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              Antigravity Tasks
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Título da Tarefa: <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Configurar pool de conexões PostgreSQL com PgBouncer..."
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Descrição e Requisitos:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contexto, motivação técnica e detalhes arquiteturais..."
              className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          {/* Category, Status & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Categoria:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
              >
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Progresso</option>
                <option value="review">Em Revisão</option>
                <option value="done">Concluído</option>
              </select>
            </div>

            {/* Estimated Hours */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Horas Estimadas:</label>
              <div className="relative">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 font-mono"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">
                  horas
                </span>
              </div>
            </div>
          </div>

          {/* Priority selection cards */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nível de Prioridade:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    priority === p.id
                      ? `${p.color} ring-1 ring-cyan-400 font-bold`
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-mono">{p.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Checklist / Subtarefas ({subtasks.filter((s) => s.completed).length}/{subtasks.length}):
              </label>

              <button
                type="button"
                disabled={isGeneratingSubtasks || !title.trim()}
                onClick={handleAutoGenerateSubtasks}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-40"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{isGeneratingSubtasks ? 'Gerando...' : 'Sugerir com IA'}</span>
              </button>
            </div>

            {/* List of subtasks */}
            <div className="space-y-1.5">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                >
                  <div
                    onClick={() => handleToggleSubtask(st.id)}
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                  >
                    {st.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <span className={st.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {st.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="p-1 text-slate-600 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Adicionar subtarefa de verificação..."
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300">Tags Técnicas:</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-lg text-xs bg-slate-900 text-slate-300 border border-slate-800 font-mono flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ex: Docker, PostgreSQL, JWT..."
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Adicionar Tag
              </button>
            </div>
          </div>

          {/* Starter Code Snippet / Commands */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              Snippet de Código ou Comando Inicial (Opcional):
            </label>
            <textarea
              rows={3}
              value={codeSnippetPreview}
              onChange={(e) => setCodeSnippetPreview(e.target.value)}
              placeholder="Comando CLI, função de exemplo ou configuração YAML..."
              className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 leading-relaxed"
            />
          </div>

          {/* Footer Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {task && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/40 border border-red-900/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir Tarefa
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Tarefa</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
