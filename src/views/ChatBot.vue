<template>
    <div class="container mx-auto px-4 py-8 max-w-3xl">
      <h1 class="text-3xl font-bold mb-6 text-center">AI Chatbot</h1>
      
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Chat Messages Area -->
        <div 
          ref="chatContainer" 
          class="h-96 overflow-y-auto p-4 space-y-4"
          v-if="messages.length > 0"
        >
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            :class="[
              'max-w-3/4 p-3 rounded-lg', 
              message.isUser 
                ? 'bg-blue-500 text-white ml-auto' 
                : 'bg-gray-200 text-gray-800'
            ]"
          >
            <div class="flex items-center mb-1">
              <div 
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center mr-2',
                  message.isUser ? 'bg-blue-600' : 'bg-gray-500'
                ]"
              >
                <span class="text-white text-sm">
                  {{ message.isUser ? 'You' : 'Bot' }}
                </span>
              </div>
              <p class="text-sm opacity-75">
                {{ formatTime(message.timestamp) }}
              </p>
            </div>
            <p>{{ message.content }}</p>
          </div>
        </div>
        
        <div v-else class="h-96 flex items-center justify-center p-4">
          <div class="text-center text-gray-500">
            <p class="mb-2">No messages yet</p>
            <p class="text-sm">Start a conversation by typing a message below</p>
          </div>
        </div>
        
        <!-- Loading Indicator -->
        <div v-if="isLoading" class="flex justify-center py-4">
          <div class="flex space-x-2">
            <div class="w-3 h-3 rounded-full bg-gray-400 animate-bounce"></div>
            <div class="w-3 h-3 rounded-full bg-gray-400 animate-bounce delay-100"></div>
            <div class="w-3 h-3 rounded-full bg-gray-400 animate-bounce delay-200"></div>
          </div>
        </div>
        
        <!-- Message Input Area -->
        <div class="border-t border-gray-200 p-4">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type your message here..."
              class="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :disabled="isLoading"
            />
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              :disabled="!newMessage.trim() || isLoading"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      
      <!-- Chat Settings -->
      <div class="mt-6 bg-white rounded-lg shadow-md p-4">
        <h2 class="text-lg font-semibold mb-4">Chat Settings</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Bot Personality
            </label>
            <select 
              v-model="botPersonality"
              class="w-full p-2 border rounded-lg"
            >
              <option value="helpful">Helpful Assistant</option>
              <option value="friendly">Friendly Companion</option>
              <option value="sarcastic">Sarcastic Bot</option>
              <option value="expert">Expert Advisor</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Response Speed
            </label>
            <div class="flex items-center gap-2">
              <span class="text-xs">Fast</span>
              <input 
                v-model="responseSpeed" 
                type="range" 
                min="1" 
                max="5" 
                class="flex-grow"
              />
              <span class="text-xs">Thoughtful</span>
            </div>
          </div>
          
          <div class="flex items-center">
            <input 
              id="memory-toggle"
              v-model="hasMemory" 
              type="checkbox" 
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="memory-toggle" class="ml-2 block text-sm text-gray-700">
              Remember conversation history
            </label>
          </div>
        </div>
        
        <div class="mt-4 flex justify-between">
          <button 
            @click="clearChat" 
            class="text-red-600 hover:text-red-700 text-sm"
            :disabled="messages.length === 0"
          >
            Clear Chat History
          </button>
          
          <button 
            @click="saveSettings" 
            class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, watch, nextTick } from 'vue';
  
  interface Message {
    content: string;
    isUser: boolean;
    timestamp: Date;
  }
  
  // Chat state
  const messages = ref<Message[]>([]);
  const newMessage = ref('');
  const isLoading = ref(false);
  const chatContainer = ref<HTMLElement | null>(null);
  
  // Settings
  const botPersonality = ref('helpful');
  const responseSpeed = ref(3);
  const hasMemory = ref(true);
  
  // Mock API response function with delay based on response speed
  const getBotResponse = (userMessage: string): Promise<string> => {
    const responseTime = responseSpeed.value * 400; // 400-2000ms
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = {
          helpful: [
            "I'd be happy to help with that.",
            "Here's what I found about your question.",
            "Let me assist you with that.",
            "I can definitely help you with this task."
          ],
          friendly: [
            "Hey there! Great question!",
            "Oh, I love talking about this!",
            "Thanks for sharing that with me!",
            "That's an interesting point you've made!"
          ],
          sarcastic: [
            "Oh, never heard THAT one before...",
            "Wow, what a fascinating question... said no one ever.",
            "Let me drop everything to answer that...",
            "Gee, if only someone had invented search engines."
          ],
          expert: [
            "According to the latest research...",
            "There are several factors to consider in this analysis.",
            "From a technical perspective, I would recommend...",
            "The data suggests that the optimal approach would be..."
          ]
        };
        
        // Choose a response based on personality and user message
        const personalityResponses = responses[botPersonality.value as keyof typeof responses];
        const randomIndex = Math.floor(Math.random() * personalityResponses.length);
        
        // Generate more contextual response in a real application
        const response = `${personalityResponses[randomIndex]} I'm responding to: "${userMessage}"`;
        
        resolve(response);
      }, responseTime);
    });
  };
  
  // Send message function
  const sendMessage = async () => {
    const userMessage = newMessage.value.trim();
    if (!userMessage) return;
    
    // Add user message
    messages.value.push({
      content: userMessage,
      isUser: true,
      timestamp: new Date()
    });
    
    newMessage.value = '';
    
    // Scroll to bottom
    await nextTick();
    scrollToBottom();
    
    // Get bot response
    isLoading.value = true;
    try {
      const botResponse = await getBotResponse(userMessage);
      
      messages.value.push({
        content: botResponse,
        isUser: false,
        timestamp: new Date()
      });
      
      // Scroll to bottom again after receiving response
      await nextTick();
      scrollToBottom();
    } catch (error) {
      console.error('Error getting bot response:', error);
      messages.value.push({
        content: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date()
      });
    } finally {
      isLoading.value = false;
    }
  };
  
  // Clear chat history
  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      messages.value = [];
    }
  };
  
  // Save settings
  const saveSettings = () => {
    // In a real app, you'd save these to localStorage or your backend
    alert('Settings saved successfully!');
  };
  
  // Format timestamp
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Scroll to bottom of chat container
  const scrollToBottom = () => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  };
  
  // Scroll to bottom when messages change
  watch(messages, () => {
    nextTick(() => {
      scrollToBottom();
    });
  });
  
  // Initial setup
  onMounted(() => {
    scrollToBottom();
    
    // Add welcome message
    setTimeout(() => {
      messages.value.push({
        content: "Hello! How can I assist you today?",
        isUser: false,
        timestamp: new Date()
      });
    }, 500);
  });
  </script>