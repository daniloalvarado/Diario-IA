import express from 'express';
import cors from 'cors';
import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Servidor Diario IA funcionando 🚀');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    console.log("Recibiendo mensaje para IA...");

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: "Eres un asistente de diario personal empático y útil. Responde SIEMPRE en español.",
      messages: convertToModelMessages(messages),
    });

    // --- MODO MANUAL (A PRUEBA DE ERRORES) ---
    // Configuramos las cabeceras necesarias
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Vercel-AI-Data-Stream': 'v1'
    });

    // Iteramos el flujo de texto manualmente y lo enviamos
    // en el formato que la App espera (0:"texto")
    for await (const chunk of result.textStream) {
      res.write(`0:${JSON.stringify(chunk)}\n`);
    }

    res.end();

  } catch (error) {
    console.error('Error en el chat:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});