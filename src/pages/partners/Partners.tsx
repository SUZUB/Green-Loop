import { useState } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Search,
  MapPin,
  Star,
  Utensils,
  ShoppingBag,
  Tv,
  Truck,
  Ticket,
  Gift,
} from "lucide-react";

const partners = [
  { id: 1, name: "Green Café", category: "Restaurant", discount: "20% off", points: 300, rating: 4.5, distance: "1.2 km", icon: Utensils },
  { id: 2, name: "EcoWear Fashion", category: "Clothing", discount: "15% off", points: 500, rating: 4.3, distance: "2.5 km", icon: ShoppingBag },
  { id: 3, name: "TechMart Electronics", category: "Electronics", discount: "10% off", points: 1000, rating: 4.7, distance: "3.8 km", icon: Tv },
  { id: 4, name: "QuickRide Transport", category: "Transport", discount: "Free 5km ride", points: 500, rating: 4.2, distance: "—", icon: Truck },
  { id: 5, name: "FoodExpress", category: "Food Delivery", discount: "₹100 credit", points: 800, rating: 4.6, distance: "—", icon: Utensils },
  { id: 6, name: "StreamPlus", category: "Entertainment", discount: "1 month free", points: 1500, rating: 4.8, distance: "—", icon: Tv },
  { id: 7, name: "FreshMart Grocery", category: "Grocery", discount: "₹200 voucher", points: 600, rating: 4.4, distance: "0.8 km", icon: ShoppingBag },
  { id: 8, name: "CinePlex Movies", category: "Entertainment", discount: "Buy 1 Get 1", points: 400, rating: 4.1, distance: "4.2 km", icon: Ticket },
];

const categories = ["All", "Restaurant", "Clothing", "Electronics", "Transport", "Food Delivery", "Entertainment", "Grocery"];

const Partners = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const balance = 750;

  const filtered = partners.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background/40">
      <PageBackground type="recycling" overlay="bg-foreground/50" />

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search partners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {categories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? "default" : "outline"}
              className="text-xs shrink-0"
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((partner, i) => (
            <motion.div key={partner.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <partner.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{partner.name}</h3>
                      <div className="flex items-center gap-0.5 text-xs text-earth">
                        <Star className="h-3 w-3 fill-earth" /> {partner.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">{partner.category}</Badge>
                      {partner.distance !== "—" && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" /> {partner.distance}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <Badge className="text-[10px] bg-leaf">{partner.discount}</Badge>
                        <span className="text-[10px] text-muted-foreground ml-2">{partner.points} pts</span>
                      </div>
                      <Button size="sm" variant={balance >= partner.points ? "default" : "outline"} className="text-xs" disabled={balance < partner.points}>
                        {balance >= partner.points ? "Redeem" : `Need ${partner.points - balance}`}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      
    </div>
  );
};

export default Partners;
