import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface Balance {
  balance: number | null;
}

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  balance: Balance | null;
}

const WithdrawModal = ({ open, onOpenChange, user, balance }: WithdrawModalProps) => {
  const [method, setMethod] = useState<"USDT" | "BTC" | "ETH">("USDT");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { createWithdrawal } = useWithdrawals(user);

  const availableBalance = balance?.balance ?? 0;

  const handleSubmit = async () => {
    const withdrawAmount = parseFloat(amount);
    
    if (!amount || withdrawAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!walletAddress) {
      toast.error("Please enter a wallet address");
      return;
    }

    setSubmitting(true);
    const result = await createWithdrawal({
      amount: withdrawAmount,
      method,
      wallet_address: walletAddress,
    });

    setSubmitting(false);
    if (result) {
      onOpenChange(false);
      setAmount("");
      setWalletAddress("");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setAmount("");
    setWalletAddress("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card variant="glass" className="p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available Balance</span>
              <span className="font-mono font-semibold">
                ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </Card>

          <div className="space-y-2">
            <Label>Withdrawal Method</Label>
            <div className="grid grid-cols-3 gap-3">
              {(["USDT", "BTC", "ETH"] as const).map((crypto) => (
                <Card
                  key={crypto}
                  variant={method === crypto ? "default" : "glass"}
                  className={`p-3 cursor-pointer text-center transition-all ${
                    method === crypto ? "ring-2 ring-primary" : "hover:bg-secondary"
                  }`}
                  onClick={() => setMethod(crypto)}
                >
                  <span className="font-semibold text-sm">{crypto}</span>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex gap-2">
              {["25%", "50%", "75%", "100%"].map((pct) => (
                <Button
                  key={pct}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setAmount((availableBalance * parseInt(pct) / 100).toFixed(2))}
                >
                  {pct}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Your {method} Wallet Address</Label>
            <Input
              placeholder={`Enter your ${method} wallet address`}
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Request Withdrawal"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Withdrawals are typically processed within 24 hours
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
