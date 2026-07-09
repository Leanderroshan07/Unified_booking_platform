import { createContext, useState, useEffect } from "react";

export const AIAssistantContext = createContext();

const DEFAULT_STARTER_MESSAGE = {
  id: "starter",
  sender: "ai",
  text: "Hi! 👋 Tell me where you want to go and what you'd like to do. I'll find great options for you.",
  payload: null,
};

export function AIAssistantProvider({ children }) {
  const [messages, setMessages] = useState([DEFAULT_STARTER_MESSAGE]);
  const [lastDetectedContext, setLastDetectedContext] = useState(null);
  const [detectedMood, setDetectedMood] = useState(null);
  const [geminiStatus, setGeminiStatus] = useState("unknown");
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  // Persist state to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ai_assistant_state");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        // Only restore if messages are not empty
        if (state.messages && state.messages.length > 0) {
          setMessages(state.messages);
        }
        setLastDetectedContext(state.lastDetectedContext || null);
        setDetectedMood(state.detectedMood || null);
        setGeminiStatus(state.geminiStatus || "unknown");
        setIsWidgetOpen(state.isWidgetOpen || false);
      } catch (e) {
        console.error("Failed to restore AI Assistant state:", e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "ai_assistant_state",
      JSON.stringify({
        messages,
        lastDetectedContext,
        detectedMood,
        geminiStatus,
        isWidgetOpen,
      })
    );
  }, [messages, lastDetectedContext, detectedMood, geminiStatus, isWidgetOpen]);

  // Helper function to clear chat history
  const clearHistory = () => {
    setMessages([DEFAULT_STARTER_MESSAGE]);
    setLastDetectedContext(null);
    setDetectedMood(null);
    localStorage.removeItem("ai_assistant_state");
  };

  // Helper function to get conversation summary
  const getConversationSummary = () => {
    const userMessages = messages.filter((m) => m.sender === "user");
    return {
      totalMessages: messages.length,
      userQueries: userMessages.length,
      hasContext: !!lastDetectedContext,
      currentMood: detectedMood,
    };
  };

  return (
    <AIAssistantContext.Provider
      value={{
        messages,
        setMessages,
        lastDetectedContext,
        setLastDetectedContext,
        detectedMood,
        setDetectedMood,
        geminiStatus,
        setGeminiStatus,
        isWidgetOpen,
        setIsWidgetOpen,
        clearHistory,
        getConversationSummary,
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
}
