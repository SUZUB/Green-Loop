import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { PageBackground } from "@/components/PageBackground";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, MapPin, Users, Sparkles, Target } from "lucide-react";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import type { ChallengeCard, HeatmapReport } from "@/hooks/useRecycleHub";

const pickerIcon = L.divIcon({
  html: '<div style="width:24px;height:24px;border-radius:50%;background:#38bdf8;border:2px solid #ffffff;box-shadow:0 0 12px rgba(56,189,248,0.55);"></div>',
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const meetupIcon = L.divIcon({
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#fb923c;border:2px solid #ffffff;box-shadow:0 0 14px rgba(251,146,60,0.55);"></div>',
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const heatLayer = (L as any).heatLayer(points, {
      radius: 24,
      blur: 32,
      maxZoom: 16,
      gradient: {
        0.1: "#3b82f6",
        0.4: "#60a5fa",
        0.6: "#fbbf24",
        0.8: "#f97316",
        1.0: "#ef4444",
      },
    });

    heatLayer.addTo(map);
    return () => {
      if (map.hasLayer(heatLayer)) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, points]);

  return null;
}

export default function ChallengesPage() {
  const {
    heatmapReports,
    heatmapPoints,
    challenges,
    selectedChallengeId,
    selectedChallenge,
    setSelectedChallengeId,
    setSelectedChallenge,
    joinChallenge,
    userBalance,
  } = useRecycleHub();

  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (!map || !selectedChallenge) return;
    map.flyTo([selectedChallenge.lat, selectedChallenge.lng], 13, { duration: 1.1 });
  }, [map, selectedChallenge]);

  const challengeGroups = useMemo(
    () => ({
      level1: challenges.filter((challenge) => challenge.level === "level-1"),
      level2: challenges.filter((challenge) => challenge.level === "level-2"),
      level3: challenges.filter((challenge) => challenge.level === "level-3"),
    }),
    [challenges]
  );

  const activeMeetups = challenges.map((challenge) => ({
    id: challenge.id,
    lat: challenge.lat,
    lng: challenge.lng,
    title: challenge.title,
    participants: challenge.participants,
    level: challenge.level,
  }));

  const pickerMarkers = heatmapReports.slice(0, 6);

  return (
    <div className="h-screen bg-background/30 text-slate-100 overflow-hidden">
      <PageBackground type="oceanPlastic" overlay="bg-foreground/50" />
      <div className="container mx-auto max-w-7xl h-full px-4 py-6 flex flex-col min-h-0">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between shrink-0">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">RecycleHub Coordination</p>
            <h1 className="text-3xl sm:text-4xl font-display font-bold">Community Cleanup Challenges</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Coordinate the next volunteer mission with live heatmap intelligence, challenge meetups, and patrol locations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Active Reports</p>
              <p className="text-xl font-semibold text-white">{heatmapReports.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Challenges</p>
              <p className="text-xl font-semibold text-white">{challenges.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Your Credit Wallet</p>
              <p className="text-xl font-semibold text-white">{userBalance.toLocaleString("en-IN")} pts</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)] flex-1 min-h-0">
          <section className="space-y-6 min-h-0 overflow-hidden">
            <Card className="rounded-[32px] bg-slate-950/90 border border-white/10 p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Live Cleanup Hub</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Active Challenges</h2>
                </div>
                <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                  Updated every 5 seconds
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  <span>Choose a challenge and coordinate with your patrols on the map.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 text-emerald-300" />
                  <span>Heatmap shows priority cleanup zones from incoming reports.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <Users className="h-4 w-4 text-amber-300" />
                  <span>Meetup markers show active teamwork start points.</span>
                </div>
              </div>
            </Card>

            <div className="space-y-6 flex-1 min-h-0 overflow-y-auto pr-2">
              {([challengeGroups.level1, challengeGroups.level2, challengeGroups.level3] as ChallengeCard[][]).map((group, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{index === 0 ? "Level 1" : index === 1 ? "Level 2" : "Level 3"}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{index === 0 ? "Quick Cleanup" : index === 1 ? "Deep Dive" : "Community Patrol"}</h3>
                    </div>
                    <Badge className={index === 0 ? "bg-emerald-100 text-emerald-800" : index === 1 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>
                      {index === 0 ? "Surface Waste" : index === 1 ? "Heavy Zone" : "Urgent Mission"}
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {group.map((challenge, idx) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.06 }}
                        className={`rounded-[28px] border px-5 py-5 transition-all ${selectedChallengeId === challenge.id ? "border-cyan-400/40 bg-slate-900" : "border-white/10 bg-slate-950/80"}`}
                        onClick={() => setSelectedChallenge(challenge.id)}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${challenge.badgeClass}`}>{challenge.badgeLabel}</span>
                              <span className="text-xs text-slate-400">{challenge.status}</span>
                            </div>
                            <h4 className="mt-3 text-lg font-semibold text-white">{challenge.title}</h4>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <Target className="h-4 w-4 text-slate-300" />
                            <span>{challenge.highlight}</span>
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-300">{challenge.description}</p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-3xl bg-slate-900/80 p-4">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Points</p>
                            <p className="mt-2 text-xl font-semibold text-white">{challenge.points}</p>
                          </div>
                          <div className="rounded-3xl bg-slate-900/80 p-4">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Meetup</p>
                            <p className="mt-2 text-sm font-semibold text-white">{challenge.meetupTime}</p>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <Button size="sm" variant={challenge.joined ? "secondary" : "default"} onClick={() => joinChallenge(challenge.id)}>
                            {challenge.joined ? "Leave" : "Join"}
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2" onClick={() => setSelectedChallenge(challenge.id)}>
                            Map Location <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                        {challenge.requiredTools && challenge.requiredTools.length > 0 && (
                          <div className="mt-4 rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-300">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Required Tools</p>
                            <p className="mt-2">{challenge.requiredTools.join(" • ")}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/90 shadow-2xl min-h-0">
            <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-slate-950/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Satellite Map</p>
                <h2 className="text-xl font-semibold text-white">High-Density Plastic Heatmap</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="rounded-full bg-cyan-500/10 px-3 py-2">Blue → Red intensity</span>
                <span className="rounded-full bg-white/10 px-3 py-2">{heatmapReports[0]?.label}</span>
              </div>
            </div>
            <div className="relative h-full pt-[86px]">
              <MapContainer
                center={[12.94, 77.62]}
                zoom={12}
                scrollWheelZoom={false}
                whenCreated={setMap}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri"
                />
                <HeatmapLayer points={heatmapPoints} />
                {pickerMarkers.map((report) => (
                  <Marker
                    key={report.id}
                    position={[report.lat, report.lng]}
                    icon={pickerIcon}
                  >
                    <Popup>
                      <div className="space-y-2">
                        <p className="font-semibold">Patrol Report</p>
                        <p className="text-sm text-slate-600">{report.label}</p>
                        <p className="text-xs text-slate-500">Intensity {report.intensity}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {activeMeetups.map((challenge) => (
                  <Marker
                    key={challenge.id}
                    position={[challenge.lat, challenge.lng]}
                    icon={meetupIcon}
                    eventHandlers={{
                      click: () => setSelectedChallenge(challenge.id),
                    }}
                  >
                    <Popup>
                      <div className="space-y-3">
                        <p className="font-semibold">{challenge.title}</p>
                        <p className="text-sm text-slate-600">Meetup location for the active challenge.</p>
                        <Button size="sm" variant="secondary" onClick={() => setSelectedChallenge(challenge.id)}>
                          Highlight Card
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
