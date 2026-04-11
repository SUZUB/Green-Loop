import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Loader2, Award, Share2, Pencil } from "lucide-react";
import html2canvas from "html2canvas";

interface Badge {
  name: string;
  icon: string;
  date?: string;
}

interface CertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  totalRecycled: string;
  co2Saved: string;
  animalsSaved: number;
  badges: Badge[];
}

export const CertificateModal = ({
  open,
  onOpenChange,
  userName,
  totalRecycled,
  co2Saved,
  animalsSaved,
  badges,
}: CertificateModalProps) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [customName, setCustomName] = useState(userName);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    setCustomName(userName);
  }, [userName]);

  const generateCanvas = async () => {
    if (!certRef.current) return null;
    return html2canvas(certRef.current, {
      scale: 3,
      backgroundColor: null,
      useCORS: true,
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `GreenLoop-Certificate-${customName.replace(/\s+/g, "-")}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    } catch (e) {
      console.error("Certificate download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  const shareText = `🏆 I earned a GREEN LOOP achievement certificate!\n\n♻️ ${totalRecycled} plastic recycled\n🌿 ${co2Saved} CO₂ prevented\n🐬 ${animalsSaved} marine animals saved\n\nBadges: ${badges.map((b) => `${b.icon} ${b.name}`).join(", ")}\n\nJoin me on GREEN LOOP and make a difference! 🌍`;

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const canvas = await generateCanvas();
        if (canvas) {
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], "GreenLoop-Certificate.jpg", { type: "image/jpeg" });
            await navigator.share({ text: shareText, files: [file] });
          }, "image/jpeg", 0.95);
        }
      } catch {
        await navigator.share({ text: shareText });
      }
    }
  };

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] p-3 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#14532D]" />
            Your Achievement Certificate
          </DialogTitle>
        </DialogHeader>

        {/* Name editor */}
        <div className="flex items-center gap-2 mb-2">
          {editingName ? (
            <div className="flex items-center gap-2 w-full">
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 h-9 text-sm"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
              />
              <Button size="sm" variant="outline" onClick={() => setEditingName(false)}>
                Done
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#1E293B] transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Name on certificate: <strong className="text-[#1E293B]">{customName}</strong></span>
            </button>
          )}
        </div>

        {/* Certificate Design */}
        <div
          ref={certRef}
          className="relative w-full aspect-[1.414/1] rounded-lg overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0a1628 0%, #132744 30%, #1a3a5c 60%, #0d4a3a 100%)",
          }}
        >
          {/* Decorative border */}
          <div
            className="absolute inset-3 rounded-lg"
            style={{
              border: "2px solid rgba(74, 222, 128, 0.4)",
              boxShadow: "inset 0 0 40px rgba(74, 222, 128, 0.05)",
            }}
          />
          <div
            className="absolute inset-5 rounded-lg"
            style={{ border: "1px solid rgba(74, 222, 128, 0.15)" }}
          />

          {/* Corner decorations */}
          {["top-6 left-6", "top-6 right-6", "bottom-6 left-6", "bottom-6 right-6"].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-8 h-8`}
              style={{
                borderTop: i < 2 ? "3px solid rgba(74, 222, 128, 0.6)" : "none",
                borderBottom: i >= 2 ? "3px solid rgba(74, 222, 128, 0.6)" : "none",
                borderLeft: i % 2 === 0 ? "3px solid rgba(74, 222, 128, 0.6)" : "none",
                borderRight: i % 2 === 1 ? "3px solid rgba(74, 222, 128, 0.6)" : "none",
              }}
            />
          ))}

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-between p-8 sm:p-10 text-center">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">♻️</span>
                <span
                  className="text-sm sm:text-base font-bold tracking-[0.3em] uppercase"
                  style={{ color: "rgba(74, 222, 128, 0.9)" }}
                >
                  GREEN LOOP
                </span>
                <span className="text-2xl">♻️</span>
              </div>
              <h1
                className="text-xl sm:text-3xl font-bold tracking-wide"
                style={{
                  color: "#f0f9f4",
                  textShadow: "0 0 20px rgba(74, 222, 128, 0.3)",
                  fontFamily: "Georgia, serif",
                }}
              >
                CERTIFICATE OF ACHIEVEMENT
              </h1>
              <div
                className="w-24 h-0.5 mx-auto mt-2"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.7), transparent)",
                }}
              />
            </div>

            {/* Body */}
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              <p className="text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                This is proudly presented to
              </p>
              <h2
                className="text-2xl sm:text-4xl font-bold"
                style={{
                  color: "#4ade80",
                  fontFamily: "Georgia, serif",
                  textShadow: "0 0 30px rgba(74, 222, 128, 0.2)",
                }}
              >
                {customName}
              </h2>
              <p className="text-xs sm:text-sm max-w-[80%] mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                In recognition of outstanding contribution to environmental sustainability through plastic recycling and waste management.
              </p>

              {/* Stats Row */}
              <div className="flex justify-center gap-4 sm:gap-8 mt-2">
                {[
                  { label: "Plastic Recycled", value: totalRecycled },
                  { label: "CO₂ Prevented", value: co2Saved },
                  { label: "Animals Saved", value: String(animalsSaved) },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-lg sm:text-2xl font-bold" style={{ color: "#4ade80" }}>
                      {stat.value}
                    </div>
                    <div className="text-[8px] sm:text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="mt-2">
                  <p className="text-[9px] sm:text-[11px] uppercase tracking-widest mb-2" style={{ color: "rgba(74, 222, 128, 0.7)" }}>
                    Badges Earned
                  </p>
                  <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                    {badges.map((b) => (
                      <div
                        key={b.name}
                        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg"
                        style={{ background: "rgba(74, 222, 128, 0.08)", border: "1px solid rgba(74, 222, 128, 0.2)" }}
                      >
                        <span className="text-lg sm:text-xl">{b.icon}</span>
                        <span className="text-[7px] sm:text-[9px] font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                          {b.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="w-full flex items-end justify-between">
              <div className="text-left">
                <div className="w-16 sm:w-20 h-0.5 mb-1" style={{ background: "rgba(74, 222, 128, 0.4)" }} />
                <p className="text-[8px] sm:text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Date: {today}
                </p>
              </div>
              <div className="text-center">
                <span className="text-3xl sm:text-4xl">🏆</span>
              </div>
              <div className="text-right">
                <div className="w-16 sm:w-20 h-0.5 mb-1 ml-auto" style={{ background: "rgba(74, 222, 128, 0.4)" }} />
                <p className="text-[8px] sm:text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  GREEN LOOP team
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-2">
          <Button onClick={handleDownload} disabled={downloading} className="w-full gap-2">
            {downloading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Download className="h-4 w-4" /> Download Certificate (JPG)</>
            )}
          </Button>

          {/* Social Share Row */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={shareToWhatsApp}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={shareToTwitter}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={shareToFacebook}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
            {navigator.share && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleNativeShare}
              >
                <Share2 className="h-4 w-4" />
                More
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
