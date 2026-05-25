import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Deck from '@/models/Deck';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    await connectToDatabase();
    
    const deck = await Deck.findById(id);
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    if (deck.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json({ success: true, deck }, { status: 200 });
  } catch (error) {
    console.error('Error fetching deck:', error);
    return NextResponse.json({ error: 'Failed to fetch deck' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    await connectToDatabase();
    
    const deck = await Deck.findById(id);
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    if (deck.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Deck.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true, message: 'Deck deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    const body = await req.json();
    
    await connectToDatabase();
    
    const deck = await Deck.findById(id);
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    if (deck.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedDeck = await Deck.findByIdAndUpdate(id, body, { new: true });
    
    return NextResponse.json({ success: true, deck: updatedDeck }, { status: 200 });
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 });
  }
}
