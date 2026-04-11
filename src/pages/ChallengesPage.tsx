import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Target, Navigation } from "lucide-react";
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
    { label: "Level 2", heading: "Deep Dive",         badge: "bg-[#DCFCE7] text-[#14532D]",     badgeText: "Heavy Zone" },
    { label: "Level 3", heading: "Community Patrol",  badge: "bg-red-100 text-red-800",         badgeText: "Urgent Mission" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F9FAFB", color: "#1E293B" }}>
      <div className="container mx-auto max-w-7xl px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#475569]">GREEN LOOP coordination</p>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#1E293B] mt-1">Community Cleanup Challenges</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#475569]">
              Coordinate the next volunteer mission with live heatmap intelligence, challenge meetups, and patrol locations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Active Reports", value: heatmapReports.length },
              { label: "Challenges",     value: challenges.length },
              { label: "Your Wallet",    value: `${userBalance.toLocaleString("en-IN")} pts` },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-[#D1FAE5] bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-[#475569]">{s.label}</p>
                <p className="text-xl font-semibold text-[#1E293B] mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">

          {/* ── Left: challenge list — full natural height, no internal scroll ── */}
          <section className="space-y-8">
            {([challengeGroups.level1, challengeGroups.level2, challengeGroups.level3] as ChallengeCard[][]).map((group, index) => (
              <div key={index}>
                {/* Level header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#475569]">{levelMeta[index].label}</p>
                    <h3 className="text-lg font-semibold text-[#1E293B] mt-0.5">{levelMeta[index].heading}</h3>
                  </div>
                  <Badge className={levelMeta[index].badge}>{levelMeta[index].badgeText}</Badge>
                </div>

                {/* Challenge cards — flex column, no overflow, no fixed height */}
                <div className="flex flex-col gap-5 pb-2">
                  {group.map((challenge, idx) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <div
                        className={`rounded-2xl border p-5 bg-white cursor-pointer transition-all hover:shadow-md ${
                          selectedChallengeId === challenge.id
                            ? "border-[#10B981] shadow-md"
                            : "border-[#D1FAE5]"
                        }`}
                        style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}
                        onClick={() => setSelectedChallenge(challenge.id)}
                      >
                        {/* Title row */}
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${challenge.badgeClass}`}>
                                {challenge.badgeLabel}
                              </span>
                              <span className="text-xs text-[#475569]">{challenge.status}</span>
                            </div>
                            <h4 className="text-base font-bold text-[#1E293B]">{challenge.title}</h4>
                            <p className="text-xs text-[#475569] mt-0.5">{challenge.locationName}</p>
                          </div>
                          {/* Points badge — bright mint for visibility */}
                          <span className="shrink-0 rounded-full bg-[#DCFCE7] px-3 py-1 text-sm font-bold text-[#059669]">
                            {challenge.points} pts
                          </span>
                        </div>

                        <p className="text-sm text-[#475569] leading-relaxed mb-4">{challenge.description}</p>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="rounded-xl bg-[#F9FAFB] border border-[#D1FAE5] p-3">
                            <p className="text-[10px] uppercase tracking-widest text-[#475569]">Meetup</p>
                            <p className="text-sm font-semibold text-[#1E293B] mt-1">{challenge.meetupTime}</p>
                          </div>
                          <div className="rounded-xl bg-[#F9FAFB] border border-[#D1FAE5] p-3">
                            <p className="text-[10px] uppercase tracking-widest text-[#475569]">Target</p>
                            <p className="text-sm font-semibold text-[#1E293B] mt-1">{challenge.targetImpactKg} kg</p>
                          </div>
                        </div>

                        {/* Required tools */}
                        {challenge.requiredTools && challenge.requiredTools.length > 0 && (
                          <div className="rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] px-3 py-2 mb-4">
                            <p className="text-[10px] uppercase tracking-widest text-[#475569] mb-1">Required Tools</p>
                            <p className="text-xs text-[#475569]">{challenge.requiredTools.join(" · ")}</p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Join — Light Mint bg + Deep Green text / Soft Gray when joined */}
                          <Button
                            size="sm"
                            disabled={challenge.joined || joiningId === challenge.id}
                            className={challenge.joined
                              ? "bg-[#F1F5F9] text-[#475569] hover:bg-[#F1F5F9] cursor-default"
                              : "bg-[#DCFCE7] text-[#14532D] hover:bg-[#A7F3D0] border-0"
                            }
                            onClick={async (e) => {
                              e.stopPropagation();
                              setJoiningId(challenge.id);
                              const joined = await joinChallenge(challenge.id);
                              setJoiningId(null);
                              toast({
                                title: joined ? "Joined challenge" : "Already joined",
                                description: joined
                                  ? "You're in. Tap Navigate to get directions."
                                  : "You've already joined this challenge.",
                              });
                            }}
                          >
                            {joiningId === challenge.id ? "Joining..." : challenge.joined ? "Joined ✓" : "Join"}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 border-[#D1FAE5] text-[#14532D] hover:bg-[#DCFCE7]"
                            onClick={(e) => {
                              e.stopPropagation();
                              openGoogleMaps(challenge.lat, challenge.lng);
                            }}
                          >
                            <Navigation className="h-3.5 w-3.5" /> Navigate
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1 text-[#475569] hover:text-[#1E293B]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedChallenge(challenge.id);
                            }}
                          >
                            <MapPin className="h-3.5 w-3.5" /> Map
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* ── Right: map — sticky so it stays visible while scrolling ── */}
          <section className="relative">
            <div className="sticky top-6 rounded-2xl border border-[#D1FAE5] bg-white shadow-md overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D1FAE5] bg-white px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#475569]">Satellite Map</p>
                  <h2 className="text-base font-semibold text-[#1E293B] mt-0.5">Plastic Heatmap</h2>
                </div>
                <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs text-[#14532D] font-medium">
                  {heatmapReports.length} reports
                </span>
              </div>
              <div className="h-[calc(100%-64px)]">
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
                        <div className="space-y-1">
                          <p className="font-semibold text-[#1E293B]">Patrol Report</p>
                          <p className="text-sm text-[#475569]">{report.label}</p>
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
                        <div className="space-y-2">
                          <p className="font-semibold text-[#1E293B]">{ch.title}</p>
                          <Button size="sm" variant="outline" className="gap-1 w-full" onClick={() => openGoogleMaps(ch.lat, ch.lng)}>
                            <Navigation className="h-3 w-3" /> Navigate
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
