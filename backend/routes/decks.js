import express from 'express';
import Deck from '../models/Deck.js';

const router = express.Router();

// GET all decks for a session
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });
    const decks = await Deck.find({ sessionId }).sort({ createdAt: -1 });
    res.json({ success: true, decks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a specific deck
router.get('/:id', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const { id } = req.params;
    if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });
    const deck = await Deck.findOne({ _id: id, sessionId });
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.json({ success: true, deck });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a specific deck
router.delete('/:id', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const { id } = req.params;
    if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });
    const deck = await Deck.findOneAndDelete({ _id: id, sessionId });
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.json({ success: true, message: 'Deck deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT (update) a specific deck
router.put('/:id', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const { id } = req.params;
    const body = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });
    const deck = await Deck.findOneAndUpdate({ _id: id, sessionId }, body, { new: true });
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.json({ success: true, deck });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
