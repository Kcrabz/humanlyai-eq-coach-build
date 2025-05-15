
import React, { useEffect, useRef, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatBubble } from "./ChatBubble";
import { EmptyChatState } from "./components/EmptyChatState";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function ChatList() {
  const { messages, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const firstRenderRef = useRef(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isIOS, setIsIOS] = useState(false);
  
  // Get sidebar states to force re-render when they change
  const { open: rightSidebarOpen } = useSidebar("right");
  const { open: leftSidebarOpen } = useSidebar("left");
  const [prevRightState, setPrevRightState] = useState(rightSidebarOpen);
  const [prevLeftState, setPrevLeftState] = useState(leftSidebarOpen);

  // Filter out any empty messages to prevent blank bubbles
  const validMessages = messages.filter(msg => msg.content && msg.content.trim());

  // Detect iOS devices
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
  }, []);
  
  // Handle viewport height adjustments for mobile devices
  useEffect(() => {
    // Only run on mobile devices
    if (!isMobile || !chatContainerRef.current) return;
    
    // Handle viewport height changes due to keyboard
    const handleResize = () => {
      if (chatContainerRef.current) {
        // Use visual viewport height to handle keyboard properly
        const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        chatContainerRef.current.style.height = `${vh}px`;
      }
    };
    
    // Listen for visual viewport changes (keyboard opening/closing)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      handleResize(); // Initial sizing
    }
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [isMobile]);

  // Force scroll to bottom on sidebar state change
  useEffect(() => {
    if (prevRightState !== rightSidebarOpen || prevLeftState !== leftSidebarOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 300); // Small delay to let transitions complete
      
      setPrevRightState(rightSidebarOpen);
      setPrevLeftState(leftSidebarOpen);
    }
  }, [rightSidebarOpen, leftSidebarOpen, prevRightState, prevLeftState]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [validMessages]);

  // If there are messages and this is the first render, scroll to the most recent message
  useEffect(() => {
    if (validMessages.length > 0 && firstRenderRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      firstRenderRef.current = false;
    }
  }, [validMessages]);

  // Ensure we reset the first render flag when component unmounts/remounts
  useEffect(() => {
    return () => {
      firstRenderRef.current = true;
    };
  }, []);

  return (
    <div 
      ref={chatContainerRef}
      className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'} space-y-6`} 
      style={{
        // Only apply safe area inset padding on iOS devices
        paddingBottom: isIOS && isMobile ? 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' : undefined
      }}
    >
      {validMessages.length === 0 ? (
        <EmptyChatState />
      ) : (
        validMessages.map((message) => (
          message.content && message.content.trim() ? 
            <ChatBubble key={message.id} message={message} /> : 
            null
        ))
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
