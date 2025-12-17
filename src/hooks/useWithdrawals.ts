import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  currency: string;
  wallet_address: string | null;
  bank_details: Json | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  processed_at: string | null;
}

export const useWithdrawals = (user: User | null) => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching withdrawals:", error);
    } else {
      setWithdrawals(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWithdrawals();

    if (!user) return;

    const channel = supabase
      .channel("withdrawals-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "withdrawals",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchWithdrawals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchWithdrawals]);

  const createWithdrawal = async (withdrawal: {
    amount: number;
    method: string;
    wallet_address?: string;
    bank_details?: Json;
  }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("withdrawals")
      .insert([{
        user_id: user.id,
        amount: withdrawal.amount,
        method: withdrawal.method,
        wallet_address: withdrawal.wallet_address,
        bank_details: withdrawal.bank_details,
        currency: "USDT",
        status: "pending",
      }])
      .select()
      .single();

    if (error) {
      toast.error("Failed to create withdrawal request");
      console.error("Error creating withdrawal:", error);
      return null;
    }

    toast.success("Withdrawal request submitted");
    return data;
  };

  return { withdrawals, loading, createWithdrawal, refetch: fetchWithdrawals };
};
