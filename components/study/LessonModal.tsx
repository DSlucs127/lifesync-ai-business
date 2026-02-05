import React, { useState, useEffect } from 'react';
import { StudyNode, QuizQuestion } from '../../types';
import { generateLessonContent, generateQuiz } from '../../services/studyService';
import { Button } from '../Button';
import { X, Loader2, CheckCircle2, AlertCircle, BookOpen, GraduationCap, Trophy, RefreshCw, ArrowRight } from 'lucide-react';

interface LessonModalProps {
  node: StudyNode;
  topicTheme: string;
  onComplete: (xpEarned: number) => void;
  onClose: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({ node, topicTheme, onComplete, onClose }) => {
  const [step, setStep] = useState<'loading' | 'content' | 'quiz_intro' | 'quiz' | 'result'>('loading');
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  // Quiz State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Load Content initially
  useEffect(() => {
    const load = async () => {
        const lessonText = await generateLessonContent(topicTheme, node.title);
        setContent(lessonText);
        setStep('content');
    };
    load();
  }, [node, topicTheme]);

  const startQuiz = async () => {
      setStep('quiz_intro');
      setIsGeneratingQuiz(true);
      // Reset quiz state
      setScore(0);
      setCurrentQIndex(0);
      setSelectedOption(null);
      setShowExplanation(false);
      
      const quizData = await generateQuiz(topicTheme, node.title);
      setQuestions(quizData);
      setIsGeneratingQuiz(false);
      if (quizData.length > 0) setStep('quiz');
      else setStep('content'); // Fallback if error
  };

  const handleAnswer = (optionIndex: number) => {
      if (showExplanation) return; // Prevent changing answer
      setSelectedOption(optionIndex);
      setShowExplanation(true);
      
      if (optionIndex === questions[currentQIndex].correctAnswerIndex) {
          setScore(prev => prev + 1);
      }
  };

  const nextQuestion = () => {
      setShowExplanation(false);
      setSelectedOption(null);
      if (currentQIndex < questions.length - 1) {
          setCurrentQIndex(prev => prev + 1);
      } else {
          finishQuiz();
      }
  };

  const finishQuiz = () => {
      setStep('result');
  };

  // 70% passing grade logic
  const passingScore = Math.ceil(questions.length * 0.7);
  const passed = score >= passingScore;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center space-x-2">
                {step === 'content' ? <BookOpen className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                <h3 className="font-bold text-lg">{node.title}</h3>
            </div>
            <button onClick={onClose}><X className="w-6 h-6 hover:bg-white/20 rounded-full p-1" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 relative">
            
            {step === 'loading' && (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <p className="text-slate-500 font-medium">A IA está preparando sua aula...</p>
                </div>
            )}

            {step === 'content' && (
                <div className="space-y-6">
                    <div className="prose prose-indigo max-w-none text-slate-700 leading-relaxed">
                        <div className="whitespace-pre-wrap">{content}</div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <Button onClick={startQuiz} className="w-full md:w-auto text-lg py-3">
                            Fazer Avaliação <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {step === 'quiz_intro' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                    {isGeneratingQuiz ? (
                        <>
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-indigo-600">AI</div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Gerando Avaliação</h3>
                                <p className="text-slate-500 mt-2">Criando questões inéditas e verificando respostas...</p>
                            </div>
                        </>
                    ) : (
                        <Button onClick={() => setStep('quiz')}>Começar Prova</Button>
                    )}
                </div>
            )}

            {step === 'quiz' && questions.length > 0 && (
                <div className="space-y-6">
                    <div className="flex justify-between text-sm font-medium text-slate-400 uppercase tracking-wider">
                        <span>Questão {currentQIndex + 1}/{questions.length}</span>
                        <span>Acertos: {score}</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800">{questions[currentQIndex].question}</h3>

                    <div className="space-y-3">
                        {questions[currentQIndex].options.map((option, idx) => {
                            let optionClass = "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50";
                            if (showExplanation) {
                                if (idx === questions[currentQIndex].correctAnswerIndex) {
                                    optionClass = "bg-emerald-100 border-emerald-500 text-emerald-800";
                                } else if (idx === selectedOption) {
                                    optionClass = "bg-red-100 border-red-500 text-red-800";
                                } else {
                                    optionClass = "bg-slate-50 border-slate-200 opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    disabled={showExplanation}
                                    onClick={() => handleAnswer(idx)}
                                    className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${optionClass}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>

                    {showExplanation && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-slideUp">
                            <h4 className="font-bold text-slate-800 mb-1 flex items-center">
                                {selectedOption === questions[currentQIndex].correctAnswerIndex ? (
                                    <><CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" /> Correto!</>
                                ) : (
                                    <><AlertCircle className="w-5 h-5 text-red-500 mr-2" /> Incorreto</>
                                )}
                            </h4>
                            <p className="text-slate-600 text-sm">{questions[currentQIndex].explanation}</p>
                            <Button onClick={nextQuestion} className="mt-4 w-full">
                                {currentQIndex < questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {step === 'result' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                    {passed ? (
                        <>
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2 animate-bounce">
                                <Trophy className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-bold text-emerald-700">Módulo Concluído!</h2>
                            <p className="text-slate-600">Você acertou {score} de {questions.length} questões ({Math.round((score/questions.length)*100)}%).</p>
                            <div className="bg-amber-100 text-amber-800 px-6 py-2 rounded-full font-bold text-lg border border-amber-200">
                                +{50 + (score * 20)} XP
                            </div>
                            <Button onClick={() => onComplete(50 + (score * 20))}>Continuar Jornada</Button>
                        </>
                    ) : (
                        <>
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                                <X className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Reprovado</h2>
                            <p className="text-slate-600 mb-2">Nota necessária: 70%. Sua nota: {Math.round((score/questions.length)*100)}%.</p>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">Você precisa refazer a avaliação para avançar. Novas perguntas serão geradas.</p>
                            
                            <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
                                <Button onClick={startQuiz} className="w-full">
                                    <RefreshCw className="w-4 h-4 mr-2" /> Refazer Avaliação
                                </Button>
                                <Button onClick={() => setStep('content')} variant="secondary" className="w-full">
                                    Revisar Aula
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};