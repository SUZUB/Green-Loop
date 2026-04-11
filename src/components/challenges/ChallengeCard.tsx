import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, ShieldCheck, Clock3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ChallengeCard as ChallengeCardType } from "@/hooks/useRecycleHub";

interface ChallengeCardProps {
  challenge: ChallengeCardType;
  selected?: boolean;
  onSelect: (id: string) => void;
  onJoin: (id: string) => void;
}

export function ChallengeCard({ challenge, selected = false, onSelect, onJoin }: ChallengeCardProps) {
  const { toast } = useToast();
  const targetParticipants = 50;
  const progress = Math.min(100, Math.round((challenge.participants / targetParticipants) * 100));
  const joinedLabel = challenge.joined ? "Leave" : "Join";
  const detailsLabel = challenge.joined ? "View" : "Details";

  const handleJoin = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onJoin(challenge.id);
    
    if (!challenge.joined) {
      toast({
        title: "✨ Successfully joined!",
        description: "Your impact has been updated in the sidebar. Let's make a difference!",
        className: "bg-[#10B981]/10 border-emerald-500/50",
      });
    } else {
      toast({
        title: "Left Challenge",
        description: "You've left this challenge.",
      });
    }
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      layout
      onClick={() => onSelect(challenge.id)}
      className={`w-full rounded-[26px] border p-5 text-left transition-all ${selected ? "border-cyan-400 bg-[#F8FAF9]" : "border-[#D1FAE5] bg-[#F8FAF9]"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={challenge.badgeClass}>{challenge.badgeLabel}</Badge>
            <span className="text-[11px] text-[#475569]">{challenge.locationName}</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-[#1E293B]">{challenge.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-2 text-right text-xs text-[#475569]">
          <span className="inline-flex items-center gap-1 text-[#14532D]"><MapPin className="h-3.5 w-3.5" /> {challenge.highlight}</span>
          <span className="inline-flex items-center gap-1 text-[#14532D]"><Clock3 className="h-3.5 w-3.5" /> {challenge.meetupTime}</span>
          <span className="inline-flex items-center gap-1 text-[#14532D]"><ShieldCheck className="h-3.5 w-3.5" /> {challenge.status}</span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#475569]">{challenge.description}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-white/95 p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#475569]">Progress</p>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#1E293B]">
            <span>{challenge.participants}/{targetParticipants}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </div>
        <div className="rounded-3xl bg-white/95 p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#475569]">Reward</p>
          <div className="mt-3 space-y-2 text-sm text-[#1E293B]">
            <div className="flex items-center justify-between">
              <span>Points</span>
              <span>{challenge.points}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button size="sm" variant={challenge.joined ? "secondary" : "default"} onClick={handleJoin}>
          {joinedLabel}
        </Button>
        <Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); onSelect(challenge.id); }}>
          {detailsLabel}
        </Button>
      </div>
    </motion.button>
  );
}
