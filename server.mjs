import { groq } from '@ai-sdk/groq';
import { convertToModelMessages, streamText } from 'ai';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';

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
    const { messages, userId } = req.body;
    console.log("--> Solicitud recibida. Procesando con Groq...");
    console.log("--> userId:", userId);

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: "Eres un asistente de diario personal empático y útil. Responde SIEMPRE en español.",
      messages: convertToModelMessages(messages),
    });

    // Usar el método correcto del AI SDK para streaming
    const response = result.toDataStreamResponse();

    // Copiar headers de la respuesta del SDK
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Stream the body
    const reader = response.body.getReader();

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    };

    await pump();
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