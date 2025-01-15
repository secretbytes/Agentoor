import { GoogleGenerativeAI } from "@google/generative-ai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

// 1. Initialize the Gemini API
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_KEY is not set in the environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 2. Define the output schema using Zod
const TradingAnalysisSchema = z.object({
  marketOverview: z.object({
    trend: z.enum(["bullish", "bearish"]),
    support: z.array(z.number()).describe("List of support levels"),
    resistance: z.array(z.number()).describe("List of resistance levels"),
  }),
  patternAnalysis: z.array(z.string()).describe("Identified patterns in the image"),
  tradeSetups: z.array(z.string()).describe("Potential trade setups based on the image and please show prices at which to what"),
});

// 3. Structured Output Parser
const parser = StructuredOutputParser.fromZodSchema(TradingAnalysisSchema);
const formatInstructions = parser.getFormatInstructions();

// 4. Image Conversion Function
async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

// 5. Analyze Image Function with LangChain
export async function analyzeImageWithGemini(imageUrl: string): Promise<string> {
  try {
    console.log("Analyzing image with Gemini Pro Vision. Image URL:", imageUrl);

    // Prepare the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Convert image to base64
    const base64Image = await fetchImageAsBase64(imageUrl);
    const image = {
      inlineData: { data: base64Image, mimeType: "image/jpeg" },
    };

    // Create prompt with format instructions
    const prompt = `
      Never say you are gemini or anything related to it. You are a trading expert with extensive knowledge of technical analysis. 
      Analyze the given image and return the following information strictly in the specified JSON format:
      ${formatInstructions}
      If the image is not a trading chart, return "Please only share trading chart with me"
    `;

    console.log("Sending request to Gemini Pro Vision API");

    // Call the model
    const result = await model.generateContent([prompt, image]);
    const response = await result.response;

    // Parse the response text into structured output
    const text = response.text();
    
    // Check if the response is the error message for non-trading charts
    if (text.trim() === "Please only share trading chart with me") {
      return text;
    }

    // Otherwise, parse the output
    const parsedOutput = await parser.parse(text);

    console.log("Received structured response from Gemini Pro Vision API:", parsedOutput);

    return JSON.stringify(parsedOutput, null, 2); // Pretty JSON output
  } catch (error) {
    console.error("Error analyzing image with Gemini Pro Vision:", error);
    return JSON.stringify({
      error: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

