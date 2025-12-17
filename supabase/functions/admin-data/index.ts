import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Hardcoded admin credentials (matches AdminLogin.tsx)
const ADMIN_NAME = "Isaac";
const ADMIN_PASSWORD = "Amabelonakorame";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { adminName, adminPassword, action, payload } = await req.json();

    // Validate admin credentials
    if (adminName !== ADMIN_NAME || adminPassword !== ADMIN_PASSWORD) {
      console.log('Admin auth failed for:', adminName);
      return new Response(
        JSON.stringify({ error: 'Invalid admin credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin authenticated, action:', action);

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let result: any = null;

    switch (action) {
      case 'getUsers': {
        const { data, error } = await supabase.rpc('admin_get_users');
        if (error) throw error;
        result = data;
        break;
      }

      case 'getDeposits': {
        const { data, error } = await supabase.rpc('admin_get_deposits');
        if (error) throw error;
        result = data;
        break;
      }

      case 'getWithdrawals': {
        const { data, error } = await supabase.rpc('admin_get_withdrawals');
        if (error) throw error;
        result = data;
        break;
      }

      case 'getTrades': {
        const { data, error } = await supabase.rpc('admin_get_trades');
        if (error) throw error;
        result = data;
        break;
      }

      // Chat actions
      case 'getChatUsers': {
        // Get all chat messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;

        if (!messagesData || messagesData.length === 0) {
          result = [];
          break;
        }

        // Get unique user IDs
        const userIds = [...new Set(messagesData.map((msg: any) => msg.user_id))];

        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const profilesMap = new Map();
        profilesData?.forEach((profile: any) => {
          profilesMap.set(profile.id, profile);
        });

        // Group messages by user
        const userMap = new Map();
        messagesData.forEach((msg: any) => {
          const profile = profilesMap.get(msg.user_id);
          if (!userMap.has(msg.user_id)) {
            userMap.set(msg.user_id, {
              user_id: msg.user_id,
              email: profile?.email || null,
              full_name: profile?.full_name || null,
              unreadCount: 0,
              lastMessage: msg.message,
              lastMessageTime: msg.created_at,
            });
          }
          if (msg.sender === 'user' && !msg.is_read) {
            const user = userMap.get(msg.user_id);
            user.unreadCount++;
          }
        });

        result = Array.from(userMap.values());
        break;
      }

      case 'getChatMessages': {
        const { userId } = payload;
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        result = data;
        break;
      }

      case 'sendAdminMessage': {
        const { userId, message } = payload;
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            user_id: userId,
            message: message,
            sender: 'admin',
            is_read: true
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
        break;
      }

      case 'markMessagesAsRead': {
        const { userId } = payload;
        const { error } = await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .eq('user_id', userId)
          .eq('sender', 'user');

        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'updateBalance': {
        const { userId, balance, todayPl, signalStrength, reason } = payload;
        const { error } = await supabase
          .from('balances')
          .update({ 
            balance, 
            today_profit_loss: todayPl,
            signal_strength: signalStrength 
          })
          .eq('user_id', userId);
        if (error) throw error;
        
        // Log adjustment
        await supabase.from('admin_balance_adjustments').insert({
          user_id: userId,
          admin_id: userId, // Using userId as placeholder since no real admin user
          amount: balance,
          adjustment_type: 'manual_adjustment',
          reason: reason || 'Admin manual edit'
        });
        
        result = { success: true };
        break;
      }

      case 'updateUserStatus': {
        const { userId, isActive } = payload;
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: isActive })
          .eq('id', userId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'updateKycStatus': {
        const { userId, status } = payload;
        const { error } = await supabase
          .from('profiles')
          .update({ kyc_status: status })
          .eq('id', userId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'approveDeposit': {
        const { depositId, userId, amount } = payload;
        
        // Update deposit status
        const { error: depositError } = await supabase
          .from('deposits')
          .update({ status: 'approved', confirmed_at: new Date().toISOString() })
          .eq('id', depositId);
        if (depositError) throw depositError;

        // Get current balance
        const { data: balanceData } = await supabase
          .from('balances')
          .select('balance, total_deposited')
          .eq('user_id', userId)
          .single();

        // Update balance
        const { error: balanceError } = await supabase
          .from('balances')
          .update({
            balance: (balanceData?.balance || 0) + amount,
            total_deposited: (balanceData?.total_deposited || 0) + amount
          })
          .eq('user_id', userId);
        if (balanceError) throw balanceError;

        result = { success: true };
        break;
      }

      case 'rejectDeposit': {
        const { depositId, reason } = payload;
        const { error } = await supabase
          .from('deposits')
          .update({ status: 'rejected', admin_note: reason })
          .eq('id', depositId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'approveWithdrawal': {
        const { withdrawalId, userId, amount } = payload;
        
        // Get current balance
        const { data: balanceData } = await supabase
          .from('balances')
          .select('balance, total_withdrawn')
          .eq('user_id', userId)
          .single();

        if ((balanceData?.balance || 0) < amount) {
          return new Response(
            JSON.stringify({ error: 'Insufficient balance' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update withdrawal status
        const { error: withdrawalError } = await supabase
          .from('withdrawals')
          .update({ status: 'approved', processed_at: new Date().toISOString() })
          .eq('id', withdrawalId);
        if (withdrawalError) throw withdrawalError;

        // Update balance
        const { error: balanceError } = await supabase
          .from('balances')
          .update({
            balance: (balanceData?.balance || 0) - amount,
            total_withdrawn: (balanceData?.total_withdrawn || 0) + amount
          })
          .eq('user_id', userId);
        if (balanceError) throw balanceError;

        result = { success: true };
        break;
      }

      case 'rejectWithdrawal': {
        const { withdrawalId, reason } = payload;
        const { error } = await supabase
          .from('withdrawals')
          .update({ status: 'rejected', admin_note: reason })
          .eq('id', withdrawalId);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'deleteUser': {
        const { userId } = payload;
        // Delete in order due to dependencies
        await supabase.from('admin_balance_adjustments').delete().eq('user_id', userId);
        await supabase.from('trades').delete().eq('user_id', userId);
        await supabase.from('withdrawals').delete().eq('user_id', userId);
        await supabase.from('deposits').delete().eq('user_id', userId);
        await supabase.from('chat_messages').delete().eq('user_id', userId);
        await supabase.from('balances').delete().eq('user_id', userId);
        await supabase.from('user_roles').delete().eq('user_id', userId);
        await supabase.from('profiles').delete().eq('id', userId);
        result = { success: true };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('Action completed successfully:', action);
    return new Response(
      JSON.stringify({ data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin data error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
