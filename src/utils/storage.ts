import { Task } from '../types';

const STORAGE_KEY = 'google_antigravity_tasks_v1';

export const INITIAL_DEV_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Integrar Google Antigravity Agent na pipeline CI/CD',
    description: 'Configurar step automatizado no GitHub Actions para acionar o agente de IA que revisa PRs, valida tipagem e sugere otimizações de performance.',
    status: 'in_progress',
    priority: 'p1',
    category: 'ai',
    tags: ['GitHub Actions', 'Gemini', 'DevOps', 'CI/CD'],
    estimatedHours: 4,
    subtasks: [
      { id: 'st-1-1', title: 'Criar workflow YAML para PRs abertos', completed: true },
      { id: 'st-1-2', title: 'Configurar secret GEMINI_API_KEY no repositório', completed: true },
      { id: 'st-1-3', title: 'Adicionar parser de comentários no Pull Request', completed: false },
      { id: 'st-1-4', title: 'Testar execução de revisão em PR de staging', completed: false },
    ],
    codeSnippetPreview: `name: Antigravity Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Antigravity Reviewer
        run: npm run dev:ai-audit`,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Migrar autenticação para sessões com JWT assinado e Refresh Token',
    description: 'Implementar rota de login com rotação segura de refresh token em cookie HttpOnly com SameSite=Strict e expiração de 15 minutos para access tokens.',
    status: 'todo',
    priority: 'p1',
    category: 'security',
    tags: ['Node.js', 'JWT', 'Security', 'Auth'],
    estimatedHours: 3.5,
    subtasks: [
      { id: 'st-2-1', title: 'Definir middleware de verificação de token Bearer', completed: false },
      { id: 'st-2-2', title: 'Implementar rota POST /auth/refresh com blacklist', completed: false },
      { id: 'st-2-3', title: 'Adicionar testes de invasão e expiração', completed: false },
    ],
    codeSnippetPreview: `// Middleware de validação JWT
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token ausente' });
  // Validação segura com chave assimétrica
  next();
};`,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Construir simulação de Gravidade Zero no Canvas para tarefas flutuantes',
    description: 'Desenvolver motor 2D com gravidade regulável (0G, Lua, Terra, Gravidade Inversa), detecção de colisão elástica e interação de arrastar e arremessar cartões.',
    status: 'done',
    priority: 'p2',
    category: 'frontend',
    tags: ['Canvas2D', 'Physics', 'Motion', 'React'],
    estimatedHours: 5,
    subtasks: [
      { id: 'st-3-1', title: 'Implementar loop requestAnimationFrame de física', completed: true },
      { id: 'st-3-2', title: 'Criar forças vetoriais de gravidade e atrito do ar', completed: true },
      { id: 'st-3-3', title: 'Adicionar manipulador de mouse para agarrar e lançar', completed: true },
      { id: 'st-3-4', title: 'Renderizar cards com efeito de brilho e rotação', completed: true },
    ],
    codeSnippetPreview: `// Vetor de física no Canvas
this.vx += (this.targetVx - this.vx) * 0.1;
this.vy += gravityY + (Math.random() - 0.5) * 0.05;
this.x += this.vx;
this.y += this.vy;`,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    dueDate: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Otimizar queries do PostgreSQL e adicionar índices compostos',
    description: 'Analisar plano de execução com EXPLAIN ANALYZE nas consultas com filtro por usuário e status, reduzindo latência de 240ms para menos de 12ms.',
    status: 'in_progress',
    priority: 'p2',
    category: 'database',
    tags: ['PostgreSQL', 'Performance', 'SQL', 'Explain'],
    estimatedHours: 2,
    subtasks: [
      { id: 'st-4-1', title: 'Gerar dump de carga com 50.000 registros de teste', completed: true },
      { id: 'st-4-2', title: 'Criar índice CREATE INDEX idx_tasks_user_status', completed: false },
      { id: 'st-4-3', title: 'Validar benchmark com pg_bench', completed: false },
    ],
    codeSnippetPreview: `CREATE INDEX CONCURRENTLY idx_tasks_user_status_created 
ON tasks (user_id, status, created_at DESC);`,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
  },
  {
    id: 'task-5',
    title: 'Adicionar cobertura de testes unitários com Vitest no módulo de física',
    description: 'Garantir que os cálculos de colisão, impulso, rebote e cálculo vetorial de gravidade tenham cobertura mínima de 90%.',
    status: 'review',
    priority: 'p3',
    category: 'testing',
    tags: ['Vitest', 'Unit Tests', 'Physics', 'TDD'],
    estimatedHours: 2.5,
    subtasks: [
      { id: 'st-5-1', title: 'Testar colisão de limites com a borda do viewport', completed: true },
      { id: 'st-5-2', title: 'Testar amortecimento de velocidade angular', completed: true },
      { id: 'st-5-3', title: 'Testar preservação de momento linear no arremesso', completed: false },
    ],
    codeSnippetPreview: `describe('Antigravity Physics Engine', () => {
  it('should bounce with correct coefficient of restitution', () => {
    const card = new PhysicsCard({ y: 500, vy: 10 });
    card.update(500, 500); // bottom wall
    expect(card.vy).toBeLessThan(0);
  });
});`,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
  },
  {
    id: 'task-6',
    title: 'Configurar Dockerfile multi-stage e build otimizado no Cloud Run',
    description: 'Reduzir tamanho final da imagem de container para menos de 100MB utilizando Alpine, aproveitando cache de camadas e isolando dependências de build.',
    status: 'todo',
    priority: 'p3',
    category: 'devops',
    tags: ['Docker', 'Cloud Run', 'Multi-stage', 'GCP'],
    estimatedHours: 3,
    subtasks: [
      { id: 'st-6-1', title: 'Criar stage de build com node:20-alpine', completed: false },
      { id: 'st-6-2', title: 'Configurar non-root user (node) no runtime', completed: false },
      { id: 'st-6-3', title: 'Subir imagem para o Google Artifact Registry', completed: false },
    ],
    codeSnippetPreview: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]`,
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
  },
];

export function loadTasksFromStorage(): Task[] {
  if (typeof window === 'undefined') return INITIAL_DEV_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveTasksToStorage(INITIAL_DEV_TASKS);
      return INITIAL_DEV_TASKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DEV_TASKS;
  } catch (e) {
    console.error('Falha ao carregar tarefas do localStorage:', e);
    return INITIAL_DEV_TASKS;
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Falha ao salvar tarefas no localStorage:', e);
  }
}
