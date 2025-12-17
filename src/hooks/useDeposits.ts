import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  currency: string;
  wallet_address: string | null;
  tx_hash: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  confirmed_at: string | null;
  screenshot_url: string | null;
}

export const useDeposits = (user: User | null) => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeposits = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("deposits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching deposits:", error);
    } else {
      setDeposits(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDeposits();

    if (!user) return;

    const channel = supabase
      .channel("deposits-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deposits",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchDeposits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchDeposits]);

  const createDeposit = async (deposit: {
    amount: number;
    method: string;
    wallet_address?: string;
    tx_hash?: string;
    screenshot_url?: string | null;
  }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("deposits")
      .insert({
        user_id: user.id,
        amount: deposit.amount,
        method: deposit.method,
        wallet_address: deposit.wallet_address,
        tx_hash: deposit.tx_hash,
        screenshot_url: deposit.screenshot_url,
        currency: deposit.method,
        status: "pending",
      } as any)
      .select()
      .single();

    if (error) {
      toast.error("Failed to create deposit");
      console.error("Error creating deposit:", error);
      return null;
    }

    toast.success("Deposit submitted - awaiting confirmation");
    return data;
  };

  return { deposits, loading, createDeposit, refetch: fetchDeposits };
};
