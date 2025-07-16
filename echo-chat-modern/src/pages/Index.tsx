import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/LoginForm';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { useChat } from '@/hooks/useChat';
import { Loader2 } from 'lucide-react';

const ChatApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const {
    sessions,
    activeSessionId,
    isTyping,
    createNewSession,
    sendMessage,
    selectSession,
    getCurrentMessages
  } = useChat();

  useEffect(() => {
    // Create initial session if user is logged in and no active session
    if (user && !activeSessionId && sessions.length === 0) {
      createNewSession();
    }
  }, [user, activeSessionId, sessions.length, createNewSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const handleNewChat = () => {
    createNewSession();
  };

  const handleSendMessage = (content: string) => {
    if (!activeSessionId) {
      const newSessionId = createNewSession();
      // Wait for next tick to ensure session is created
      setTimeout(() => sendMessage(content), 0);
    } else {
      sendMessage(content);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        sessions={sessions.map(session => ({
          id: session.id,
          title: session.title,
          lastMessage: session.lastMessage,
          timestamp: session.timestamp
        }))}
        activeSessionId={activeSessionId}
        onSessionSelect={selectSession}
        onNewChat={handleNewChat}
      />
      
      <div className="flex-1">
        <ChatInterface
          messages={getCurrentMessages()}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
        />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <ChatApp />
    </AuthProvider>
  );
};

export default Index;
