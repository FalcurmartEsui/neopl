import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { adminApi } from "@/lib/adminApi";
import type { Json } from "@/integrations/supabase/types";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  date_of_birth: string | null;
  profile_completed: boolean | null;
  kyc_status: string | null;
  is_active: boolean | null;
  created_at: string | null;
  government_id_type: string | null;
  government_id_url: string | null;
}

interface Balance {
  id: string;
  user_id: string;
  balance: number | null;
  demo_balance: number | null;
  total_deposited: number | null;
  total_withdrawn: number | null;
  total_profit_loss: number | null;
  today_profit_loss: number | null;
  signal_strength: number | null;
}

export interface UserWithBalance extends Profile {
  balance_data: Balance | null;
}

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  currency: string | null;
  wallet_address: string | null;
  tx_hash: string | null;
  status: string | null;
  admin_note: string | null;
  created_at: string | null;
  confirmed_at: string | null;
  screenshot_url: string | null;
}

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  currency: string | null;
  wallet_address: string | null;
  bank_details: Json | null;
  status: string | null;
  admin_note: string | null;
  created_at: string | null;
  processed_at: string | null;
}

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

export interface DepositWithProfile extends Deposit {
  profile?: Profile;
}

export interface WithdrawalWithProfile extends Withdrawal {
  profile?: Profile;
}

export interface TradeWithProfile extends Trade {
  profile?: Profile;
}

