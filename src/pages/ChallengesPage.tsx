import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { PageBackground } from "@/components/PageBackground";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Users, Sparkles, Target, Navigation } from "lucide-react";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import type { ChallengeCard } from "@/hooks/useRecycleHub";
import { useToast } from "@/hooks/use-toast";

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
    let heatLayer: any = null;

    const addLayer = () => {
      const size = map.getSize();
      if (size.x === 0 || size.y === 0) return;
      heatLayer = (L as any).heatLayer(points, {
        radius: 24,
        blur: 32,
        maxZoom: 16,
        gradient: { 0.1: "#3b82f6", 0.4: "#60a5fa", 0.6: "#fbbf24", 0.8: "#f97316", 1.0: "#ef4444" },
      });
      heatLayer.addTo(map);
    };

    map.whenReady(() => setTimeout(addLayer, 0));

    return () => {
      if (heatLayer && map.hasLayer(heatLayer)) map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

export default function ChallengesPage() {
  const { toast } = useToast();
  const {
    heatmapReports,
    heatmapPoints,
    challenges,
    selectedChallengeId,
    selectedChallenge,
    setSelectedChallenge,
    joinChallenge,
    userBalance,
  } = useRecycleHub();

  const [map, setMap] = useState<L.Map | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  /** Opens Google Maps directions to the challenge meetup coordinates. */
  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  useEffect(() => {
    const htmlOv = document.documentElement.style.overflow;
    const bodyOv = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = htmlOv;
      document.body.style.overflow = bodyOv;
    };
  }, []);

  useEffect(() => {
    if (!map || !selectedChallenge) return;
    map.flyTo([selectedChallenge.lat, selectedChallenge.lng], 13, { duration: 1.1 });
  }, [map, selectedChallenge]);

  const challengeGroups = useMemo(
    () => ({
      level1: challenges.filter((c) => c.level === "level-1"),
      level2: challenges.filter((c) => c.level === "level-2"),
      level3: challenges.filter((c) => c.level === "level-3"),
    }),
    [challenges]
  );

  const activeMeetups = challenges.map((c) => ({
    id: c.id, lat: c.lat, lng: c.lng, title: c.title,
    participants: c.participants, level: c.level,
  }));

  const pickerMarkers = heatmapReports.slice(0, 6);

  const levelMeta = [
    { label: "Level 1", heading: "Quick Cleanup",     badge: "bg-emerald-100 text-emerald-800", badgeText: "Surface Waste" },
    { label: "Level 2", heading: "Deep Dive",         badge: "bg-amber-100 text-amber-800",     badgeText: "Heavy Zone" },
    { label: "Level 3", heading: "Community Patrol",  badge: "bg-red-100 text-red-800",         badgeText: "Urgent Mission" },
  ];

  return (
    <div className="h-screen bg-background/30 text-slate-100 overflow-hidden">
      <PageBackground type="oceanPlastic" overlay="bg-foreground/50" />
      <div className="container mx-auto max-w-7xl h-full px-4 py-6 flex flex-col min-h-0">

        {/* ── Header ── */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between shrink-0">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">GREEN LOOP coordination</p>
            <h1 className="text-3xl sm:text-4xl font-display font-bold">Community Cleanup Challenges</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Coordinate the next volunteer mission with live heatmap intelligence, challenge meetups, and patrol locations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Active Reports", value: heatmapReports.length },
              { label: "Challenges",     value: challenges.length },
              { label: "Your Credit Wallet", value: `${userBalance.toLocaleString("en-IN")} pts` },
            ].map((s) => (
              <div key={s.label} className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{s.label}</p>
                <p className="text-xl font-semibold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)] flex-1 min-h-0">

          {/* ── Left: challenge list ── */}
          <section className="space-y-6 min-h-0 overflow-hidden flex flex-col">
            <Card className="rounded-[32px] bg-slate-950/90 border border-white/10 p-6 shadow-2xl shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Live Cleanup Hub</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Active Challenges</h2>
                </div>
                <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">Updated every 5 seconds</div>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { icon: Sparkles, color: "text-cyan-300",    text: "Choose a challenge and coordinate with your patrols on the map." },
                  { icon: MapPin,   color: "text-emerald-300", text: "Heatmap shows priority cleanup zones from incoming reports." },
                  { icon: Users,    color: "text-amber-300",   text: "Meetup markers show active teamwork start points." },
                ].map(({ icon: Icon, color, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-slate-400">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-6 flex-1 min-h-0 overflow-y-auto pr-2">
              {([challengeGroups.level1, challengeGroups.level2, challengeGroups.level3] as ChallengeCard[][]).map((group, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{levelMeta[index].label}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{levelMeta[index].heading}</h3>
                    </div>
                    <Badge className={levelMeta[index].badge}>{levelMeta[index].badgeText}</Badge>
                  </div>

                  <div className="space-y-4">
                    {group.map((challenge, idx) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.06 }}
                        className={`rounded-[28px] border px-5 py-5 transition-all cursor-pointer ${
                          selectedChallengeId === challenge.id
                            ? "border-cyan-400/40 bg-slate-900"
                            : "border-white/10 bg-slate-950/80"
                        }`}
                        onClick={() => setSelectedChallenge(challenge.id)}
                      >
                        {/* Title row */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${challenge.badgeClass}`}>
                                {challenge.badgeLabel}
                              </span>
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

                        {/* Stats */}
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

                        {/* Action buttons */}
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          {/* Join */}
                          <Button
                            size="sm"
                            variant={challenge.joined ? "secondary" : "default"}
                            disabled={challenge.joined || joiningId === challenge.id}
                            onClick={async (e) => {
                              e.stopPropagation();
                              setJoiningId(challenge.id);
                              const joined = await joinChallenge(challenge.id);
                              setJoiningId(null);
                              toast({
                                title: joined ? "Joined challenge" : "Already joined",
                                description: joined
                                  ? "You're in. Tap Navigate to get directions to the meetup."
                                  : "You've already joined this challenge.",
                                variant: joined ? "default" : "default",
                              });
                            }}
                          >
                            {joiningId === challenge.id ? "Joining..." : challenge.joined ? "Joined ✓" : "Join"}
                          </Button>

                          {/* Navigate — opens Google Maps with the meetup coordinates */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              openGoogleMaps(challenge.lat, challenge.lng);
                            }}
                          >
                            <Navigation className="h-4 w-4" /> Navigate
                          </Button>

                          {/* Highlight on map */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1 text-slate-400 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChallenge(challenge.id);
                            }}
                          >
                            <MapPin className="h-4 w-4" /> Map
                          </Button>
                        </div>

                        {/* Required tools */}
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

          {/* ── Right: map ── */}
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
                ref={setMap}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri"
                />
                <HeatmapLayer points={heatmapPoints} />
                {pickerMarkers.map((report) => (
                  <Marker key={report.id} position={[report.lat, report.lng]} icon={pickerIcon}>
                    <Popup>
                      <div className="space-y-2">
                        <p className="font-semibold">Patrol Report</p>
                        <p className="text-sm text-slate-600">{report.label}</p>
                        <p className="text-xs text-slate-500">Intensity {report.intensity}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {activeMeetups.map((ch) => (
                  <Marker
                    key={ch.id}
                    position={[ch.lat, ch.lng]}
                    icon={meetupIcon}
                    eventHandlers={{ click: () => setSelectedChallenge(ch.id) }}
                  >
                    <Popup>
                      <div className="space-y-3">
                        <p className="font-semibold">{ch.title}</p>
                        <p className="text-sm text-slate-600">Meetup location for the active challenge.</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => setSelectedChallenge(ch.id)}>
                            Highlight Card
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => openGoogleMaps(ch.lat, ch.lng)}
                          >
                            <Navigation className="h-3 w-3" /> Navigate
                          </Button>
                        </div>
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
