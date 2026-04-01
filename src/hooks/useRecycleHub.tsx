import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { mockLeaderboardData, LeaderboardUser } from "@/data/mockData";

export type HeatmapReport = {
  id: string;
  lat: number;
  lng: number;
  intensity: number;
  label: string;
  description: string;
  createdAt: string;
};

export type ChallengeLevel = "level-1" | "level-2" | "level-3";

export interface ChallengeCard {
  id: string;
  title: string;
  level: ChallengeLevel;
  badgeLabel: string;
  badgeClass: string;
  description: string;
  points: number;
  date: string;
  startTime: string;
  endTime: string;
  meetupTime: string;
  meetupInstructions: string;
  weather: {
    condition: string;
    temperature: string;
    icon: string;
  };
  locationName: string;
  lat: number;
  lng: number;
  areaCoordinates: [number, number][];
  requiredTools?: string[];
  participants: number;
  participantAvatars: { id: string; name: string; initials: string; color: string }[];
  targetImpactKg: number;
  reportsFiledKg: number;
  physicalIntensity: "Low" | "Medium" | "High";
  ageSuitability: "Family Friendly" | "Adults Only";
  status: string;
  joined: boolean;
  completed: boolean;
  mapLink: string;
  highlight: string;
}

export type MarketTransactionType = "Market Purchase" | "Challenge Reward" | "Market Stream";
export type MarketTransactionStatus = "Complete" | "Pending";

export interface MarketTransaction {
  id: string;
  description: string;
  amount: number;
  status: MarketTransactionStatus;
  createdAt: string;
  type: MarketTransactionType;
}

