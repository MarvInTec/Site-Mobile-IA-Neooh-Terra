import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const getNeoResponse = async (message: string, history: { role: string, parts: { text: string }[] }[], location?: { lat: number, lng: number } | null) => {
  if (!apiKey) {
    return "O Agente NEO está em manutenção (Chave de API não configurada).";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "Você é o NEO, o Agente de Inteligência Artificial da NEOOH. Você é inovador, tecnológico e focado em soluções de mídia Out of Home (OOH) e Digital Out of Home (DOOH). Suas respostas devem ser CURTAS, DIRETAS e PRECISAS. Use o Google Maps para fornecer informações precisas sobre localizações, especialmente sobre a NEOOH em São Paulo. Use o site https://neooh.com.br para buscar informações sobre a empresa. Seja prestativo, profissional e use um tom futurista." + (location ? ` O usuário está em: lat ${location.lat}, lng ${location.lng}.` : ""),
        tools: [{ googleMaps: {} }],
        toolConfig: location ? {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        } : undefined
      },
    });

    return response.text || "Desculpe, não consegui processar sua solicitação no momento.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Houve um erro ao conectar com o NEO. Por favor, tente novamente mais tarde.";
  }
};
