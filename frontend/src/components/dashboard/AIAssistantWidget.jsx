import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, X, Smile, Heart, Wind, Compass, Moon, Bot } from "lucide-react";
import { queryAIAssistant } from "../../services/aiAssistantService";
import { formatINR } from "../../utils/currency";
import { AIAssistantContext } from "../../contexts/AIAssistantContext";
import PyramidLoader from "./PyramidLoader";
import GenerateButton from "./GenerateButton";
import StyledSubmitButton from "./StyledSubmitButton";

const MOOD_THEMES = {
  happy: {
    accent: "#FFD166",
    bg: "rgba(255,209,102,0.08)",
    border: "rgba(255,209,102,0.25)",
    text: "#FFD166",
    emoji: "😄",
    label: "Happy",
    banner: "Great energy! ✨ Let me find something fun for you.",
    Icon: Smile,
  },
  sad: {
    accent: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.25)",
    text: "#c4b5fd",
    emoji: "💙",
    label: "Feeling Down",
    banner: "I'm here for you 💙 Let me find something to lift your spirits.",
    Icon: Moon,
  },
  stressed: {
    accent: "#f87171",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.25)",
    text: "#fca5a5",
    emoji: "🌿",
    label: "Stressed",
    banner: "Take a breath 🌿 Let me find something calming for you.",
    Icon: Wind,
  },
  tired: {
    accent: "#67e8f9",
    bg: "rgba(103,232,249,0.08)",
    border: "rgba(103,232,249,0.25)",
    text: "#a5f3fc",
    emoji: "😴",
    label: "Tired",
    banner: "Rest mode activated 😴 Something easy and relaxing coming right up.",
    Icon: Moon,
  },
  relaxed: {
    accent: "#4ade80",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.25)",
    text: "#86efac",
    emoji: "🧘",
    label: "Relaxed",
    banner: "Chill vibes only 🧘 Here are some laid-back options for you.",
    Icon: Wind,
  },
  romantic: {
    accent: "#f472b6",
    bg: "rgba(244,114,182,0.08)",
    border: "rgba(244,114,182,0.25)",
    text: "#f9a8d4",
    emoji: "💕",
    label: "Romantic",
    banner: "How lovely 💕 Let me find the perfect romantic setting.",
    Icon: Heart,
  },
  adventurous: {
    accent: "#fb923c",
    bg: "rgba(251,146,60,0.08)",
    border: "rgba(251,146,60,0.25)",
    text: "#fdba74",
    emoji: "🏔️",
    label: "Adventurous",
    banner: "Adventure awaits! 🏔️ Let's find something thrilling.",
    Icon: Compass,
  },
};

const DEFAULT_ACCENT = "#00d2ff";

