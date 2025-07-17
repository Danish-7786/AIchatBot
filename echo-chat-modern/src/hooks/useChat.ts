import { useState, useCallback } from 'react';
import { Message } from '@/components/ChatInterface';
import axios from 'axios';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: string;
  timestamp: Date;
}

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const saveToLocalStorage = useCallback((newSessions: ChatSession[]) => {
    localStorage.setItem('chatHistory', JSON.stringify(newSessions));
  }, []);

  const generateTitle = (content: string): string => {
    // Generate a title from the first message, truncated to 50 chars
    const words = content.split(' ').slice(0, 6).join(' ');
    return words.length > 50 ? words.substring(0, 47) + '...' : words;
  };

  const generateMockResponse = async (userMessage: string): Promise<any> => {
    // Simulate AI thinking time
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/chat`,{"message":[userMessage],"allow_search":true})
      if(response != null){
        return response.data;
      }
    } catch (error) {
      console.error("err",error)
      return "Sorry, there was an error getting a response.";

    }
 
  };

  const createNewSession = useCallback((): string => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      lastMessage: '',
      timestamp: new Date()
    };

    setSessions(prev => {
      const updated = [newSession, ...prev];
      saveToLocalStorage(updated);
      return updated;
    });

    setActiveSessionId(newSession.id);
    return newSession.id;
  }, [saveToLocalStorage]);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    // Add user message immediately
    setSessions(prev => {
      const updated = prev.map(session => {
        if (session.id === activeSessionId) {
          const updatedMessages = [...session.messages, userMessage];
          const title = session.messages.length === 0 ? generateTitle(content) : session.title;
          
          return {
            ...session,
            title,
            messages: updatedMessages,
            lastMessage: content,
            timestamp: new Date()
          };
        }
        return session;
      });
      
      saveToLocalStorage(updated);
      return updated;
    });

    // Show typing indicator
    setIsTyping(true);

    try {
      // Generate AI response
      const aiResponse = await generateMockResponse(content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date()
      };

      // Add AI response
      setSessions(prev => {
        const updated = prev.map(session => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages, assistantMessage],
              lastMessage: aiResponse.substring(0, 100) + '...',
              timestamp: new Date()
            };
          }
          return session;
        });
        
        saveToLocalStorage(updated);
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  }, [activeSessionId, saveToLocalStorage]);

  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const getCurrentSession = useCallback(() => {
    return sessions.find(session => session.id === activeSessionId);
  }, [sessions, activeSessionId]);

  const getCurrentMessages = useCallback(() => {
    const currentSession = getCurrentSession();
    return currentSession?.messages || [];
  }, [getCurrentSession]);

  return {
    sessions,
    activeSessionId,
    isTyping,
    createNewSession,
    sendMessage,
    selectSession,
    getCurrentMessages,
    getCurrentSession
  };
};