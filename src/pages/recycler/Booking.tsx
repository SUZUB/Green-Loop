import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { useNavigate } from "react-router-dom";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import { usePickupBroadcast } from "@/hooks/usePickupBroadcast";
import { usePickupSchedule } from "@/hooks/usePickupSchedule";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  Weight,
  MapPin,
  Check,
  Recycle,
  Sun,
  Sunset,
  Moon,
  Edit3,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const timeSlots = [
  { id: "morning", label: "Morning", time: "8:00 AM – 12:00 PM", icon: Sun },
  { id: "afternoon", label: "Afternoon", time: "12:00 PM – 5:00 PM", icon: Sunset },
  { id: "evening", label: "Evening", time: "5:00 PM – 8:00 PM", icon: Moon },
];

const encouragingMessages = [
  "🌊 You just saved a sea turtle's day! Thank you for recycling!",
  "🌱 Every gram counts — you're a planet hero!",
  "♻️ You're part of the solution, not the pollution!",
  "🐬 The ocean thanks you for keeping it clean!",
  "🌍 Small actions, big impact. You're amazing!",
  "🦋 Nature is smiling because of you today!",
  "💚 You're turning waste into wonder. Keep going!",
  "🏆 Champion recycler! The Earth is proud of you!",
  "🌿 One pickup closer to a greener tomorrow!",
  "🎉 You did it! Recycling has never been cooler!",
];

