
import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  index: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState("");

  const isCorrect = selectedOption === question.correctAnswer || 
    (question.type === 'short-answer' && shortAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim());

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !showAnswer) {
      setShowAnswer(true);
    }
  };

  return (
    <div className="paper-sheet p-8 md:p-16 mb-24 rounded-lg overflow-hidden border border-slate-200">
      {/* Textbook Sidebar Marker */}
      <div className="absolute top-0 left-0 w-10 h-full bg-slate-50 border-r border-slate-200 flex flex-col items-center py-8">
        <span className="font-black text-slate-300 transform -rotate-90 origin-center whitespace-nowrap text-xs uppercase tracking-widest mt-12">
          Section {Math.ceil((index + 1) / 5)} • Problem {index + 1}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 ml-8">
        {/* Figure / Illustration Section */}
        <div className="lg:w-2/5 space-y-6">
           <div className="bg-white border-2 border-slate-100 p-4 rounded shadow-sm">
             <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden rounded relative">
                {question.imageUrl ? (
                  <img 
                    src={question.imageUrl} 
                    alt={`Figure ${index + 1}`} 
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                ) : question.isGeneratingImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Rendering Figure...</span>
                  </div>
                ) : (
                  <div className="text-4xl opacity-10">📖</div>
                )}
             </div>
             <p className="mt-3 text-center font-serif-textbook text-sm italic text-slate-500">
               <span className="font-bold">Figure {index + 1}.</span> {question.illustrationPrompt}
             </p>
           </div>
           
           <div className="hidden lg:block bg-yellow-50/50 p-6 rounded-xl border-l-4 border-yellow-200 rotate-1 shadow-sm">
              <h5 className="font-handwritten text-yellow-700 text-lg mb-1">Teacher's Note:</h5>
              <p className="font-handwritten text-yellow-800 text-base leading-snug">
                Look closely at the diagram before answering! The answer is hidden in the details.
              </p>
           </div>
        </div>

        {/* Content Section */}
        <div className="lg:w-3/5">
          <div className="mb-10">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded mb-4">
              {question.type.replace('-', ' ')}
            </span>
            <h3 className="font-serif-textbook text-3xl md:text-4xl text-slate-800 leading-[1.2]">
              <span className="font-bold mr-4">{index + 1}.</span>
              {question.text}
            </h3>
          </div>

          <div className="space-y-4">
            {question.type === 'multiple-choice' && question.options && (
              <div className="space-y-3">
                {question.options.map((option, i) => (
                  <button
                    key={i}
                    disabled={showAnswer}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full text-left p-4 rounded border-2 transition-all flex items-start gap-4
                      ${selectedOption === option ? 'border-sky-500 bg-sky-50 shadow-sm' : 'border-slate-100 hover:border-slate-300'}
                      ${showAnswer && option === question.correctAnswer ? 'border-emerald-500 bg-emerald-50' : ''}
                      ${showAnswer && selectedOption === option && option !== question.correctAnswer ? 'border-rose-300 bg-rose-50' : ''}
                    `}
                  >
                    <span className={`w-7 h-7 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold
                      ${selectedOption === option ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 text-slate-400'}
                    `}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-serif-textbook text-xl text-slate-700">{option}</span>
                  </button>
                ))}
              </div>
            )}

            {question.type === 'true-false' && (
               <div className="flex gap-4">
                 {['True', 'False'].map((val) => (
                   <button
                    key={val}
                    disabled={showAnswer}
                    onClick={() => setSelectedOption(val)}
                    className={`flex-1 py-4 rounded border-2 font-serif-textbook text-xl font-bold transition-all
                      ${selectedOption === val ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-100 text-slate-400 hover:border-slate-300'}
                      ${showAnswer && val === question.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}
                    `}
                   >
                     {val}
                   </button>
                 ))}
               </div>
            )}

            {question.type === 'short-answer' && (
              <div className="space-y-2">
                <input 
                  type="text"
                  disabled={showAnswer}
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  className="w-full p-4 border-b-2 border-slate-300 focus:border-sky-500 focus:outline-none font-serif-textbook text-2xl italic bg-transparent"
                />
              </div>
            )}
          </div>

          <div className="mt-12">
            {!showAnswer ? (
              <button 
                onClick={() => setShowAnswer(true)}
                disabled={!selectedOption && !shortAnswer}
                className="bg-sky-600 text-white px-10 py-4 rounded font-bold text-sm uppercase tracking-widest shadow-md hover:bg-sky-700 transition-all disabled:opacity-30"
              >
                Submit Response
              </button>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className={`p-6 rounded border-l-8 ${isCorrect || question.type === 'short-answer' ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}>
                   <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                     {isCorrect ? '✅ Evaluation: Correct' : '❌ Evaluation: Review Needed'}
                   </h4>
                   <p className="font-serif-textbook text-lg text-slate-700 mb-4">
                     <span className="font-bold">Correct Key:</span> {question.correctAnswer}
                   </p>
                   <p className="font-serif-textbook text-lg text-slate-600 leading-relaxed italic">
                     "{question.explanation}"
                   </p>
                </div>
                
                <button 
                  onClick={() => { setShowAnswer(false); setSelectedOption(null); setShortAnswer(""); }}
                  className="text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-sky-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
