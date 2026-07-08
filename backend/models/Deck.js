import mongoose from 'mongoose';

const FlashcardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  type: { type: String, enum: ['definition', 'qa', 'formula', 'concept'], default: 'qa' },
  status: { type: String, enum: ['new', 'learning', 'learned'], default: 'new' }
});

const DeckSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  title: { type: String, required: true },
  learningGoal: { type: String },
  difficulty: { type: String },
  cards: [FlashcardSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Deck || mongoose.model('Deck', DeckSchema);
