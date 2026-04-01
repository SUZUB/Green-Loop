import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EcoProvider } from "@/context/EcoContext";
import { DialogProvider } from "@/context/DialogContext";
import { RecycleHubProvider } from "@/hooks/useRecycleHub";
import { AIChatBot } from "./components/AIChatBot";
import { Layout } from "./components/Layout";
import { RecyclerLayout } from "./components/RecyclerLayout";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import RoleSelect from "./pages/RoleSelect";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

/** Lazy-load heavy role dashboards; public entry routes stay eager so home/auth never hang on a chunk. */
const RecyclerDashboard = lazy(() => import("./pages/recycler/Dashboard"));
const Booking = lazy(() => import("./pages/recycler/Booking"));
const Rewards = lazy(() => import("./pages/recycler/Rewards"));
const Leaderboard = lazy(() => import("./pages/recycler/Leaderboard"));
const Achievements = lazy(() => import("./pages/recycler/Achievements"));
const Impact = lazy(() => import("./pages/recycler/Impact"));
const Wallet = lazy(() => import("./pages/recycler/Wallet"));
const Referral = lazy(() => import("./pages/recycler/Referral"));
const Profile = lazy(() => import("./pages/recycler/Profile"));
const PickerAICamera = lazy(() => import("./pages/picker/AICamera"));
const PickerAvailablePickups = lazy(() => import("./pages/picker/AvailablePickups"));
const KnowledgeHub = lazy(() => import("./pages/education/KnowledgeHub"));
const Community = lazy(() => import("./pages/community/Community"));
const Partners = lazy(() => import("./pages/partners/Partners"));
const ChallengesPage = lazy(() => import("./pages/ChallengesPage"));
const PickerDashboard = lazy(() => import("./pages/picker/Dashboard"));
const PickerProfile = lazy(() => import("./pages/picker/Profile"));
const BuyerDashboard = lazy(() => import("./pages/buyer/Dashboard"));
const BuyerListings = lazy(() => import("./pages/buyer/Listings"));
const BuyerOrders = lazy(() => import("./pages/buyer/Orders"));
const BuyerSuppliers = lazy(() => import("./pages/buyer/Suppliers"));
const BuyerAnalytics = lazy(() => import("./pages/buyer/Analytics"));
const BuyerProfile = lazy(() => import("./pages/buyer/Profile"));
const BuyerMessages = lazy(() => import("./pages/buyer/Messages"));
const BuyerPayments = lazy(() => import("./pages/buyer/Payments"));
const CarbonMarket = lazy(() => import("./pages/buyer/CarbonMarket"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <span className="sr-only">Loading page</span>
    </div>
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
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Public routes without Layout */}
                  <Route path="/" element={<Index />} />
                  <Route path="/role-select" element={<RoleSelect />} />
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/signup" element={<Signup />} />

                  {/* Protected routes with Layout - Separate for each role */}
                  <Route element={<Layout><AIChatBot /></Layout>}>
                    {/* Recycler Routes */}
                    <Route element={<RecyclerLayout />}>
                      <Route path="/recycler/dashboard" element={<RecyclerDashboard />} />
                      <Route path="/recycler/booking" element={<Booking />} />
                      <Route path="/recycler/rewards" element={<Rewards />} />
                      <Route path="/recycler/leaderboard" element={<Leaderboard />} />
                      <Route path="/recycler/challenges" element={<ChallengesPage />} />
                      <Route path="/recycler/achievements" element={<Achievements />} />
                      <Route path="/recycler/impact" element={<Impact />} />
                      <Route path="/recycler/wallet" element={<Wallet />} />
                      <Route path="/recycler/referral" element={<Referral />} />
                      <Route path="/recycler/profile" element={<Profile />} />
                      <Route path="/recycler/ai-camera" element={<Navigate to="/picker/ai-camera" replace />} />
                      <Route path="/education/knowledge-hub" element={<KnowledgeHub />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/partners" element={<Partners />} />
                    </Route>

                    {/* Picker Routes - Standalone */}
                    <Route path="/picker/dashboard" element={<PickerDashboard />} />
                    <Route path="/picker/profile" element={<PickerProfile />} />
                    <Route path="/picker/ai-camera" element={<PickerAICamera />} />
                    <Route path="/picker/available-pickups" element={<PickerAvailablePickups />} />

                    {/* Buyer Routes - Standalone */}
                    <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                    <Route path="/buyer/listings" element={<BuyerListings />} />
                    <Route path="/buyer/orders" element={<BuyerOrders />} />
                    <Route path="/buyer/suppliers" element={<BuyerSuppliers />} />
                    <Route path="/buyer/analytics" element={<BuyerAnalytics />} />
                    <Route path="/buyer/profile" element={<BuyerProfile />} />
                    <Route path="/buyer/messages" element={<BuyerMessages />} />
                    <Route path="/buyer/payments" element={<BuyerPayments />} />
                    <Route path="/buyer/carbon-market" element={<CarbonMarket />} />

                    <Route path="/challenges" element={<ChallengesPage />} />
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
