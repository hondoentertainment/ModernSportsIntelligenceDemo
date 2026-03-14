import { GoogleGenAI } from '@google/genai';

const ALLOWED_METHODS = 'POST, OPTIONS';

function setCorsHeaders(res: any) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Internal Server Error';
}

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on the server.' });
  }

  const body = req.body ?? {};
  if (!body.model || !body.contents) {
    return res.status(400).json({ error: 'Missing required AI request payload.' });
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: body.model,
      contents: body.contents,
      config: body.config,
    });

    return res.status(200).json({
      text: response.text || '',
    });
  } catch (error) {
    console.error('[api/ai/generate]', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
}