const INITIAL_MARKET_TRANSACTIONS: MarketTransaction[] = [
  {
    id: "#RH-8807",
    description: "Challenge Reward",
    amount: 40,
    status: "Complete",
    type: "Challenge Reward",
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "#RH-8819",
    description: "Market Purchase",
    amount: 120,
    status: "Complete",
    type: "Market Purchase",
    createdAt: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
  },
  {
    id: "#RH-8821",
    description: "Market Stream",
    amount: 16,
    status: "Complete",
    type: "Market Stream",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

const MARKET_STORAGE_KEYS = {
  userBalance: "recyclehub_user_balance",
  availableMarketCredits: "recyclehub_available_market_credits",
  transactions: "recyclehub_market_transactions",
  globalMetrics: "recyclehub_global_metrics",
  challenges: "recyclehub_challenges",
  sourcingRequests: "recyclehub_sourcing_requests",
  trackOrders: "recyclehub_track_orders",
  recentActivity: "recyclehub_recent_activity",
  topRecyclers: "recyclehub_top_recyclers",
  quickActionStats: "recyclehub_quick_action_stats",
};

const generateTransactionId = () => `#RH-${Math.floor(1000 + Math.random() * 9000)}`;

const createMarketTransaction = (transaction: Omit<MarketTransaction, "id" | "createdAt">): MarketTransaction => ({
  ...transaction,
  id: generateTransactionId(),
  createdAt: new Date().toISOString(),
});

const createMockMarketTransaction = (): MarketTransaction => {
  const descriptions: Array<{ description: string; type: MarketTransactionType; amount: number }> = [
    { description: "Market Purchase", type: "Market Purchase", amount: Math.floor(Math.random() * 20) + 5 },
    { description: "Challenge Reward", type: "Challenge Reward", amount: Math.floor(Math.random() * 30) + 10 },
  ];
  const next = descriptions[Math.floor(Math.random() * descriptions.length)];
  return createMarketTransaction({
    description: next.description,
    amount: next.amount,
    status: "Complete",
    type: next.type,
  });
};

export interface SupplierApplication {
  id: string;
  supplier: string;
  status: "Pending" | "Approved";
  materialType: string;
  quantity: string;
  appliedAt: string;
  location: string;
  contact: string;
}

export interface SourcingRequest {
  id: string;
  materialType: string;
  quantity: string;
  requestedBy: string;
  location: string;
  requiredBy: string;
  status: "Active" | "Pending";
  applications: number;
}

export interface OrderTracker {
  id: string;
  supplier: string;
  materialType: string;
  quantity: string;
  pricePerKg: string;
  totalAmount: string;
  status: "In Transit" | "Completed";
  orderDate: string;
  eta: string;
  invoiceReady: boolean;
}

export interface GlobalMetrics {
  totalPlasticRecycledKg: number;
  totalCarbonCredits: number;
  livePickersOnline: number;
  communityMembers: number;
  societiesCleaned: number;
  totalAreasSanitized: number;
}

export interface RecentActivityItem {
  id: string;
  desc: string;
  pts: string;
  date: string;
}

export interface QuickActionStats {
  bookPickup: { nextScheduled: string; recentPickups: number };
  leaderboard: { rank: number; totalRecyclers: number };
  myImpact: { totalWasteDivertedKg: number };
  wallet: { balance: number; lastEarned: number; currency: string };
  rewards: { availableRewards: number; pointsToMilestone: number; nextMilestone: number; rewardItems: string[] };
  achievements: { badgesEarned: number; totalBadges: number };
  referrals: { successfulReferrals: number; pendingRewardCredits: number; referralDetails: { id: string; name: string; status: string; rewardCredits: number; referredAt: string }[] };
  learn: { completedCourses: number; inProgress: number; inProgressCourses: { id: string; title: string; status: string; progressPercentage: number }[] };
  community: { activeGroups: number; pendingMessages: number; groupList: { id: string; name: string; unreadMessages: number }[] };
}

export interface TopRecycler {
  id: string;
  name: string;
  avatar: string;
  totalCredits: number;
  rank: number;
  badge?: string;
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const createInitialHeatmapReports = (count = 60): HeatmapReport[] =>
  Array.from({ length: count }, (_, index) => {
    const baseLat = 12.94 + (Math.random() - 0.5) * 0.12;
    const baseLng = 77.62 + (Math.random() - 0.5) * 0.12;
    const intensity = Number((0.45 + Math.random() * 0.5).toFixed(2));
    const kg = Math.floor(Math.random() * 8) + 2;
    return {
      id: `report-init-${index}`,
      lat: Number(baseLat.toFixed(5)),
      lng: Number(baseLng.toFixed(5)),
      intensity,
      label: `Live pickup hotspot ${index + 1}`,
      description: `${kg} kg of plastic waste reported in the active clean zone.`,
      createdAt: new Date(Date.now() - (count - index) * 1000 * 60 * 2).toISOString(),
    };
  });

const INITIAL_HEATMAP_REPORTS: HeatmapReport[] = createInitialHeatmapReports(60);

const INITIAL_SUPPLIER_APPLICATIONS: SupplierApplication[] = [
  { id: "app-01", supplier: "ABC Recyclers", status: "Pending", materialType: "PET", quantity: "500 kg", appliedAt: "2 hrs ago", location: "Mumbai", contact: "+91 98765 43210" },
  { id: "app-02", supplier: "Green Plastics Co", status: "Pending", materialType: "HDPE", quantity: "750 kg", appliedAt: "5 hrs ago", location: "Bangalore", contact: "+91 91234 56789" },
  { id: "app-03", supplier: "Recycle India", status: "Pending", materialType: "LDPE", quantity: "650 kg", appliedAt: "Yesterday", location: "Chennai", contact: "+91 99876 54321" },
  { id: "app-04", supplier: "Eco Partners", status: "Pending", materialType: "PET", quantity: "1,200 kg", appliedAt: "1 day ago", location: "Pune", contact: "+91 90123 45678" },
  { id: "app-05", supplier: "Urban Reclaim", status: "Pending", materialType: "HDPE", quantity: "900 kg", appliedAt: "2 days ago", location: "Hyderabad", contact: "+91 90012 34567" },
  { id: "app-06", supplier: "Circle Green", status: "Approved", materialType: "PET", quantity: "1,100 kg", appliedAt: "3 days ago", location: "Delhi", contact: "+91 92345 67890" },
  { id: "app-07", supplier: "BlueLoop Recycling", status: "Approved", materialType: "LDPE", quantity: "780 kg", appliedAt: "4 days ago", location: "Kochi", contact: "+91 93456 78901" },
  { id: "app-08", supplier: "FreshCycle", status: "Approved", materialType: "HDPE", quantity: "1,750 kg", appliedAt: "5 days ago", location: "Ahmedabad", contact: "+91 94567 89012" },
  { id: "app-09", supplier: "TerraLoop", status: "Approved", materialType: "PET", quantity: "930 kg", appliedAt: "6 days ago", location: "Kolkata", contact: "+91 95678 90123" },
  { id: "app-10", supplier: "GreenShift", status: "Approved", materialType: "LDPE", quantity: "620 kg", appliedAt: "6 days ago", location: "Noida", contact: "+91 96789 01234" },
  { id: "app-11", supplier: "ReNew Plastics", status: "Approved", materialType: "PET", quantity: "1,350 kg", appliedAt: "1 week ago", location: "Jaipur", contact: "+91 97890 12345" },
  { id: "app-12", supplier: "EcoMerge", status: "Approved", materialType: "HDPE", quantity: "1,050 kg", appliedAt: "1 week ago", location: "Lucknow", contact: "+91 98901 23456" },
  { id: "app-13", supplier: "SustainLoop", status: "Approved", materialType: "PET", quantity: "1,600 kg", appliedAt: "1 week ago", location: "Nagpur", contact: "+91 99012 34567" },
  { id: "app-14", supplier: "BioHarvest", status: "Approved", materialType: "LDPE", quantity: "700 kg", appliedAt: "1 week ago", location: "Coimbatore", contact: "+91 90123 45678" },
  { id: "app-15", supplier: "PlastiCycle", status: "Approved", materialType: "PET", quantity: "950 kg", appliedAt: "8 days ago", location: "Surat", contact: "+91 91234 56789" },
  { id: "app-16", supplier: "GreenWave", status: "Approved", materialType: "HDPE", quantity: "1,300 kg", appliedAt: "9 days ago", location: "Nagpur", contact: "+91 92345 67890" },
  { id: "app-17", supplier: "RecycleWorks", status: "Approved", materialType: "PET", quantity: "1,200 kg", appliedAt: "10 days ago", location: "Bhubaneswar", contact: "+91 93456 78901" },
];

const INITIAL_SOURCING_REQUESTS: SourcingRequest[] = [
  { id: "req-01", materialType: "PET", quantity: "500 kg", requestedBy: "Green Plastics", location: "Bangalore", requiredBy: "Apr 5", status: "Active", applications: 12 },
  { id: "req-02", materialType: "HDPE", quantity: "1,200 kg", requestedBy: "Eco Partners", location: "Mumbai", requiredBy: "Apr 8", status: "Active", applications: 9 },
  { id: "req-03", materialType: "LDPE", quantity: "750 kg", requestedBy: "Urban Reclaim", location: "Chennai", requiredBy: "Apr 10", status: "Active", applications: 7 },
  { id: "req-04", materialType: "PET", quantity: "2,000 kg", requestedBy: "BlueLoop Recycling", location: "Delhi", requiredBy: "Apr 12", status: "Active", applications: 15 },
  { id: "req-05", materialType: "HDPE", quantity: "900 kg", requestedBy: "Circle Green", location: "Hyderabad", requiredBy: "Apr 14", status: "Active", applications: 11 },
  { id: "req-06", materialType: "LDPE", quantity: "650 kg", requestedBy: "FreshCycle", location: "Pune", requiredBy: "Apr 15", status: "Active", applications: 8 },
  { id: "req-07", materialType: "PET", quantity: "1,100 kg", requestedBy: "TerraLoop", location: "Kolkata", requiredBy: "Apr 18", status: "Active", applications: 13 },
  { id: "req-08", materialType: "HDPE", quantity: "1,750 kg", requestedBy: "GreenShift", location: "Noida", requiredBy: "Apr 20", status: "Active", applications: 10 },
];

const INITIAL_TRACK_ORDERS: OrderTracker[] = [
  { id: "ORD-101", supplier: "ABC Recyclers", materialType: "PET", quantity: "500 kg", pricePerKg: "₹14/kg", totalAmount: "₹7,000", status: "In Transit", orderDate: "Mar 22", eta: "Mar 28", invoiceReady: true },
  { id: "ORD-102", supplier: "XYZ Plastics", materialType: "HDPE", quantity: "1,000 kg", pricePerKg: "₹15/kg", totalAmount: "₹15,000", status: "In Transit", orderDate: "Mar 20", eta: "Mar 27", invoiceReady: true },
  { id: "ORD-103", supplier: "Green Plastics Co", materialType: "LDPE", quantity: "800 kg", pricePerKg: "₹13/kg", totalAmount: "₹10,400", status: "In Transit", orderDate: "Mar 21", eta: "Mar 29", invoiceReady: true },
  { id: "ORD-104", supplier: "Eco Solutions", materialType: "PET", quantity: "1,200 kg", pricePerKg: "₹16/kg", totalAmount: "₹19,200", status: "In Transit", orderDate: "Mar 23", eta: "Mar 30", invoiceReady: true },
  { id: "ORD-105", supplier: "Recycle India", materialType: "HDPE", quantity: "600 kg", pricePerKg: "₹14/kg", totalAmount: "₹8,400", status: "Completed", orderDate: "Mar 10", eta: "Mar 15", invoiceReady: true },
  { id: "ORD-106", supplier: "BlueLoop Recycling", materialType: "PET", quantity: "750 kg", pricePerKg: "₹15/kg", totalAmount: "₹11,250", status: "Completed", orderDate: "Mar 8", eta: "Mar 14", invoiceReady: true },
  { id: "ORD-107", supplier: "GreenShift", materialType: "LDPE", quantity: "900 kg", pricePerKg: "₹13/kg", totalAmount: "₹11,700", status: "Completed", orderDate: "Mar 6", eta: "Mar 13", invoiceReady: true },
  { id: "ORD-108", supplier: "Urban Reclaim", materialType: "PET", quantity: "1,100 kg", pricePerKg: "₹14/kg", totalAmount: "₹15,400", status: "Completed", orderDate: "Mar 4", eta: "Mar 11", invoiceReady: true },
  { id: "ORD-109", supplier: "SustainLoop", materialType: "HDPE", quantity: "650 kg", pricePerKg: "₹14/kg", totalAmount: "₹9,100", status: "Completed", orderDate: "Mar 2", eta: "Mar 9", invoiceReady: true },
  { id: "ORD-110", supplier: "TerraLoop", materialType: "PET", quantity: "1,300 kg", pricePerKg: "₹15/kg", totalAmount: "₹19,500", status: "Completed", orderDate: "Mar 1", eta: "Mar 8", invoiceReady: true },
  { id: "ORD-111", supplier: "EcoMerge", materialType: "LDPE", quantity: "700 kg", pricePerKg: "₹13/kg", totalAmount: "₹9,100", status: "Completed", orderDate: "Feb 28", eta: "Mar 6", invoiceReady: true },
  { id: "ORD-112", supplier: "GreenWave", materialType: "PET", quantity: "950 kg", pricePerKg: "₹14/kg", totalAmount: "₹13,300", status: "Completed", orderDate: "Feb 26", eta: "Mar 4", invoiceReady: true },
];

const INITIAL_RECENT_ACTIVITY: RecentActivityItem[] = [
  { id: "act-01", desc: "Nisha completed Cubbon Park Sunday Scrub", pts: "+22", date: "Today" },
  { id: "act-02", desc: "Arjun finished BTM Layout Phase 2 Blitz", pts: "+18", date: "Today" },
  { id: "act-03", desc: "Mira wrapped up Forest Edge Deep Dive", pts: "+35", date: "Yesterday" },
  { id: "act-04", desc: "Ravi closed Canal-side Cleanup shift", pts: "+27", date: "Yesterday" },
  { id: "act-05", desc: "Priya joined Industrial Park Community Patrol", pts: "+40", date: "2 days ago" },
  { id: "act-06", desc: "Kiran completed Coastal Stretch Patrol", pts: "+45", date: "2 days ago" },
  { id: "act-07", desc: "Leela finished MG Road Lunch Break Sweep", pts: "+20", date: "3 days ago" },
  { id: "act-08", desc: "Sam completed Koramangala Cleanup Corridor", pts: "+32", date: "3 days ago" },
  { id: "act-09", desc: "Anika closed Cubbon Park Sunday Scrub", pts: "+24", date: "4 days ago" },
  { id: "act-10", desc: "Dev completed BTM Layout Phase 2 Blitz", pts: "+29", date: "4 days ago" },
];

const INITIAL_TOP_RECYCLERS: TopRecycler[] = [
  { id: "top-01", rank: 1, name: "Arjun Mehta", avatar: "AM", totalCredits: 5000, badge: "🥇" },
  { id: "top-02", rank: 2, name: "Priya Singh", avatar: "PS", totalCredits: 4200, badge: "🥈" },
  { id: "top-03", rank: 3, name: "Kiran Rao", avatar: "KR", totalCredits: 3550, badge: "🥉" },
  { id: "top-04", rank: 4, name: "Neha Gupta", avatar: "NG", totalCredits: 2200 },
  { id: "top-05", rank: 5, name: "Rohit Sharma", avatar: "RS", totalCredits: 1450 },
];

const INITIAL_QUICK_ACTION_STATS: QuickActionStats = {
  bookPickup: {
    nextScheduled: "Tomorrow, 10:00 AM",
    recentPickups: 24,
  },
  leaderboard: {
    rank: 12,
    totalRecyclers: 1200,
  },
  myImpact: {
    totalWasteDivertedKg: 18750,
  },
  wallet: {
    balance: 840,
    lastEarned: 150,
    currency: "₹",
  },
  rewards: {
    availableRewards: 3,
    pointsToMilestone: 1200,
    nextMilestone: 1500,
    rewardItems: ["Reusable Bottle", "Community Pass", "Carbon Voucher"],
  },
  achievements: {
    badgesEarned: 8,
    totalBadges: 12,
  },
  referrals: {
    successfulReferrals: 5,
    pendingRewardCredits: 100,
    referralDetails: [
      { id: "ref-01", name: "Riya Patel", status: "Completed", rewardCredits: 20, referredAt: "2 weeks ago" },
      { id: "ref-02", name: "Manish Kumar", status: "Completed", rewardCredits: 20, referredAt: "1 week ago" },
      { id: "ref-03", name: "Ananya Bose", status: "Completed", rewardCredits: 20, referredAt: "5 days ago" },
      { id: "ref-04", name: "Sahil Mehta", status: "Pending", rewardCredits: 20, referredAt: "3 days ago" },
      { id: "ref-05", name: "Tara Nair", status: "Accepted", rewardCredits: 20, referredAt: "Today" },
    ],
  },
  learn: {
    completedCourses: 4,
    inProgress: 2,
    inProgressCourses: [
      { id: "course-01", title: "Plastic Identification 101", status: "In progress", progressPercentage: 45 },
      { id: "course-02", title: "Zero-Waste Event Planning", status: "In progress", progressPercentage: 25 },
    ],
  },
  community: {
    activeGroups: 12,
    pendingMessages: 3,
    groupList: [
      { id: "group-01", name: "MG Road Cleanup Crew", unreadMessages: 1 },
      { id: "group-02", name: "River Patrol Collective", unreadMessages: 0 },
      { id: "group-03", name: "Plastic-Free City Hub", unreadMessages: 2 },
    ],
  },
};

const INITIAL_GLOBAL_METRICS: GlobalMetrics = {
  totalPlasticRecycledKg: 18750,
  totalCarbonCredits: 8420,
  livePickersOnline: randomInt(35, 52),
  communityMembers: 1290,
  societiesCleaned: 142,
  totalAreasSanitized: 142,
};

const INITIAL_LEADERBOARD_USERS: LeaderboardUser[] = mockLeaderboardData;

const INITIAL_CHALLENGES: ChallengeCard[] = [
  {
    id: "challenge-1",
    title: "BTM Layout Phase 2 Blitz",
    level: "level-1",
    badgeLabel: "Quick Sweep",
    badgeClass: "bg-emerald-100 text-emerald-800",
    description: "A fast cleanup along the BTM layout stretch ahead of the weekend markets.",
    points: 70,
    locationName: "BTM Layout Phase 2",
    date: "2026-03-30",
    startTime: "09:00 AM",
    endTime: "12:00 PM",
    meetupTime: "Today • 09:00 AM",
    meetupInstructions: "Meet next to the street food block near the main entrance.",
    weather: { condition: "Sunny", temperature: "28°C", icon: "☀️" },
    lat: 12.9348,
    lng: 77.6183,
    areaCoordinates: [
      [12.9358, 77.6168],
      [12.9342, 77.6195],
      [12.9334, 77.6188],
      [12.9341, 77.6173],
    ],
    requiredTools: ["Gloves", "Trash bags"],
    participants: 22,
    participantAvatars: [
      { id: "a1", name: "Nisha", initials: "N", color: "bg-cyan-500" },
      { id: "a2", name: "Arjun", initials: "A", color: "bg-emerald-500" },
      { id: "a3", name: "Leela", initials: "L", color: "bg-amber-500" },
    ],
    targetImpactKg: 90,
    reportsFiledKg: 35,
    physicalIntensity: "Low",
    ageSuitability: "Family Friendly",
    status: "Open",
    joined: false,
    completed: false,
    mapLink: "#",
    highlight: "Community-friendly quick run",
  },
  {
    id: "challenge-2",
    title: "Cubbon Park Sunday Scrub",
    level: "level-1",
    badgeLabel: "Quick Sweep",
    badgeClass: "bg-emerald-100 text-emerald-800",
    description: "Sweep the park lawns and pathways before the Sunday morning crowds arrive.",
    points: 85,
    locationName: "Cubbon Park Central",
    date: "2026-03-31",
    startTime: "07:30 AM",
    endTime: "10:00 AM",
    meetupTime: "Tomorrow • 07:30 AM",
    meetupInstructions: "Meet near the main bandstand next to the ticket counter.",
    weather: { condition: "Clear", temperature: "26°C", icon: "🌤️" },
    lat: 12.9763,
    lng: 77.5921,
    areaCoordinates: [
      [12.9772, 77.5915],
      [12.9760, 77.5934],
      [12.9750, 77.5926],
      [12.9757, 77.5910],
    ],
    requiredTools: ["Gloves", "Trash bags"],
    participants: 35,
    participantAvatars: [
      { id: "a4", name: "Ravi", initials: "R", color: "bg-sky-500" },
      { id: "a5", name: "Mira", initials: "M", color: "bg-violet-500" },
      { id: "a6", name: "Sam", initials: "S", color: "bg-fuchsia-500" },
    ],
    targetImpactKg: 140,
    reportsFiledKg: 60,
    physicalIntensity: "Low",
    ageSuitability: "Family Friendly",
    status: "Open",
    joined: false,
    completed: false,
    mapLink: "#",
    highlight: "Perfect for morning volunteers",
  },
  {
    id: "challenge-3",
    title: "MG Road Lunch Break Sweep",
    level: "level-1",
    badgeLabel: "Quick Sweep",
    badgeClass: "bg-emerald-100 text-emerald-800",
    description: "Fast downtown curbside clearing while the lunch crowd is away.",
    points: 95,
    locationName: "MG Road Business District",
    date: "2026-04-01",
    startTime: "12:00 PM",
    endTime: "02:30 PM",
    meetupTime: "Monday • 12:00 PM",
    meetupInstructions: "Meet under the clock tower at the east end.",
    weather: { condition: "Partly cloudy", temperature: "29°C", icon: "⛅" },
    lat: 12.9747,
    lng: 77.6050,
    areaCoordinates: [
      [12.9758, 77.6043],
      [12.9740, 77.6059],
      [12.9735, 77.6048],
      [12.9744, 77.6037],
    ],
    requiredTools: ["Gloves", "Trash bags"],
    participants: 18,
    participantAvatars: [
      { id: "a7", name: "Priya", initials: "P", color: "bg-rose-500" },
      { id: "a8", name: "Vikram", initials: "V", color: "bg-lime-500" },
      { id: "a9", name: "Anika", initials: "A", color: "bg-slate-500" },
    ],
    targetImpactKg: 110,
    reportsFiledKg: 42,
    physicalIntensity: "Low",
    ageSuitability: "Family Friendly",
    status: "Open",
    joined: false,
    completed: false,
    mapLink: "#",
    highlight: "Quick after-work shift",
  },
  {
    id: "challenge-4",
    title: "Forest Edge Deep Dive",
    level: "level-2",
    badgeLabel: "Deep Dive",
    badgeClass: "bg-amber-100 text-amber-800",
    description: "Tackle a dense litter section near the Hesaraghatta forest edge.",
    points: 180,
    locationName: "Hesaraghatta Forest Outskirts",
    date: "2026-04-02",
    startTime: "08:30 AM",
    endTime: "02:00 PM",
    meetupTime: "Wednesday • 08:30 AM",
    meetupInstructions: "Assemble at the western trailhead parking lot beside the ranger kiosk.",
    weather: { condition: "Light showers", temperature: "26°C", icon: "🌦️" },
    lat: 13.0946,
    lng: 77.3971,
    areaCoordinates: [
      [13.0960, 77.3960],
      [13.0948, 77.3990],
      [13.0934, 77.3982],
      [13.0940, 77.3953],
    ],
    requiredTools: ["Gloves", "Strong bags", "Water"],
    participants: 28,
    participantAvatars: [
      { id: "a10", name: "Neha", initials: "N", color: "bg-cyan-600" },
      { id: "a11", name: "Rohan", initials: "R", color: "bg-amber-500" },
      { id: "a12", name: "Tara", initials: "T", color: "bg-fuchsia-500" },
    ],
    targetImpactKg: 200,
    reportsFiledKg: 82,
    physicalIntensity: "High",
    ageSuitability: "Adults Only",
    status: "Filling Fast",
    joined: false,
    completed: false,
    mapLink: "#",
    highlight: "Forest edge cleanup",
  },
  {
    id: "challenge-5",
    title: "Canal-side Cleanup",
    level: "level-2",
    badgeLabel: "Deep Dive",
    badgeClass: "bg-amber-100 text-amber-800",
    description: "Collect and remove debris from canal banks and nearby walkways.",
    points: 210,
    locationName: "Hennur Canal",
    date: "2026-04-03",
    startTime: "02:00 PM",
    endTime: "06:00 PM",
    meetupTime: "Thursday • 02:00 PM",
    meetupInstructions: "Gather near the green bridge entrance close to the community bench.",
    weather: { condition: "Humid", temperature: "31°C", icon: "☁️" },
    lat: 13.0358,
    lng: 77.6555,
    areaCoordinates: [
      [13.0369, 77.6541],
      [13.0355, 77.6571],
      [13.0343, 77.6563],
      [13.0348, 77.6535],
    ],
    requiredTools: ["Gloves", "Trash bags", "Water bottle"],
    participants: 30,
    participantAvatars: [
      { id: "a13", name: "Isha", initials: "I", color: "bg-sky-500" },
      { id: "a14", name: "Dev", initials: "D", color: "bg-emerald-500" },
      { id: "a15", name: "Anu", initials: "A", color: "bg-rose-500" },
    ],
    targetImpactKg: 180,
    reportsFiledKg: 92,
    physicalIntensity: "Medium",
    ageSuitability: "Family Friendly",
    status: "Open",
    joined: false,
    completed: false,
    mapLink: "#",
    highlight: "Canal-side volunteer shift",
  },
  {
    id: "challenge-6",
    title: "Koramangala Cleanup Corridor",
    level: "level-2",
    badgeLabel: "Deep Dive",
    badgeClass: "bg-amber-100 text-amber-800",
    description: "Deep clean the busy Koramangala corridor before the evening rush.",
    points: 240,
    locationName: "Koramangala 5th Block",
    date: "2026-04-04",
    startTime: "05:00 PM",
    endTime: "08:30 PM",
    meetupTime: "Friday • 05:00 PM",
    meetupInstructions: "Meet outside the main mall entrance next to the taxi stand.",
    weather: { condition: "Clear", temperature: "29°C", icon: "☀️" },
    lat: 12.9250,
    lng: 77.6198,
    areaCoordinates: [
      [12.9260, 77.6180],
      [12.9245, 77.6204],
      [12.9239, 77.6195],
      [12.9248, 77.6182],
    ],
    requiredTools: ["Gloves", "Trash bags", "Street brooms"],
    participants: 42,
    participantAvatars: [
      { id: "a16", name: "Ishaan", initials: "I", color: "bg-teal-500" },
      { id: "a17", name: "Sana", initials: "S", color: "bg-pink-500" },
      { id: "a18", name: "Naveen", initials: "N", color: "bg-indigo-500" },
    ],
    targetImpactKg: 250,
    reportsFiledKg: 135,
    physicalIntensity: "High",
    ageSuitability: "Adults Only",
    status: "Open",
    joined: false,
    completed: false,
    mapLink: "#",
    highlight: "High-traffic commercial zone",
  },
  {
    id: "challenge-7",
    title: "Industrial Park Community Patrol",
    level: "level-3",
    badgeLabel: "Patrol",
    badgeClass: "bg-red-100 text-red-800",
    description: "Mobilize teams across the industrial park for a controlled cleanup patrol.",
    points: 380,
    locationName: "Bengaluru Industrial Park",
    date: "2026-04-05",
    startTime: "07:00 AM",
    endTime: "03:00 PM",
    meetupTime: "Saturday • 07:00 AM",
    meetupInstructions: "Meet by the north loading dock near Gate 5; look for the blue banner.",
    weather: { condition: "Partly cloudy", temperature: "30°C", icon: "⛅" },
    lat: 12.9109,
    lng: 77.5348,
    areaCoordinates: [
      [12.9121, 77.5334],
      [12.9113, 77.5361],
      [12.9098, 77.5355],
      [12.9102, 77.5327],
    ],
    requiredTools: ["Gloves", "Safety vests", "High-visibility jackets"],
    participants: 40,
    participantAvatars: [
      { id: "a19", name: "Rhea", initials: "R", color: "bg-orange-500" },
      { id: "a20", name: "Karan", initials: "K", color: "bg-cyan-500" },
      { id: "a21", name: "Tanya", initials: "T", color: "bg-green-500" },
    ],
    targetImpactKg: 360,
    reportsFiledKg: 190,
    physicalIntensity: "High",
    ageSuitability: "Adults Only",
    status: "Urgent",
    joined: false,
    completed: false,
    mapLink: "#",
    highlight: "Large team coordination",
  },
  {
    id: "challenge-8",
    title: "Coastal Stretch Patrol",
    level: "level-3",
    badgeLabel: "Patrol",
    badgeClass: "bg-red-100 text-red-800",
    description: "Coordinate a beach cleanup patrol across the coastal stretch.",
    points: 460,
    locationName: "Bengaluru Coastal Road",
    date: "2026-04-06",
    startTime: "06:00 AM",
    endTime: "12:00 PM",
    meetupTime: "Sunday • 06:00 AM",
    meetupInstructions: "Meet by the beachfront kiosk near the north pier; look for the turquoise flag.",
    weather: { condition: "Clear", temperature: "27°C", icon: "🌤️" },
    lat: 12.9542,
    lng: 77.4900,
    areaCoordinates: [
      [12.9560, 77.4885],
      [12.9548, 77.4920],
      [12.9532, 77.4912],
      [12.9538, 77.4880],
    ],
    requiredTools: ["Buckets", "Gloves", "Rakes", "Garbage nets"],
    participants: 44,
    participantAvatars: [
      { id: "a22", name: "Vikram", initials: "V", color: "bg-emerald-500" },
      { id: "a23", name: "Aanya", initials: "A", color: "bg-sky-500" },
      { id: "a24", name: "Rohit", initials: "R", color: "bg-rose-500" },
    ],
    targetImpactKg: 320,
    reportsFiledKg: 180,
    physicalIntensity: "High",
    ageSuitability: "Adults Only",
    status: "Filling Fast",
    joined: false,
    completed: false,
    mapLink: "#",
    highlight: "Strong turnout expected",
  },
];

const randomRange = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2));
const randomOffset = () => (Math.random() - 0.5) * 0.02;

const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
};

