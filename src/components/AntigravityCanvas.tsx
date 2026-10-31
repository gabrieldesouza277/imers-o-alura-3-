import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Task, GravitySettings } from '../types';
import { soundFx } from '../utils/audio';
import { 
  Sparkles, 
  RotateCcw, 
  Compass, 
  Flame, 
  Maximize2, 
  Sliders, 
  ShieldAlert, 
  Magnet, 
  Hand, 
  ArrowUpCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface AntigravityCanvasProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

interface PhysicsBody {
  id: string;
  task: Task;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  angle: number;
  vAngle: number;
  isDragging: boolean;
  color: string;
  priorityColor: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  frontend: '#06b6d4', // Cyan
  backend: '#6366f1',  // Indigo
  devops: '#f59e0b',   // Amber
  ai: '#a855f7',       // Purple
  database: '#10b981', // Emerald
  security: '#ef4444', // Red
  testing: '#ec4899',  // Pink
};

const PRIORITY_COLORS: Record<string, string> = {
  p1: '#ef4444',
  p2: '#f97316',
  p3: '#3b82f6',
  p4: '#94a3b8',
};

export const AntigravityCanvas: React.FC<AntigravityCanvasProps> = ({
  tasks,
  onSelectTask,
  onToggleComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [settings, setSettings] = useState<GravitySettings>({
    enabled: true,
    gravityY: 0, // Zero gravity by default for the iconic Antigravity feel!
    airFriction: 0.985,
    bounceRestitution: 0.75,
    mouseMode: 'drag',
  });

  const [gravityPreset, setGravityPreset] = useState<'zero' | 'moon' | 'earth' | 'inverted'>('zero');
  const [selectedBody, setSelectedBody] = useState<PhysicsBody | null>(null);
  const [stats, setStats] = useState({ activeCards: tasks.length, energy: 0 });

  const bodiesRef = useRef<PhysicsBody[]>([]);
  const mouseRef = useRef<{
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    isDown: boolean;
    draggedBody: PhysicsBody | null;
    dragOffsetX: number;
    dragOffsetY: number;
  }>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    isDown: false,
    draggedBody: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
  });

  // Cosmic background particles
  const particlesRef = useRef<Array<{ x: number; y: number; size: number; alpha: number; speed: number }>>([]);

  // Initialize or synchronize physics bodies with tasks
  useEffect(() => {
    const container = containerRef.current;
    const width = container?.clientWidth || 1000;
    const height = container?.clientHeight || 650;

    const existingMap = new Map<string, PhysicsBody>();
    bodiesRef.current.forEach((b) => existingMap.set(b.id, b));

    const newBodies: PhysicsBody[] = tasks.map((task, index) => {
      const existing = existingMap.get(task.id);
      if (existing) {
        existing.task = task;
        return existing;
      }

      // Distribute nicely across the canvas with some float
      const cols = Math.max(2, Math.floor(width / 260));
      const col = index % cols;
      const row = Math.floor(index / cols);

      const cardWidth = 240;
      const cardHeight = 110;

      const startX = 40 + col * (cardWidth + 24) + (Math.random() - 0.5) * 30;
      const startY = 60 + row * (cardHeight + 24) + (Math.random() - 0.5) * 30;

      return {
        id: task.id,
        task,
        x: Math.min(width - cardWidth - 20, Math.max(20, startX)),
        y: Math.min(height - cardHeight - 20, Math.max(20, startY)),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        width: cardWidth,
        height: cardHeight,
        angle: (Math.random() - 0.5) * 0.1,
        vAngle: (Math.random() - 0.5) * 0.005,
        isDragging: false,
        color: CATEGORY_COLORS[task.category] || '#6366f1',
        priorityColor: PRIORITY_COLORS[task.priority] || '#3b82f6',
      };
    });

    bodiesRef.current = newBodies;
    setStats({ activeCards: newBodies.length, energy: 0 });

    // Generate background space dust/stars
    if (particlesRef.current.length === 0) {
      const parts = [];
      for (let i = 0; i < 90; i++) {
        parts.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.6 + 0.2,
          speed: Math.random() * 0.3 + 0.05,
        });
      }
      particlesRef.current = parts;
    }
  }, [tasks]);

  // Set gravity presets
  const applyGravityPreset = (preset: 'zero' | 'moon' | 'earth' | 'inverted') => {
    setGravityPreset(preset);
    soundFx.playZeroG();

    let gY = 0;
    if (preset === 'zero') gY = 0;
    else if (preset === 'moon') gY = 0.15;
    else if (preset === 'earth') gY = 0.65;
    else if (preset === 'inverted') gY = -0.55;

    setSettings((prev) => ({
      ...prev,
      gravityY: gY,
    }));
  };

  // Big Bang / Antigravity Blast
  const triggerAntigravityBlast = () => {
    soundFx.playZeroG();
    const container = containerRef.current;
    const centerX = (container?.clientWidth || 800) / 2;
    const centerY = (container?.clientHeight || 600) / 2;

    bodiesRef.current.forEach((body) => {
      const dx = body.x + body.width / 2 - centerX;
      const dy = body.y + body.height / 2 - centerY;
      const dist = Math.max(50, Math.sqrt(dx * dx + dy * dy));
      const force = 18 + Math.random() * 12;

      body.vx += (dx / dist) * force;
      body.vy += (dy / dist) * force - 6; // upward explosion
      body.vAngle += (Math.random() - 0.5) * 0.12;
    });
  };

  // Reset / Align to Grid
  const resetToGrid = () => {
    soundFx.playClick();
    const container = containerRef.current;
    const width = container?.clientWidth || 1000;

    const cols = Math.max(2, Math.floor(width / 260));

    bodiesRef.current.forEach((body, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const targetX = 30 + col * (body.width + 20);
      const targetY = 40 + row * (body.height + 20);

      body.vx = (targetX - body.x) * 0.12;
      body.vy = (targetY - body.y) * 0.12;
      body.angle *= 0.5;
      body.vAngle *= 0.2;
    });
  };

  // Main Physics and Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark high-tech slate
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Render cosmic stars/dust
      ctx.fillStyle = '#94a3b8';
      particlesRef.current.forEach((p) => {
        p.y += p.speed * (settings.gravityY === 0 ? 0.2 : settings.gravityY);
        if (p.y > height) p.y = 0;
        if (p.y < 0) p.y = height;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw subtle gravity grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Mouse Attractor / Repulsor Visual Field
      const mouse = mouseRef.current;
      if (settings.mouseMode !== 'drag') {
        const radius = settings.mouseMode === 'attract' ? 180 : 140;
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          10,
          mouse.x,
          mouse.y,
          radius
        );

        if (settings.mouseMode === 'attract') {
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Target reticle
        ctx.strokeStyle = settings.mouseMode === 'attract' ? '#c084fc' : '#f87171';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2);
        ctx.stroke();
      }

      let totalKineticEnergy = 0;

      // Update and draw physics cards
      const bodies = bodiesRef.current;
      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];

        // Apply mouse drag or physics forces
        if (body.isDragging) {
          const targetX = mouse.x - mouse.dragOffsetX;
          const targetY = mouse.y - mouse.dragOffsetY;

          body.vx = (targetX - body.x) * 0.4;
          body.vy = (targetY - body.y) * 0.4;
          body.x = targetX;
          body.y = targetY;

          // Mouse throwing momentum
          body.vAngle = (mouse.x - mouse.prevX) * 0.002;
        } else {
          // Attractor / Repulsor force
          if (settings.mouseMode === 'attract' || settings.mouseMode === 'repel') {
            const centerX = body.x + body.width / 2;
            const centerY = body.y + body.height / 2;
            const dx = mouse.x - centerX;
            const dy = mouse.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 260 && dist > 10) {
              const sign = settings.mouseMode === 'attract' ? 1 : -1;
              const strength = (1 - dist / 260) * 1.8 * sign;
              body.vx += (dx / dist) * strength;
              body.vy += (dy / dist) * strength;
            }
          }

          // Gravity force
          body.vy += settings.gravityY;

          // Zero-gravity slight gentle cosmic drift
          if (settings.gravityY === 0) {
            body.vx += (Math.random() - 0.5) * 0.04;
            body.vy += (Math.random() - 0.5) * 0.04;
          }

          // Air resistance / friction
          body.vx *= settings.airFriction;
          body.vy *= settings.airFriction;
          body.vAngle *= 0.96;

          // Apply velocity
          body.x += body.vx;
          body.y += body.vy;
          body.angle += body.vAngle;

          // Wall Collisions (Left & Right)
          if (body.x < 10) {
            body.x = 10;
            body.vx = -body.vx * settings.bounceRestitution;
            body.vAngle += body.vy * 0.002;
          } else if (body.x + body.width > width - 10) {
            body.x = width - 10 - body.width;
            body.vx = -body.vx * settings.bounceRestitution;
            body.vAngle -= body.vy * 0.002;
          }

          // Wall Collisions (Top & Bottom)
          if (body.y < 10) {
            body.y = 10;
            body.vy = -body.vy * settings.bounceRestitution;
            body.vAngle -= body.vx * 0.002;
          } else if (body.y + body.height > height - 10) {
            body.y = height - 10 - body.height;
            body.vy = -body.vy * settings.bounceRestitution;
            body.vAngle += body.vx * 0.002;
          }

          // Max angle clamping for readability
          if (body.angle > 0.4) body.angle = 0.4;
          if (body.angle < -0.4) body.angle = -0.4;
        }

        totalKineticEnergy += Math.abs(body.vx) + Math.abs(body.vy);

        // Render card
        ctx.save();
        ctx.translate(body.x + body.width / 2, body.y + body.height / 2);
        ctx.rotate(body.angle);

        const halfW = body.width / 2;
        const halfH = body.height / 2;

        // Card Drop Shadow / Neon Aura
        ctx.shadowColor = body.isDragging ? body.color : 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = body.isDragging ? 24 : 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = body.isDragging ? 8 : 4;

        // Card Glass Background
        ctx.fillStyle = body.task.status === 'done' 
          ? 'rgba(15, 23, 42, 0.85)' 
          : 'rgba(20, 27, 45, 0.92)';

        // Rounded Rect path
        const r = 12;
        ctx.beginPath();
        ctx.moveTo(-halfW + r, -halfH);
        ctx.lineTo(halfW - r, -halfH);
        ctx.quadraticCurveTo(halfW, -halfH, halfW, -halfH + r);
        ctx.lineTo(halfW, halfH - r);
        ctx.quadraticCurveTo(halfW, halfH, halfW - r, halfH);
        ctx.lineTo(-halfW + r, halfH);
        ctx.quadraticCurveTo(-halfW, halfH, -halfW, halfH - r);
        ctx.lineTo(-halfW, -halfH + r);
        ctx.quadraticCurveTo(-halfW, -halfH, -halfW + r, -halfH);
        ctx.closePath();
        ctx.fill();

        // Border Glow
        ctx.shadowBlur = 0;
        ctx.strokeStyle = body.isDragging
          ? body.color
          : body.task.status === 'done'
          ? 'rgba(16, 185, 129, 0.4)'
          : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = body.isDragging ? 2 : 1;
        ctx.stroke();

        // Left accent bar for Priority
        ctx.fillStyle = body.priorityColor;
        ctx.fillRect(-halfW + 3, -halfH + 12, 4, body.height - 24);

        // Priority Pill
        ctx.fillStyle = body.priorityColor + '25';
        ctx.fillRect(-halfW + 16, -halfH + 12, 34, 18);
        ctx.fillStyle = body.priorityColor;
        ctx.font = 'bold 10px Fira Code, monospace';
        ctx.fillText(body.task.priority.toUpperCase(), -halfW + 24, -halfH + 25);

        // Category Tag
        ctx.fillStyle = body.color;
        ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
        ctx.fillText(body.task.category.toUpperCase(), -halfW + 58, -halfH + 25);

        // Status badge
        ctx.fillStyle = body.task.status === 'done' ? '#10b981' : '#64748b';
        ctx.font = '10px Plus Jakarta Sans, sans-serif';
        const statusText =
          body.task.status === 'done'
            ? '✓ Pronto'
            : body.task.status === 'in_progress'
            ? '⚡ Em Andamento'
            : body.task.status === 'review'
            ? '👀 Em Revisão'
            : '○ A Fazer';
        ctx.fillText(statusText, halfW - 74, -halfH + 25);

        // Title (truncated with ellipsis if long)
        ctx.fillStyle = body.task.status === 'done' ? '#94a3b8' : '#f8fafc';
        ctx.font = '600 12px Plus Jakarta Sans, sans-serif';

        let title = body.task.title;
        if (title.length > 28) title = title.substring(0, 26) + '...';
        ctx.fillText(title, -halfW + 16, -halfH + 52);

        // Subtasks progress bar
        const totalSubs = body.task.subtasks.length;
        const doneSubs = body.task.subtasks.filter((s) => s.completed).length;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(-halfW + 16, halfH - 24, body.width - 32, 4);

        if (totalSubs > 0) {
          const ratio = doneSubs / totalSubs;
          ctx.fillStyle = body.color;
          ctx.fillRect(-halfW + 16, halfH - 24, (body.width - 32) * ratio, 4);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px Fira Code, monospace';
          ctx.fillText(`${doneSubs}/${totalSubs} subtarefas`, -halfW + 16, halfH - 10);
        } else {
          ctx.fillStyle = '#64748b';
          ctx.font = '10px Fira Code, monospace';
          ctx.fillText(`${body.task.estimatedHours}h est.`, -halfW + 16, halfH - 10);
        }

        // Action hint icon at bottom right
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Plus Jakarta Sans, sans-serif';
        ctx.fillText('Clique 2x p/ abrir', halfW - 90, halfH - 10);

        ctx.restore();
      }

      // Update stats once per second
      if (Math.random() < 0.05) {
        setStats({
          activeCards: bodies.length,
          energy: Math.round(totalKineticEnergy * 10) / 10,
        });
      }

      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse / Touch Event Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    mouseRef.current.x = mouseX;
    mouseRef.current.y = mouseY;
    mouseRef.current.prevX = mouseX;
    mouseRef.current.prevY = mouseY;
    mouseRef.current.isDown = true;

    // Check hit test against bodies (top-most body first)
    const bodies = bodiesRef.current;
    for (let i = bodies.length - 1; i >= 0; i--) {
      const body = bodies[i];
      // Approximate bounding box with angle tolerance
      if (
        mouseX >= body.x - 5 &&
        mouseX <= body.x + body.width + 5 &&
        mouseY >= body.y - 5 &&
        mouseY <= body.y + body.height + 5
      ) {
        soundFx.playPop();
        body.isDragging = true;
        mouseRef.current.draggedBody = body;
        mouseRef.current.dragOffsetX = mouseX - body.x;
        mouseRef.current.dragOffsetY = mouseY - body.y;

        // Bring to front
        bodies.splice(i, 1);
        bodies.push(body);
        setSelectedBody(body);
        break;
      }
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    mouseRef.current.x = mouseX;
    mouseRef.current.y = mouseY;
  }, []);

  const handleMouseUp = useCallback(() => {
    const dragged = mouseRef.current.draggedBody;
    if (dragged) {
      dragged.isDragging = false;
      // Fling momentum release
      const flingX = (mouseRef.current.x - mouseRef.current.prevX) * 0.8;
      const flingY = (mouseRef.current.y - mouseRef.current.prevY) * 0.8;
      dragged.vx += flingX;
      dragged.vy += flingY;
    }
    mouseRef.current.isDown = false;
    mouseRef.current.draggedBody = null;
  }, []);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const bodies = bodiesRef.current;
      for (let i = bodies.length - 1; i >= 0; i--) {
        const body = bodies[i];
        if (
          mouseX >= body.x &&
          mouseX <= body.x + body.width &&
          mouseY >= body.y &&
          mouseY <= body.y + body.height
        ) {
          soundFx.playClick();
          onSelectTask(body.task);
          break;
        }
      }
    },
    [onSelectTask]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[78vh] min-h-[580px] bg-slate-950 rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl flex flex-col select-none"
    >
      {/* Antigravity HUD Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Badge: Antigravity Physics Engine status */}
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/30 pointer-events-auto shadow-lg">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute opacity-75"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 font-mono tracking-wider">
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
              GOOGLE ANTIGRAVITY ENGINE
            </div>
            <div className="text-[10px] text-slate-400">
              {stats.activeCards} cartões flutuantes • Energia: {stats.energy}J
            </div>
          </div>
        </div>

        {/* Center: Gravity Preset Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 pointer-events-auto shadow-lg">
          <button
            onClick={() => applyGravityPreset('zero')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              gravityPreset === 'zero'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            0G (Zero Gravidade)
          </button>

          <button
            onClick={() => applyGravityPreset('moon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              gravityPreset === 'moon'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            🌙 Lunar (0.15G)
          </button>

          <button
            onClick={() => applyGravityPreset('earth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              gravityPreset === 'earth'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            🌍 Terra (1.0G)
          </button>

          <button
            onClick={() => applyGravityPreset('inverted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              gravityPreset === 'inverted'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            Inversa (-0.5G)
          </button>
        </div>

        {/* Right: Interaction Mode & Big Bang Trigger */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Mouse Mode selector */}
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg">
            <button
              title="Modo Agarrar e Arremessar tarefas"
              onClick={() => setSettings((s) => ({ ...s, mouseMode: 'drag' }))}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                settings.mouseMode === 'drag'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Hand className="w-4 h-4" />
            </button>
            <button
              title="Atraidor Gravitacional (Vórtice no mouse)"
              onClick={() => setSettings((s) => ({ ...s, mouseMode: 'attract' }))}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                settings.mouseMode === 'attract'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Magnet className="w-4 h-4" />
            </button>
            <button
              title="Repulsor (Empurrar tarefas com o mouse)"
              onClick={() => setSettings((s) => ({ ...s, mouseMode: 'repel' }))}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                settings.mouseMode === 'repel'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>

          {/* Antigravity Blast button */}
          <button
            onClick={triggerAntigravityBlast}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            Impulso Antigravity
          </button>

          {/* Reset to Grid button */}
          <button
            onClick={resetToGrid}
            title="Alinhar tarefas em grade"
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition-colors shadow-lg active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Physics Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Bottom Floating Info / Quick Selected Task Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-4">
          <span>💡 <strong>Dica:</strong> Arraste e arremesse os cartões no espaço. Clique 2x para abrir detalhes.</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-cyan-400">Google Antigravity Physics v2.4</span>
        </div>

        {selectedBody && (
          <div className="bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-cyan-500/40 pointer-events-auto flex items-center gap-3 shadow-xl max-w-md animate-in fade-in slide-in-from-bottom-2">
            <div className="truncate">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Tarefa Selecionada ({selectedBody.task.priority.toUpperCase()})
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {selectedBody.task.title}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onToggleComplete(selectedBody.task.id)}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                  selectedBody.task.status === 'done'
                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {selectedBody.task.status === 'done' ? 'Concluída' : 'Concluir'}
              </button>
              <button
                onClick={() => onSelectTask(selectedBody.task)}
                className="p-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
