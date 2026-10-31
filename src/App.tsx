import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, ViewMode } from './types';
import { loadTasksFromStorage, saveTasksToStorage } from './utils/storage';
import { soundFx } from './utils/audio';
import confetti from 'canvas-confetti';

import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskListView } from './components/TaskListView';
import { EisenhowerMatrix } from './components/EisenhowerMatrix';
import { AntigravityCanvas } from './components/AntigravityCanvas';
import { PomodoroTimer } from './components/PomodoroTimer';

import { TaskModal } from './components/TaskModal';
import { AntigravityAgentModal } from './components/AntigravityAgentModal';
import { DevCopilotModal } from './components/DevCopilotModal';
import { SprintOptimizerModal } from './components/SprintOptimizerModal';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [currentView, setCurrentView] = useState<ViewMode>('antigravity'); // Start in the iconic Antigravity mode!

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskInitialStatus, setNewTaskInitialStatus] = useState<TaskStatus>('todo');

  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isOptimizerModalOpen, setIsOptimizerModalOpen] = useState(false);
  const [copilotTask, setCopilotTask] = useState<Task | null>(null);

  // Sync tasks to LocalStorage
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Handler: Update status (Kanban drag & drop, quick cycle)
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  // Handler: Toggle complete
  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === 'done';
          const newStatus: TaskStatus = isDone ? 'todo' : 'done';
          if (!isDone) {
            soundFx.playComplete();
            confetti({ particleCount: 40, spread: 60 });
          } else {
            soundFx.playClick();
          }
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  // Handler: Toggle subtask
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    soundFx.playClick();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          // If all subtasks are done, celebrate
          const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
          if (allCompleted && t.status !== 'done') {
            soundFx.playComplete();
            confetti({ particleCount: 30, spread: 45 });
          }
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  // Handler: Save Task (Create or Update)
  const handleSaveTask = (taskToSave: Task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === taskToSave.id);
      if (exists) {
        return prev.map((t) => (t.id === taskToSave.id ? taskToSave : t));
      }
      return [taskToSave, ...prev];
    });
  };

  // Handler: Delete Task
  const handleDeleteTask = (taskId: string) => {
    soundFx.playClick();
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Handler: Add multiple tasks from AI Decomposer
  const handleAddTasksFromAI = (newTasks: Task[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
  };

  // Handler: Update code snippet from Copilot
  const handleUpdateTaskSnippet = (taskId: string, snippet: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, codeSnippetPreview: snippet } : t))
    );
  };

  // Export JSON
  const handleExportTasks = () => {
    soundFx.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `antigravity-tasks-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setTasks(imported);
          soundFx.playComplete();
          confetti({ particleCount: 40, spread: 60 });
        }
      } catch (err) {
        console.error('Falha ao importar JSON de tarefas:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* App Header */}
      <Header
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        tasks={tasks}
        onOpenNewTaskModal={() => {
          setSelectedTask(null);
          setNewTaskInitialStatus('todo');
          setIsTaskModalOpen(true);
        }}
        onOpenAgentModal={() => setIsAgentModalOpen(true)}
        onOpenOptimizerModal={() => setIsOptimizerModalOpen(true)}
        onExportTasks={handleExportTasks}
        onImportTasks={handleImportTasks}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'antigravity' && (
          <div className="space-y-4">
            <AntigravityCanvas
              tasks={tasks}
              onSelectTask={(task) => {
                setSelectedTask(task);
                setIsTaskModalOpen(true);
              }}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        )}

        {currentView === 'kanban' && (
          <KanbanBoard
            tasks={tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onSelectTask={(task) => {
              setSelectedTask(task);
              setIsTaskModalOpen(true);
            }}
            onOpenNewTaskModalWithStatus={(status) => {
              setSelectedTask(null);
              setNewTaskInitialStatus(status);
              setIsTaskModalOpen(true);
            }}
            onOpenDevCopilot={(task) => setCopilotTask(task)}
            onDeleteTask={handleDeleteTask}
            onToggleSubtask={handleToggleSubtask}
          />
        )}

        {currentView === 'list' && (
          <TaskListView
            tasks={tasks}
            onSelectTask={(task) => {
              setSelectedTask(task);
              setIsTaskModalOpen(true);
            }}
            onToggleComplete={handleToggleComplete}
            onOpenDevCopilot={(task) => setCopilotTask(task)}
            onDeleteTask={handleDeleteTask}
            onToggleSubtask={handleToggleSubtask}
          />
        )}

        {currentView === 'matrix' && (
          <EisenhowerMatrix
            tasks={tasks}
            onSelectTask={(task) => {
              setSelectedTask(task);
              setIsTaskModalOpen(true);
            }}
            onOpenDevCopilot={(task) => setCopilotTask(task)}
            onToggleComplete={handleToggleComplete}
          />
        )}

        {currentView === 'pomodoro' && (
          <PomodoroTimer
            tasks={tasks}
            onSelectTask={(task) => {
              setSelectedTask(task);
              setIsTaskModalOpen(true);
            }}
            onToggleComplete={handleToggleComplete}
          />
        )}
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        task={selectedTask}
        initialStatus={newTaskInitialStatus}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      <AntigravityAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onAddTasks={handleAddTasksFromAI}
      />

      <DevCopilotModal
        task={copilotTask}
        onClose={() => setCopilotTask(null)}
        onUpdateTaskSnippet={handleUpdateTaskSnippet}
      />

      <SprintOptimizerModal
        isOpen={isOptimizerModalOpen}
        tasks={tasks}
        onClose={() => setIsOptimizerModalOpen(false)}
        onSelectTask={(task) => {
          setSelectedTask(task);
          setIsTaskModalOpen(true);
        }}
      />
    </div>
  );
}
