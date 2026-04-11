import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, Marker, Popup, Polygon, TileLayer, ZoomControl, AttributionControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HeatmapPoint } from "@/hooks/useHeatmapData";
import { useRecycleHub, ChallengeCard } from "@/hooks/useRecycleHub";
import { ChallengeList } from "@/components/challenges/ChallengeList";
import { ChallengeDetails } from "@/components/challenges/ChallengeDetails";
import { VerifyCollectionModal } from "@/components/picker/VerifyCollectionModal";

interface PickerMapTrackerProps {
  role?: "picker" | "recycler";
  title?: string;
  onHeatmapEvent?: (payload: {
    latestPoint: HeatmapPoint;
    liveCount: number;
    coinBalanceDelta: number;
  }) => void;
}

const centerByRole = {
  picker: [12.9352, 77.6245] as [number, number],
  recycler: [12.9661, 77.6077] as [number, number],
};

function createChallengeIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:24px;height:24px;border-radius:12px;background:${color};border:2px solid #fff;box-shadow:0 0 12px ${color}77"></div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

const challengeIcons = {
  "level-1": createChallengeIcon("#22c55e"),
  "level-2": createChallengeIcon("#f59e0b"),
  "level-3": createChallengeIcon("#ef4444"),
};

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

const pickerIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;border-radius:10px;background:#3b82f6;border:2px solid #fff;box-shadow:0 0 12px rgba(59,130,246,0.5);"></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const highlightIcon = L.divIcon({
  html: `<div style="width:26px;height:26px;border-radius:13px;background:radial-gradient(circle, #22d3ee 0%, #0ea5e9 80%);border:3px solid #fff;box-shadow:0 0 18px rgba(14,165,233,0.55);"></div>`,
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const layer = (L as any).heatLayer(points, {
      radius: 28,
      blur: 28,
      maxZoom: 16,
      gradient: {
        0.1: "#3b82f6",
        0.3: "#60a5fa",
        0.5: "#facc15",
        0.7: "#fb923c",
        1.0: "#ef4444",
      },
    });

    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, points]);

  return null;
}

const getBoundsChallenges = (map: L.Map | null, challenges: ChallengeCard[]) => {
  if (!map) return challenges;
  const bounds = map.getBounds();
  return challenges.filter((challenge) => bounds.contains([challenge.lat, challenge.lng]));
};

