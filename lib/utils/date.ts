/**
 * Date formatting utilities for consistent date display across the app
 */

/**
 * Format date as full date with weekday
 * Example: "lunes, 1 de enero de 2024"
 */
export const formatLongDate = (date: Date | string): string => {
  // CAMBIO: "en-US" -> "es-ES"
  return new Date(date).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date as uppercase weekday and date
 * Example: "LUNES 1 de enero de 2024"
 */
export const formatUppercaseDate = (date: Date | string): string => {
  const dateObj = new Date(date);
  // CAMBIO: "en-US" -> "es-ES"
  const dayOfWeek = dateObj
    .toLocaleDateString("es-ES", { weekday: "long" })
    .toUpperCase();
  
  // CAMBIO: "en-US" -> "es-ES"
  const dateStr = dateObj.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  
  return `${dayOfWeek} ${dateStr}`;
};

/**
 * Format time only
 * Example: "2:30 PM" or "14:30" (depending on device settings/locale)
 */
export const formatTime = (date: Date | string): string => {
  // CAMBIO: "en-US" -> "es-ES"
  return new Date(date).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Puedes poner false si prefieres formato 24h (14:30)
  });
};

/**
 * Get current greeting based on time of day
 */
export const getTimeOfDayGreeting = (hour?: number): string => {
  const currentHour = hour ?? new Date().getHours();

  // CAMBIO: Textos traducidos al español
  if (currentHour < 12) return "Buenos Días";
  if (currentHour < 19) return "Buenas Tardes"; 
  return "Buenas Noches";
};