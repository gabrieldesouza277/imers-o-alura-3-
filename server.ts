import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI on the server side
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System instruction for the Antigravity Dev Agent
const ANTIGRAVITY_DEV_SYSTEM_PROMPT = `Você é o "Google Antigravity Agent", o assistente autônomo de engenharia de software para o desenvolvedor na Era da IA.
Sua missão é ajudar engenheiros de software e tech leads a planejar, decompor, priorizar e resolver tarefas de código com precisão de nível sênior.
Você domina arquitetura de software, DevOps, TypeScript, React, Node.js, Cloud, Docker, Bancos de Dados, Segurança e Inteligência Artificial.
Sempre retorne respostas práticas, com foco em código limpo, boas práticas, testes e valor entregue.`;

/**
 * Endpoint: Decompose a high-level developer objective into actionable engineering tasks
 */
app.post('/api/antigravity/decompose', async (req, res) => {
  try {
    const { objective, techStack = [], experienceLevel = 'pleno' } = req.body;

    if (!objective || typeof objective !== 'string') {
      return res.status(400).json({ error: 'O objetivo da meta de desenvolvimento é obrigatório.' });
    }

    const prompt = `Analise a seguinte meta de desenvolvimento de software e a decomponha em 3 a 6 tarefas de engenharia detalhadas, realistas e sequenciadas:

Meta do Desenvolvedor: "${objective}"
Stack Tecnológica selecionada: ${techStack.length > 0 ? techStack.join(', ') : 'Geral (Full-Stack / Cloud)'}
Nível de Experiência: ${experienceLevel}

Para cada tarefa, forneça:
1. title: Título conciso e técnico iniciando com verbo no infinitivo (ex: "Configurar middleware de autenticação JWT")
2. description: Descrição clara do que deve ser feito, critérios de aceitação e recomendações arquiteturais
3. category: Uma destas opções exatas: "frontend", "backend", "devops", "ai", "database", "security", "testing"
4. priority: Uma destas opções exatas: "p1" (Crítica/Bloqueante), "p2" (Alta), "p3" (Média), "p4" (Baixa)
5. estimatedHours: Estimativa realista em horas (número decimal ou inteiro, ex: 1.5, 3, 4)
6. subtasks: Array de 3 a 5 subtarefas de verificação (strings)
7. tags: Array de 2 a 4 tags técnicas (ex: ["TypeScript", "Express", "JWT"])
8. codeSnippetPreview: (Opcional) Snippet de código inicial ou comando terminal relevante

Responda ESTRITAMENTE em formato JSON com o seguinte formato:
{
  "summary": "Breve resumo da estratégia arquitetural proposta (1 a 2 frases)",
  "tasks": [
    {
      "title": "...",
      "description": "...",
      "category": "backend",
      "priority": "p1",
      "estimatedHours": 2.5,
      "subtasks": ["Subtarefa 1", "Subtarefa 2", "Subtarefa 3"],
      "tags": ["Node", "Express"],
      "codeSnippetPreview": "..."
    }
  ]
}`;

    const interaction = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      input: prompt,
      system_instruction: ANTIGRAVITY_DEV_SYSTEM_PROMPT,
      generation_config: {
        max_output_tokens: 3000,
        temperature: 0.2,
      },
    });

    let fullOutput = '';
    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const textContent = step.content?.find((c) => c.type === 'text');
        if (textContent && textContent.text) {
          fullOutput += textContent.text;
        }
      }
    }

    // Parse JSON safely
    const jsonMatch =
      fullOutput.match(/```json\s*([\s\S]*?)\s*```/) ||
      fullOutput.match(/([\{\[][\s\S]*[\}\]])/);

    if (!jsonMatch) {
      throw new Error('Não foi possível processar a resposta do agente.');
    }

    const parsed = JSON.parse(jsonMatch[1]);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Erro em /api/antigravity/decompose:', error);
    return res.status(500).json({
      error: error.message || 'Falha ao processar com Google Antigravity Agent.',
    });
  }
});

/**
 * Endpoint: Dev Copilot / Antigravity Agent solution for a specific task
 */