// Check if admin is logged in via password
const isAdminAuthenticated = () => {
  return localStorage.getItem("adminAuth") === "true" && 
         localStorage.getItem("adminName") && 
         localStorage.getItem("adminPassword");
};

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithBalance[]>([]);
  const [deposits, setDeposits] = useState<DepositWithProfile[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithProfile[]>([]);
  const [trades, setTrades] = useState<TradeWithProfile[]>([]);

  useEffect(() => {
    const checkAdmin = () => {
      const authenticated = isAdminAuthenticated();
      setIsAdmin(Boolean(authenticated));
      setLoading(false);
    };
    checkAdmin();
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const data = await adminApi.getUsers();
      // Transform the flat data into UserWithBalance format
      const usersWithBalances: UserWithBalance[] = (data || []).map((row: any) => ({
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        phone: row.phone,
        country: row.country,
        address: row.address,
        city: row.city,
        state: row.state,
        postal_code: row.postal_code,
        date_of_birth: row.date_of_birth,
        profile_completed: row.profile_completed,
        kyc_status: row.kyc_status,
        is_active: row.is_active,
        created_at: row.created_at,
        government_id_type: row.government_id_type,
        government_id_url: row.government_id_url,
        balance_data: row.user_id ? {
          id: row.balance_id,
          user_id: row.user_id,
          balance: row.balance,
          demo_balance: row.demo_balance,
          total_deposited: row.total_deposited,
          total_withdrawn: row.total_withdrawn,
          total_profit_loss: row.total_profit_loss,
          today_profit_loss: row.today_profit_loss,
          signal_strength: row.signal_strength,
        } : null,
      }));
      setUsers(usersWithBalances);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  }, [isAdmin]);

  const fetchDeposits = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const data = await adminApi.getDeposits();
      const depositsWithProfiles: DepositWithProfile[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        amount: row.amount,
        method: row.method,
        currency: row.currency,
        wallet_address: row.wallet_address,
        tx_hash: row.tx_hash,
        status: row.status,
        admin_note: row.admin_note,
        created_at: row.created_at,
        confirmed_at: row.confirmed_at,
        screenshot_url: row.screenshot_url,
        profile: row.profile,
      }));
      setDeposits(depositsWithProfiles);
    } catch (error) {
      console.error("Error fetching deposits:", error);
      toast.error("Failed to fetch deposits");
    }
  }, [isAdmin]);

  const fetchWithdrawals = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const data = await adminApi.getWithdrawals();
      const withdrawalsWithProfiles: WithdrawalWithProfile[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        amount: row.amount,
        method: row.method,
        currency: row.currency,
        wallet_address: row.wallet_address,
        bank_details: row.bank_details,
        status: row.status,
        admin_note: row.admin_note,
        created_at: row.created_at,
        processed_at: row.processed_at,
        profile: row.profile,
      }));
      setWithdrawals(withdrawalsWithProfiles);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Failed to fetch withdrawals");
    }
  }, [isAdmin]);

  const fetchTrades = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const data = await adminApi.getTrades();
      const tradesWithProfiles: TradeWithProfile[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        symbol: row.symbol,
        side: row.side,
        quantity: row.quantity,
        entry_price: row.entry_price,
        exit_price: row.exit_price,
        leverage: row.leverage,
        stop_loss: row.stop_loss,
        take_profit: row.take_profit,
        profit_loss: row.profit_loss,
        admin_profit_override: row.admin_profit_override,
        is_demo: row.is_demo,
        status: row.status,
        order_type: row.order_type,
        created_at: row.created_at,
        closed_at: row.closed_at,
        profile: row.profile,
      }));
      setTrades(tradesWithProfiles);
    } catch (error) {
      console.error("Error fetching trades:", error);
      toast.error("Failed to fetch trades");
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchDeposits();
      fetchWithdrawals();
      fetchTrades();
    }
  }, [isAdmin, fetchUsers, fetchDeposits, fetchWithdrawals, fetchTrades]);

  const approveDeposit = async (depositId: string) => {
    const deposit = deposits.find((d) => d.id === depositId);
    if (!deposit) return false;

    try {
      await adminApi.approveDeposit(depositId, deposit.user_id, deposit.amount);
      toast.success("Deposit approved and balance updated");
      fetchDeposits();
      fetchUsers();
      return true;
    } catch (error) {
      toast.error("Failed to approve deposit");
      return false;
    }
  };

  const rejectDeposit = async (depositId: string, reason?: string) => {
    try {
      await adminApi.rejectDeposit(depositId, reason);
      toast.success("Deposit rejected");
      fetchDeposits();
      return true;
    } catch (error) {
      toast.error("Failed to reject deposit");
      return false;
    }
  };

  const approveWithdrawal = async (withdrawalId: string) => {
    const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
    if (!withdrawal) return false;

    try {
      await adminApi.approveWithdrawal(withdrawalId, withdrawal.user_id, withdrawal.amount);
      toast.success("Withdrawal approved and balance updated");
      fetchWithdrawals();
      fetchUsers();
      return true;
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve withdrawal");
      return false;
    }
  };

  const rejectWithdrawal = async (withdrawalId: string, reason?: string) => {
    try {
      await adminApi.rejectWithdrawal(withdrawalId, reason);
      toast.success("Withdrawal rejected");
      fetchWithdrawals();
      return true;
    } catch (error) {
      toast.error("Failed to reject withdrawal");
      return false;
    }
  };

  const updateUserBalance = async (userId: string, newBalance: number, reason: string) => {
    const currentUser = users.find((u) => u.id === userId);
    try {
      await adminApi.updateBalance(
        userId, 
        newBalance, 
        currentUser?.balance_data?.today_profit_loss || 0,
        currentUser?.balance_data?.signal_strength || 3,
        reason
      );
      toast.success("Balance updated");
      fetchUsers();
      return true;
    } catch (error) {
      console.error("Failed to update balance:", error);
      toast.error("Failed to update balance");
      return false;
    }
  };

  const updateTodayProfitLoss = async (userId: string, todayPl: number) => {
    const currentUser = users.find((u) => u.id === userId);
    try {
      await adminApi.updateBalance(
        userId,
        currentUser?.balance_data?.balance || 0,
        todayPl,
        currentUser?.balance_data?.signal_strength || 3,
        `Today's P/L set to ${todayPl}`
      );
      toast.success("Today's P/L updated");
      fetchUsers();
      return true;
    } catch (error) {
      console.error("Failed to update today's P/L:", error);
      toast.error("Failed to update today's P/L");
      return false;
    }
  };

  const updateSignalStrength = async (userId: string, signalStrength: number) => {
    const currentUser = users.find((u) => u.id === userId);
    try {
      await adminApi.updateBalance(
        userId,
        currentUser?.balance_data?.balance || 0,
        currentUser?.balance_data?.today_profit_loss || 0,
        signalStrength,
        `Signal strength set to ${signalStrength}`
      );
      toast.success("Signal strength updated");
      fetchUsers();
      return true;
    } catch (error) {
      console.error("Failed to update signal strength:", error);
      toast.error("Failed to update signal strength");
      return false;
    }
  };

  // Combined update for all balance fields at once (prevents race conditions)
  const updateAllBalanceFields = async (
    userId: string, 
    balance: number, 
    todayPl: number, 
    signalStrength: number
  ) => {
    try {
      await adminApi.updateBalance(userId, balance, todayPl, signalStrength, "Admin manual edit");
      toast.success("User data updated successfully");
      fetchUsers();
      return true;
    } catch (error) {
      console.error("Failed to update user data:", error);
      toast.error("Failed to update user data");
      return false;
    }
  };

  const updateKycStatus = async (userId: string, status: string) => {
    try {
      await adminApi.updateKycStatus(userId, status);
      toast.success(`KYC status updated to ${status}`);
      fetchUsers();
      return true;
    } catch (error) {
      toast.error("Failed to update KYC status");
      return false;
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, isActive);
      toast.success(isActive ? "User activated" : "User blocked");
      fetchUsers();
      return true;
    } catch (error) {
      toast.error("Failed to update user status");
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await adminApi.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
      return true;
    } catch (error) {
      toast.error("Failed to delete user");
      return false;
    }
  };

  return {
    isAdmin,
    loading,
    users,
    deposits,
    withdrawals,
    trades,
    approveDeposit,
    rejectDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    updateUserBalance,
    updateTodayProfitLoss,
    updateSignalStrength,
    updateAllBalanceFields,
    updateKycStatus,
    updateUserStatus,
    deleteUser,
    refetchUsers: fetchUsers,
    refetchDeposits: fetchDeposits,
    refetchWithdrawals: fetchWithdrawals,
    refetchTrades: fetchTrades,
  };
};
