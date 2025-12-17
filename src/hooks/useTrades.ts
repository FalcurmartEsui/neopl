import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  side: string;
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  leverage: number;
  stop_loss: number | null;
  take_profit: number | null;
  profit_loss: number;
  admin_profit_override: number | null;
  is_demo: boolean;
  status: string;
  order_type: string;
  created_at: string;
  closed_at: string | null;
}

export const useTrades = (user: User | null, isDemo: boolean = false) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [openTrades, setOpenTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_demo", isDemo)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching trades:", error);
    } else {
      setTrades(data || []);
      setOpenTrades((data || []).filter((t) => t.status === "open"));
    }
    setLoading(false);
  }, [user, isDemo]);

  useEffect(() => {
    fetchTrades();

    if (!user) return;

    // Subscribe to realtime updates
    const channel = supabase
      .channel("trades-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trades",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchTrades]);

  const openTrade = async (trade: {
    symbol: string;
    side: "buy" | "sell";
    quantity: number;
    entry_price: number;
    leverage?: number;
    stop_loss?: number;
    take_profit?: number;
    order_type?: "market" | "limit";
  }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("trades")
      .insert({
        user_id: user.id,
        symbol: trade.symbol,
        side: trade.side,
        quantity: trade.quantity,
        entry_price: trade.entry_price,
        leverage: trade.leverage || 1,
        stop_loss: trade.stop_loss,
        take_profit: trade.take_profit,
        order_type: trade.order_type || "market",
        is_demo: isDemo,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to open trade");
      console.error("Error opening trade:", error);
      return null;
    }

    toast.success(`${trade.side.toUpperCase()} order placed for ${trade.quantity} ${trade.symbol}`);
    return data;
  };

  const closeTrade = async (tradeId: string, exitPrice: number, profitLoss: number) => {
    const { error } = await supabase
      .from("trades")
      .update({
        status: "closed",
        exit_price: exitPrice,
        profit_loss: profitLoss,
        closed_at: new Date().toISOString(),
      })
      .eq("id", tradeId);

    if (error) {
      toast.error("Failed to close trade");
      console.error("Error closing trade:", error);
      return false;
    }

    toast.success("Trade closed successfully");
    return true;
  };

  return { trades, openTrades, loading, openTrade, closeTrade, refetch: fetchTrades };
};
