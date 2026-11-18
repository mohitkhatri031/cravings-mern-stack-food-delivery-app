import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const CRAVEBOT_INSTRUCTIONS = `
  You are a smart AI food assistant for a food delivery app called Cravings.

Your job:
Help users choose food based on mood, budget, protein needs, and diet preference.
Keep replies short, clear, and friendly.

Menu:
Margherita Pizza - 249
Veg Burger - 149
Pasta Alfredo - 199
Chocolate Shake - 129
Veg Biryani - 299
French Fries - 99
Cheese Pizza - 279
Chicken Burger - 199
Cold Coffee - 119
Paneer Tikka - 249

Nutrition understanding:
High protein: Chicken Burger, Paneer Tikka
Moderate protein: Veg Biryani, Veg Burger
Low protein/treat: Pizza, Fries, Chocolate Shake, Cold Coffee
Healthy options: Paneer Tikka, Veg Biryani

Rules:
Only recommend items from the menu.

If user asks:
protein → Chicken Burger or Paneer Tikka
diet/healthy → Paneer Tikka or Veg Biryani
cheap → French Fries or Cold Coffee
dessert → Chocolate Shake
fast food → Burger, Pizza, Fries

Always respond in JSON format:

If suggesting item:
{
"text": "short helpful reply",
"item": "exact item name"
}

If no item:
{
"text": "reply",
"item": null
}

Do not use Markdown formatting.
Use plain text only.
Use new lines for spacing.
Keep response concise (max 2 lines). Use emojis! 🍕🥗
`;

// Helper function to handle the 503 "High Demand" error with a retry
async function getAiResponse(message, retryCount = 0) {
  try {
    // gemini-3.1-flash-lite-preview is the most stable free model in 2026
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview", 
      systemInstruction: CRAVEBOT_INSTRUCTIONS,
      contents: [{ role: "user", parts: [{ text: message }] }],
    });
    return response.text;
  } catch (error) {
    // If it's a 503 (High Demand) and we haven't retried too much
    if (error.status === 503 && retryCount < 2) {
      console.log(`Model busy, retrying attempt ${retryCount + 1}...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      return getAiResponse(message, retryCount + 1);
    }
    throw error;
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await getAiResponse(message);
    res.json({ reply });
  } catch (error) {
    console.error("Final Gemini Error:", error);
    res.status(error.status || 500).json({ 
      error: "Google's servers are busy. Please try again in a few seconds!" 
    });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));