import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadCloud, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSessionId } from '../lib/session';

export default function CreateDeck() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    learningGoal: '',
    cardType: 'qa',
    difficulty: 'medium',
    numberOfCards: 10
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a PDF file.');
      return;
    }

    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title || file.name.replace('.pdf', ''));
    data.append('learningGoal', formData.learningGoal);
    data.append('cardType', formData.cardType);
    data.append('difficulty', formData.difficulty);
    data.append('numberOfCards', formData.numberOfCards);
    data.append('sessionId', getSessionId());

    try {
      const res = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to generate flashcards');
      }

      navigate(`/deck/${result.deckId}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans selection:bg-primary-yellow">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-black hover:text-primary-red mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2 stroke-[3]" />
          Back to Dashboard
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-none border-4 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_black] relative"
        >
          <div className="absolute top-0 right-0 w-16 h-16 border-l-4 border-b-4 border-black bg-primary-yellow" />
          
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black">Create New Deck</h1>
          <p className="text-lg font-medium text-black mb-10 border-b-4 border-black pb-6">Upload your study material and let AI do the rest.</p>

          {error && (
            <div className="bg-primary-red text-white p-4 rounded-none mb-8 text-sm font-bold border-4 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_black]">
              Error: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-black mb-3">Study Material (PDF)</label>
              <div className="mt-1 flex justify-center px-6 pt-8 pb-10 border-4 border-black border-dashed rounded-none bg-primary-yellow/10 hover:bg-primary-yellow/20 transition-none cursor-pointer">
                <div className="space-y-4 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-black stroke-[2]" />
                  <div className="flex text-sm text-black justify-center font-bold">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-none text-primary-blue hover:text-primary-red underline uppercase tracking-wider">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={handleFileChange} />
                    </label>
                  </div>
                  <p className="text-sm font-bold text-black uppercase tracking-widest">
                    {file ? file.name : 'PDF up to 10MB'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-black mb-3">Deck Title (Optional)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="E.G. CHAPTER 4: CELL BIOLOGY"
                className="w-full rounded-none border-4 border-black bg-white px-4 py-4 text-base font-bold focus:ring-0 focus:border-primary-blue placeholder-gray-400 outline-none transition-none shadow-[4px_4px_0px_0px_black] focus:shadow-[6px_6px_0px_0px_black]"
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-black mb-3">Learning Goal</label>
              <textarea
                name="learningGoal"
                value={formData.learningGoal}
                onChange={handleInputChange}
                rows={3}
                placeholder="WHAT DO YOU WANT TO LEARN? (E.G. MEMORIZE KEY FORMULAS FOR THE EXAM)"
                className="w-full rounded-none border-4 border-black bg-white px-4 py-4 text-base font-bold focus:ring-0 focus:border-primary-blue placeholder-gray-400 outline-none transition-none shadow-[4px_4px_0px_0px_black] focus:shadow-[6px_6px_0px_0px_black]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-black mb-3">Card Type</label>
                <select
                  name="cardType"
                  value={formData.cardType}
                  onChange={handleInputChange}
                  className="w-full rounded-none border-4 border-black bg-white px-4 py-4 text-base font-bold uppercase tracking-wider focus:ring-0 focus:border-primary-blue outline-none shadow-[4px_4px_0px_0px_black]"
                >
                  <option value="qa">Q&A</option>
                  <option value="definition">Definitions</option>
                  <option value="formula">Formulas</option>
                  <option value="concept">Concepts</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-black mb-3">Difficulty</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full rounded-none border-4 border-black bg-white px-4 py-4 text-base font-bold uppercase tracking-wider focus:ring-0 focus:border-primary-blue outline-none shadow-[4px_4px_0px_0px_black]"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-black mb-3">Card Count</label>
                <input
                  type="number"
                  name="numberOfCards"
                  min="1"
                  max="50"
                  value={formData.numberOfCards}
                  onChange={handleInputChange}
                  className="w-full rounded-none border-4 border-black bg-white px-4 py-4 text-base font-bold focus:ring-0 focus:border-primary-blue outline-none shadow-[4px_4px_0px_0px_black]"
                />
              </div>
            </div>

            <div className="pt-8 mt-8 border-t-4 border-black">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-5 px-6 border-4 border-black rounded-none shadow-[6px_6px_0px_0px_black] text-lg font-black uppercase tracking-widest text-white bg-primary-red hover:bg-primary-red/90 focus:outline-none focus:ring-4 focus:ring-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[6px_6px_0px_0px_black]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-6 w-6 stroke-[3]" />
                    Analyzing PDF...
                  </>
                ) : (
                  'Generate Flashcards'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
