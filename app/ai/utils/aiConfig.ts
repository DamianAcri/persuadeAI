// app/ai/utils/aiConfig.ts
import OpenAI from 'openai';

// Configuración de OpenAI
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Función para seleccionar el modelo adecuado según la tarea
// En este caso, siempre usaremos gpt-4o-mini para todas las tareas
export const getAIModel = () => {
  return 'gpt-4o-mini';
};