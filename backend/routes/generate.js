import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import Deck from '../models/Deck.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title = 'Untitled Deck', learningGoal = 'General Knowledge', cardType = 'mixed', difficulty = 'medium', numberOfCards = '10', sessionId } = req.body;
    const file = req.file;

    if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Parse PDF
    const pdfData = await pdfParse(file.buffer);
    const textContent = pdfData.text;

    if (!textContent || textContent.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from the PDF' });
    }

    const truncatedText = textContent.substring(0, 50000);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `
You are an expert AI study assistant.
Analyze the following study material extracted from a PDF.
Generate high-quality flashcards based on:
Learning Goal: ${learningGoal}
Card Type: ${cardType}
Difficulty: ${difficulty}
Number of Cards: ${parseInt(numberOfCards, 10)}

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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let flashcards;
    try {
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
      return res.status(500).json({ error: 'Failed to generate valid flashcards format.' });
    }

    const newDeck = new Deck({
      sessionId,
      title,
      learningGoal,
      difficulty,
      cards: flashcards
    });

    await newDeck.save();

    res.status(201).json({ success: true, deckId: newDeck._id, deck: newDeck });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

export default router;
