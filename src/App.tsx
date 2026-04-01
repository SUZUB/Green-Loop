import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { EcoProvider } from "@/context/EcoContext";
import { DialogProvider } from "@/context/DialogContext";
import { RecycleHubProvider } from "@/hooks/useRecycleHub";
import { AIChatBot } from "./components/AIChatBot";
import { Layout } from "./components/Layout";
import RoleSelect from "./pages/RoleSelect";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import RecyclerDashboard from "./pages/recycler/Dashboard";
import Booking from "./pages/recycler/Booking";
import Rewards from "./pages/recycler/Rewards";
import Leaderboard from "./pages/recycler/Leaderboard";
import Achievements from "./pages/recycler/Achievements";
import Impact from "./pages/recycler/Impact";
import Wallet from "./pages/recycler/Wallet";
import Referral from "./pages/recycler/Referral";
import Profile from "./pages/recycler/Profile";
import KnowledgeHub from "./pages/education/KnowledgeHub";
import Community from "./pages/community/Community";
import Partners from "./pages/partners/Partners";
import ChallengesPage from "./pages/ChallengesPage";
import PickerDashboard from "./pages/picker/Dashboard";
import BuyerDashboard from "./pages/buyer/Dashboard";
import BuyerListings from "./pages/buyer/Listings";
import BuyerOrders from "./pages/buyer/Orders";
import BuyerSuppliers from "./pages/buyer/Suppliers";
import BuyerAnalytics from "./pages/buyer/Analytics";
import BuyerProfile from "./pages/buyer/Profile";
import BuyerMessages from "./pages/buyer/Messages";
import BuyerPayments from "./pages/buyer/Payments";
import CarbonMarket from "./pages/buyer/CarbonMarket";
import NotFound from "./pages/NotFound";
import { RecyclerLayout } from "./components/RecyclerLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <EcoProvider>
        <DialogProvider>
          <RecycleHubProvider>
            <BrowserRouter>
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
                    <Route path="/education/knowledge-hub" element={<KnowledgeHub />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/partners" element={<Partners />} />
                  </Route>
                  
                  {/* Picker Routes - Standalone */}
                  <Route path="/picker/dashboard" element={<PickerDashboard />} />
                  
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
            </BrowserRouter>
          </RecycleHubProvider>
        </DialogProvider>
      </EcoProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
