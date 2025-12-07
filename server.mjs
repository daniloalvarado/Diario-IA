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
    console.log("--> Solicitud recibida. Procesando con Groq...");

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: "Eres un asistente de diario personal empático y útil. Responde SIEMPRE en español.",
      messages: convertToModelMessages(messages),
    });

    // --- MODO MANUAL INDESTRUCTIBLE ---
    // 1. Configuramos las cabeceras exactas que espera Expo/Vercel AI
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Vercel-AI-Data-Stream': 'v1'
    });

    // 2. Iteramos el texto generado y lo enviamos con el formato "0:texto"
    // Este formato es el protocolo oficial que usa tu App para entender el stream.
    for await (const textPart of result.textStream) {
      res.write(`0:${JSON.stringify(textPart)}\n`);
    }

    res.end();
    console.log("--> Respuesta enviada correctamente.");

  } catch (error) {
    console.error('ERROR EN EL PROCESO:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno: ' + error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});