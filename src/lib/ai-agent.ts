import { decrypt } from './encryption';

interface AgentConfig {
  model: string;
  api_key_encrypted: string;
  system_prompt: string;
  knowledge_base?: string;
  output_format: string;
  temperature: number;
  max_tokens: number;
}

interface TaskInput {
  title: string;
  description: string;
  tier: string;
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
