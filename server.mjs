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
    console.log("1. Recibiendo mensaje del usuario...");

    // Verificación rápida de la llave (solo para ver si existe, no la imprime completa por seguridad)
    if (!process.env.GROQ_API_KEY) {
        console.error("ERROR CRÍTICO: No se encontró GROQ_API_KEY en las variables de entorno.");
        return res.status(500).json({ error: "Falta API Key en el servidor" });
    }
    console.log(`2. API Key detectada (Longitud: ${process.env.GROQ_API_KEY.length})`);

    console.log("3. Iniciando solicitud a Groq...");
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: "Eres un asistente de diario personal empático y útil. Responde SIEMPRE en español.",
      messages: convertToModelMessages(messages),
    });

    console.log("4. Configurando cabeceras de respuesta...");
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Vercel-AI-Data-Stream': 'v1'
    });

    console.log("5. Entrando al bucle de stream...");
    let chunkCount = 0;
    
    for await (const chunk of result.textStream) {
      if (chunkCount === 0) console.log("6. ¡PRIMER DATO RECIBIDO DE LA IA!"); // Si ves esto, funciona
      res.write(`0:${JSON.stringify(chunk)}\n`);
      chunkCount++;
    }

    console.log(`7. Stream finalizado. Se enviaron ${chunkCount} fragmentos.`);
    res.end();

  } catch (error) {
    console.error('ERROR EN EL PROCESO:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});