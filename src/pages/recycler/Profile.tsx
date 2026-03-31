import { useState } from "react";
import { motion } from "framer-motion";

import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useToast } from "@/hooks/use-toast";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Star,
  CalendarDays,
  Weight,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

const pickupHistory = [
  { id: "RH-A1B2C", date: "Mar 6, 2026", time: "Morning", weight: "2.5 kg", points: 250, status: "completed", picker: "Suresh K.", rating: 5 },
  { id: "RH-D3E4F", date: "Mar 3, 2026", time: "Afternoon", weight: "1.8 kg", points: 180, status: "completed", picker: "Ravi M.", rating: 4 },
  { id: "RH-G5H6I", date: "Feb 28, 2026", time: "Evening", weight: "3.2 kg", points: 320, status: "completed", picker: "Anita S.", rating: 5 },
  { id: "RH-J7K8L", date: "Feb 22, 2026", time: "Morning", weight: "1.0 kg", points: 100, status: "cancelled", picker: "—", rating: 0 },
  { id: "RH-M9N0O", date: "Feb 15, 2026", time: "Morning", weight: "4.0 kg", points: 400, status: "completed", picker: "Suresh K.", rating: 5 },
];

const Profile = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("history");
  const [search, setSearch] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  const filtered = pickupHistory.filter(
    (p) => p.id.toLowerCase().includes(search.toLowerCase()) || p.date.includes(search)
  );

  const handleExport = () => {
    const csv = "ID,Date,Time,Weight,Points,Status,Picker,Rating\n" +
      pickupHistory.map((p) => `${p.id},${p.date},${p.time},${p.weight},${p.points},${p.status},${p.picker},${p.rating}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pickup-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background/40">
      <PageBackground type="waste" overlay="bg-foreground/50" />

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-hero-gradient flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
                AS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg">Ananya Sharma</h2>
                  <Badge className="text-[10px] bg-ocean">Verified ✓</Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> HSR Layout, Bangalore</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> +91 98765 43210</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted">
                <div className="font-display font-bold">12.5 kg</div>
                <p className="text-[10px] text-muted-foreground">Recycled</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <div className="font-display font-bold">750</div>
                <p className="text-[10px] text-muted-foreground">Points</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <div className="font-display font-bold">🌱</div>
                <p className="text-[10px] text-muted-foreground">Plastic Saver</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
            <TabsTrigger value="feedback" className="flex-1">Feedback</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by ID or date..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
                <Download className="h-4 w-4" /> CSV
              </Button>
            </div>
            <div className="space-y-2">
              {filtered.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-muted-foreground">{p.id}</span>
                      <Badge variant="outline" className={`text-[10px] ${
                        p.status === "completed" ? "border-primary text-primary" : "border-destructive text-destructive"
                      }`}>
                        {p.status === "completed" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                        {p.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {p.date}</span>
                        <span className="flex items-center gap-1"><Weight className="h-3 w-3" /> {p.weight}</span>
                      </div>
                      <span className="font-display font-bold text-primary">+{p.points}</span>
                    </div>
                    {p.status === "completed" && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                        <span>Picker: {p.picker}</span>
                        <span className="flex items-center gap-0.5">{Array.from({ length: p.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-earth text-earth" />)}</span>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="feedback">
            <Card className="p-5 space-y-4">
              <div>
                <Label>Rate your experience</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setFeedbackRating(s)}>
                      <Star className={`h-8 w-8 ${s <= feedbackRating ? "fill-earth text-earth" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Comments or suggestions</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Tell us how we can improve..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={() => {
                toast({ title: "Thank you for your feedback! 💚" });
                setFeedbackRating(0);
                setFeedbackText("");
              }}>Submit Feedback</Button>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-5 space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input defaultValue="Ananya Sharma" className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input defaultValue="ananya@example.com" className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input defaultValue="+91 98765 43210" className="mt-1" />
              </div>
              <div>
                <Label>Address</Label>
                <Input defaultValue="HSR Layout, Bangalore" className="mt-1" />
              </div>
              <Button className="w-full">Save Changes</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
};

export default Profile;