const reduceHeatmapIntensity = (reports: HeatmapReport[], challenge: ChallengeCard) =>
  reports.map((report) => {
    const distance = getDistanceKm(report.lat, report.lng, challenge.lat, challenge.lng);
    if (distance <= 2) {
      return {
        ...report,
        intensity: Number(Math.max(0.12, report.intensity * 0.65).toFixed(2)),
      };
    }
    return report;
  });

const createHeatmapReport = (): HeatmapReport => {
  const baseLat = 12.94 + randomOffset();
  const baseLng = 77.62 + randomOffset();
  const kg = Math.floor(Math.random() * 6) + 1;
  const intensity = Number((0.4 + Math.random() * 0.6).toFixed(2));
  return {
    id: `report-${Date.now()}`,
    lat: Number((baseLat + randomOffset()).toFixed(5)),
    lng: Number((baseLng + randomOffset()).toFixed(5)),
    intensity,
    label: `Rapid Response Report (${kg} kg)` ,
    description: `${kg} kg of plastic waste reported in a new hotspot.`,
    createdAt: new Date().toISOString(),
  };
};

interface RecycleHubContextValue {
  heatmapReports: HeatmapReport[];
  heatmapPoints: [number, number, number][];
  challenges: ChallengeCard[];
  selectedChallengeId: string | null;
  selectedChallenge: ChallengeCard | null;
  setSelectedChallengeId: (id: string) => void;
  setSelectedChallenge: (id: string) => void;
  joinChallenge: (id: string) => void;
  globalMetrics: GlobalMetrics;
  supplierApplications: SupplierApplication[];
  sourcingRequests: SourcingRequest[];
  trackOrders: OrderTracker[];
  recentActivity: RecentActivityItem[];
  topRecyclers: TopRecycler[];
  leaderboardUsers: LeaderboardUser[];
  userBalance: number;
  availableMarketCredits: number;
  fullTransactionList: MarketTransaction[];
  quickActionStats: QuickActionStats;
  addTransaction: (transaction: Omit<MarketTransaction, "id" | "createdAt">) => void;
  addSourcingRequest: (request: Omit<SourcingRequest, "id">) => SourcingRequest;
  addTrackOrder: (order: Omit<OrderTracker, "id"> & { id?: string }) => OrderTracker;
  updateTrackOrderStatus: (orderId: string, status: OrderTracker["status"]) => void;
  completePurchase: (quantity: number) => boolean;
  refreshAllData: () => void;
}

