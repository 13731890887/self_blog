type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

function getApiKey() {
  return process.env.BAILIAN_API_KEY;
}

function getBaseUrl() {
  return process.env.BAILIAN_BASE_URL ?? 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
}

function getChatModel() {
  return process.env.BAILIAN_CHAT_MODEL ?? 'qwen-plus';
}

function getMoodModel() {
  return process.env.BAILIAN_MOOD_MODEL ?? getChatModel();
}

export function hasBailianConfig() {
  return Boolean(getApiKey());
}

export async function createBailianChatCompletion(messages: ChatMessage[], model = getChatModel()) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('BAILIAN_API_KEY is not configured');
  }

  const response = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.6
    })
  });

  if (!response.ok) {
    throw new Error(`Bailian chat completion failed with ${response.status}`);
  }

  return response.json() as Promise<{
    choices?: Array<{ message?: { content?: string } }>;
  }>;
}

export async function createBailianStream(messages: ChatMessage[], model = getChatModel()) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('BAILIAN_API_KEY is not configured');
  }

  const response = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      stream: true
    })
  });

  if (!response.ok || !response.body) {
    throw new Error(`Bailian streaming request failed with ${response.status}`);
  }

  return response.body;
}

export async function generateMoodOfDay() {
  const completion = await createBailianChatCompletion(
    [
      {
        role: 'system',
        content: 'You generate a daily mood orb for a personal blog. Return only compact JSON with keys color,label,rationale.'
      },
      {
        role: 'user',
        content: 'Choose one mood for today and a matching hex color. Keep label one or two words.'
      }
    ],
    getMoodModel()
  );

  const text = completion.choices?.[0]?.message?.content ?? '';
  return extractJson(text);
}

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('No JSON object found in Bailian response');
  }

  const parsed = JSON.parse(match[0]) as {
    color?: string;
    label?: string;
    rationale?: string;
  };

  return {
    color: typeof parsed.color === 'string' ? parsed.color : '#00D9C0',
    label: typeof parsed.label === 'string' ? parsed.label : 'lucid',
    rationale: typeof parsed.rationale === 'string' ? parsed.rationale : ''
  };
}
