import { StudyPlan, QuizQuestion } from "../types";

export const generateStudyCurriculum = async (topic: string): Promise<Omit<StudyPlan, 'id' | 'userId' | 'createdAt'> | null> => {
  return null;
};

export const generateLessonContent = async (topic: string, nodeTitle: string): Promise<string> => {
    return "AI disabled.";
};

export const generateQuiz = async (topic: string, nodeTitle: string): Promise<QuizQuestion[]> => {
    return [];
};
