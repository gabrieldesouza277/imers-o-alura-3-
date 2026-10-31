import React, { useState } from 'react';
import { ViewMode, Task } from '../types';
import { soundFx } from '../utils/audio';
import { 
  Sparkles, 
  Plus, 
  LayoutDashboard, 
  ListTodo, 
  Grid3X3, 
  Compass, 
  Timer, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  Zap, 
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  tasks: Task[];
  onOpenNewTaskModal: () => void;
  onOpenAgentModal: () => void;
  onOpenOptimizerModal: () => void;
  onExportTasks: () => void;
  onImportTasks: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  tasks,
  onOpenNewTaskModal,
  onOpenAgentModal,
  onOpenOptimizerModal,
  onExportTasks,
  onImportTasks,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    soundFx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) soundFx.playClick();
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const criticalP1 = tasks.filter((t) => t.priority === 'p1' && t.status !== 'done').length;
  const totalHours = tasks.reduce((acc, t) => acc + (t.status !== 'done' ? t.estimatedHours : 0), 0);
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40 transition-all">
      {/* Top Banner: Brand, Agent Status & Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer" onClick={() => onViewChange('antigravity')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Google Antigravity
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-mono text-sm sm:text-base">
                  Tasks
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Dev na Era da IA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sistema autônomo com Antigravity Agent, Física Zero-G e Decomposição de Metas
            </p>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          {/* AI Decomposer Agent Button */}
          <button
            onClick={() => {
              soundFx.playPop();
              onOpenAgentModal();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-cyan-200" />
            <span>Decompor Meta com IA</span>
          </button>

          {/* Sprint Optimizer Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenOptimizerModal();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all active:scale-95 cursor-pointer"
            title="Otimizar fluxo da Sprint com IA"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Otimizar Sprint</span>
          </button>

          {/* New Task Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenNewTaskModal();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="hidden xs:inline">Nova Tarefa</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Silenciar Efeitos Sonoros' : 'Ativar Efeitos Sonoros'}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Export JSON */}
          <button
            onClick={onExportTasks}
            title="Exportar tarefas em JSON"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import JSON */}
          <label
            title="Importar tarefas de JSON"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={onImportTasks} className="hidden" />
          </label>
        </div>
      </div>

      {/* Navigation Tabs & Metrics Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 pt-1 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/40">
        {/* Navigation View Switcher */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              soundFx.playClick();
              onViewChange('kanban');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentView === 'kanban'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onViewChange('list');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentView === 'list'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Lista</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onViewChange('matrix');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentView === 'matrix'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Matriz Dev</span>
          </button>

          <button
            onClick={() => {
              soundFx.playZeroG();
              onViewChange('antigravity');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentView === 'antigravity'
                ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-300 border border-cyan-400/40 shadow-sm shadow-cyan-500/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Gravidade Zero</span>
            <span className="px-1 py-0.2 text-[9px] rounded bg-cyan-500/30 text-cyan-300 font-mono">0G</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onViewChange('pomodoro');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentView === 'pomodoro'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span>Pomodoro Dev</span>
          </button>
        </nav>

        {/* Live Project Metrics */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{completedTasks}/{totalTasks} ({completionPercentage}%)</span>
          </div>

          {criticalP1 > 0 && (
            <div className="flex items-center gap-1.5 text-red-400 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-800/40">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{criticalP1} Críticas (P1)</span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>~{totalHours}h restantes</span>
          </div>
        </div>
      </div>
    </header>
  );
};