export function PickerMapTracker({ role = "picker", title, onHeatmapEvent }: PickerMapTrackerProps) {
  const {
    heatmapReports,
    heatmapPoints,
    challenges,
    selectedChallengeId,
    selectedChallenge,
    setSelectedChallenge,
    joinChallenge,
    globalMetrics,
  } = useRecycleHub();

  const pickerMarkers = useMemo(() => {
    const targetCount = globalMetrics.livePickersOnline;
    if (heatmapReports.length === 0 || targetCount === 0) return [];

    const baseMarkers = heatmapReports.slice(0, Math.min(targetCount, heatmapReports.length));
    if (baseMarkers.length >= targetCount) return baseMarkers;

    const generated = [...baseMarkers];
    while (generated.length < targetCount) {
      const template = heatmapReports[generated.length % heatmapReports.length];
      generated.push({
        ...template,
        id: `${template.id}-dup-${generated.length}`,
        lat: Number((template.lat + randomOffset()).toFixed(5)),
        lng: Number((template.lng + randomOffset()).toFixed(5)),
      });
    }
    return generated;
  }, [globalMetrics.livePickersOnline, heatmapReports]);

  const [map, setMap] = useState<L.Map | null>(null);
  const [boundsChallenges, setBoundsChallenges] = useState<ChallengeCard[]>(challenges);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortMode, setSortMode] = useState("proximity");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [highlightedReportId, setHighlightedReportId] = useState<string | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const [selectedPickerId, setSelectedPickerId] = useState<string | null>(null);

  useEffect(() => {
    if (!map) return;

    const updateBounds = () => setBoundsChallenges(getBoundsChallenges(map, challenges));
    updateBounds();

    map.on("moveend", updateBounds);
    return () => {
      map.off("moveend", updateBounds);
    };
  }, [map, challenges]);

  useEffect(() => {
    const handleHighlight = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent?.detail) {
        setHighlightedReportId(customEvent.detail);
      }
    };

    window.addEventListener("ai-chat-highlight-spot", handleHighlight as EventListener);
    return () => {
      window.removeEventListener("ai-chat-highlight-spot", handleHighlight as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!map || !selectedChallenge) return;

    if (detailsOpen) {
      map.setView([selectedChallenge.lat, selectedChallenge.lng], 14, { animate: false });
      map.panBy([-180, 0], { animate: true });
    } else {
      map.flyTo([selectedChallenge.lat, selectedChallenge.lng], 14, { duration: 1.2 });
    }

    const marker = markerRefs.current[selectedChallenge.id];
    if (marker) {
      marker.openPopup();
    }
  }, [map, selectedChallenge, detailsOpen]);

  const filteredChallenges = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    let filtered = challenges.filter((challenge) => {
      const matchesSearch =
        query.length === 0 ||
        challenge.title.toLowerCase().includes(query) ||
        challenge.locationName.toLowerCase().includes(query) ||
        challenge.description.toLowerCase().includes(query);
      const matchesLevel = difficultyFilter === "all" || challenge.level === difficultyFilter;
      return matchesSearch && matchesLevel;
    });

    if (sortMode === "proximity" && map) {
      const center = map.getCenter();
      filtered = [...filtered].sort((a, b) => {
        const distA = getDistanceKm(center.lat, center.lng, a.lat, a.lng);
        const distB = getDistanceKm(center.lat, center.lng, b.lat, b.lng);
        return distA - distB;
      });
    } else if (sortMode === "urgency") {
      filtered = [...filtered].sort((a, b) => b.participants - a.participants);
    }

    return filtered;
  }, [challenges, searchQuery, difficultyFilter, sortMode, map]);

  const displayedChallenges = useMemo(() => {
    if (boundsChallenges.length > 0) {
      return filteredChallenges.filter((challenge) =>
        boundsChallenges.some((visible) => visible.id === challenge.id)
      );
    }
    return filteredChallenges;
  }, [filteredChallenges, boundsChallenges]);

  const livePickerCount = useMemo(
    () => challenges.reduce((sum, challenge) => sum + challenge.participants, 0),
    [challenges]
  );

  const nearbyChallenges = displayedChallenges;
  const visibleCount = displayedChallenges.length;
  const averageIntensity = useMemo(() => {
    if (heatmapReports.length === 0) return 0;
    return heatmapReports.reduce((sum, report) => sum + report.intensity, 0) / heatmapReports.length;
  }, [heatmapReports]);

  const resetMapView = () => {
    if (!map) return;
    map.flyTo(centerByRole[role], 13, { duration: 0.9 });
  };

  const titleText = title || (role === "picker" ? "Live Picker and Plastic Heatmap" : "Live Giver Heatmap");
  const subtitle = role === "picker"
    ? "Satellite heatmap and active cleanup challenges in one view."
    : "Satellite heatmap and nearby demand locations for givers.";

  return (
    <div className="grid gap-6">
      <div className="h-[34rem] overflow-hidden rounded-[36px] border border-[#D1FAE5] bg-white/95 shadow-2xl">
        <MapContainer
          center={centerByRole[role]}
          zoom={13}
          scrollWheelZoom={true}
          whenCreated={setMap}
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA"
          />
          <HeatmapLayer points={heatmapPoints} />
          {selectedChallenge?.areaCoordinates && (
            <Polygon
              positions={selectedChallenge.areaCoordinates}
              pathOptions={{ color: "#22d3ee", fillColor: "#22d3ee", fillOpacity: 0.18, weight: 2, dashArray: "6" }}
            />
          )}
          <ZoomControl position="topright" />
          <AttributionControl position="bottomright" prefix="" />
          {pickerMarkers.map((report) => (
            <Marker
              key={report.id}
              position={[report.lat, report.lng]}
              icon={report.id === selectedPickerId ? highlightIcon : pickerIcon}
              eventHandlers={{
                click: () => setSelectedPickerId(report.id),
              }}
            >
              <Popup>
                <div className="space-y-2 text-[#1E293B]">
                  <p className="text-sm font-semibold">Picker #{report.id.slice(0, 6)}</p>
                  <p className="text-xs text-[#475569]">{report.label ?? "Active picker"}</p>
                  <Button
                    size="sm"
                    className="w-full gap-1 bg-[#10B981] hover:bg-[#059669] text-white"
                    onClick={() => setSelectedPickerId(report.id)}
                  >
                    Verify Collection
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
          {challenges.map((challenge) => (
            <Marker
              key={challenge.id}
              position={[challenge.lat, challenge.lng]}
              icon={challengeIcons[challenge.level]}
              eventHandlers={{
                click: () => {
                  setSelectedChallenge(challenge.id);
                  setDetailsOpen(true);
                },
              }}
              ref={(marker) => {
                if (marker) markerRefs.current[challenge.id] = marker;
              }}
            >
              <Popup>
                <div className="space-y-3 text-[#1E293B]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{challenge.title}</p>
                    <Badge className={challenge.badgeClass}>{challenge.badgeLabel}</Badge>
                  </div>
                  <p className="text-xs text-[#475569]">{challenge.locationName}</p>
                  <p className="text-xs text-[#475569]">{challenge.meetupTime}</p>
                  <p className="text-xs text-[#475569]">Reward: {challenge.points} points</p>
                  <Button size="sm" className="w-full" onClick={() => joinChallenge(challenge.id)} disabled={challenge.joined}>
                    {challenge.joined ? "Joined" : "Join Challenge"}
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {highlightedReportId && (
          <div className="rounded-[28px] border border-cyan-400/20 bg-[#10B981]/10 p-4 text-[#1E293B] mt-4">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Gemini Suggestion</p>
            <p className="mt-2 font-semibold text-[#1E293B]">
              {heatmapReports.find((report) => report.id === highlightedReportId)?.label ?? "Priority hotspot"}
            </p>
            <p className="mt-1 text-sm text-[#475569]">
              {heatmapReports.find((report) => report.id === highlightedReportId)?.description ?? "This zone has the highest current intensity."}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <div className="rounded-[36px] border border-[#D1FAE5] bg-white/95 p-6 shadow-2xl">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[#475569]">Challenge Master</p>
              <h2 className="text-2xl font-semibold text-[#1E293B]">{titleText}</h2>
              <p className="text-sm text-[#475569]">{subtitle}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[28px] bg-[#F8FAF9]/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[#475569]">Active Missions</p>
                <p className="mt-3 text-3xl font-semibold text-[#1E293B]">{challenges.length}</p>
                <p className="mt-2 text-xs text-[#475569]">Nearby within the map bounds.</p>
              </div>
              <div className="rounded-[28px] bg-[#F8FAF9]/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#475569]">Live Heat</p>
                  <Badge className="bg-cyan-100 text-cyan-800">{averageIntensity.toFixed(2)}</Badge>
                </div>
                <p className="mt-3 text-sm text-[#14532D]">Avg zone intensity across tracked points.</p>
              </div>
            </div>

            <ChallengeList
              challenges={nearbyChallenges}
              selectedChallengeId={selectedChallengeId}
              searchQuery={searchQuery}
              difficultyFilter={difficultyFilter}
              sortMode={sortMode}
              onSearchChange={setSearchQuery}
              onFilterChange={setDifficultyFilter}
              onSortChange={setSortMode}
              onSelect={(id) => {
                setSelectedChallenge(id);
                setDetailsOpen(true);
              }}
              onJoin={joinChallenge}
            />
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-[36px] border border-[#D1FAE5] bg-white/95 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#475569]">Mission Briefing</p>
                <h3 className="mt-2 text-lg font-semibold text-[#1E293B]">{selectedChallenge ? selectedChallenge.title : "Select a challenge"}</h3>
              </div>
              <Badge className="bg-white/10 text-[#475569]">{selectedChallenge ? selectedChallenge.badgeLabel : "Ready"}</Badge>
            </div>
            <p className="mt-4 text-sm text-[#475569]">{selectedChallenge ? selectedChallenge.description : "Choose a challenge card to expand the mission plan and join live."}</p>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden rounded-[36px] border border-[#D1FAE5] bg-[#F8FAF9]/75 shadow-2xl">
            <AnimatePresence mode="wait">
              {detailsOpen && selectedChallenge ? (
                <ChallengeDetails
                  challenge={selectedChallenge}
                  open={detailsOpen}
                  onClose={() => setDetailsOpen(false)}
                  onJoin={joinChallenge}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-[#475569]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#14532D]">
                    <span>👆</span>
                  </div>
                  <p className="max-w-[260px] text-sm">Select a challenge to open a full mission briefing with live participation controls and team updates.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>

      {/* ── Verify Collection Modal — opens when a blue picker marker is clicked ── */}
      <AnimatePresence>
        {selectedPickerId && (
          <VerifyCollectionModal
            pickerId={selectedPickerId}
            pickerLabel={pickerMarkers.find((r) => r.id === selectedPickerId)?.label}
            onClose={() => setSelectedPickerId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
