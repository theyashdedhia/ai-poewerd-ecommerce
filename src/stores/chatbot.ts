import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/supabase/client';
import { useAuthStore } from './auth';
import type { Database } from '@/supabase/types';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

export const useChatbotStore = defineStore('chatbot', () => {
  const authStore = useAuthStore();
  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  
  // Load chat history
  async function loadChatHistory() {
    if (!authStore.isAuthenticated) return;
    
    isLoading.value = true;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', authStore.user?.id)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      messages.value = data || [];
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      isLoading.value = false;
    }
  }
  
  // Send a message and get AI response
  async function sendMessage(message: string) {
    try {
      // First, save the user's message
      const userId = authStore.isAuthenticated ? authStore.user?.id : 'guest';
      
      const { data: userMsg, error: userMsgError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          message,
          is_bot: false
        })
        .select()
        .single();
        
      if (userMsgError) throw userMsgError;
      
      // Add to local state
      messages.value.push(userMsg);
      
      // In a real app, this would call an AI service
      // For now, we'll just simulate a response
      const botResponse = await simulateAIResponse(message);
      
      // Save the bot's response
      const { data: botMsg, error: botMsgError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          message: botResponse,
          is_bot: true
        })
        .select()
        .single();
        
      if (botMsgError) throw botMsgError;
      
      // Add to local state
      messages.value.push(botMsg);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to send message' 
      };
    }
  }
  
  // Simulate AI response (this would be replaced with a real AI service)
  async function simulateAIResponse(message: string) {
    // Add a slight delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple keyword-based responses
    const lowercaseMsg = message.toLowerCase();
    
    if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi')) {
      return "Hello! How can I help you with your shopping today?";
    } else if (lowercaseMsg.includes('help')) {
      return "I'd be happy to help! You can ask me about products, shipping, returns, or any other questions you have.";
    } else if (lowercaseMsg.includes('shipping') || lowercaseMsg.includes('delivery')) {
      return "We offer standard shipping (3-5 business days) and express shipping (1-2 business days). Free shipping on orders over $50!";
    } else if (lowercaseMsg.includes('return') || lowercaseMsg.includes('refund')) {
      return "Our return policy allows returns within 30 days of purchase. Just visit your order history to start a return.";
    } else if (lowercaseMsg.includes('payment') || lowercaseMsg.includes('pay')) {
      return "We accept all major credit cards, PayPal, and Apple Pay.";
    } else if (lowercaseMsg.includes('track') || lowercaseMsg.includes('order status')) {
      return "You can track your order in the 'My Orders' section of your account.";
    } else {
      return "I'm not sure I understand. Could you please rephrase your question?";
    }
  }
  
  // Clear chat history
  async function clearChatHistory() {
    if (!authStore.isAuthenticated) {
      messages.value = [];
      return { success: true };
    }
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', authStore.user?.id);
        
      if (error) throw error;
      
      messages.value = [];
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to clear chat history' 
      };
    }
  }
  
  return {
    messages,
    isLoading,
    loadChatHistory,
    sendMessage,
    clearChatHistory
  };
});