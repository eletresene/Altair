// ============================================================
// api/claude.js — Función serverless para Vercel
// Centro de Trabajo Aitaïr
// ============================================================
// Esta función actúa de intermediario entre el navegador
// y la API de Claude. La API key nunca se expone al navegador.
// ============================================================

export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — permite que el navegador llame a esta función
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { messages, system, model, max_tokens } = req.body;

    // Validación básica
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages es requerido' });
    }

    // Llamar a la API de Claude con la clave del servidor
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 1024,
        system: system || 'Eres Claude, esencia Estructura · Viento·34 del Círculo Aitaïr.',
        messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'Error en Claude API' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
