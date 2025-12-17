import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, MessageCircle, User as UserIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/adminApi";

interface Message {
  id: string;
  user_id: string;
  message: string;
  sender: string;
  is_read: boolean;
  created_at: string;
}

interface ChatUser {
  user_id: string;
  email: string | null;
  full_name: string | null;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
}

const AdminChat = () => {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchChatUsers();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      fetchChatUsers();
      if (selectedUser) {
        fetchMessages(selectedUser);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatUsers = async () => {
    try {
      const data = await adminApi.getChatUsers();
      setChatUsers(data || []);
    } catch (error) {
      console.error("Error fetching chat users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const data = await adminApi.getChatMessages(userId);
      setMessages(data || []);
      // Mark messages as read
      await adminApi.markMessagesAsRead(userId);
      // Refresh user list to update unread counts
      fetchChatUsers();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
    fetchMessages(userId);
  };

  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return;

    setSending(true);
    try {
      await adminApi.sendAdminMessage(selectedUser, newMessage.trim());
      setNewMessage("");
      fetchMessages(selectedUser);
    } catch (error) {
      toast.error("Failed to send message");
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedUserData = chatUsers.find(u => u.user_id === selectedUser);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* Users List */}
      <Card className="p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversations
          </h3>
          <Button variant="ghost" size="sm" onClick={fetchChatUsers}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {loading ? (
            <p className="text-muted-foreground text-sm text-center py-4">Loading...</p>
          ) : chatUsers.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No conversations yet</p>
          ) : (
            chatUsers.map((user) => (
              <button
                key={user.user_id}
                onClick={() => handleSelectUser(user.user_id)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedUser === user.user_id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 hover:bg-secondary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.full_name || user.email || "Unknown"}</p>
                      <p className={`text-xs truncate max-w-[150px] ${selectedUser === user.user_id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {user.lastMessage}
                      </p>
                    </div>
                  </div>
                  {user.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {user.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2 flex flex-col">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{selectedUserData?.full_name || selectedUserData?.email || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{selectedUserData?.email}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.sender === "admin"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-secondary-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a reply..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sending}
                />
                <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminChat;
