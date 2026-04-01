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
  userBalance: 0,
  userImpactKg: 0,
  activeChallenges: [],
  transactionHistory: [],
  leaderboardData: mockLeaderboardData,
  globalPlasticCollected: 12450,
  globalCO2Saved: 6225,
  globalUsersActive: 50000,
  globalPointsDistributed: 1000000,
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
    case "ADD_PLASTIC_COLLECTION": {
      const newPlasticCollected = state.globalPlasticCollected + action.amount;
      const newCO2Saved = state.globalCO2Saved + action.amount * 0.5; // 100g plastic = 50g CO2
      const newPoints = Math.floor(action.amount * 0.01); // Earn points for plastic
      return {
        ...state,
        globalPlasticCollected: newPlasticCollected,
        globalCO2Saved: newCO2Saved,
        globalPointsDistributed: state.globalPointsDistributed + newPoints,
        userBalance: state.userBalance + newPoints,
        userImpactKg: state.userImpactKg + action.amount / 1000, // Convert g to kg
      };
    }
    default:
      return state;
  }
}

function sanitizeEcoState(parsed: unknown, init: EcoState): EcoState {
  if (!parsed || typeof parsed !== "object") return init;
  const p = parsed as Record<string, unknown>;
  const rawProfile =
    p.userProfile && typeof p.userProfile === "object" ? (p.userProfile as Record<string, unknown>) : {};

  return {
    ...init,
    userBalance: typeof p.userBalance === "number" && Number.isFinite(p.userBalance) ? p.userBalance : init.userBalance,
    userImpactKg: typeof p.userImpactKg === "number" && Number.isFinite(p.userImpactKg) ? p.userImpactKg : init.userImpactKg,
    activeChallenges: Array.isArray(p.activeChallenges) ? (p.activeChallenges as Challenge[]) : init.activeChallenges,
    transactionHistory: Array.isArray(p.transactionHistory) ? (p.transactionHistory as Transaction[]) : init.transactionHistory,
    leaderboardData: Array.isArray(p.leaderboardData) ? (p.leaderboardData as LeaderboardUser[]) : init.leaderboardData,
    globalPlasticCollected:
      typeof p.globalPlasticCollected === "number" && Number.isFinite(p.globalPlasticCollected)
        ? p.globalPlasticCollected
        : init.globalPlasticCollected,
    globalCO2Saved: typeof p.globalCO2Saved === "number" && Number.isFinite(p.globalCO2Saved) ? p.globalCO2Saved : init.globalCO2Saved,
    globalUsersActive:
      typeof p.globalUsersActive === "number" && Number.isFinite(p.globalUsersActive) ? p.globalUsersActive : init.globalUsersActive,
    globalPointsDistributed:
      typeof p.globalPointsDistributed === "number" && Number.isFinite(p.globalPointsDistributed)
        ? p.globalPointsDistributed
        : init.globalPointsDistributed,
    userProfile: {
      ...init.userProfile,
      name: typeof rawProfile.name === "string" ? rawProfile.name : init.userProfile.name,
      email: typeof rawProfile.email === "string" ? rawProfile.email : init.userProfile.email,
      phone: typeof rawProfile.phone === "string" ? rawProfile.phone : init.userProfile.phone,
      address: typeof rawProfile.address === "string" ? rawProfile.address : init.userProfile.address,
      role:
        rawProfile.role === "recycler" || rawProfile.role === "picker" || rawProfile.role === "buyer" || rawProfile.role === null
          ? (rawProfile.role as EcoState["userProfile"]["role"])
          : init.userProfile.role,
    },
  };
}

const EcoContext = createContext<{
  state: EcoState;
  dispatch: React.Dispatch<EcoAction>;
} | undefined>(undefined);

export function EcoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ecoReducer, initialState, (init) => {
    try {
      // Only restore if it belongs to the current auth session
      const storedUid = window.localStorage.getItem("recyclehub_auth_user_id");
      const ecoUid = window.localStorage.getItem("eco_sync_user_id");
      if (storedUid && ecoUid && storedUid !== ecoUid) {
        // Different user — start fresh
        window.localStorage.removeItem("eco_sync_state");
        window.localStorage.removeItem("eco_sync_user_id");
        return init;
      }
      const stored = localStorage.getItem("eco_sync_state");
      if (!stored) return init;
      const parsed = JSON.parse(stored) as unknown;
      return sanitizeEcoState(parsed, init);
    } catch {
      return init;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("eco_sync_state", JSON.stringify(state));
      const uid = window.localStorage.getItem("recyclehub_auth_user_id");
      if (uid) window.localStorage.setItem("eco_sync_user_id", uid);
    } catch {
      // Private mode / quota — do not break the app
    }
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
