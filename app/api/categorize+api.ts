import { createCategory, fetchCategories } from "@/lib/sanity/categories";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai"; // <--- CAMBIO: Usamos generateText en vez de generateObject

export async function POST(req: Request) {
  try {
    const { title, content, userId } = await req.json();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!content) {
      return new Response("Content is required", { status: 400 });
    }

    console.log("Categorizing entry:", {
      title,
      contentLength: content.length,
    });

    const existingCategories = await fetchCategories();
    
    const entryText = title
      ? `Title: ${title}\n\nContent: ${content}`
      : content;

    // Construimos un prompt que incluye la estructura JSON deseada como texto
    const prompt = `You are a categorization expert for a personal journal application.

Analyze the following journal entry and determine the most appropriate category.

ENTRY:
${entryText}

EXISTING CATEGORIES:
${existingCategories
  .map((c) => `- ${c.title} (ID: ${c._id}) [Color: ${c.color || "none"}]`)
  .join("\n")}

INSTRUCTIONS:
1. Review existing categories. Match if possible.
2. Create new ONLY if clearly distinct and useful.
3. OUTPUT FORMAT: You must return ONLY a valid JSON object. Do not wrap in markdown blocks like \`\`\`json. The JSON must match this structure exactly:

{
  "categoryAction": "existing" | "new",
  "categoryId": "string (ID from list above, or empty string if new)",
  "newCategoryTitle": "string (Title for new category, or empty string if existing)",
  "newCategoryColor": "string (Hex color for new category, or empty string if existing)",
  "reasoning": "string (Brief explanation)"
}

IMPORTANT: Prefer using existing categories.
`;

    // Usamos generateText para evitar conflictos de "response_format"
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: prompt,
    });

    // Limpiamos la respuesta por si el modelo añadió bloques de código markdown
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    console.log("AI Raw Output:", cleanText);

    let resultObject;
    try {
        resultObject = JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse AI JSON:", cleanText);
        throw new Error("AI did not return valid JSON");
    }

    console.log("Parsed result:", resultObject);

    let categoryId: string;
    let categoryTitle: string;

    if (resultObject.categoryAction === "existing") {
      if (!resultObject.categoryId || resultObject.categoryId.trim() === "") {
         // Fallback por si la IA falla
         categoryId = existingCategories[0]?._id; 
         categoryTitle = existingCategories[0]?.title || "Sin Categoría";
      } else {
         categoryId = resultObject.categoryId;
         categoryTitle = existingCategories.find((c) => c._id === categoryId)?.title || "Desconocida";
      }
      console.log("Using existing category:", categoryId, categoryTitle);
    } else {
      // Create a new category
      if (!resultObject.newCategoryTitle || resultObject.newCategoryTitle.trim() === "") {
         resultObject.newCategoryTitle = "General";
         resultObject.newCategoryColor = "#CCCCCC";
      }

      console.log("Creating new category:", resultObject.newCategoryTitle);

      const newCategory = await createCategory({
        title: resultObject.newCategoryTitle,
        color: resultObject.newCategoryColor || "#000000",
      });

      categoryId = newCategory._id;
      categoryTitle = resultObject.newCategoryTitle;
      console.log("Created new category with ID:", categoryId);
    }

    return Response.json({
      categoryId,
      reasoning: resultObject.reasoning,
      action: resultObject.categoryAction,
      categoryTitle,
    });

  } catch (error) {
    console.error("Error in categorization:", error);
    return new Response(
      `Failed to categorize entry: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}