import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EcoProvider } from "@/context/EcoContext";
import { DialogProvider } from "@/context/DialogContext";
import { RecycleHubProvider } from "@/hooks/useRecycleHub";
import { AIChatBot } from "./components/AIChatBot";
import { RecyclerLayout } from "./components/RecyclerLayout";
import { PickerLayout } from "./components/PickerLayout";
import { BuyerLayout } from "./components/BuyerLayout";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import RoleSelect from "./pages/RoleSelect";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// ── Recycler pages ──────────────────────────────────────────────────────────
const RecyclerDashboard  = lazy(() => import("./pages/recycler/Dashboard"));
const NearbyRVMs         = lazy(() => import("./pages/recycler/NearbyRVMs"));
const Rewards            = lazy(() => import("./pages/recycler/Rewards"));
const Leaderboard        = lazy(() => import("./pages/recycler/Leaderboard"));
const Achievements       = lazy(() => import("./pages/recycler/Achievements"));
const Impact             = lazy(() => import("./pages/recycler/Impact"));
const Wallet             = lazy(() => import("./pages/recycler/Wallet"));
const Referral           = lazy(() => import("./pages/recycler/Referral"));
const RecyclerProfile    = lazy(() => import("./pages/recycler/Profile"));
const RecyclerHistory    = lazy(() => import("./pages/recycler/History"));
const ChallengesPage     = lazy(() => import("./pages/ChallengesPage"));
const KnowledgeHub       = lazy(() => import("./pages/education/KnowledgeHub"));
const Community          = lazy(() => import("./pages/community/Community"));
const Partners           = lazy(() => import("./pages/partners/Partners"));

// ── Picker pages ────────────────────────────────────────────────────────────
const PickerDashboard        = lazy(() => import("./pages/picker/Dashboard"));
const PickerProfile          = lazy(() => import("./pages/picker/Profile"));
const PickerAvailablePickups = lazy(() => import("./pages/picker/AvailablePickups"));
const PickerHistory          = lazy(() => import("./pages/picker/History"));

// ── Buyer pages ─────────────────────────────────────────────────────────────
const BuyerDashboard  = lazy(() => import("./pages/buyer/Dashboard"));
const BuyerListings   = lazy(() => import("./pages/buyer/Listings"));
const BuyerOrders     = lazy(() => import("./pages/buyer/Orders"));
const BuyerSuppliers  = lazy(() => import("./pages/buyer/Suppliers"));
const BuyerAnalytics  = lazy(() => import("./pages/buyer/Analytics"));
const BuyerProfile    = lazy(() => import("./pages/buyer/Profile"));
const BuyerMessages   = lazy(() => import("./pages/buyer/Messages"));
const BuyerPayments   = lazy(() => import("./pages/buyer/Payments"));
const CarbonMarket    = lazy(() => import("./pages/buyer/CarbonMarket"));

const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#F9FAFB" }}>
      <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" aria-hidden />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

// Wrapper that renders RecyclerLayout + AIChatBot floating widget
function RecyclerShell() {
  return (
    <>
      <RecyclerLayout />
      <AIChatBot />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <EcoProvider>
        <DialogProvider>
          <RecycleHubProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* ── Public ── */}
                  <Route path="/"            element={<Index />} />
                  <Route path="/role-select" element={<RoleSelect />} />
                  <Route path="/auth/login"  element={<Login />} />
                  <Route path="/auth/signup" element={<Signup />} />

                  {/* ── Recycler — own sidebar + AIChatBot ── */}
                  <Route element={<RecyclerLayout />}>
                    <Route path="/recycler/dashboard"    element={<RecyclerDashboard />} />
                    <Route path="/recycler/nearby-rvms"  element={<NearbyRVMs />} />
                    <Route path="/recycler/rewards"      element={<Rewards />} />
                    <Route path="/recycler/leaderboard"  element={<Leaderboard />} />
                    <Route path="/recycler/challenges"   element={<ChallengesPage />} />
                    <Route path="/recycler/achievements" element={<Achievements />} />
                    <Route path="/recycler/impact"       element={<Impact />} />
                    <Route path="/recycler/wallet"       element={<Wallet />} />
                    <Route path="/recycler/referral"     element={<Referral />} />
                    <Route path="/recycler/profile"      element={<RecyclerProfile />} />
                    <Route path="/recycler/history"      element={<RecyclerHistory />} />
                    <Route path="/education/knowledge-hub" element={<KnowledgeHub />} />
                    <Route path="/community"             element={<Community />} />
                    <Route path="/partners"              element={<Partners />} />
                  </Route>

                  {/* ── Picker — own dedicated layout & sidebar ── */}
                  <Route element={<PickerLayout />}>
                    <Route path="/picker/dashboard"         element={<PickerDashboard />} />
                    <Route path="/picker/profile"           element={<PickerProfile />} />
                    <Route path="/picker/available-pickups" element={<PickerAvailablePickups />} />
                    <Route path="/picker/history"           element={<PickerHistory />} />
                  </Route>

                  {/* ── Buyer — own dedicated layout & sidebar ── */}
                  <Route element={<BuyerLayout />}>
                    <Route path="/buyer/dashboard"     element={<BuyerDashboard />} />
                    <Route path="/buyer/listings"      element={<BuyerListings />} />
                    <Route path="/buyer/orders"        element={<BuyerOrders />} />
                    <Route path="/buyer/suppliers"     element={<BuyerSuppliers />} />
                    <Route path="/buyer/analytics"     element={<BuyerAnalytics />} />
                    <Route path="/buyer/profile"       element={<BuyerProfile />} />
                    <Route path="/buyer/messages"      element={<BuyerMessages />} />
                    <Route path="/buyer/payments"      element={<BuyerPayments />} />
                    <Route path="/buyer/carbon-market" element={<CarbonMarket />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </RecycleHubProvider>
        </DialogProvider>
      </EcoProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
