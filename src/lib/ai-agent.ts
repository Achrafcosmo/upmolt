import { decrypt } from './encryption';

interface TaskInput {
  task_id?: string;
  title: string;
  description: string;
  tier: string;
}

export async function runWebhookAgent(webhookUrl: string, webhookSecret: string | null, task: TaskInput): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (webhookSecret) headers['X-Webhook-Secret'] = webhookSecret;

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      task_id: task.task_id,
      title: task.title,
      description: task.description,
      tier: task.tier,
      callback_url: 'https://upmolt.vercel.app/api/tasks/callback',
    }),
  });

  if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
  if (res.status === 202) return '__ASYNC_PROCESSING__';

  const data = await res.json();
  return data.result || data.content || JSON.stringify(data);
}

export async function runOpenAIAssistant(apiKey: string, assistantId: string, task: TaskInput): Promise<string> {
  const threadRes = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'OpenAI-Beta': 'assistants=v2' },
    body: JSON.stringify({ messages: [{ role: 'user', content: `Task: ${task.title}\n\nDetails: ${task.description}\n\nTier: ${task.tier}` }] }),
  });
  const thread = await threadRes.json();

  const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'OpenAI-Beta': 'assistants=v2' },
    body: JSON.stringify({ assistant_id: assistantId }),
  });
  const run = await runRes.json();

  let status = run.status;
  let attempts = 0;
  while (status !== 'completed' && status !== 'failed' && attempts < 60) {
    await new Promise(r => setTimeout(r, 2000));
    const checkRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'OpenAI-Beta': 'assistants=v2' },
    });
    const checkData = await checkRes.json();
    status = checkData.status;
    attempts++;
  }

  if (status !== 'completed') throw new Error(`Assistant run ${status}`);

  const msgsRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'OpenAI-Beta': 'assistants=v2' },
  });
  const msgs = await msgsRes.json();
  const lastMsg = msgs.data[0];
  return lastMsg.content[0]?.text?.value || 'No response from assistant';
}

interface AgentConfig {
  model: string;
  api_key_encrypted: string;
  system_prompt: string;
  knowledge_base?: string;
  output_format: string;
  temperature: number;
  max_tokens: number;
}

export async function runAgent(config: AgentConfig, task: TaskInput): Promise<string> {
  const apiKey = decrypt(config.api_key_encrypted);
  const model = config.model || 'gpt-4o';

  const messages: { role: string; content: string }[] = [];

  let systemContent = config.system_prompt || 'You are a helpful AI agent.';
  if (config.knowledge_base) {
    systemContent += '\n\n## Reference Knowledge\n' + config.knowledge_base;
  }
  systemContent += `\n\nOutput format: ${config.output_format}`;
  messages.push({ role: 'system', content: systemContent });

  messages.push({
    role: 'user',
    content: `Task: ${task.title}\n\nDetails: ${task.description}\n\nTier: ${task.tier}`
  });

  if (model.startsWith('claude')) {
    return await callAnthropic(apiKey, model, messages, config);
  } else {
    return await callOpenAI(apiKey, model, messages, config);
  }
}

async function callOpenAI(apiKey: string, model: string, messages: { role: string; content: string }[], config: AgentConfig): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: config.temperature || 0.7,
      max_tokens: config.max_tokens || 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropic(apiKey: string, model: string, messages: { role: string; content: string }[], config: AgentConfig): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMsgs = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role,
    content: m.content,
  }));

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      system: systemMsg,
      messages: userMsgs,
      temperature: config.temperature || 0.7,
      max_tokens: config.max_tokens || 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}
