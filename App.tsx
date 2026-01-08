
import React, { useState } from 'react';
import Layout from './components/Layout';
import FileUpload from './components/FileUpload';
import QuestionCard from './components/QuestionCard';
import { AppState, TextbookAnalysis, Question, SketchStyle, DifficultyLevel, GradeLevel } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('upload');
  const [analysis, setAnalysis] = useState<TextbookAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<SketchStyle>('pencil');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('similar');
  const [grade, setGrade] = useState<GradeLevel>('Elementary (K-5)');
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const handleImageSelected = (base64: string) => {
    setPendingImage(base64);
    setState('grade_selection');
  };

  const handleStartAnalysis = async () => {
    if (!pendingImage) return;
    
    setState('analyzing');
    setError(null);
    try {
      const result = await geminiService.analyzeTextbookPage(pendingImage, grade, difficulty);
      
      const initializedQuestions = result.questions.map(q => ({
        ...q,
        isGeneratingImage: true
      }));

      setAnalysis({ ...result, questions: initializedQuestions });
      setState('results');

      // Generate illustrations in the background
      generateImagesSequentially(initializedQuestions, selectedStyle);

    } catch (err: any) {
      setError(err.message || "Oops! The research engines were interrupted. Let's try again! ✏️");
      setState('upload');
    }
  };

  const generateImagesSequentially = async (questions: Question[], style: SketchStyle) => {
    for (const q of questions) {
      try {
        const imageUrl = await geminiService.generateIllustration(q.illustrationPrompt, style);
        setAnalysis(prev => {
          if (!prev) return null;
          return {
            ...prev,
            questions: prev.questions.map(item => 
              item.id === q.id ? { ...item, imageUrl, isGeneratingImage: false } : item
            )
          };
        });
      } catch (err) {
        setAnalysis(prev => {
          if (!prev) return null;
          return {
            ...prev,
            questions: prev.questions.map(item => 
              item.id === q.id ? { ...item, isGeneratingImage: false } : item
            )
          };
        });
      }
    }
  };

  const styleOptions: { id: SketchStyle; label: string; icon: string }[] = [
    { id: 'pencil', label: 'Technical', icon: '📐' },
    { id: 'watercolor', label: 'Watercolor', icon: '🎨' },
    { id: 'chalkboard', label: 'Draft', icon: '✏️' },
    { id: 'crayon', label: 'Simple', icon: '🖍️' },
  ];

  const gradeOptions: GradeLevel[] = ['Elementary (K-5)', 'Middle School (6-8)', 'High School (9-12)', 'College/Expert'];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12 w-full">
        {state === 'upload' && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-16 relative">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-7xl animate-bounce">✨</div>
              <h2 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter">
                Edu<span className="text-sky-500 italic">Genie</span>
              </h2>
              <p className="text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                Transform any textbook page into a <span className="text-sky-500 font-black">Curriculum-Aligned</span> practice workbook.
              </p>
            </div>
            
            <FileUpload onFileSelect={handleImageSelected} isProcessing={false} />
            
            <div className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { title: "AI Research", desc: "Our engine scans curriculum standards to build grade-appropriate challenges.", color: "bg-white border-sky-200", icon: "🌐" },
                 { title: "Visual Logic", desc: "Dynamic illustrations help visualize complex textbook concepts.", color: "bg-white border-amber-200", icon: "🎨" },
                 { title: "Universal Prep", desc: "From K-5 to College, EduGenie adapts to your specific academic level.", color: "bg-white border-emerald-200", icon: "🎓" }
               ].map((feature, i) => (
                 <div key={i} className={`${feature.color} p-10 rounded-[2rem] border-4 shadow-xl hover:-translate-y-2 transition-all duration-300`}>
                   <div className="text-6xl mb-8">{feature.icon}</div>
                   <h4 className="text-2xl font-black text-slate-800 mb-4">{feature.title}</h4>
                   <p className="text-slate-500 font-medium text-lg leading-relaxed">{feature.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {state === 'grade_selection' && (
          <div className="animate-in slide-in-from-bottom-10 duration-500 max-w-4xl mx-auto">
            <div className="bg-white p-12 rounded-[3rem] border-4 border-slate-100 shadow-2xl">
              <h3 className="text-4xl font-black text-slate-800 mb-2 text-center">Customize Your Workbook</h3>
              <p className="text-center text-slate-500 mb-12">Tell us more about the student for better AI research results.</p>
              
              <div className="space-y-12">
                <section>
                  <label className="block text-slate-400 font-black uppercase tracking-widest text-xs mb-6 text-center">Select Grade Level</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {gradeOptions.map(g => (
                      <button
                        key={g}
                        onClick={() => setGrade(g)}
                        className={`p-6 rounded-2xl border-4 text-center transition-all bouncy
                          ${grade === g ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-lg' : 'border-slate-50 bg-white hover:border-slate-100 text-slate-400'}
                        `}
                      >
                        <span className="font-bold text-sm leading-tight block">{g}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <label className="block text-slate-400 font-black uppercase tracking-widest text-xs mb-6 text-center">Challenge Intensity</label>
                    <div className="flex gap-2">
                      {(['easy', 'similar', 'difficult'] as DifficultyLevel[]).map(d => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`flex-1 p-4 rounded-xl border-4 transition-all bouncy capitalize font-bold text-sm
                            ${difficulty === d ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-50 text-slate-400'}
                          `}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </section>
                  <section>
                    <label className="block text-slate-400 font-black uppercase tracking-widest text-xs mb-6 text-center">Illustration Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {styleOptions.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStyle(s.id)}
                          className={`p-4 rounded-xl border-4 transition-all bouncy text-xs font-bold
                            ${selectedStyle === s.id ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-50 text-slate-400'}
                          `}
                        >
                          {s.icon} {s.label}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <div className="mt-16 flex gap-4">
                <button 
                  onClick={() => setState('upload')}
                  className="px-8 py-5 rounded-2xl font-black text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleStartAnalysis}
                  className="flex-1 bg-sky-600 text-white py-5 rounded-2xl font-black text-xl shadow-[0_8px_0_rgb(2,132,199)] hover:translate-y-[2px] hover:shadow-[0_6px_0_rgb(2,132,199)] active:translate-y-[8px] active:shadow-none transition-all"
                >
                  Generate Workbook ✨
                </button>
              </div>
            </div>
          </div>
        )}

        {state === 'analyzing' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
            <div className="relative w-48 h-48 mb-12">
               <div className="absolute inset-0 bg-sky-100 rounded-full animate-ping opacity-30"></div>
               <div className="relative bg-white rounded-full p-12 shadow-2xl border-4 border-sky-50 flex items-center justify-center overflow-hidden">
                  <div className="text-8xl animate-pulse">📡</div>
               </div>
            </div>
            <h3 className="text-4xl font-black text-slate-800 mb-4">Researching Curriculum...</h3>
            <p className="text-xl text-slate-500 font-bold max-w-md text-center italic">
              "We're using AI Research to find the best {grade} standards for this topic!"
            </p>
          </div>
        )}

        {state === 'results' && analysis && (
          <div className="animate-in slide-in-from-bottom-10 duration-1000">
            {/* Textbook Title Block */}
            <div className="text-center mb-24 max-w-4xl mx-auto">
               <span className="inline-block px-6 py-2 bg-amber-100 text-amber-700 font-black text-xs uppercase tracking-[0.3em] rounded-full mb-8">
                 {grade} Level Practice Guide
               </span>
               <h2 className="text-6xl md:text-8xl font-black text-slate-900 mb-6 tracking-tighter font-serif-textbook">
                 {analysis.topic}
               </h2>
               <div className="h-1.5 w-48 bg-sky-500 mx-auto rounded-full mb-12"></div>
               <p className="text-2xl text-slate-600 font-medium leading-relaxed font-serif-textbook italic">
                 {analysis.summary}
               </p>
            </div>

            {/* Questions List */}
            <div className="max-w-5xl mx-auto">
              {analysis.questions.map((q, idx) => (
                <QuestionCard key={q.id} question={q} index={idx} />
              ))}
            </div>

            {/* Research Footnotes */}
            {analysis.sources && analysis.sources.length > 0 && (
              <div className="max-w-4xl mx-auto mt-32 p-12 bg-white rounded-[2rem] border border-slate-100">
                <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-8 text-center">Research Grounds & Sources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.sources.map((src, i) => (
                    <a 
                      key={i} 
                      href={src.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-xl">🌐</div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-700 truncate">{src.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{src.uri}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center mt-24 mb-32">
              <button 
                onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setState('upload'); setAnalysis(null); }}
                className="bg-slate-900 text-white px-16 py-8 rounded-[2rem] text-3xl font-black shadow-2xl hover:bg-black transition-all hover:scale-105"
              >
                Close Workbook 🏅
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
