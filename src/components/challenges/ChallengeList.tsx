import { useMemo } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChallengeCard as ChallengeCardType } from "@/hooks/useRecycleHub";

interface ChallengeListProps {
  challenges: ChallengeCardType[];
  selectedChallengeId: string | null;
  searchQuery: string;
  difficultyFilter: string;
  sortMode: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onSelect: (id: string) => void;
  onJoin: (id: string) => void;
}

const difficultyOptions = [
  { label: "All", value: "all" },
  { label: "Quick", value: "level-1" },
  { label: "Deep", value: "level-2" },
  { label: "Patrol", value: "level-3" },
];

const sortOptions = [
  { label: "Proximity", value: "proximity" },
  { label: "Urgency", value: "urgency" },
];

export function ChallengeList({
  challenges,
  selectedChallengeId,
  searchQuery,
  difficultyFilter,
  sortMode,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onSelect,
  onJoin,
}: ChallengeListProps) {
  const countText = useMemo(() => {
    if (challenges.length === 0) return "No challenges found";
    return `${challenges.length} challenges available`;
  }, [challenges.length]);

  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="rounded-[32px] bg-white/95 border border-[#D1FAE5] p-5 shadow-2xl backdrop-blur">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#475569]">Nearby Challenges</p>
              <h2 className="mt-2 text-lg font-semibold text-[#1E293B]">{countText}</h2>
            </div>
            <Button size="icon" variant="ghost">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
              <Input
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search by name or location"
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={difficultyFilter === option.value ? "secondary" : "outline"}
                  onClick={() => onFilterChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-[#475569]">Sort by</div>
              <div className="flex items-center gap-2">
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={sortMode === option.value ? "secondary" : "outline"}
                    onClick={() => onSortChange(option.value)}
                    className="flex items-center gap-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3 overflow-y-auto pr-1">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(challenge.id)}
            onKeyDown={(e) => e.key === "Enter" && onSelect(challenge.id)}
            className={`w-full rounded-[28px] border p-4 text-left transition-all cursor-pointer ${selectedChallengeId === challenge.id ? "border-cyan-400 bg-[#F8FAF9]" : "border-[#D1FAE5] bg-[#F8FAF9]"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1E293B]">{challenge.title}</p>
                <p className="text-xs text-[#475569] mt-1">{challenge.locationName}</p>
              </div>
              <Badge className={challenge.badgeClass}>{challenge.badgeLabel}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#475569]">
              <span>{challenge.participants} participants</span>
              <span>{challenge.level.replace("level-", "Level ")}</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#475569]">{challenge.status}</span>
              <Button
                size="sm"
                variant={challenge.joined ? "secondary" : "outline"}
                onClick={(e) => { e.stopPropagation(); onJoin(challenge.id); }}
              >
                {challenge.joined ? "Joined" : "Join"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
