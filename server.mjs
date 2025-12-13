import { groq } from '@ai-sdk/groq';
import { convertToModelMessages, streamText, generateText } from 'ai';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import { createClient } from '@sanity/client';

// 1. Configuración Inicial
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// 2. Cliente de Sanity (Integrado aquí para evitar errores de importación)
const sanity = createClient({
  projectId: process.env.EXPO_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.EXPO_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false, // False para asegurar que leemos los datos más recientes
  apiVersion: '2023-05-03',
  token: process.env.EXPO_PUBLIC_SANITY_TOKEN, // ¡OJO! Asegúrate de tener esta variable en Render
});

// --- RUTA 1: SALUD DEL SERVIDOR ---
app.get('/', (req, res) => {
  res.send('✅ Servidor Diario IA: Operativo (Chat + Categorización)');
});

// --- RUTA 2: CATEGORIZACIÓN AUTOMÁTICA (La lógica que faltaba) ---
app.post('/api/categorize', async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    console.log(`--> 🧠 Categorizando entrada para usuario: ${userId}`);

    // Validaciones básicas
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!content) return res.status(400).json({ error: "Content is required" });

    // A. Obtener categorías existentes de Sanity
    let existingCategories = [];
    try {
      existingCategories = await sanity.fetch(`*[_type == "category"]{_id, title, color}`);
    } catch (err) {
      console.error("⚠️ Error leyendo Sanity (continuando con lista vacía):", err.message);
    }

    const entryText = title ? `Title: ${title}\n\nContent: ${content}` : content;

    // B. Preparar el Prompt para la IA
    const prompt = `You are a categorization expert for a personal journal application.
Analyze the following journal entry and determine the most appropriate category.

ENTRY:
${entryText}

EXISTING CATEGORIES:
${existingCategories.map((c) => `- ${c.title} (ID: ${c._id})`).join("\n")}

INSTRUCTIONS:
1. Review existing categories. Match if possible.
2. Create new ONLY if clearly distinct and useful.
3. OUTPUT FORMAT: Return ONLY a valid JSON object (no markdown). Structure:
{
  "categoryAction": "existing" | "new",
  "categoryId": "string (ID or empty)",
  "newCategoryTitle": "string (Title if new)",
  "newCategoryColor": "string (Hex color if new)",
  "reasoning": "string"
}`;

    // C. Llamada a Groq (No-Streaming)
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: prompt,
    });

    console.log("--> IA Respuesta Cruda:", text);

    // D. Limpieza y Parsing seguro del JSON
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let result;
    
    try {
        result = JSON.parse(cleanText);
    } catch (e) {
        console.error("❌ Error parseando JSON de IA:", cleanText);
        // Fallback para no romper la app
        result = { categoryAction: "new", newCategoryTitle: "General", reasoning: "Error de IA, asignado por defecto." };
    }

    // E. Lógica de Negocio (Crear vs Asignar)
    let finalResponse = {
        categoryId: "",
        categoryTitle: "",
        action: result.categoryAction,
        reasoning: result.reasoning
    };

    if (result.categoryAction === "existing" && result.categoryId) {
        // Verificar que el ID realmente existe
        const found = existingCategories.find(c => c._id === result.categoryId);
        if (found) {
            finalResponse.categoryId = found._id;
            finalResponse.categoryTitle = found.title;
        } else {
            // Si la IA alucinó un ID, forzamos creación de "General"
            result.categoryAction = "new";
            result.newCategoryTitle = "General";
        }
    }

    if (result.categoryAction === "new" || !finalResponse.categoryId) {
        const newTitle = result.newCategoryTitle || "General";
        const newColor = result.newCategoryColor || "#CCCCCC";
        
        console.log(`--> ✨ Creando nueva categoría: ${newTitle}`);
        
        try {
            const newCat = await sanity.create({
                _type: 'category',
                title: newTitle,
                color: newColor,
                userId: userId // Opcional: si tus categorías son por usuario
            });
            finalResponse.categoryId = newCat._id;
            finalResponse.categoryTitle = newCat.title;
            finalResponse.action = "new";
        } catch (sanityError) {
            console.error("❌ Error creando categoría en Sanity:", sanityError);
            return res.status(500).json({ error: "Failed to create category in database" });
        }
    }

    // F. Responder al Frontend
    console.log("--> ✅ Categorización completada:", finalResponse);
    res.json(finalResponse);

  } catch (error) {
    console.error('❌ ERROR FATAL EN CATEGORIZACIÓN:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- RUTA 3: CHAT (Streaming) ---
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userId } = req.body;
    console.log(`--> 💬 Chat iniciado. Usuario: ${userId}`);

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: "Eres un asistente de diario personal empático y útil. Responde SIEMPRE en español.",
      messages: convertToModelMessages(messages),
    });

    const response = result.toUIMessageStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
      },
    });

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

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
    console.log("--> 💬 Respuesta de chat finalizada.");

  } catch (error) {
    console.error('❌ ERROR EN CHAT:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno: ' + error.message });
    }
  }
});

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  console.log(`   - Chat: /api/chat`);
  console.log(`   - Categorizar: /api/categorize`);
});