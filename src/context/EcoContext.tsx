import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { mockLeaderboardData } from "@/data/mockData";

// Types
type Challenge = any; // Replace with your ChallengeCard type
type Transaction = any; // Replace with your MarketTransaction type
type LeaderboardUser = typeof mockLeaderboardData[number];

interface EcoState {
  userBalance: number;
  userImpactKg: number;
  activeChallenges: Challenge[];
  transactionHistory: Transaction[];
  leaderboardData: LeaderboardUser[];
  // Global data that updates across all components
  globalPlasticCollected: number;
  globalCO2Saved: number;
  globalUsersActive: number;
  globalPointsDistributed: number;
  // User profile data
  userProfile: {
    name: string;
    email: string;
    phone: string;
    address: string;
    role: 'recycler' | 'picker' | 'buyer' | null;
  };
}

const initialState: EcoState = {
  userBalance: 4250, // Default or load from storage
  userImpactKg: 124.5,
  activeChallenges: [],
  transactionHistory: [],
  leaderboardData: mockLeaderboardData,
  // Global stats
  globalPlasticCollected: 12450,
  globalCO2Saved: 6225,
  globalUsersActive: 50000,
  globalPointsDistributed: 1000000,
  // User profile
  userProfile: {
    name: '',
    email: '',
    phone: '',
    address: '',
    role: null,
  },
};

type EcoAction =
  | { type: "BUY_CREDITS"; amount: number }
  | { type: "JOIN_CHALLENGE"; challenge: Challenge }
  | { type: "COMPLETE_CHALLENGE"; challengeId: string; impactKg: number }
  | { type: "LOAD_STATE"; state: Partial<EcoState> }
  | { type: "SET_STATE"; state: Partial<EcoState> }
  | { type: "UPDATE_GLOBAL_STATS"; stats: Partial<Pick<EcoState, 'globalPlasticCollected' | 'globalCO2Saved' | 'globalUsersActive' | 'globalPointsDistributed'>> }
  | { type: "UPDATE_USER_PROFILE"; profile: Partial<EcoState['userProfile']> }
  | { type: "ADD_PLASTIC_COLLECTION"; amount: number }

function ecoReducer(state: EcoState, action: EcoAction): EcoState {
  switch (action.type) {
    case "BUY_CREDITS": {
      const newBalance = state.userBalance + action.amount;
      const newTransaction = {
        id: Date.now().toString(),
        description: "Market Purchase",
        amount: action.amount,
        status: "Complete",
        type: "Market Purchase",
        createdAt: new Date().toISOString(),
      };
      // Resort leaderboard
      const updatedLeaderboard = state.leaderboardData
        .map((u) =>
          u.isCurrentUser
            ? { ...u, credits: newBalance }
            : u
        )
        .sort((a, b) => b.credits - a.credits);
      return {
        ...state,
        userBalance: newBalance,
        transactionHistory: [newTransaction, ...state.transactionHistory],
        leaderboardData: updatedLeaderboard,
      };
    }
    case "JOIN_CHALLENGE": {
      const updatedChallenges = state.activeChallenges.map((c) =>
        c.id === action.challenge.id
          ? { ...c, participants: c.participants + 1, joined: true }
          : c
      );
      return {
        ...state,
        activeChallenges: updatedChallenges,
      };
    }
    case "COMPLETE_CHALLENGE": {
      const updatedChallenges = state.activeChallenges.map((c) =>
        c.id === action.challengeId ? { ...c, completed: true } : c
      );
      return {
        ...state,
        userImpactKg: state.userImpactKg + action.impactKg,
        activeChallenges: updatedChallenges,
      };
    }
    case "LOAD_STATE":
      return { ...state, ...action.state };
    case "SET_STATE":
      return { ...state, ...action.state };
    case "UPDATE_GLOBAL_STATS":
      return {
        ...state,
        globalPlasticCollected: action.stats.globalPlasticCollected ?? state.globalPlasticCollected,
        globalCO2Saved: action.stats.globalCO2Saved ?? state.globalCO2Saved,
        globalUsersActive: action.stats.globalUsersActive ?? state.globalUsersActive,
        globalPointsDistributed: action.stats.globalPointsDistributed ?? state.globalPointsDistributed,
      };
    case "UPDATE_USER_PROFILE":
      return {
        ...state,
        userProfile: { ...state.userProfile, ...action.profile },
      };
    case "ADD_PLASTIC_COLLECTION":
      const newPlasticCollected = state.globalPlasticCollected + action.amount;
      const newCO2Saved = state.globalCO2Saved + (action.amount * 0.5); // 100g plastic = 50g CO2
      const newPoints = Math.floor(action.amount * 0.01); // Earn points for plastic
      return {
        ...state,
        globalPlasticCollected: newPlasticCollected,
        globalCO2Saved: newCO2Saved,
        globalPointsDistributed: state.globalPointsDistributed + newPoints,
        userBalance: state.userBalance + newPoints,
        userImpactKg: state.userImpactKg + (action.amount / 1000), // Convert g to kg
      };
    default:
      return state;
  }
}

const EcoContext = createContext<{
  state: EcoState;
  dispatch: React.Dispatch<EcoAction>;
} | undefined>(undefined);

export function EcoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ecoReducer, initialState, (init) => {
    try {
      const stored = localStorage.getItem("eco_sync_state");
      return stored ? { ...init, ...JSON.parse(stored) } : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem("eco_sync_state", JSON.stringify(state));
  }, [state]);

  return (
    <EcoContext.Provider value={{ state, dispatch }}>
      {children}
    </EcoContext.Provider>
  );
}

export function useEco() {
  const ctx = useContext(EcoContext);
  if (!ctx) throw new Error("useEco must be used within EcoProvider");
  return ctx;
}
