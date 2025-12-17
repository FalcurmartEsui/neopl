import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Copy, Check, Upload, Loader2 } from "lucide-react";
import { useDeposits } from "@/hooks/useDeposits";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import DepositConfirmation from "./DepositConfirmation";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

const WALLET_ADDRESSES = {
  BTC: "bc1qntku2yvtqu3vpjhsudvjed0thms0v46pg59y07",
  ETH: "0x3a8153b2f2acf733BD0Fe12d04558959E2E556B2",
  USDT: "0x3a8153b2f2acf733BD0Fe12d04558959E2E556B2",
  SOL: "2K4ueG1xrwxjhXormk8mVhjs1wmYitXdkKTyeAhJXDSC",
};

const CRYPTO_INFO = {
  BTC: { name: "Bitcoin", network: "Bitcoin Network", color: "#F7931A" },
  ETH: { name: "Ethereum", network: "ETH Network", color: "#627EEA" },
  USDT: { name: "Tether USD", network: "ERC20 Network", color: "#26A17B" },
  SOL: { name: "Solana", network: "Solana Network", color: "#9945FF" },
};

type CryptoType = keyof typeof WALLET_ADDRESSES;
type Step = "amount" | "currency" | "address" | "confirm";

const DepositModal = ({ open, onOpenChange, user }: DepositModalProps) => {
  const [step, setStep] = useState<Step>("amount");
  const [amountUSD, setAmountUSD] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>("USDT");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createDeposit } = useDeposits(user);
  const { priceData, loading: pricesLoading, refetch: refetchPrices } = useCryptoPrices();

  // Refresh prices when modal opens
  useEffect(() => {
    if (open) {
      refetchPrices();
    }
  }, [open, refetchPrices]);

  // Map crypto symbols to priceData keys
  const cryptoToPriceKey: Record<CryptoType, keyof typeof priceData> = {
    BTC: 'BTC',
    ETH: 'ETH', 
    SOL: 'SOL',
    USDT: 'USDT'
  };

  // Calculate crypto amount from USD using live prices
  const calculateCryptoAmount = (crypto: CryptoType) => {
    const usdValue = parseFloat(amountUSD) || 0;
    if (usdValue <= 0) return "0";
    
    if (crypto === "USDT") {
      return usdValue.toFixed(2);
    }
    
    const priceKey = cryptoToPriceKey[crypto];
    const cryptoPrice = priceData[priceKey];
    
    if (!cryptoPrice || cryptoPrice === 0) return "Loading...";
    
    const amount = usdValue / cryptoPrice;
    
    // Format based on crypto type
    if (crypto === "BTC") {
      return amount.toFixed(8);
    } else if (crypto === "ETH") {
      return amount.toFixed(6);
    } else {
      return amount.toFixed(4);
    }
  };

  const cryptoAmount = calculateCryptoAmount(selectedCrypto);

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESSES[selectedCrypto]);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile || !user) return null;
    
    setUploading(true);
    const fileExt = screenshotFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('deposit-screenshots')
      .upload(fileName, screenshotFile);
    
    setUploading(false);
    
    if (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload screenshot");
      return null;
    }
    
    const { data } = supabase.storage
      .from('deposit-screenshots')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!amountUSD || parseFloat(amountUSD) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    
    let screenshotUrl = null;
    if (screenshotFile) {
      screenshotUrl = await uploadScreenshot();
    }

    const result = await createDeposit({
      amount: parseFloat(amountUSD),
      method: selectedCrypto,
      wallet_address: WALLET_ADDRESSES[selectedCrypto],
      screenshot_url: screenshotUrl,
    });

    setSubmitting(false);
    if (result) {
      // Close modal and show confirmation animation
      onOpenChange(false);
      setShowConfirmation(true);
    }
  };

  const handleConfirmationComplete = () => {
    setShowConfirmation(false);
    setStep("amount");
    setAmountUSD("");
    setSelectedCrypto("USDT");
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep("amount");
    setAmountUSD("");
    setSelectedCrypto("USDT");
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  const handleNext = () => {
    if (step === "amount") {
      if (!amountUSD || parseFloat(amountUSD) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      setStep("currency");
    } else if (step === "currency") {
      setStep("address");
    } else if (step === "address") {
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "currency") setStep("amount");
    else if (step === "address") setStep("currency");
    else if (step === "confirm") setStep("address");
  };

  // Get current price for display
  const getCurrentPrice = (crypto: CryptoType) => {
    if (crypto === "USDT") return 1;
    const priceKey = cryptoToPriceKey[crypto];
    return priceData[priceKey] || 0;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "amount" && "Enter Deposit Amount"}
            {step === "currency" && "Select Currency"}
            {step === "address" && `Your ${CRYPTO_INFO[selectedCrypto].name} Address`}
            {step === "confirm" && "Confirm Deposit"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Enter Amount in USD */}
        {step === "amount" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the amount you want to deposit in USD:
            </p>
            
            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amountUSD}
                  onChange={(e) => setAmountUSD(e.target.value)}
                  className="pl-7"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleNext}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Select Crypto Currency */}
        {step === "currency" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the cryptocurrency you want to send:
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(WALLET_ADDRESSES) as CryptoType[]).map((crypto) => (
                <Card
                  key={crypto}
                  className={`p-4 cursor-pointer text-center transition-all border-2 ${
                    selectedCrypto === crypto 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedCrypto(crypto)}
                >
                  <div 
                    className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: CRYPTO_INFO[crypto].color }}
                  >
                    {crypto.charAt(0)}
                  </div>
                  <span className="font-semibold block">{crypto}</span>
                  <span className="text-xs text-muted-foreground block">{CRYPTO_INFO[crypto].name}</span>
                  {crypto !== "USDT" && (
                    <span className="text-xs text-primary mt-1 block">
                      {pricesLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin inline" />
                      ) : (
                        `$${getCurrentPrice(crypto).toLocaleString()}`
                      )}
                    </span>
                  )}
                </Card>
              ))}
            </div>

            <Card className="p-3 bg-secondary/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You'll send:</span>
                <span className="font-semibold">
                  {pricesLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : (
                    `${cryptoAmount} ${selectedCrypto}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">USD Amount:</span>
                <span className="font-semibold">${parseFloat(amountUSD || "0").toFixed(2)}</span>
              </div>
              {selectedCrypto !== "USDT" && (
                <div className="flex justify-between text-xs mt-2 pt-2 border-t border-border">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="text-primary">
                    1 {selectedCrypto} = ${getCurrentPrice(selectedCrypto).toLocaleString()}
                  </span>
                </div>
              )}
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleNext}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Show QR Code and Address */}
        {step === "address" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: CRYPTO_INFO[selectedCrypto].color }}
              >
                {selectedCrypto.charAt(0)}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG 
                  value={WALLET_ADDRESSES[selectedCrypto]} 
                  size={180}
                  level="H"
                />
              </div>
            </div>

            <p className="text-center text-muted-foreground text-sm">
              Your {CRYPTO_INFO[selectedCrypto].name} Address
            </p>

            <Card className="p-3 bg-secondary">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs break-all">
                  {WALLET_ADDRESSES[selectedCrypto]}
                </code>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </Card>

            <p className="text-center text-muted-foreground text-xs">
              Receive {CRYPTO_INFO[selectedCrypto].name} on the {CRYPTO_INFO[selectedCrypto].network}.
            </p>

            <Card className="p-3 bg-primary/10 border-primary/20">
              <div className="text-center">
                <span className="text-sm text-muted-foreground">Send exactly:</span>
                <p className="font-bold text-lg">{cryptoAmount} {selectedCrypto}</p>
                <span className="text-xs text-muted-foreground">(${parseFloat(amountUSD).toFixed(2)} USD)</span>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleNext}>
                I've Sent It
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm and Upload Screenshot */}
        {step === "confirm" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a screenshot of your transaction for faster processing:
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {screenshotPreview ? (
              <div className="relative">
                <img 
                  src={screenshotPreview} 
                  alt="Transaction screenshot" 
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setScreenshotFile(null);
                    setScreenshotPreview(null);
                  }}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Card 
                className="p-8 border-dashed border-2 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-secondary mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Upload Screenshot</p>
                  <p className="text-xs text-muted-foreground">Click to upload (max 5MB)</p>
                </div>
              </Card>
            )}

            <Card className="p-3 bg-secondary/50">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">${parseFloat(amountUSD).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Crypto:</span>
                  <span className="font-semibold">{cryptoAmount} {selectedCrypto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="font-semibold">{CRYPTO_INFO[selectedCrypto].network}</span>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>
                Back
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleSubmit} 
                disabled={submitting || uploading}
              >
                {submitting || uploading ? "Processing..." : "Confirm Deposit"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Deposits are typically credited within 1-3 network confirmations
            </p>
          </div>
        )}
      </DialogContent>

      {/* Confirmation Animation Overlay */}
      <DepositConfirmation 
        show={showConfirmation} 
        onComplete={handleConfirmationComplete} 
      />
    </Dialog>
  );
};

export default DepositModal;