app.post('/api/antigravity/assist', async (req, res) => {
  try {
    const { taskTitle, taskDescription, category, tags = [], userQuery } = req.body;

    if (!taskTitle) {
      return res.status(400).json({ error: 'Título da tarefa é obrigatório.' });
    }

    const prompt = `Você é o Google Antigravity Agent atuando como Engenheiro Sênior / Dev Copilot.
O desenvolvedor precisa de ajuda para resolver ou acelerar a seguinte tarefa:

Tarefa: "${taskTitle}"
Categoria: "${category || 'software'}"
Descrição Atual: "${taskDescription || 'Sem descrição'}"
Tags: ${tags.join(', ') || 'N/A'}
Dúvida ou Instrução Específica do Usuário: "${userQuery || 'Como implementar esta tarefa com as melhores práticas da era da IA?'}"

Forneça uma resposta técnica, elegante e diretamente utilizável em formato JSON com os campos:
{
  "architecturalAdvice": "Explicação técnica sucinta do design pattern, boas práticas e armadilhas a evitar",
  "implementationCode": "Código de implementação pronto para uso com comentários explicativos (linguagem apropriada para as tags)",
  "codeLanguage": "typescript | javascript | python | bash | sql | etc",
  "cliCommands": ["Comandos de terminal para instalar dependências, rodar testes ou executar a tarefa"],
  "checklist": ["Critérios de aceitação para marcar a tarefa como pronta e sem bugs"],
  "aiSuperpowerTip": "Dica de como ferramentas de IA na Era da IA podem automatizar ou acelerar essa entrega"
}`;

    const interaction = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      input: prompt,
      system_instruction: ANTIGRAVITY_DEV_SYSTEM_PROMPT,
      generation_config: {
        max_output_tokens: 3000,
        temperature: 0.3,
      },
    });

    let fullOutput = '';
    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const textContent = step.content?.find((c) => c.type === 'text');
        if (textContent && textContent.text) {
          fullOutput += textContent.text;
        }
      }
    }

    const jsonMatch =
      fullOutput.match(/```json\s*([\s\S]*?)\s*```/) ||
      fullOutput.match(/([\{\[][\s\S]*[\}\]])/);

    if (!jsonMatch) {
      throw new Error('Falha ao parsear resposta do Dev Copilot.');
    }

    const parsed = JSON.parse(jsonMatch[1]);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Erro em /api/antigravity/assist:', error);
    return res.status(500).json({
      error: error.message || 'Falha ao consultar o Antigravity Dev Copilot.',
    });
  }
});

/**
 * Endpoint: Smart Sprint Optimization & Bottleneck Analysis
 */
app.post('/api/antigravity/optimize-sprint', async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'Nenhuma tarefa informada para análise.' });
    }

    const prompt = `Analise a seguinte lista de tarefas do desenvolvedor e forneça uma otimização de fluxo de trabalho (Flow State / Dev Sprint):

Tarefas atuais:
${JSON.stringify(
  tasks.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    status: t.status,
    category: t.category,
    estimatedHours: t.estimatedHours,
  })),
  null,
  2
)}

Retorne um JSON com:
{
  "executiveSummary": "Resumo executivo do estado atual do projeto e gargalos identificados",
  "recommendedOrderIds": ["id1", "id2", "id3"], // Os IDs das 3 tarefas prioritárias recomendadas para focar imediatamente
  "focusStrategy": "Estratégia recomendada para hoje (ex: Quick Wins primeiro para desbloquear deploy, ou focar no hotfix crítico)",
  "metrics": {
    "totalBacklogHours": 0,
    "bottlenecksCount": 0,
    "completionRatePercentage": 0
  },
  "devProductivityTips": ["Dica 1 para devs na era da IA", "Dica 2 para manter o foco"]
}`;

    const interaction = await ai.interactions.create({
      model: 'gemini-3.8-flash',
      input: prompt,
      system_instruction: ANTIGRAVITY_DEV_SYSTEM_PROMPT,
      generation_config: {
        max_output_tokens: 2000,
        temperature: 0.2,
      },
    });

    let fullOutput = '';
    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const textContent = step.content?.find((c) => c.type === 'text');
        if (textContent && textContent.text) {
          fullOutput += textContent.text;
        }
      }
    }

    const jsonMatch =
      fullOutput.match(/```json\s*([\s\S]*?)\s*```/) ||
      fullOutput.match(/([\{\[][\s\S]*[\}\]])/);

    if (!jsonMatch) {
      throw new Error('Falha ao otimizar sprint com Antigravity.');
    }

    const parsed = JSON.parse(jsonMatch[1]);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Erro em /api/antigravity/optimize-sprint:', error);
    return res.status(500).json({
      error: error.message || 'Falha ao otimizar sprint.',
    });
  }
});

// Configure Vite integration for dev and static serving for production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Google Antigravity Tasks server rodando na porta ${PORT}`);
  });
}

startServer();
