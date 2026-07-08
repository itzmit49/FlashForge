import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle, CheckCircle, Download, FileText } from 'lucide-react';
import { getSessionId } from '../lib/session';

export default function StudyDeck() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchDeck();
  }, [id]);

  const fetchDeck = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/decks/${id}?sessionId=${getSessionId()}`);
      if (!res.ok) throw new Error('Failed to load deck');
      const data = await res.json();
      setDeck(data.deck);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (deck && currentIndex < deck.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const handleShuffle = () => {
    if (!deck) return;
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    setDeck({ ...deck, cards: shuffled });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleMarkLearned = async () => {
    if (!deck) return;
    
    const updatedCards = [...deck.cards];
    updatedCards[currentIndex].status = 'learned';
    
    setDeck({ ...deck, cards: updatedCards });
    
    try {
      await fetch(`http://localhost:5000/api/decks/${id}?sessionId=${getSessionId()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: updatedCards })
      });
    } catch (err) {
      console.error('Failed to update card status', err);
    }
    
    handleNext();
  };

  const handleExportCSV = () => {
    if (!deck) return;
    import('papaparse').then((Papa) => {
      const csv = Papa.unparse(deck.cards.map(c => ({ Question: c.question, Answer: c.answer, Type: c.type })));
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${deck.title || 'deck'}.csv`;
      link.click();
      setShowExportMenu(false);
    });
  };

  const handleExportPDF = () => {
    if (!deck) return;
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(deck.title || 'Flashcard Deck', 20, 20);
      
      doc.setFontSize(12);
      let y = 30;
      deck.cards.forEach((card, i) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFont(undefined, 'bold');
        const qLines = doc.splitTextToSize(`Q: ${card.question}`, 170);
        doc.text(qLines, 20, y);
        y += qLines.length * 7;
        
        doc.setFont(undefined, 'normal');
        const aLines = doc.splitTextToSize(`A: ${card.answer}`, 170);
        doc.text(aLines, 20, y);
        y += aLines.length * 7 + 10;
      });
      
      doc.save(`${deck.title || 'deck'}.pdf`);
      setShowExportMenu(false);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-8 border-primary-blue border-t-primary-red rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_black] text-center">
          <p className="text-xl font-black uppercase text-primary-red mb-6">{error || 'Deck not found'}</p>
          <Link to="/" className="inline-block px-6 py-3 bg-black text-white font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const currentCard = deck.cards[currentIndex];
  const progress = ((currentIndex + 1) / deck.cards.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 font-sans flex flex-col selection:bg-primary-yellow">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
          <Link to="/" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-black hover:text-primary-red transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2 stroke-[3]" />
            Dashboard
          </Link>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center px-4 py-2 bg-white border-2 border-black rounded-none text-sm font-bold uppercase tracking-wider text-black hover:bg-primary-yellow shadow-[4px_4px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <Download className="w-4 h-4 mr-2 stroke-[3]" />
              Export
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_black] py-1 z-20">
                <button onClick={handleExportCSV} className="w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wider text-black hover:bg-primary-yellow inline-flex items-center border-b-2 border-transparent hover:border-black">
                  <FileText className="w-4 h-4 mr-2 stroke-[2]" /> Export to CSV
                </button>
                <button onClick={handleExportPDF} className="w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wider text-black hover:bg-primary-yellow inline-flex items-center">
                  <FileText className="w-4 h-4 mr-2 stroke-[2]" /> Export to PDF
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-12 text-center relative">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black mb-4">{deck.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm font-bold uppercase tracking-widest text-black mb-6">
            <span className="border-2 border-black px-3 py-1 bg-white">{currentIndex + 1} of {deck.cards.length} Cards</span>
            {currentCard?.status === 'learned' && (
              <span className="inline-flex items-center bg-primary-yellow border-2 border-black px-3 py-1 text-black">
                <CheckCircle className="w-4 h-4 mr-2 stroke-[3]" /> Learned
              </span>
            )}
          </div>
          
          <div className="w-full max-w-2xl mx-auto h-4 bg-white border-2 border-black rounded-none mt-6 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary-blue border-r-2 border-black transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex + (isFlipped ? '-flipped' : '-front')}
              initial={{ rotateX: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              className={`w-full max-w-2xl min-h-[350px] md:min-h-[450px] rounded-none shadow-[12px_12px_0px_0px_black] cursor-pointer p-8 md:p-12 flex flex-col items-center justify-center text-center relative border-4 border-black ${isFlipped ? 'bg-primary-yellow' : 'bg-white'}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`absolute top-4 left-4 w-4 h-4 rounded-full border-2 border-black ${isFlipped ? 'bg-white' : 'bg-primary-red'}`} />
              <div className={`absolute top-4 right-4 w-4 h-4 border-2 border-black ${isFlipped ? 'bg-white' : 'bg-primary-blue'}`} />
              
              <div className="absolute top-6 text-sm font-black uppercase tracking-widest text-black border-b-2 border-black pb-1">
                {isFlipped ? 'Answer' : 'Question'} • {currentCard?.type}
              </div>
              
              <div className={`text-2xl md:text-4xl font-black uppercase tracking-tight text-black mt-8`}>
                {isFlipped ? currentCard?.answer : currentCard?.question}
              </div>
              
              <div className="absolute bottom-6 text-sm font-bold uppercase tracking-widest text-black/50">
                Click to flip
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-16 mb-8 flex items-center justify-center gap-4 md:gap-8">
          <button 
            onClick={handleShuffle}
            className="p-4 bg-white border-2 border-black text-black hover:bg-primary-yellow shadow-[4px_4px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none"
            title="Shuffle Deck"
          >
            <Shuffle className="w-6 h-6 stroke-[3]" />
          </button>
          
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-4 bg-white border-4 border-black text-black rounded-full hover:bg-primary-red hover:text-white shadow-[6px_6px_0px_0px_black] disabled:opacity-50 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[6px_6px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <ChevronLeft className="w-8 h-8 stroke-[3]" />
          </button>
          
          <button 
            onClick={handleMarkLearned}
            className="px-8 py-4 bg-white border-4 border-black text-black text-lg font-black uppercase tracking-widest rounded-none hover:bg-primary-yellow shadow-[6px_6px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all inline-flex items-center"
          >
            <CheckCircle className="w-6 h-6 mr-3 stroke-[3]" /> Mark Learned
          </button>
          
          <button 
            onClick={handleNext}
            disabled={currentIndex === deck.cards.length - 1}
            className="p-4 bg-primary-blue border-4 border-black text-white rounded-full hover:bg-primary-blue/90 shadow-[6px_6px_0px_0px_black] disabled:opacity-50 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[6px_6px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <ChevronRight className="w-8 h-8 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}
