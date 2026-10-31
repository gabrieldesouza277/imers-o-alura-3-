import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Radio, 
  Headphones, 
  Volume2, 
  VolumeX, 
  Flame, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

interface PomodoroTimerProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  tasks,
  onSelectTask,
  onToggleComplete,
}) => {
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [ambientSound, setAmbientSound] = useState<'off' | 'space' | 'cyber'>('off');

  // Set default active task
  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      const active = tasks.find((t) => t.status === 'in_progress') || tasks.find((t) => t.status === 'todo');
      if (active) setSelectedTaskId(active.id);
    }
  }, [tasks, selectedTaskId]);

  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  // Timer tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Completed timer!
      soundFx.playComplete();
      confetti({ particleCount: 50, spread: 70 });
      if (mode === 'work') {
        setCompletedSessions((c) => c + 1);
        setMode('shortBreak');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    soundFx.playClick();
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'work') setTimeLeft(25 * 60);
    else if (newMode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const toggleTimer = () => {
    soundFx.playClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    soundFx.playClick();
    setIsRunning(false);
    if (mode === 'work') setTimeLeft(25 * 60);
    else if (mode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const toggleAmbientSound = (type: 'space' | 'cyber') => {
    if (ambientSound === type) {
      soundFx.stopFocusNoise();
      setAmbientSound('off');
    } else {
      soundFx.startFocusNoise(type);
      setAmbientSound(type);
    }
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = mode === 'work' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Workstation Container */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-cyan-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Estação de Foco Dev • Flow State
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Elimine distrações com blocos de hiperfoco e ruído sintético gerado por síntese de áudio.
            </p>
          </div>

          {/* Streak pill */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>{completedSessions} ciclos hoje</span>
          </div>
        </div>

        {/* Main Grid: Clock & Task Pin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Interactive Countdown Ring */}
          <div className="flex flex-col items-center justify-center">
            {/* Mode Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
              <button
                onClick={() => switchMode('work')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'work'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Foco (25m)
              </button>
              <button
                onClick={() => switchMode('shortBreak')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'shortBreak'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pausa Curta (5m)
              </button>
              <button
                onClick={() => switchMode('longBreak')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'longBreak'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pausa Longa (15m)
              </button>
            </div>

            {/* Circular Timer Display */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="44%"
                  className="stroke-cyan-400 transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 110}
                  strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-mono font-black text-white tracking-wider">
                  {timeFormatted}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-mono mt-1">
                  {mode === 'work' ? 'Sessão Dev' : 'Descanso'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={toggleTimer}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Iniciar Foco
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                title="Reiniciar timer"
                className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Active Task Card & Ambient Sound Synth */}
          <div className="space-y-6">
            {/* Active Task Selector */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Tarefa em Foco
                </span>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1 max-w-[200px] truncate focus:outline-none focus:border-cyan-500/50"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.priority.toUpperCase()} - {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {activeTask ? (
                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/40 uppercase">
                      {activeTask.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {activeTask.estimatedHours}h estimadas
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white leading-snug">
                    {activeTask.title}
                  </h3>

                  {activeTask.description && (
                    <p className="text-xs text-slate-400 line-clamp-3">
                      {activeTask.description}
                    </p>
                  )}

                  {/* Actions for active task */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => onToggleComplete(activeTask.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        activeTask.status === 'done'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {activeTask.status === 'done' ? 'Tarefa Concluída' : 'Marcar como Feita'}
                    </button>

                    <button
                      onClick={() => onSelectTask(activeTask)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Nenhuma tarefa selecionada para esta sessão.
                </div>
              )}
            </div>

            {/* Ambient Sound Generator (Web Audio API Synthesizer) */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-purple-400" />
                  Gerador de Áudio Ambiente
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Web Audio Synth</span>
              </div>

              <p className="text-xs text-slate-400">
                Sons estáticos contínuos para bloquear ruído externo e induzir estado de imersão:
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAmbientSound('space')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    ambientSound === 'space'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Deep Space
                </button>

                <button
                  onClick={() => toggleAmbientSound('cyber')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    ambientSound === 'cyber'
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Terminal Drone
                </button>

                {ambientSound !== 'off' && (
                  <button
                    onClick={() => {
                      soundFx.stopFocusNoise();
                      setAmbientSound('off');
                    }}
                    title="Desligar ruído de fundo"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
