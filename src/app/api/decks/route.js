import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Deck from '@/models/Deck';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    // Fetch all decks for this session, sorted by newest first
    const decks = await Deck.find({ sessionId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, decks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 });
  }
}
