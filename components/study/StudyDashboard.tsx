
import React, { useState, useEffect } from 'react';
import { StudyPlan, StudyNode } from '../../types';
import { generateStudyCurriculum } from '../../services/studyService';
import { db } from '../../services/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { StudyTree } from './StudyTree';
import { LessonModal } from './LessonModal';
import { Button } from '../Button';
import { Input } from '../Input';
import { Plus, BookOpen, Loader2 } from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';

export const StudyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addXP } = useGamification();
  
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<StudyNode | null>(null);

  // Load existing plan
  useEffect(() => {
    if (!user) return;
    const loadPlan = async () => {
        setIsLoading(true);
        const q = query(collection(db, 'study_plans'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
            // Load the most recent one for now
            const data = snap.docs[0].data() as StudyPlan;
            setActivePlan({ ...data, id: snap.docs[0].id });
        }
        setIsLoading(false);
    };
    loadPlan();
  }, [user]);

  const handleCreatePlan = async () => {
      if (!user || !newTopic.trim()) return;
      setIsCreating(true);

      const planData = await generateStudyCurriculum(newTopic);
      
      if (planData) {
          const fullPlan: Omit<StudyPlan, 'id'> = {
              ...planData,
              userId: user.uid,
              createdAt: new Date().toISOString()
          };
          
          const ref = await addDoc(collection(db, 'study_plans'), fullPlan);
          setActivePlan({ ...fullPlan, id: ref.id });
          setNewTopic('');
      } else {
          alert("Não foi possível gerar o plano. Tente outro tema.");
      }
      setIsCreating(false);
  };

  const handleNodeComplete = async (xp: number) => {
      if (!activePlan || !selectedNode || !user) return;

      const { leveledUp, newLevel } = await addXP(xp, 'study') || {};
      if (leveledUp) {
          alert(`PARABÉNS! Você subiu para o Nível ${newLevel}!`);
      }

      // Update local state
      const updatedNodes = activePlan.nodes.map(n => {
          if (n.id === selectedNode.id) return { ...n, status: 'completed' as const };
          // Unlock next node
          if (n.position === selectedNode.position + 1) return { ...n, status: 'unlocked' as const };
          return n;
      });

      const updatedPlan = { ...activePlan, nodes: updatedNodes };
      setActivePlan(updatedPlan);
      setSelectedNode(null);

      // Update Firestore
      await updateDoc(doc(db, 'study_plans', activePlan.id), { nodes: updatedNodes });
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-24 md:pb-0 animate-fadeIn min-h-screen">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Jornada de Aprendizado</h2>
            <p className="text-slate-500 text-sm">Evolua seu conhecimento e ganhe XP.</p>
        </div>
        {activePlan && (
            <Button variant="secondary" onClick={() => setActivePlan(null)} size="sm">
                Trocar Foco
            </Button>
        )}
      </div>

      {!activePlan ? (
          <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center min-h-[400px]">
             <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                 <BookOpen className="w-10 h-10 text-indigo-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">O que você quer aprender hoje?</h3>
             <p className="text-slate-500 max-w-md mb-6">A IA criará um currículo personalizado com aulas e provas atualizadas para você.</p>
             
             <div className="flex w-full max-w-md gap-2">
                 <Input 
                    placeholder="Ex: Investimentos, Python, História da Arte..." 
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    disabled={isCreating}
                 />
                 <Button onClick={handleCreatePlan} disabled={isCreating || !newTopic}>
                    {isCreating ? <Loader2 className="animate-spin" /> : <Plus />}
                 </Button>
             </div>
          </div>
      ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[600px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
             <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{activePlan.title}</h3>
                <p className="text-slate-500 font-medium">{activePlan.description}</p>
             </div>

             <StudyTree nodes={activePlan.nodes} onNodeClick={setSelectedNode} />
          </div>
      )}

      {selectedNode && activePlan && (
          <LessonModal 
             node={selectedNode} 
             topicTheme={activePlan.theme}
             onClose={() => setSelectedNode(null)}
             onComplete={handleNodeComplete}
          />
      )}
    </div>
  );
};
