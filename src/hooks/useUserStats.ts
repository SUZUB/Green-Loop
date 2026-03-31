import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  fullName: string;
  totalRecycledKg: number;
  totalPoints: number;
  coinBalance: number;
  totalPickups: number;
  consecutiveWeeks: number;
  referralCount: number;
  co2Saved: number;
  animalsSaved: number;
  earnedBadges: { name: string; icon: string; date?: string }[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

const BADGE_DEFINITIONS = [
  { key: "plastic_saver", name: "Plastic Saver", icon: "🌱", desc: "Complete your first recycling pickup", check: (s: any) => s.totalPickups >= 1 },
  { key: "eco_warrior", name: "Eco Warrior", icon: "⚔️", desc: "Recycle 100 kg total", check: (s: any) => s.totalRecycledKg >= 100 },
  { key: "green_champion", name: "Green Champion", icon: "🏅", desc: "Recycle 500 kg total", check: (s: any) => s.totalRecycledKg >= 500 },
  { key: "consistency_king", name: "Consistency King", icon: "👑", desc: "10 consecutive weekly pickups", check: (s: any) => s.consecutiveWeeks >= 10 },
  { key: "community_hero", name: "Community Hero", icon: "🦸", desc: "Refer 5 friends", check: (s: any) => s.referralCount >= 5 },
  { key: "planet_guardian", name: "Planet Guardian", icon: "🌍", desc: "Save 1,000 kg CO₂", check: (s: any) => s.co2Saved >= 1000 },
  { key: "ocean_protector", name: "Ocean Protector", icon: "🐬", desc: "Save 100 marine animals", check: (s: any) => s.animalsSaved >= 100 },
  { key: "zero_waste_hero", name: "Zero Waste Hero", icon: "♻️", desc: "50 pickups, zero cancellations", check: (s: any) => s.totalPickups >= 50 },
];

export const BADGE_DEFS = BADGE_DEFINITIONS;

const EMPTY_STATS: UserStats = {
  fullName: "",
  totalRecycledKg: 0,
  totalPoints: 0,
  coinBalance: 0,
  totalPickups: 0,
  consecutiveWeeks: 0,
  referralCount: 0,
  co2Saved: 0,
  animalsSaved: 0,
  earnedBadges: [],
  isLoading: false,
  isAuthenticated: false,
};

export function useUserStats(): UserStats {
  const [stats, setStats] = useState<UserStats>({ ...EMPTY_STATS, isLoading: true });

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStats(EMPTY_STATS);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: badges } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id);

      if (profile) {
        const p = profile as any;
        const totalKg = Number(p.total_recycled_kg) || 0;

        const earnedBadges = (badges || []).map((b: any) => ({
          name: b.badge_name,
          icon: b.badge_icon,
          date: new Date(b.earned_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        }));

        setStats({
          fullName: p.full_name || "Recycler",
          totalRecycledKg: totalKg,
          totalPoints: p.total_points || 0,
          coinBalance: p.coin_balance || 0,
          totalPickups: p.total_pickups || 0,
          consecutiveWeeks: p.consecutive_weeks || 0,
          referralCount: p.referral_count || 0,
          co2Saved: totalKg * 0.5,
          animalsSaved: Math.floor(totalKg),
          earnedBadges,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setStats(EMPTY_STATS);
      }

      // Subscribe to realtime profile updates
      channel = supabase
        .channel("my-profile-changes")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
          (payload) => {
            const p = payload.new as any;
            const totalKg = Number(p.total_recycled_kg) || 0;
            setStats((prev) => ({
              ...prev,
              totalPoints: p.total_points || 0,
              coinBalance: p.coin_balance || 0,
              totalRecycledKg: totalKg,
              totalPickups: p.total_pickups || 0,
              consecutiveWeeks: p.consecutive_weeks || 0,
              referralCount: p.referral_count || 0,
              co2Saved: totalKg * 0.5,
              animalsSaved: Math.floor(totalKg),
            }));
          }
        )
        .subscribe();
    };

    fetchStats();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return stats;
}
