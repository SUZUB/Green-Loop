import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BuyerBottomNav } from "@/components/BuyerNav";
import { useToast } from "@/hooks/use-toast";
import { useRecycleHub } from "@/hooks/useRecycleHub";
import TransactionHistory from "@/components/TransactionHistory";
import { Loader2 } from "lucide-react";

const CREDIT_PRICE = 100;

const CarbonMarket = () => {
  const { toast } = useToast();
  const { userBalance, availableMarketCredits, completePurchase } = useRecycleHub();
  const [quantity, setQuantity] = useState(5);
  const [quantityError, setQuantityError] = useState("");
  const [showBilling, setShowBilling] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [gstin, setGstin] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");

  const totalCost = useMemo(() => quantity * CREDIT_PRICE, [quantity]);
  const isQuantityValid = quantity >= 1 && quantity <= availableMarketCredits;
  const reachedMax = quantity >= availableMarketCredits;
  const canSubmitBilling = isQuantityValid && fullName.trim() && streetAddress.trim() && city.trim();

  useEffect(() => {
    if (quantity > availableMarketCredits) {
      setQuantity(availableMarketCredits);
      setQuantityError("Cannot exceed available market supply.");
      return;
    }

    if (quantity < 1) {
      setQuantity(1);
      setQuantityError("Quantity must be at least 1.");
      return;
    }

    setQuantityError("");
  }, [quantity, availableMarketCredits]);

  const decrementQuantity = () => {
    setQuantity((current) => {
      const next = Math.max(1, current - 1);
      if (next < availableMarketCredits) {
        setQuantityError("");
      }
      return next;
    });
  };

  const incrementQuantity = () => {
    setQuantity((current) => {
      if (current >= availableMarketCredits) {
        setQuantityError("Cannot exceed available market supply.");
        return current;
      }
      return Math.min(availableMarketCredits, current + 1);
    });
  };

  const handleReadyToBuy = () => {
    if (!isQuantityValid) {
      setQuantityError("Cannot exceed available market supply.");
      toast({
        title: "Invalid credit selection",
        description: `Please choose a quantity between 1 and ${availableMarketCredits}.`,
        variant: "destructive",
      });
      return;
    }
    setShowBilling(true);
    toast({
      title: "Ready to purchase",
      description: `Review billing details for ${quantity} credits costing ₹${totalCost.toLocaleString("en-IN")}.`,
    });
  };

  const handleCompletePurchase = () => {
    if (!isQuantityValid) {
      toast({
        title: "Invalid quantity",
        description: "Adjust the credit quantity to the available supply before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!fullName.trim() || !streetAddress.trim() || !city.trim()) {
      toast({
        title: "Billing details required",
        description: "Please complete your name, address, and city before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    window.setTimeout(() => {
      const success = completePurchase(quantity);
      setIsProcessing(false);

      if (!success) {
        toast({
          title: "Purchase failed",
          description: "Unable to complete purchase. Confirm available credits and try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Purchase confirmed!",
        description: `Purchase confirmed! ${quantity} credits added to your wallet.`,
        variant: "success",
      });
      setShowBilling(false);
    }, 900);
  };

  return (
    <div className="min-h-screen pb-28">
      <PageBackground type="recycling" overlay="bg-emerald-950/35" />

      <nav className="sticky top-0 z-50 border-b border-[#D1FAE5] bg-[#F8FAF9]/40 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-display font-semibold tracking-tight text-[#1E293B]">Carbon Market</span>
            <Badge className="rounded-full bg-emerald-100/90 px-3 py-2 text-sm font-semibold text-emerald-950">Live</Badge>
          </div>
          <span className="rounded-full bg-emerald-100/85 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm shadow-emerald-900/10">
            Balance: {userBalance.toLocaleString("en-IN")} Credits
          </span>
        </div>
      </nav>

      <main className="container mx-auto max-w-7xl px-4 pt-8">
        <section className="grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-white/80 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-md border border-white/60"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#475569]">Live Available Credits</p>
                <h1 className="mt-3 text-5xl font-display font-bold text-[#14532D]">{availableMarketCredits}</h1>
              </div>
              <div className="rounded-3xl bg-white/95 px-5 py-4 text-right text-[#1E293B] shadow-lg shadow-slate-950/20">
                <p className="text-sm uppercase tracking-[0.24em] text-[#14532D]">Current Rate</p>
                <p className="mt-2 text-2xl font-semibold">₹{CREDIT_PRICE}/credit</p>
              </div>
            </div>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-3xl bg-white/80 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-md border border-white/60"
          >
            <div className="mb-6 flex flex-col gap-2">
              <p className="text-sm uppercase tracking-[0.28em] text-[#475569]">Select Credits to Purchase</p>
              <h2 className="text-2xl font-semibold text-[#1E293B]">Build your carbon portfolio with confidence.</h2>
              <p className="max-w-2xl text-sm text-[#475569]">Choose the number of credits and watch the total update instantly at the live market rate.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl bg-[#F8FAF9]/5 p-5 border border-[#D1FAE5]/60">
                <div className="flex items-center justify-between gap-3 text-sm text-[#475569]">
                  <span>Quantity</span>
                  <span className="text-[#065F46]">Rate fixed at ₹{CREDIT_PRICE}</span>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-12 rounded-full border-slate-300 text-[#065F46] hover:bg-[#F0FDF4]"
                    onClick={decrementQuantity}
                  >
                    −
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isNaN(value)) {
                        setQuantity(1);
                        return;
                      }
                      setQuantity(value);
                    }}
                    className={`max-w-[120px] text-center text-xl font-semibold tracking-tight ${quantityError ? "border-red-500 ring-1 ring-red-400" : ""}`}
                    min={1}
                    max={availableMarketCredits}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-12 rounded-full border-slate-300 text-[#065F46] hover:bg-[#F0FDF4] disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={incrementQuantity}
                    disabled={quantity >= availableMarketCredits}
                  >
                    +
                  </Button>
                </div>
                {quantityError ? (
                  <p className="mt-3 text-sm font-medium text-red-600">{quantityError}</p>
                ) : null}
                <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-[#065F46]">
                  <p className="text-sm uppercase tracking-[0.24em] text-[#14532D]/80">Total Cost</p>
                  <p className="mt-2 text-3xl font-semibold text-emerald-900">₹{totalCost.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-[#F8FAF9]/5 p-5 border border-[#D1FAE5]/60 flex flex-col justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[#475569]">Order summary</p>
                  <div className="mt-5 space-y-3 rounded-3xl bg-white/90 p-5 shadow-sm shadow-slate-900/5">
                    <div className="flex items-center justify-between text-sm text-[#475569]">
                      <span>Credits</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-[#475569]">
                      <span>Unit price</span>
                      <span>₹{CREDIT_PRICE}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#D1FAE5] pt-4 text-base font-semibold text-[#1E293B]">
                      <span>Total</span>
                      <span>₹{totalCost.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  className={`mt-6 w-full ${reachedMax ? "bg-slate-400 text-[#065F46]" : "bg-[#10B981] text-[#1E293B] hover:bg-[#10B981]"}`}
                  onClick={handleReadyToBuy}
                  disabled={!isQuantityValid}
                >
                  Ready to Buy
                </Button>
              </div>
            </div>
          </motion.section>

          {showBilling && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-3xl bg-white/80 p-6 shadow-2xl shadow-slate-950/15 backdrop-blur-md border border-white/60"
            >
              <div className="mb-6 flex flex-col gap-2">
                <p className="text-sm uppercase tracking-[0.28em] text-[#475569]">Confirm Billing & Payment Details</p>
                <h2 className="text-2xl font-semibold text-[#1E293B]">Secure the next step in your purchase.</h2>
                <p className="max-w-2xl text-sm text-[#475569]">Enter the account details below so the transaction can settle through your corporate payment method.</p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="full-name">Full Name on Account</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Amit Sharma"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="gstin">Corporate GSTIN (Optional)</Label>
                  <Input
                    id="gstin"
                    value={gstin}
                    onChange={(event) => setGstin(event.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div className="lg:col-span-2 space-y-3">
                  <Label htmlFor="street">Billing Street Address</Label>
                  <Input
                    id="street"
                    value={streetAddress}
                    onChange={(event) => setStreetAddress(event.target.value)}
                    placeholder="No. 21, Green Loop Avenue"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Bengaluru"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="payment-method">
                      <SelectValue placeholder="Choose method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  type="button"
                  className="w-full bg-[#F8FAF9] text-[#1E293B] hover:bg-[#F8FAF9] disabled:opacity-50"
                  onClick={handleCompletePurchase}
                  disabled={!canSubmitBilling || isProcessing}
                >
                  {isProcessing ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </span>
                  ) : (
                    <>Complete Secure Purchase ({quantity} Credits - ₹{totalCost.toLocaleString("en-IN")})</>
                  )}
                </Button>
              </div>
            </motion.section>
          )}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <TransactionHistory />
          </motion.div>
        </section>
      </main>

      <BuyerBottomNav />
    </div>
  );
};

export default CarbonMarket;
