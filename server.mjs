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
  res.send('Servidor Diario IA: Activo 🟢');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    console.log("--> Solicitud recibida en /api/chat");

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: "Eres un asistente de diario personal empático y útil. Responde SIEMPRE en español.",
      messages: convertToModelMessages(messages),
    });

    // --- SOLUCIÓN DE COMPATIBILIDAD ---
    // 1. Generamos la respuesta estándar de Vercel AI
    const aiResponse = result.toDataStreamResponse();

    // 2. Copiamos las cabeceras correctas (esto arregla el formato)
    aiResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // 3. Enviamos el stream directamente (sin tocarlo nosotros)
    const reader = aiResponse.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // 'value' ya viene en el formato correcto (Uint8Array)
      res.write(value);
    }

    res.end();
    console.log("--> Respuesta enviada exitosamente");

  } catch (error) {
    console.error('ERROR CRÍTICO:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno: ' + error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});