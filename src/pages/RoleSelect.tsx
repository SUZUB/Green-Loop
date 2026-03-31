import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { useNavigate } from "react-router-dom";
import { Recycle, Truck, Factory, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const roles = [
  {
    icon: Recycle,
    emoji: "♻️",
    title: "I'm a Plastic Recycler",
    description: "Give plastic from your home. Schedule pickups and earn rewards for every gram you recycle.",
    path: "/auth/login?role=recycler",
    color: "bg-primary",
  },
  {
    icon: Truck,
    emoji: "👤",
    title: "I'm a Plastic Collector",
    description: "Collect plastic from recyclers. Manage pickups, track routes, and grow your collection network.",
    path: "/auth/login?role=picker",
    color: "bg-ocean",
  },
  {
    icon: Factory,
    emoji: "🏭",
    title: "I'm a Plastic Buyer",
    description: "Purchase physical plastic wholesale or buy verified Carbon Credits to offset your corporate footprint and meet EPR targets.",
    path: "/auth/login?role=buyer",
    color: "bg-earth",
  },
];

const RoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background/40 flex flex-col">
      <PageBackground type="waste" overlay="bg-foreground/50" />
      <nav className="p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">Choose Your Role</h1>
            <p className="text-muted-foreground">Join our plastic economy as a...</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role, i) => (
              <motion.button
                key={role.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                onClick={() => navigate(role.path)}
                whileHover={{ y: -6 }}
                className="p-8 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 text-left group border border-border hover:border-primary/30"
              >
                <div className={`w-14 h-14 rounded-xl ${role.color} flex items-center justify-center mb-5`}>
                  <role.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                  {role.title}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">{role.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Continue →
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
