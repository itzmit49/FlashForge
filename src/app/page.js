'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Clock, Layers, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const res = await fetch('/api/decks');
      const data = await res.json();
      if (data.success) {
        setDecks(data.decks);
      }
    } catch (error) {
      console.error('Failed to fetch decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this deck?')) return;
    
    try {
      await fetch(`/api/decks/${id}`, { method: 'DELETE' });
      setDecks(decks.filter(d => d._id !== id));
    } catch (error) {
      console.error('Failed to delete deck:', error);
    }
  };

  // Bauhaus colors array for decorative elements
  const colors = ['bg-primary-red', 'bg-primary-blue', 'bg-primary-yellow'];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary-yellow">
      {/* Header */}
      <header className="bg-white border-b-4 border-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Geometric Logo */}
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-full bg-primary-red border-2 border-black" />
              <div className="w-4 h-4 bg-primary-yellow border-2 border-black" />
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-primary-blue filter drop-shadow-[0_2px_0_rgba(0,0,0,1)]" style={{ transform: 'translateY(1px)' }} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">FlashForge</h1>
          </div>
          <Link 
            href="/create"
            className="inline-flex items-center px-6 py-3 border-2 border-black text-sm font-bold uppercase tracking-wider rounded-none shadow-[4px_4px_0px_0px_black] text-white bg-primary-red hover:bg-primary-red/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200 ease-out"
          >
            <Plus className="w-5 h-5 mr-2 stroke-[3]" />
            New Deck
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 bg-primary-yellow border-4 border-black p-8 shadow-[8px_8px_0px_0px_black] relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase text-black leading-[0.9]">Your Study<br/>Decks</h2>
            <p className="mt-4 text-xl font-medium text-black max-w-xl">Pick up where you left off or create something new.</p>
          </div>
          {/* Decorative Background Element */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary-red rounded-full border-4 border-black translate-x-1/3 -translate-y-1/3 opacity-20" />
          <div className="absolute right-32 bottom-0 w-32 h-32 bg-primary-blue border-4 border-black rotate-45 translate-y-1/2 opacity-20" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-none h-48 border-4 border-black shadow-[8px_8px_0px_0px_black]" />
            ))}
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-none border-4 border-black shadow-[8px_8px_0px_0px_black] relative">
            <div className="w-16 h-16 mx-auto bg-primary-blue border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_black]">
              <BookOpen className="h-8 w-8 text-white stroke-[2]" />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tight text-black mb-2">No decks yet</h3>
            <p className="text-lg font-medium text-black max-w-sm mx-auto mb-8">Get started by generating your first AI-powered flashcard deck.</p>
            <Link
              href="/create"
              className="inline-flex items-center px-8 py-4 border-2 border-black text-sm font-bold uppercase tracking-wider rounded-none shadow-[4px_4px_0px_0px_black] text-white bg-primary-blue hover:bg-primary-blue/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200 ease-out"
            >
              <Plus className="w-5 h-5 mr-2 stroke-[3]" />
              Generate Deck
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {decks.map((deck, index) => {
              const learnedCount = deck.cards?.filter(c => c.status === 'learned').length || 0;
              const totalCards = deck.cards?.length || 0;
              const progress = totalCards > 0 ? Math.round((learnedCount / totalCards) * 100) : 0;
              
              const accentColor = colors[index % colors.length];

              return (
                <Link key={deck._id} href={`/deck/${deck._id}`} className="group relative bg-white rounded-none p-6 border-4 border-black shadow-[8px_8px_0px_0px_black] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_black] transition-all duration-200 ease-out">
                  {/* Decorative Corner Shape */}
                  <div className={`absolute top-0 right-0 w-6 h-6 border-l-4 border-b-4 border-black ${accentColor}`} />
                  
                  <button 
                    onClick={(e) => handleDelete(e, deck._id)}
                    className="absolute top-8 right-4 p-2 bg-white border-2 border-black opacity-0 group-hover:opacity-100 hover:bg-primary-red hover:text-white text-black shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200 rounded-none z-10"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2]" />
                  </button>
                  
                  <div className="mb-6 pt-2">
                    <span className={`inline-flex items-center px-3 py-1 border-2 border-black text-xs font-bold uppercase tracking-widest bg-white text-black mb-4 shadow-[2px_2px_0px_0px_black]`}>
                      {deck.difficulty || 'Mixed'}
                    </span>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-black line-clamp-2 mb-2 leading-tight">{deck.title}</h3>
                    <p className="text-base font-medium text-black line-clamp-1">{deck.learningGoal || 'General Study'}</p>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t-4 border-black flex items-center justify-between text-sm font-bold uppercase text-black">
                    <div className="flex items-center">
                      <Layers className="w-5 h-5 mr-2" />
                      {totalCards} Cards
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      {new Date(deck.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Mini Progress Bar */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="w-full bg-white border-2 border-black h-4 mr-4 relative">
                      <div className={`absolute left-0 top-0 h-full border-r-2 border-black ${accentColor}`} style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-wider text-black">{progress}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
