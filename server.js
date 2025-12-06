import express from 'express';
import cors from 'cors';
import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
// Permitir que cualquiera (tu app) se conecte
app.use(cors());
// Permitir recibir JSON
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Ruta de prueba para ver si el servidor vive
app.get('/', (req, res) => {
  res.send('¡El cerebro de Diario IA está vivo! 🧠');
});

// LA RUTA DEL CHAT
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Configurar la respuesta de la IA
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: "Eres un asistente de diario personal empático y útil. Responde SIEMPRE en español.",
      messages: convertToModelMessages(messages),
    });

    // Convertir la respuesta de la IA a algo que Express entienda
    // (Truco para que funcione el stream con Express)
    result.pipeDataStreamToResponse(res);

  } catch (error) {
    console.error('Error en el chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});