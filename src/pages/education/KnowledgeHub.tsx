import { useState } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Search, BookOpen, Recycle, ArrowRight, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const articles = [
  { id: 1, title: "Understanding PET Plastic (#1)", category: "Plastic Types", readTime: "3 min", excerpt: "PET is the most commonly recycled plastic. Learn how to identify and properly sort it.", tag: "PET" },
  { id: 2, title: "HDPE: The Strong & Recyclable Plastic (#2)", category: "Plastic Types", readTime: "4 min", excerpt: "HDPE is used in milk jugs and detergent bottles. Here's why it's one of the easiest plastics to recycle.", tag: "HDPE" },
  { id: 3, title: "Why PVC (#3) is Hard to Recycle", category: "Plastic Types", readTime: "3 min", excerpt: "PVC releases toxic chemicals when recycled. Learn what to do with PVC products.", tag: "PVC" },
  { id: 4, title: "How to Properly Segregate Plastics at Home", category: "Tips", readTime: "5 min", excerpt: "A step-by-step guide to sorting your plastic waste for maximum recycling impact.", tag: "Guide" },
  { id: 5, title: "The Impact of Single-Use Plastics on Oceans", category: "Environment", readTime: "6 min", excerpt: "8 million tonnes of plastic enter our oceans every year. Here's what you can do about it.", tag: "Ocean" },
  { id: 6, title: "Recycling Process: From Collection to New Product", category: "Process", readTime: "7 min", excerpt: "Follow the journey of a plastic bottle from your doorstep to becoming a new product.", tag: "Process" },
  { id: 7, title: "Fun Fact: A Plastic Bottle Takes 450 Years to Decompose", category: "Facts", readTime: "2 min", excerpt: "Quick facts about plastic that will change how you think about your daily consumption.", tag: "Facts" },
];

const plasticGuide = [
  { code: 1, symbol: "♻️ 1", name: "PET/PETE", examples: "Water bottles, food containers", recyclable: true, color: "bg-primary" },
  { code: 2, symbol: "♻️ 2", name: "HDPE", examples: "Milk jugs, detergent bottles, pipes", recyclable: true, color: "bg-ocean" },
  { code: 3, symbol: "♻️ 3", name: "PVC", examples: "Pipes, window frames, flooring", recyclable: false, color: "bg-destructive" },
  { code: 4, symbol: "♻️ 4", name: "LDPE", examples: "Plastic bags, squeeze bottles, wrap", recyclable: true, color: "bg-leaf" },
  { code: 5, symbol: "♻️ 5", name: "PP", examples: "Yogurt cups, bottle caps, straws", recyclable: true, color: "bg-earth" },
  { code: 6, symbol: "♻️ 6", name: "PS", examples: "Styrofoam, disposable cups, packaging", recyclable: false, color: "bg-destructive" },
  { code: 7, symbol: "♻️ 7", name: "Other", examples: "Mixed plastics, polycarbonate", recyclable: false, color: "bg-muted" },
];

const categories = ["All", "Plastic Types", "Tips", "Environment", "Process", "Facts"];

const KnowledgeHub = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("articles");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [email, setEmail] = useState("");

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || a.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background/40">
      <PageBackground type="pollution" overlay="bg-foreground/50" />

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="articles" className="flex-1">Articles</TabsTrigger>
            <TabsTrigger value="guide" className="flex-1">Plastic Guide</TabsTrigger>
            <TabsTrigger value="newsletter" className="flex-1">Newsletter</TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
              {filtered.map((article, i) => (
                <motion.div key={article.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4 hover:shadow-soft transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-[10px]">{article.tag}</Badge>
                      <span className="text-[10px] text-muted-foreground">{article.readTime}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{article.title}</h3>
                    <p className="text-xs text-muted-foreground">{article.excerpt}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guide">
            <p className="text-sm text-muted-foreground mb-4">Look for the recycling symbol on your plastic items to identify the type.</p>
            <div className="space-y-3">
              {plasticGuide.map((item, i) => (
                <motion.div key={item.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="p-4 flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0`}>
                      #{item.code}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <Badge variant={item.recyclable ? "default" : "destructive"} className="text-[10px]">
                          {item.recyclable ? "✓ Accepted" : "✗ Not accepted"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.examples}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="newsletter">
            <Card className="p-6 text-center">
              <Mail className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg mb-2">Stay Informed</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get weekly recycling tips, environmental news, success stories, and upcoming events.
              </p>
              <div className="flex gap-2">
                <Input placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button onClick={() => {
                  if (email) {
                    toast({ title: "Subscribed! 📬", description: "You'll receive weekly updates." });
                    setEmail("");
                  }
                }}>Subscribe</Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">Unsubscribe anytime. We respect your inbox.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      
    </div>
  );
};

export default KnowledgeHub;
