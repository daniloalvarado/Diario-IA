import express from 'express';
import cors from 'cors';
import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';
import * as dotenv from 'dotenv';
import { Readable } from 'node:stream'; // <--- IMPORTANTE: Agregamos esto

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Servidor Diario IA funcionando correctamente 🚀');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Configuración de la IA
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: "Eres un asistente de diario personal empático y útil. Responde SIEMPRE en español.",
      messages: convertToModelMessages(messages),
    });

    // --- CORRECCIÓN DEL ERROR ---
    // En lugar de usar pipeDataStreamToResponse (que falla),
    // convertimos el flujo manualmente a algo que Express entienda.
    
    // 1. Configuramos las cabeceras para streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Vercel-AI-Data-Stream': 'v1'
    });

    // 2. Convertimos el stream web a stream de Node y lo enviamos
    const stream = result.toDataStream();
    Readable.fromWeb(stream).pipe(res);

  } catch (error) {
    console.error('Error en el servidor:', error);
    // Solo enviamos error si las cabeceras no se han enviado ya
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});