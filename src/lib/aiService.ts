import { GoogleGenAI, Type } from "@google/genai";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PredictionData {
  medicineName: string;
  predictedStockOutDate: string;
  confidence: number;
  reasoning: string;
  suggestedAction: string;
}

export const aiService = {
  async predictShortages(): Promise<PredictionData[]> {
    // Fetch latest 100 inventory logs for analysis
    const logsQ = query(
      collection(db, 'inventory_logs'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(logsQ);
    const logs = snapshot.docs.map(doc => doc.data());

    if (logs.length === 0) return [];

    const prompt = `Act as a Pharmaceutical Supply Chain Analyst. 
    Analyze the following 100 recent inventory movement logs (quantities changing over time):
    Logs: ${JSON.stringify(logs)}
    
    Current Date: ${new Date().toLocaleDateString()}

    Task:
    1. Group logs by medicineName.
    2. Calculate consumption rates (quantityChange < 0 events).
    3. Predict the date when stock will reach ZERO for EACH medicine.
    4. Provide actionable insights (e.g., 'Restock from Distributor X').
    
    Output exactly as JSON array matching schema. Use ISO dates.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                medicineName: { type: Type.STRING },
                predictedStockOutDate: { type: Type.STRING, description: "ISO date string" },
                confidence: { type: Type.NUMBER, description: "0 to 1 scale" },
                reasoning: { type: Type.STRING },
                suggestedAction: { type: Type.STRING }
              },
              required: ["medicineName", "predictedStockOutDate", "confidence", "reasoning", "suggestedAction"]
            }
          }
        }
      });

      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("AI Prediction Error:", error);
      return [];
    }
  }
};
