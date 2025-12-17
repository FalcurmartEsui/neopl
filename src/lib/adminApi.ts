import { supabase } from "@/integrations/supabase/client";

// Admin credentials stored in localStorage after login
const getAdminCredentials = () => {
  // We store these after successful login in AdminLogin.tsx
  return {
    adminName: localStorage.getItem("adminName") || "",
    adminPassword: localStorage.getItem("adminPassword") || ""
  };
};

export const adminApi = {
  async callAdminFunction(action: string, payload?: any) {
    const { adminName, adminPassword } = getAdminCredentials();
    
    if (!adminName || !adminPassword) {
      throw new Error("Admin credentials not found. Please log in again.");
    }

    const { data, error } = await supabase.functions.invoke('admin-data', {
      body: {
        adminName,
        adminPassword,
        action,
        payload
      }
    });

    if (error) {
      console.error('Admin API error:', error);
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data?.data;
  },

  async getUsers() {
    return this.callAdminFunction('getUsers');
  },

  async getDeposits() {
    return this.callAdminFunction('getDeposits');
  },

  async getWithdrawals() {
    return this.callAdminFunction('getWithdrawals');
  },

  async getTrades() {
    return this.callAdminFunction('getTrades');
  },

  // Chat functions
  async getChatUsers() {
    return this.callAdminFunction('getChatUsers');
  },

  async getChatMessages(userId: string) {
    return this.callAdminFunction('getChatMessages', { userId });
  },

  async sendAdminMessage(userId: string, message: string) {
    return this.callAdminFunction('sendAdminMessage', { userId, message });
  },

  async markMessagesAsRead(userId: string) {
    return this.callAdminFunction('markMessagesAsRead', { userId });
  },

  async updateBalance(userId: string, balance: number, todayPl: number, signalStrength: number, reason?: string) {
    return this.callAdminFunction('updateBalance', { userId, balance, todayPl, signalStrength, reason });
  },

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.callAdminFunction('updateUserStatus', { userId, isActive });
  },

  async updateKycStatus(userId: string, status: string) {
    return this.callAdminFunction('updateKycStatus', { userId, status });
  },

  async approveDeposit(depositId: string, userId: string, amount: number) {
    return this.callAdminFunction('approveDeposit', { depositId, userId, amount });
  },

  async rejectDeposit(depositId: string, reason?: string) {
    return this.callAdminFunction('rejectDeposit', { depositId, reason });
  },

  async approveWithdrawal(withdrawalId: string, userId: string, amount: number) {
    return this.callAdminFunction('approveWithdrawal', { withdrawalId, userId, amount });
  },

  async rejectWithdrawal(withdrawalId: string, reason?: string) {
    return this.callAdminFunction('rejectWithdrawal', { withdrawalId, reason });
  },

  async deleteUser(userId: string) {
    return this.callAdminFunction('deleteUser', { userId });
  }
};