const Booking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Date | undefined>();
  const [timeSlot, setTimeSlot] = useState("");
  const [weight, setWeight] = useState("");
  const [address, setAddress] = useState("");
  const [editingLocation, setEditingLocation] = useState(false);
  const [tempAddress, setTempAddress] = useState("");
  const bookingId = `RH-${Date.now().toString(36).toUpperCase()}`;
  const { bookPickup } = useRecycleHub();
  const { broadcast } = usePickupBroadcast();
  const { schedulePickup } = usePickupSchedule();

  // Generate smart suggestions based on selected date
  const getSmartSuggestions = () => {
    if (!date) return [];
    const suggestions = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() + i + Math.floor(Math.random() * 3));
      const slots = ["Morning", "Afternoon", "Evening"];
      suggestions.push({
        date: d,
        dateLabel: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
        slot: slots[Math.floor(Math.random() * slots.length)],
        slotsAvailable: Math.floor(Math.random() * 8) + 2,
      });
    }
    return suggestions;
  };

  const canProceed = () => {
    if (step === 0) return !!date;
    if (step === 1) return !!timeSlot;
    if (step === 2) return !!weight && parseFloat(weight) > 0;
    if (step === 3) return address.trim().length > 5;
    return true;
  };

  const steps = [
    { label: "Date", icon: CalendarDays },
    { label: "Time", icon: Clock },
    { label: "Weight", icon: Weight },
    { label: "Location", icon: MapPin },
    { label: "Confirm", icon: Check },
  ];

  const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];

  return (
    <div className="min-h-screen">
      <PageBackground type="ocean" overlay="bg-[#F8FAF9]/65" />
      

      {/* Progress */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex items-center justify-between max-w-md mx-auto mb-8">
          {steps.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  i < step ? "bg-[#10B981] text-white" :
                  i === step ? "bg-[#10B981] text-white animate-pulse-soft" :
                  "bg-muted text-[#475569]"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span className="text-xs text-[#475569] hidden sm:block">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="date" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-display font-bold mb-2">Pick a Date</h2>
                <p className="text-[#475569] mb-6">Choose when you'd like us to pick up your plastic.</p>
                <Card className="p-4 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="pointer-events-auto"
                  />
                </Card>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="time" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-display font-bold mb-2">Choose a Time Slot</h2>
                <p className="text-[#475569] mb-6">Select the most convenient time for pickup.</p>
                <div className="space-y-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setTimeSlot(slot.id)}
                      className={`w-full p-5 rounded-xl border text-left flex items-center gap-4 transition-all ${
                        timeSlot === slot.id
                          ? "border-primary bg-[#F0FDF4] shadow-soft"
                          : "border-[#D1FAE5] bg-card hover:border-[#D1FAE5]"
                      }`}
                    >
                      <slot.icon className={`h-6 w-6 ${timeSlot === slot.id ? "text-[#14532D]" : "text-[#475569]"}`} />
                      <div>
                        <div className="font-semibold">{slot.label}</div>
                        <div className="text-sm text-[#475569]">{slot.time}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="weight" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-display font-bold mb-2">Estimated Weight</h2>
                <p className="text-[#475569] mb-6">How much plastic do you have? An estimate is fine.</p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="weight">Weight (in kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g. 2.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      min="0.1"
                      step="0.1"
                      className="mt-2 text-lg h-12"
                    />
                  </div>
                  {weight && parseFloat(weight) > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-[#F0FDF4]">
                      <p className="text-sm text-[#1E293B]">
                        🎉 You'll earn approximately <strong>{Math.round(parseFloat(weight) * 100)} points</strong> (≈ ₹{Math.round(parseFloat(weight) * 10)})
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="location" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-display font-bold mb-2">Pickup Location</h2>
                <p className="text-[#475569] mb-6">Where should we pick up the plastic?</p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Full Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter your full address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-2 h-12"
                    />
                  </div>
                  <Button variant="outline" className="w-full gap-2" onClick={() => setAddress("Auto-detected location (GPS)")}>
                    <MapPin className="h-4 w-4" /> Use Current Location
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-[#10B981] flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="h-10 w-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-display font-bold mb-2">Pickup Confirmed!</h2>
                  <p className="text-[#475569] text-sm">Booking ID: <span className="font-mono font-semibold text-[#1E293B]">{bookingId}</span></p>
                </div>

                {/* Confirmation Details */}
                <Card className="p-6 space-y-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#475569] flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Date</span>
                    <span className="font-medium">{date?.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#475569] flex items-center gap-2"><Clock className="h-4 w-4" /> Time</span>
                    <span className="font-medium capitalize">{timeSlot}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#475569] flex items-center gap-2"><Weight className="h-4 w-4" /> Weight</span>
                    <span className="font-medium">{weight} kg</span>
                  </div>

                  {/* Editable location */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[#475569] flex items-center gap-2 shrink-0"><MapPin className="h-4 w-4" /> Location</span>
                    {editingLocation ? (
                      <div className="flex flex-col items-end gap-2">
                        <Input
                          value={tempAddress}
                          onChange={(e) => setTempAddress(e.target.value)}
                          className="h-9 text-sm w-[200px]"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingLocation(false)}>Cancel</Button>
                          <Button size="sm" className="h-7 text-xs" onClick={() => { setAddress(tempAddress); setEditingLocation(false); }}>Save</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-right max-w-[180px] truncate">{address}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => { setTempAddress(address); setEditingLocation(true); }}
                        >
                          <Edit3 className="h-3.5 w-3.5 text-[#475569]" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#D1FAE5]">
                    <span className="text-[#475569]">Est. Points</span>
                    <span className="font-semibold text-[#14532D]">{Math.round(parseFloat(weight) * 100)} pts (≈ ₹{Math.round(parseFloat(weight) * 10)})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#475569]">Status</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#14532D]">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" /> Confirmed
                    </span>
                  </div>
                </Card>

                {/* Encouraging message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-xl bg-[#F0FDF4] text-center mb-6"
                >
                  <p className="text-[#1E293B] font-medium">{randomMessage}</p>
                </motion.div>

                {/* Smart Suggestions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <Card className="p-5 mb-6 border-[#D1FAE5] bg-[#F0FDF4]">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-[#14532D]" />
                      <h3 className="font-display font-semibold text-sm">Smart Suggestions</h3>
                    </div>
                    <p className="text-sm text-[#475569] mb-4">
                      We found <strong className="text-[#1E293B]">{getSmartSuggestions().length} more slots</strong> in your area. Would you like to contribute again?
                    </p>
                    <div className="space-y-2">
                      {getSmartSuggestions().slice(0, 3).map((s, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          onClick={() => {
                            setDate(s.date);
                            setTimeSlot(s.slot.toLowerCase());
                            setStep(2);
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-lg bg-card border border-[#D1FAE5] hover:border-primary/40 transition-colors text-left"
                        >
                          <div>
                            <span className="text-sm font-medium">{s.dateLabel}</span>
                            <span className="text-xs text-[#475569] ml-2">• {s.slot}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#14532D] font-medium">{s.slotsAvailable} slots</span>
                            <ChevronRight className="h-4 w-4 text-[#475569]" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                <div className="space-y-3">
                  <Button className="w-full" onClick={() => navigate("/recycler/rewards")}>
                    View Rewards Dashboard
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => { setStep(0); setDate(undefined); setTimeSlot(""); setWeight(""); setAddress(""); }}>
                    Book Another Pickup
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 4 && (
            <div className="mt-8">
              <Button
                className="w-full gap-2"
                size="lg"
                disabled={!canProceed()}
                onClick={async () => {
                  if (step === 3) {
                    const { data: auth } = await supabase.auth.getUser();
                    const { data: profile } = auth.user
                      ? await supabase.from("profiles").select("full_name, lat, lng").eq("id", auth.user.id).maybeSingle()
                      : { data: null };

                    const lat = (profile as any)?.lat ?? 12.9716;
                    const lng = (profile as any)?.lng ?? 77.5946;
                    const recyclerName = (profile as any)?.full_name || auth.user?.email || "Recycler";
                    const dateLabel = date?.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) ?? "Today";

                    // Broadcast to pickups table — status AVAILABLE, pickers can accept it
                    const broadcastResult = await broadcast({
                      lat,
                      lng,
                      address,
                      weight_kg: Number(weight),
                    });

                    // Register in the shared pickup schedule (localStorage + real-time)
                    schedulePickup({
                      id: broadcastResult?.id ?? bookingId,
                      recycler_id: auth.user?.id ?? "local",
                      recycler_name: recyclerName,
                      date: dateLabel,
                      time_slot: timeSlot || "morning",
                      weight_kg: Number(weight),
                      address,
                    });

                    await bookPickup({
                      userName: recyclerName,
                      date: dateLabel,
                      timeSlot: timeSlot || "morning",
                      weightKg: Number(weight),
                      address,
                    });
                  }
                  setStep(step + 1);
                }}
              >
                {step === 3 ? "Confirm Booking" : "Continue"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Booking;
