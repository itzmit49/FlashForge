import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import connectToDatabase from '@/lib/mongodb';
import Deck from '@/models/Deck';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const file = formData.get('file');
    const title = formData.get('title') || 'Untitled Deck';
    const learningGoal = formData.get('learningGoal') || 'General Knowledge';
    const cardType = formData.get('cardType') || 'mixed';
    const difficulty = formData.get('difficulty') || 'medium';
    const numberOfCards = parseInt(formData.get('numberOfCards') || '10', 10);

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF
    const pdfData = await pdfParse(buffer);
    const textContent = pdfData.text;

    if (!textContent || textContent.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract text from the PDF' }, { status: 400 });
    }

    // Limit text content to avoid token limits (e.g., max ~30,000 chars for prompt safety, depending on model)
    const truncatedText = textContent.substring(0, 50000);

    // Prepare Gemini Prompt
    const prompt = `
You are an expert AI study assistant.
Analyze the following study material extracted from a PDF.
Generate high-quality flashcards based on:
Learning Goal: ${learningGoal}
Card Type: ${cardType}
Difficulty: ${difficulty}
Number of Cards: ${numberOfCards}

Requirements:
- Focus only on important concepts
- Keep flashcards concise
- Make answers clear and easy to remember
- Highlight exam-relevant topics
- If formulas exist, include them
- If definitions exist, convert them into cards
- If concept explanation is needed, keep it short and student-friendly

Return EXACTLY a JSON array in this format, and nothing else (no markdown blocks like \`\`\`json):
[
 {
   "question": "...",
   "answer": "...",
   "type": "definition | qa | formula | concept"
 }
]

Study Material:
${truncatedText}
`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON
    let flashcards;
    try {
      // Clean up potential markdown formatting from Gemini
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.substring(7);
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.substring(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
      
      flashcards = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText);
      return NextResponse.json({ error: 'Failed to generate valid flashcards format.' }, { status: 500 });
    }

    // Save Deck to MongoDB
    const newDeck = new Deck({
      title,
      learningGoal,
      difficulty,
      cards: flashcards
    });

    await newDeck.save();

    return NextResponse.json({ success: true, deckId: newDeck._id, deck: newDeck }, { status: 201 });

  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
