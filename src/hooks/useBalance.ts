import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Balance {
  id: string;
  user_id: string;
  balance: number;
  demo_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_profit_loss: number;
  today_profit_loss: number;
  signal_strength: number;
}

export const useBalance = (user: User | null) => {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("balances")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching balance:", error);
    } else {
      setBalance(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      setBalance(null);
      setLoading(false);
      return;
    }

    fetchBalance();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("balance-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "balances",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBalance(payload.new as Balance);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { balance, loading, refetch: fetchBalance };
};
