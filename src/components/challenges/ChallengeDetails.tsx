import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, MapPin, Clock, Calendar, Compass, CloudSun, Users, CheckSquare2 } from "lucide-react";
import { ChallengeCard as ChallengeCardType } from "@/hooks/useRecycleHub";

interface ChallengeDetailsProps {
  challenge: ChallengeCardType | null;
  open: boolean;
  onClose: () => void;
  onJoin: (id: string) => void;
}

const parseStartDate = (date: string, time: string) => {
  const [timePart, period] = time.split(" ");
  const [hourStr, minuteStr] = timePart.split(":");
  let hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, hour, minute);
};

export function ChallengeDetails({ challenge, open, onClose, onJoin }: ChallengeDetailsProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const checklist = useMemo(() => {
    const tools = challenge?.requiredTools ?? ["Gloves", "Reusable Water Bottle", "Sturdy Shoes"];
    return [...new Set([...tools, "Reflective vest", "Portable snacks"])] as string[];
  }, [challenge?.requiredTools]);

  useEffect(() => {
    const resetState: Record<string, boolean> = {};
    checklist.forEach((item) => {
      resetState[item] = false;
    });
    setCheckedItems(resetState);
  }, [checklist]);

  const startDate = useMemo(() => (challenge ? parseStartDate(challenge.date, challenge.startTime) : null), [challenge]);
  const countdown = useMemo(() => {
    if (!startDate) return null;
    const diff = startDate.getTime() - Date.now();
    if (diff <= 0 || diff > 24 * 60 * 60 * 1000) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m until start`;
  }, [startDate]);

  const impactProgress = useMemo(() => {
    if (!challenge) return 0;
    return Math.min(100, Math.round((challenge.reportsFiledKg / challenge.targetImpactKg) * 100));
  }, [challenge]);

  if (!challenge || !open) return null;

  const timeline = [
    { time: "09:00 AM", title: "Briefing & Gear Distribution", detail: "Review zones, safety protocols and assign teams." },
    { time: "10:00 AM", title: "Zone-based Clearing", detail: "Deploy teams to mapped cleanup areas." },
    { time: "12:00 PM", title: "Waste Sorting & Weighing", detail: "Separate recyclables and record totals." },
    { time: "01:00 PM", title: "Carbon Credit Distribution", detail: "Award points and conduct debrief." },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ duration: 0.35 }}
      className="relative flex min-h-0 h-full flex-col overflow-hidden rounded-[32px] border border-[#D1FAE5] bg-white/95 shadow-2xl backdrop-blur-md"
    >
      <div className="border-b border-[#D1FAE5] px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-[#475569]">Mission Command</p>
            <h2 className="text-2xl font-semibold text-[#1E293B]">{challenge.title}</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#475569]">
              <span>{challenge.locationName}</span>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span>{challenge.date}</span>
              <span>•</span>
              <span>{challenge.startTime} — {challenge.endTime}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-800">{challenge.physicalIntensity}</Badge>
            <Badge className="bg-[#10B981]/10 text-cyan-200">{challenge.ageSuitability}</Badge>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4 text-[#475569]" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-[#475569] text-xs uppercase tracking-[0.24em]"><Calendar className="h-4 w-4" /> Date + Time</div>
                <p className="mt-3 text-lg font-semibold text-[#1E293B]">{challenge.date}</p>
                <p className="mt-1 text-sm text-[#475569]">{challenge.startTime} — {challenge.endTime}</p>
                {countdown ? <p className="mt-2 text-xs text-cyan-300">{countdown}</p> : null}
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-[#475569] text-xs uppercase tracking-[0.24em]"><CloudSun className="h-4 w-4" /> Weather</div>
                <p className="mt-3 text-lg font-semibold text-[#1E293B]">{challenge.weather.condition}</p>
                <p className="mt-1 text-sm text-[#475569]">{challenge.weather.temperature}</p>
              </Card>
            </div>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#475569]">Meetup Point</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#1E293B]">Exact Meetup Instructions</h3>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">{challenge.participants} volunteers</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#14532D]">{challenge.meetupInstructions}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-[#475569]">
                <MapPin className="h-4 w-4" />
                <span>{challenge.lat.toFixed(4)}, {challenge.lng.toFixed(4)}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${challenge.lat},${challenge.lng}`, "_blank", "noreferrer")}
              >
                Get Directions
              </Button>
            </Card>

            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[#475569]">Event Brief</p>
              <p className="mt-3 text-sm leading-6 text-[#14532D]">{challenge.description}</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#475569]">What to Bring</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#1E293B]">Challenge Checklist</h3>
                </div>
                <CheckSquare2 className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="mt-4 grid gap-2">
                {checklist.map((item) => (
                  <label key={item} className="flex items-center gap-3 rounded-3xl border border-[#D1FAE5] bg-white/95 px-4 py-3">
                    <Checkbox
                      checked={checkedItems[item] ?? false}
                      onCheckedChange={(checked) => setCheckedItems((prev) => ({ ...prev, [item]: checked as boolean }))}
                    />
                    <span className="text-sm text-[#475569]">{item}</span>
                  </label>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[#475569]">Timeline</p>
              <div className="mt-5 space-y-4">
                {timeline.map((step) => (
                  <div key={step.time} className="flex gap-4 rounded-[28px] border border-[#D1FAE5] bg-white/95 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#10B981]/10 text-cyan-200 font-semibold">{step.time}</div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1E293B]">{step.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-[#475569]">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#475569]">Active Crew</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#1E293B]">{challenge.participants} volunteers joined</h3>
                </div>
                <Users className="h-5 w-5 text-[#475569]" />
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {challenge.participantAvatars.map((avatar) => (
                  <div key={avatar.id} className={`flex h-12 w-12 items-center justify-center rounded-full ${avatar.color} text-sm font-semibold text-[#1E293B] shadow-lg`}>
                    {avatar.initials}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#475569]">Impact Projection</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#1E293B]">{challenge.targetImpactKg} kg goal</h3>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">{impactProgress}%</Badge>
              </div>
              <Progress value={impactProgress} className="mt-4 h-3 rounded-full" />
              <p className="mt-2 text-sm text-[#475569]">{challenge.reportsFiledKg} kg filed of {challenge.targetImpactKg} kg</p>
            </Card>

            <Card className="p-5">
              <div className="grid gap-3">
                <div className="rounded-[24px] bg-white/95 p-4">
                  <div className="flex items-center justify-between text-[#475569] text-xs uppercase tracking-[0.24em]"><Clock className="h-4 w-4" /> Duration</div>
                  <p className="mt-3 text-sm text-[#1E293B]">{challenge.startTime} — {challenge.endTime}</p>
                </div>
                <div className="rounded-[24px] bg-white/95 p-4">
                  <div className="flex items-center justify-between text-[#475569] text-xs uppercase tracking-[0.24em]"><Compass className="h-4 w-4" /> Zone Points</div>
                  <p className="mt-3 text-sm text-[#1E293B]">{challenge.areaCoordinates.length} mapped points</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D1FAE5] px-6 py-4">
        <Button className="w-full" onClick={() => onJoin(challenge.id)} disabled={challenge.joined}>
          {challenge.joined ? "Already Joined" : "Join Challenge"}
        </Button>
      </div>
    </motion.aside>
  );
}