export default function AIAssistantWidget() {
  const aiContext = useContext(AIAssistantContext);
  const {
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
  } = aiContext;

  const [isOpen, setIsOpen] = useState(isWidgetOpen);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [supportsVoiceInput, setSupportsVoiceInput] = useState(false);
  const [supportsVoiceOutput, setSupportsVoiceOutput] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeakReplies, setAutoSpeakReplies] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [voiceError, setVoiceError] = useState("");
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const stopRequestedRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const meterFrameRef = useRef(null);
  const navigate = useNavigate();

  const getSpeechRecognitionConstructor = () => {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  };

  const stopSpeaking = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const mapVoiceError = (errorCode) => {
    if (errorCode === "not-allowed" || errorCode === "service-not-allowed") {
      return "Microphone permission denied. Allow microphone access and try again.";
    }

    if (errorCode === "audio-capture") {
      return "No microphone detected. Check your audio input device.";
    }

    if (errorCode === "no-speech") {
      return "No speech detected. Please speak clearly and try again.";
    }

    if (errorCode === "network") {
      return "Voice recognition network issue. Please check internet and try again.";
    }

    return "Voice input failed. Please try again.";
  };

  const hasSecureSpeechContext = () => {
    if (typeof window === "undefined") return false;
    const host = window.location?.hostname;
    return window.isSecureContext || host === "localhost" || host === "127.0.0.1";
  };

  const stopVoiceMeter = () => {
    if (meterFrameRef.current) {
      cancelAnimationFrame(meterFrameRef.current);
      meterFrameRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      const context = audioContextRef.current;
      audioContextRef.current = null;
      if (context.state !== "closed") {
        void context.close();
      }
    }

    setVoiceLevel(0);
  };

  const startVoiceMeter = async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    stopVoiceMeter();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;

    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      return true;
    }

    const context = new AudioContextConstructor();
    audioContextRef.current = context;

    const source = context.createMediaStreamSource(stream);
    sourceRef.current = source;

    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.82;
    analyserRef.current = analyser;
    source.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteTimeDomainData(data);
      let sumSquares = 0;
      for (let i = 0; i < data.length; i += 1) {
        const normalized = (data[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }

      const rms = Math.sqrt(sumSquares / data.length);
      const level = Math.min(100, Math.round(rms * 260));
      setVoiceLevel(level);
      meterFrameRef.current = requestAnimationFrame(tick);
    };

    meterFrameRef.current = requestAnimationFrame(tick);
    return true;
  };

  const speakText = (text) => {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setVoiceError("Unable to play voice response.");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      setVoiceError("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      stopRequestedRef.current = true;
      recognitionRef.current.stop();
      stopVoiceMeter();
      setIsListening(false);
      return;
    }

    if (!hasSecureSpeechContext()) {
      setVoiceError("Voice input requires HTTPS or localhost.");
      return;
    }

    setVoiceError("");
    stopRequestedRef.current = false;

    try {
      await startVoiceMeter();
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      stopVoiceMeter();
      setIsListening(false);
      setVoiceError("Microphone permission denied or unavailable.");
    }
  };

  const resolveGeminiStatus = (response) => {
    if (!response || typeof response !== "object") return "unknown";

    if (response?.detectedContext?.geminiUnavailable === true) {
      return "unavailable";
    }

    const gemini = response?.gemini;
    if (!gemini || typeof gemini !== "object") return "unknown";

    if (gemini.fallbackUsed === true) return "unavailable";
    if (gemini.configured === false) return "unavailable";
    if (gemini.configured === true) return "available";

    return "unknown";
  };

  const buildTransportQuery = (item) => {
    const params = new URLSearchParams();

    if (item?.origin) {
      params.set("from", String(item.origin));
    }

    if (item?.destination) {
      params.set("to", String(item.destination));
    }

    return params.toString();
  };

  const openRecommendation = (item) => {
    const itemType = String(item?._type || "").toLowerCase();
    const itemId = String(item?._id || "").trim();
    const itemLocation = String(item?.location || "").trim();

    if ((itemType === "movie" || itemType === "activity") && itemId) {
      navigate(`/movies/${itemId}`);
      return;
    }

    if (itemType === "hotel" && itemId) {
      navigate(`/hotels/${itemId}`);
      return;
    }

    if (itemType === "flight" && itemId) {
      navigate(`/flights/${itemId}`);
      return;
    }

    if (itemType === "train" && itemId) {
      navigate(`/trains/${itemId}`);
      return;
    }

    if (itemType === "bus" && itemId) {
      navigate(`/buses/${itemId}`, { state: { initialBus: item } });
      return;
    }

    if (itemType === "movie" || itemType === "activity") {
      navigate(itemLocation ? `/movies?location=${encodeURIComponent(itemLocation)}` : "/movies");
      return;
    }

    if (itemType === "hotel") {
      navigate(itemLocation ? `/hotels?location=${encodeURIComponent(itemLocation)}` : "/hotels");
      return;
    }

    if (itemType === "flight") {
      const query = buildTransportQuery(item);
      navigate(query ? `/flights?${query}` : "/flights");
      return;
    }

    if (itemType === "train") {
      const query = buildTransportQuery(item);
      navigate(query ? `/trains?${query}` : "/trains");
      return;
    }

    if (itemType === "bus") {
      const query = buildTransportQuery(item);
      navigate(query ? `/buses?${query}` : "/buses");
      return;
    }

    navigate("/dashboard");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Sync widget open state with context
  useEffect(() => {
    setIsWidgetOpen(isOpen);
  }, [isOpen, setIsWidgetOpen]);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor();
    setSupportsVoiceInput(Boolean(SpeechRecognition));
    setSupportsVoiceOutput(typeof window !== "undefined" && "speechSynthesis" in window);

    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript.trim());
      setVoiceError("");
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" && stopRequestedRef.current) {
        stopRequestedRef.current = false;
        setVoiceError("");
        setIsListening(false);
        return;
      }

      setVoiceError(mapVoiceError(event.error));
      stopVoiceMeter();
      setIsListening(false);
    };

    recognition.onend = () => {
      stopRequestedRef.current = false;
      stopVoiceMeter();
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      stopVoiceMeter();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const sendMessage = async (event) => {
    event?.preventDefault();

    const message = input.trim();
    if (!message || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: message,
      payload: null,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setVoiceError("");

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      stopVoiceMeter();
      setIsListening(false);
    }

    try {
      // Build enhanced context with conversation history
      const conversationHistory = messages
        .filter((m) => m.sender === "user")
        .slice(-5) // Last 5 user messages for context
        .map((m) => m.text);

      const enhancedContext = {
        ...lastDetectedContext,
        conversationHistory,
        messageCount: messages.length,
        currentMood: detectedMood,
      };

      const response = await queryAIAssistant(message, enhancedContext);

      setGeminiStatus(resolveGeminiStatus(response));

      if (response?.detectedContext && typeof response.detectedContext === "object") {
        setLastDetectedContext(response.detectedContext);
        const moodKey = response.detectedContext?.mood;
        if (moodKey && MOOD_THEMES[moodKey]) {
          setDetectedMood(moodKey);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: response.reply || "Found some options for you!",
          payload: response,
        },
      ]);

      if (autoSpeakReplies) {
        speakText(response.reply || "Found some options for you!");
      }
    } catch {
      const fallbackMessage = "Sorry, I couldn't find anything. Try a different location or type of plan.";
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          sender: "ai",
          text: fallbackMessage,
          payload: null,
        },
      ]);

      if (autoSpeakReplies) {
        speakText(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed right-6 bottom-6 z-50"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
    >
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            style={detectedMood && MOOD_THEMES[detectedMood] ? { borderColor: `${MOOD_THEMES[detectedMood].accent}30` } : {}}
            className="mb-4 w-[min(98vw,60rem)] h-[min(90vh,52rem)] rounded-3xl border border-[#00d2ff]/20 bg-gradient-to-br from-[#0a1f2e] to-[#051320] backdrop-blur-lg shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div
              className="px-6 py-4 border-b border-white/10 flex items-center justify-between"
              style={detectedMood && MOOD_THEMES[detectedMood] ? { background: MOOD_THEMES[detectedMood].bg } : { background: "rgba(0,210,255,0.05)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg text-[#051320] grid place-items-center"
                  style={{ background: detectedMood && MOOD_THEMES[detectedMood] ? MOOD_THEMES[detectedMood].accent : DEFAULT_ACCENT }}
                >
                  {detectedMood && MOOD_THEMES[detectedMood]
                    ? (() => { const MIcon = MOOD_THEMES[detectedMood].Icon; return <MIcon size={20} />; })()
                    : <Bot size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Travel Assistant</h3>
                  <p
                    className={`mt-1 text-[11px] inline-flex items-center gap-1 rounded-full px-2 py-0.5 border ${
                      geminiStatus === "available"
                        ? "text-emerald-300 border-emerald-400/40 bg-emerald-500/10"
                        : geminiStatus === "unavailable"
                        ? "text-amber-300 border-amber-400/40 bg-amber-500/10"
                        : "text-white/60 border-white/20 bg-white/5"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        geminiStatus === "available"
                          ? "bg-emerald-400"
                          : geminiStatus === "unavailable"
                          ? "bg-amber-400"
                          : "bg-white/50"
                      }`}
                    />
                    Gemini: {geminiStatus === "available" ? "Available" : geminiStatus === "unavailable" ? "Unavailable" : "Unknown"}
                  </p>
                  {detectedMood && MOOD_THEMES[detectedMood] && (
                    <AnimatePresence>
                      <motion.p
                        key={detectedMood}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-1 text-[11px] inline-flex items-center gap-1 rounded-full px-2 py-0.5 border"
                        style={{
                          color: MOOD_THEMES[detectedMood].text,
                          borderColor: MOOD_THEMES[detectedMood].border,
                          background: MOOD_THEMES[detectedMood].bg,
                        }}
                      >
                        <span>{MOOD_THEMES[detectedMood].emoji}</span>
                        {MOOD_THEMES[detectedMood].label}
                      </motion.p>
                    </AnimatePresence>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                    return;
                  }

                  const latestAiMessage = [...messages].reverse().find((m) => m.sender === "ai" && m.text);
                  if (latestAiMessage) {
                    speakText(latestAiMessage.text);
                  }
                }}
                disabled={!supportsVoiceOutput}
                className="h-8 px-2 rounded-lg hover:bg-white/10 grid place-items-center text-white/70 disabled:opacity-40 disabled:cursor-not-allowed"
                title={isSpeaking ? "Stop voice playback" : "Play latest AI reply"}
              >
                {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                type="button"
                onClick={() => setAutoSpeakReplies((prev) => !prev)}
                disabled={!supportsVoiceOutput}
                className={`h-8 px-2 rounded-lg text-xs border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  autoSpeakReplies
                    ? "text-emerald-300 border-emerald-400/40 bg-emerald-500/10"
                    : "text-white/70 border-white/20 hover:bg-white/10"
                }`}
                title="Auto-read AI replies"
              >
                Auto Voice
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-white/10 grid place-items-center"
              >
                <X size={18} className="text-white/70" />
              </button>
            </div>

            {/* Mood Banner */}
            <AnimatePresence>
              {detectedMood && MOOD_THEMES[detectedMood] && (
                <motion.div
                  key={detectedMood}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-5 py-2 text-xs font-medium text-center"
                  style={{
                    background: MOOD_THEMES[detectedMood].bg,
                    color: MOOD_THEMES[detectedMood].text,
                    borderBottom: `1px solid ${MOOD_THEMES[detectedMood].border}`,
                  }}
                >
                  {MOOD_THEMES[detectedMood].banner}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scroll-smooth">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <motion.div
                    whileHover={msg.sender === "ai" ? { scale: 1.02, translateX: -5 } : { scale: 1.02, translateX: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-base backdrop-blur-sm transition-all ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-[#00d2ff] to-[#0099cc] text-[#051320] font-medium shadow-lg shadow-[#00d2ff]/20"
                        : "bg-gradient-to-br from-white/15 to-white/8 text-white border border-white/20 shadow-lg shadow-white/5"
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.sender === "ai" && supportsVoiceOutput && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.05 }}
                        type="button"
                        onClick={() => speakText(msg.text)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-[#8fd4e6] hover:text-white hover:bg-white/10 px-2 py-1 rounded-lg transition"
                        title="Read this response"
                      >
                        <Volume2 size={14} />
                        Listen
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl px-4 py-3 bg-gradient-to-br from-white/15 to-white/8 text-white/80 text-base inline-flex items-center gap-2 border border-white/20 shadow-lg shadow-white/5">
                    <PyramidLoader />
                    <span className="text-sm">Finding great options...</span>
                  </div>
                </motion.div>
              )}

              {/* Recommendations - Enhanced Cards with Animations */}
              <AnimatePresence>
                {messages
                  .filter((m) => m.sender === "ai" && m.payload)
                  .slice(-1)
                  .map((msg) =>
                    Array.isArray(msg.payload?.recommendations) && msg.payload.recommendations.length > 0 ? (
                      <motion.div
                        key={`recs-${msg.id}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="bg-gradient-to-b from-white/8 to-white/4 rounded-2xl p-5 border border-white/15 mt-4 backdrop-blur-sm"
                      >
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-xs uppercase tracking-widest text-[#8fd4e6] font-bold mb-4 flex items-center gap-2"
                        >
                          <span className="text-lg">🏆</span> Top Picks
                        </motion.p>
                        <div className="space-y-3">
                          {msg.payload.recommendations.slice(0, 4).map((item, idx) => (
                            <motion.button
                              key={`${item._id || idx}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 + idx * 0.08, duration: 0.3 }}
                              whileHover={{ scale: 1.02, translateX: 5 }}
                              type="button"
                              onClick={() => openRecommendation(item)}
                              className="w-full text-left bg-gradient-to-r from-white/8 to-white/4 p-4 rounded-xl border border-white/10 hover:border-[#00d2ff]/50 hover:bg-gradient-to-r hover:from-white/15 hover:to-white/8 transition-all duration-300 cursor-pointer group"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 + idx * 0.08 }}
                                    className="text-xs uppercase text-[#00d2ff] font-semibold tracking-wide group-hover:text-[#67e8f9] transition"
                                  >
                                    {String(item._type || "option").replace(/_/g, " ")}
                                  </motion.p>
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.12 + idx * 0.08 }}
                                    className="text-lg font-bold text-white mt-2 group-hover:text-[#00d2ff] transition"
                                  >
                                    {item.name || item.title}
                                  </motion.p>
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.14 + idx * 0.08 }}
                                    className="text-sm text-slate-300 mt-1 group-hover:text-white transition"
                                  >
                                    📍 {item.location || "Location pending"}
                                  </motion.p>
                                </div>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.15 + idx * 0.08 }}
                                  className="text-right"
                                >
                                  <p className="text-xs text-slate-400 uppercase tracking-wide">Rating</p>
                                  <div className="text-2xl font-bold text-[#00d2ff] mt-1 flex items-center gap-1">
                                    {(item.score ?? 0).toFixed(1)}
                                    <span className="text-lg">⭐</span>
                                  </div>
                                </motion.div>
                              </div>
                              <div className="flex items-center justify-between mt-4 text-sm text-slate-300 border-t border-white/5 pt-3">
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.16 + idx * 0.08 }}
                                  className="font-semibold text-[#FFD166] group-hover:text-white transition"
                                >
                                  💰 {item.price ? formatINR(item.price) : "Price TBA"}
                                </motion.span>
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.17 + idx * 0.08 }}
                                  className="text-[#00d2ff] group-hover:text-[#67e8f9] transition"
                                >
                                  📏 {item.distanceKm ? `${item.distanceKm} km` : "Distance TBA"}
                                </motion.span>
                              </div>
                              {item.seatsAvailable !== undefined && ["bus", "train", "flight"].includes(item._type) && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.18 + idx * 0.08 }}
                                  className="mt-3 text-xs text-slate-400 border-t border-white/5 pt-3 flex items-center justify-between"
                                >
                                  <span>🪑 Seats Available:</span>
                                  <span className={`font-semibold ${item.seatsAvailable > 20 ? "text-emerald-400" : item.seatsAvailable > 5 ? "text-yellow-400" : "text-rose-400"}`}>
                                    {item.seatsAvailable} seats
                                  </span>
                                </motion.div>
                              )}
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.18 + idx * 0.08 }}
                                className="mt-3 text-xs text-[#8fd4e6] group-hover:text-white transition flex items-center gap-1"
                              >
                                ➜ Click to view details
                              </motion.p>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    ) : null
                  )}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-5 border-t border-white/10 bg-[#051320]">
              {(isListening || voiceError) && (
                <p className={`mb-2 text-xs ${voiceError ? "text-rose-300" : "text-[#8fd4e6]"}`}>
                  {voiceError || "Listening... speak now."}
                </p>
              )}
              {isListening && (
                <div className="mb-3">
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00d2ff] to-[#67e8f9] transition-all duration-75"
                      style={{ width: `${Math.max(6, voiceLevel)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-[#8fd4e6]/90">Mic level: {voiceLevel}%</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Where to? What do you want to do?"
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00d2ff] disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isLoading || !supportsVoiceInput}
                  className={`h-12 w-12 rounded-lg border grid place-items-center transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    isListening
                      ? "border-rose-400/80 bg-rose-500/15 text-rose-300"
                      : "border-white/20 bg-white/5 text-white/80 hover:border-[#00d2ff]/60"
                  }`}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <StyledSubmitButton
                  onClick={() => {
                    const form = document.querySelector("form");
                    if (form) form.dispatchEvent(new Event("submit", { bubbles: true }));
                  }}
                  disabled={isLoading || !input.trim()}
                  title="Send message"
                  icon={null}
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bot Button */}
      <GenerateButton
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        detectedMood={detectedMood}
        MOOD_THEMES={MOOD_THEMES}
        DEFAULT_ACCENT={DEFAULT_ACCENT}
      />
    </motion.div>
  );
}
