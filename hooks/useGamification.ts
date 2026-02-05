
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, updateDoc, increment } from 'firebase/firestore';
import { UserStats } from '../types';

const LEVEL_BASE_XP = 100;

export const useGamification = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats | null>(null);

    useEffect(() => {
        if (!user) return;

        // --- DEMO MODE BYPASS ---
        if (user.uid === 'demo-user') {
            setStats({
                userId: 'demo-user',
                level: 3,
                currentXP: 450,
                maxXP: 800,
                streakDays: 5,
                lastActiveDate: new Date().toISOString(),
                totalTasksCompleted: 12,
                totalStudyModulesCompleted: 4
            });
            return;
        }

        const ref = doc(db, 'user_stats', user.uid);
        
        const unsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                setStats(snap.data() as UserStats);
            } else {
                // Initialize stats
                const initialStats: UserStats = {
                    userId: user.uid,
                    level: 1,
                    currentXP: 0,
                    maxXP: LEVEL_BASE_XP,
                    streakDays: 0,
                    lastActiveDate: new Date().toISOString(),
                    totalTasksCompleted: 0,
                    totalStudyModulesCompleted: 0
                };
                setDoc(ref, initialStats);
            }
        }, (error) => {
            console.error("Gamification Error:", error);
        });
        return () => unsub();
    }, [user]);

    const addXP = async (amount: number, source: 'task' | 'study') => {
        if (!user || !stats) return;

        let newXP = stats.currentXP + amount;
        let newLevel = stats.level;
        let newMaxXP = stats.maxXP;
        let leveledUp = false;

        // Level Up Logic
        if (newXP >= stats.maxXP) {
            newXP = newXP - stats.maxXP;
            newLevel += 1;
            newMaxXP = Math.floor(newMaxXP * 1.2); // +20% harder each level
            leveledUp = true;
        }

        // Handle Demo Update Locally
        if (user.uid === 'demo-user') {
            setStats(prev => prev ? ({
                ...prev,
                currentXP: newXP,
                level: newLevel,
                maxXP: newMaxXP,
                totalTasksCompleted: source === 'task' ? prev.totalTasksCompleted + 1 : prev.totalTasksCompleted,
                totalStudyModulesCompleted: source === 'study' ? prev.totalStudyModulesCompleted + 1 : prev.totalStudyModulesCompleted
            }) : null);
            return { leveledUp, newLevel };
        }

        const updateData: any = {
            currentXP: newXP,
            level: newLevel,
            maxXP: newMaxXP,
            lastActiveDate: new Date().toISOString()
        };

        if (source === 'task') updateData.totalTasksCompleted = increment(1);
        if (source === 'study') updateData.totalStudyModulesCompleted = increment(1);

        try {
            await updateDoc(doc(db, 'user_stats', user.uid), updateData);
        } catch (e) {
            console.error("Failed to update XP", e);
        }
        
        return { leveledUp, newLevel };
    };

    return { stats, addXP };
};
