// import { generateAPIUrl } from "@/utils"; // <--- Lo comentamos para no usar la función que fallaba

interface CategorizeResponse {
  categoryId: string;
  reasoning: string;
  action: "existing" | "new";
  categoryTitle: string;
}

// 👇 TU SERVIDOR DE RENDER (Sin barra al final)
const BACKEND_URL = "https://diario-ia-backend.onrender.com";

/**
 * Calls the AI categorization API to automatically categorize a journal entry
 * @param title - Optional title of the journal entry
 * @param content - Content of the journal entry
 * @param userId - User ID for authentication
 * @returns Category ID and categorization details
 */
export async function categorizeJournalEntry(
  title: string | undefined,
  content: string,
  userId: string
): Promise<CategorizeResponse> {
  try {
    // 👇 Construimos la URL completa aquí mismo
    const fullUrl = `${BACKEND_URL}/api/categorize`;

    console.log("🚀 Intentando conectar con Backend:", fullUrl);

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        userId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Esto nos dará detalles si el servidor responde con error (ej: 500 o 404)
      throw new Error(`Categorization failed: ${response.status} ${errorText}`);
    }

    const result: CategorizeResponse = await response.json();
    console.log("✅ Categorization result:", result);

    return result;
  } catch (error) {
    console.error("❌ Error calling categorization API:", error);
    throw error;
  }
}