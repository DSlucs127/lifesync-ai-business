import { Transaction, Category, Budget } from "../types";

export interface AdvisorContext {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  userProfile: {
      income: number;
      goal: string;
      housingType: string;
      housingCost: number;
      vehicleStatus: string;
      vehicleCost: number;
  };
  mode: 'standard' | 'custom';
}

export const consultFinancialAdvisor = async (
  userMessage: string,
  context: AdvisorContext,
  history: any[] = []
): Promise<any> => {
    return null;
};