const MarketContext = createContext<RecycleHubContextValue | undefined>(undefined);

function useProvideRecycleHub() {
  const [heatmapReports, setHeatmapReports] = useState<HeatmapReport[]>(INITIAL_HEATMAP_REPORTS);
  const [challenges, setChallenges] = useState<ChallengeCard[]>(INITIAL_CHALLENGES);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(INITIAL_CHALLENGES[0]?.id ?? null);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics>(INITIAL_GLOBAL_METRICS);
  const [supplierApplications, setSupplierApplications] = useState<SupplierApplication[]>(INITIAL_SUPPLIER_APPLICATIONS);
  const [sourcingRequests, setSourcingRequests] = useState<SourcingRequest[]>(INITIAL_SOURCING_REQUESTS);
  const [trackOrders, setTrackOrders] = useState<OrderTracker[]>(INITIAL_TRACK_ORDERS);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(INITIAL_RECENT_ACTIVITY);
  const [topRecyclers, setTopRecyclers] = useState<TopRecycler[]>(INITIAL_TOP_RECYCLERS);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD_USERS);
  const [quickActionStats, setQuickActionStats] = useState<QuickActionStats>(INITIAL_QUICK_ACTION_STATS);
  const [userBalance, setUserBalance] = useState<number>(840);
  const [availableMarketCredits, setAvailableMarketCredits] = useState<number>(200);
  const [fullTransactionList, setFullTransactionList] = useState<MarketTransaction[]>(INITIAL_MARKET_TRANSACTIONS);

  useEffect(() => {
    const storedBalance = window.localStorage.getItem(MARKET_STORAGE_KEYS.userBalance);
    const storedAvailableCredits = window.localStorage.getItem(MARKET_STORAGE_KEYS.availableMarketCredits);
    const storedTransactions = window.localStorage.getItem(MARKET_STORAGE_KEYS.transactions);

    if (storedBalance !== null) {
      setUserBalance(Number(storedBalance));
    }

    if (storedAvailableCredits !== null) {
      setAvailableMarketCredits(Number(storedAvailableCredits));
    }

    if (storedTransactions) {
      try {
        const parsed = JSON.parse(storedTransactions) as MarketTransaction[];
        if (Array.isArray(parsed)) {
          setFullTransactionList(parsed);
        }
      } catch {
        setFullTransactionList(INITIAL_MARKET_TRANSACTIONS);
      }
    }

    const storedMetrics = window.localStorage.getItem(MARKET_STORAGE_KEYS.globalMetrics);
    if (storedMetrics) {
      try {
        const parsed = JSON.parse(storedMetrics) as GlobalMetrics;
        setGlobalMetrics(parsed);
      } catch {
        setGlobalMetrics(INITIAL_GLOBAL_METRICS);
      }
    }

    const storedChallenges = window.localStorage.getItem(MARKET_STORAGE_KEYS.challenges);
    if (storedChallenges) {
      try {
        const parsed = JSON.parse(storedChallenges) as ChallengeCard[];
        if (Array.isArray(parsed)) {
          setChallenges(parsed);
        }
      } catch {
        setChallenges(INITIAL_CHALLENGES);
      }
    }

    const storedRecentActivity = window.localStorage.getItem(MARKET_STORAGE_KEYS.recentActivity);
    if (storedRecentActivity) {
      try {
        const parsed = JSON.parse(storedRecentActivity) as RecentActivityItem[];
        if (Array.isArray(parsed)) {
          setRecentActivity(parsed);
        }
      } catch {
        setRecentActivity(INITIAL_RECENT_ACTIVITY);
      }
    }

    const storedTopRecyclers = window.localStorage.getItem(MARKET_STORAGE_KEYS.topRecyclers);
    if (storedTopRecyclers) {
      try {
        const parsed = JSON.parse(storedTopRecyclers) as TopRecycler[];
        if (Array.isArray(parsed)) {
          setTopRecyclers(parsed);
        }
      } catch {
        setTopRecyclers(INITIAL_TOP_RECYCLERS);
      }
    }

    const storedQuickActionStats = window.localStorage.getItem(MARKET_STORAGE_KEYS.quickActionStats);
    if (storedQuickActionStats) {
      try {
        const parsed = JSON.parse(storedQuickActionStats) as QuickActionStats;
        setQuickActionStats(parsed);
      } catch {
        setQuickActionStats(INITIAL_QUICK_ACTION_STATS);
      }
    }

    const storedSourcingRequests = window.localStorage.getItem(MARKET_STORAGE_KEYS.sourcingRequests);
    if (storedSourcingRequests) {
      try {
        const parsed = JSON.parse(storedSourcingRequests) as SourcingRequest[];
        if (Array.isArray(parsed)) {
          setSourcingRequests(parsed);
        }
      } catch {
        setSourcingRequests(INITIAL_SOURCING_REQUESTS);
      }
    }

    const storedTrackOrders = window.localStorage.getItem(MARKET_STORAGE_KEYS.trackOrders);
    if (storedTrackOrders) {
      try {
        const parsed = JSON.parse(storedTrackOrders) as OrderTracker[];
        if (Array.isArray(parsed)) {
          setTrackOrders(parsed);
        }
      } catch {
        setTrackOrders(INITIAL_TRACK_ORDERS);
      }
    }
  }, []);

  useEffect(() => {
    const livePickerInterval = window.setInterval(() => {
      setGlobalMetrics((current) => ({
        ...current,
        livePickersOnline: randomInt(35, 52),
      }));
    }, 7000);

    const tickerInterval = window.setInterval(() => {
      setGlobalMetrics((current) => ({
        ...current,
        totalPlasticRecycledKg: Number((current.totalPlasticRecycledKg + Number((Math.random() * 0.8 + 0.3).toFixed(1))).toFixed(1)),
        totalCarbonCredits: current.totalCarbonCredits + randomInt(1, 3),
      }));
    }, 10000);

    return () => {
      window.clearInterval(livePickerInterval);
      window.clearInterval(tickerInterval);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const newReport = createHeatmapReport();
      setHeatmapReports((prev) => [newReport, ...prev].slice(0, 80));
      setChallenges((prev) =>
        prev.map((challenge) =>
          challenge.id === prev[Math.floor(Math.random() * prev.length)].id
            ? {
                ...challenge,
                participants: challenge.participants + Math.floor(Math.random() * 3),
              }
            : challenge
        )
      );
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const transactionInterval = window.setInterval(() => {
      const mockTx = createMockMarketTransaction();
      setFullTransactionList((prev) => [mockTx, ...prev].slice(0, 50));
    }, 60000);

    return () => window.clearInterval(transactionInterval);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(MARKET_STORAGE_KEYS.userBalance, String(userBalance));
  }, [userBalance]);

  useEffect(() => {
    window.localStorage.setItem(MARKET_STORAGE_KEYS.availableMarketCredits, String(availableMarketCredits));
  }, [availableMarketCredits]);

  useEffect(() => {
    window.localStorage.setItem(MARKET_STORAGE_KEYS.transactions, JSON.stringify(fullTransactionList));
  }, [fullTransactionList]);

  useEffect(() => {
    window.localStorage.setItem(MARKET_STORAGE_KEYS.globalMetrics, JSON.stringify(globalMetrics));
  }, [globalMetrics]);

  useEffect(() => {
    window.localStorage.setItem(MARKET_STORAGE_KEYS.challenges, JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    window.localStorage.setItem(MARKET_STORAGE_KEYS.recentActivity, JSON.stringify(recentActivity));
  }, [recentActivity]);

  useEffect(() => {
    window.localStorage.setItem(MARKET_STORAGE_KEYS.topRecyclers, JSON.stringify(topRecyclers));
  }, [topRecyclers]);

  useEffect(() => {
    window.localStorage.setItem(MARKET_STORAGE_KEYS.quickActionStats, JSON.stringify(quickActionStats));
  }, [quickActionStats]);

  useEffect(() => {
    window.localStorage.setItem(MARKET_STORAGE_KEYS.sourcingRequests, JSON.stringify(sourcingRequests));
  }, [sourcingRequests]);

  useEffect(() => {
    window.localStorage.setItem(MARKET_STORAGE_KEYS.trackOrders, JSON.stringify(trackOrders));
  }, [trackOrders]);

  // Sync userBalance with quickActionStats and leaderboard
  useEffect(() => {
    if (leaderboardUsers.length > 0) {
      // Update quick action stats wallet when userBalance changes
      setQuickActionStats((prev) => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          balance: userBalance,
        },
      }));

      // Recalculate leaderboard ranks when userBalance changes
      setLeaderboardUsers((prev) => {
        const currentUserIdx = prev.findIndex((u) => u.isCurrentUser);
        if (currentUserIdx !== -1) {
          prev[currentUserIdx] = {
            ...prev[currentUserIdx],
            credits: userBalance,
          };
        }

        const sorted = [...prev].sort((a, b) => b.credits - a.credits);
        return sorted.map((user, idx) => ({
          ...user,
          rank: idx + 1,
        }));
      });
    }
  }, [userBalance]);

  const heatmapPoints = useMemo(
    () => heatmapReports.map((report) => [report.lat, report.lng, report.intensity] as [number, number, number]),
    [heatmapReports]
  );

  const selectedChallenge = useMemo(
    () => (selectedChallengeId ? challenges.find((challenge) => challenge.id === selectedChallengeId) ?? null : null),
    [challenges, selectedChallengeId]
  );

  const setSelectedChallenge = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
  };

  const refreshAllData = () => {
    // Recalculate leaderboard ranks based on current user balance
    let currentUserNewRank = 12;
    
    setLeaderboardUsers((prev) => {
      // Find current user and update their credits
      const currentUserIdx = prev.findIndex((u) => u.isCurrentUser);
      if (currentUserIdx !== -1) {
        prev[currentUserIdx] = {
          ...prev[currentUserIdx],
          credits: userBalance,
          kgRecycled: quickActionStats.myImpact.totalWasteDivertedKg,
        };
      }

      // Sort by credits and recalculate ranks
      const sorted = [...prev].sort((a, b) => b.credits - a.credits);
      const rankedUsers = sorted.map((user, idx) => ({
        ...user,
        rank: idx + 1,
      }));
      
      // Extract current user's new rank
      const currentUser = rankedUsers.find((u) => u.isCurrentUser);
      if (currentUser) {
        currentUserNewRank = currentUser.rank;
      }
      
      return rankedUsers;
    });

    // Update quick action stats to reflect current state
    setQuickActionStats((prev) => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        balance: userBalance,
      },
      myImpact: {
        ...prev.myImpact,
        totalWasteDivertedKg: prev.myImpact.totalWasteDivertedKg,
      },
      leaderboard: {
        ...prev.leaderboard,
        rank: currentUserNewRank,
      },
    }));
  };

  const joinChallenge = (challengeId: string) => {
    setChallenges((prev) => {
      const newChallenges = prev.map((challenge) =>
        challenge.id === challengeId
          ? {
              ...challenge,
              joined: !challenge.joined,
              completed: !challenge.joined && challenge.participants + 1 >= 50,
              participants: challenge.joined ? Math.max(challenge.participants - 1, 0) : challenge.participants + 1,
            }
          : challenge
      );

      const updatedChallenge = newChallenges.find((c) => c.id === challengeId);
      if (updatedChallenge?.joined) {
        setHeatmapReports((reports) => reduceHeatmapIntensity(reports, updatedChallenge));
        
        // Add reward credits
        const rewardCredits = updatedChallenge.points * 10;
        setUserBalance((prev) => prev + rewardCredits);
        
        // Increment live pickers
        setGlobalMetrics((prev) => ({
          ...prev,
          livePickersOnline: Math.min(prev.livePickersOnline + 1, 99),
        }));
        
        // Increment my impact (add 50% of target impact)
        const impactIncrease = Math.round(updatedChallenge.targetImpactKg * 0.5);
        setQuickActionStats((prev) => ({
          ...prev,
          wallet: {
            ...prev.wallet,
            lastEarned: rewardCredits,
          },
          myImpact: {
            totalWasteDivertedKg: prev.myImpact.totalWasteDivertedKg + impactIncrease,
          },
        }));
        
        // Update global metrics with impact
        setGlobalMetrics((prev) => ({
          ...prev,
          totalPlasticRecycledKg: Number((prev.totalPlasticRecycledKg + impactIncrease).toFixed(1)),
        }));
        
        addTransaction({
          description: `Challenge joined: ${updatedChallenge.title}`,
          amount: rewardCredits,
          status: "Complete",
          type: "Challenge Reward",
        });
      } else if (!updatedChallenge?.joined) {
        // When leaving challenge, decrement live pickers and impact
        const prevChallenge = prev.find((c) => c.id === challengeId);
        if (prevChallenge?.joined) {
          setGlobalMetrics((prev) => ({
            ...prev,
            livePickersOnline: Math.max(prev.livePickersOnline - 1, 0),
          }));
          
          const impactDecrease = Math.round(prevChallenge.targetImpactKg * 0.5);
          setQuickActionStats((prev) => ({
            ...prev,
            myImpact: {
              totalWasteDivertedKg: Math.max(prev.myImpact.totalWasteDivertedKg - impactDecrease, 0),
            },
          }));
        }
      }

      if (updatedChallenge?.completed && !prev.find((c) => c.id === challengeId)?.completed) {
        setGlobalMetrics((current) => ({
          ...current,
          totalPlasticRecycledKg: Number((current.totalPlasticRecycledKg + updatedChallenge.reportsFiledKg).toFixed(1)),
          totalCarbonCredits: current.totalCarbonCredits + Math.max(1, Math.round(updatedChallenge.reportsFiledKg * 0.4)),
        }));
      }

      return newChallenges;
    });
  };

  const addTransaction = (transaction: Omit<MarketTransaction, "id" | "createdAt">) => {
    setFullTransactionList((prev) => [createMarketTransaction(transaction), ...prev].slice(0, 50));
  };

  const addSourcingRequest = (request: Omit<SourcingRequest, "id">) => {
    const newRequest: SourcingRequest = {
      ...request,
      id: `req-${Date.now()}`,
    };
    setSourcingRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  const addTrackOrder = (order: Omit<OrderTracker, "id"> & { id?: string }) => {
    const newOrder: OrderTracker = {
      ...order,
      id: order.id ?? `ORD-${Date.now()}`,
    };
    setTrackOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateTrackOrderStatus = (orderId: string, status: OrderTracker["status"]) => {
    setTrackOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const completePurchase = (quantity: number) => {
    if (quantity < 1 || quantity > availableMarketCredits) {
      return false;
    }

    setAvailableMarketCredits((prev) => prev - quantity);
    setUserBalance((prev) => prev + quantity);
    addTransaction({
      description: "Market Purchase",
      amount: quantity,
      status: "Complete",
      type: "Market Purchase",
    });

    return true;
  };

  return {
    heatmapReports,
    heatmapPoints,
    challenges,
    selectedChallengeId,
    selectedChallenge,
    setSelectedChallengeId,
    setSelectedChallenge,
    joinChallenge,
    globalMetrics,
    supplierApplications,
    sourcingRequests,
    trackOrders,
    userBalance,
    availableMarketCredits,
    fullTransactionList,
    recentActivity,
    topRecyclers,
    leaderboardUsers,
    quickActionStats,
    addTransaction,
    addSourcingRequest,
    addTrackOrder,
    updateTrackOrderStatus,
    completePurchase,
    refreshAllData,
  };
}

export function RecycleHubProvider({ children }: { children: ReactNode }) {
  const value = useProvideRecycleHub();
  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useRecycleHub() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("useRecycleHub must be used within a RecycleHubProvider");
  }
  return context;
}

export function useMarket() {
  return useRecycleHub();
}
