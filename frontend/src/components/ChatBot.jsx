import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { queryAIAssistant } from "../services/aiAssistantService";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { sender: "ai", text: "Welcome! Ask me for travel plans, routes, and options. ✈️" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDetectedContext, setLastDetectedContext] = useState(null);
  const [geminiStatus, setGeminiStatus] = useState("unknown");
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

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
      setMessage(transcript.trim());
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

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = { sender: "user", text: message };
    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setVoiceError("");

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      stopVoiceMeter();
      setIsListening(false);
    }

    try {
      const res = await queryAIAssistant(message, lastDetectedContext);

      setGeminiStatus(resolveGeminiStatus(res));

      if (res?.detectedContext && typeof res.detectedContext === "object") {
        setLastDetectedContext(res.detectedContext);
      }

      const reply = res.reply || "I found some options for you.";
      setChat((prev) => [...prev, { sender: "ai", text: reply }]);

      if (autoSpeakReplies) {
        speakText(reply);
      }
    } catch {
      const fallbackMessage = "I'm having trouble connecting right now. Please try again in a moment.";
      setChat((prev) => [
        ...prev,
        { sender: "ai", text: fallbackMessage }
      ]);

      if (autoSpeakReplies) {
        speakText(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-80 md:w-96 overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl shadow-red-500/10 flex flex-col"
            style={{ height: "500px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-red-600/20 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Cinematic Assistant</h3>
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Always Ready
                  </p>
                  <p className={`mt-1 text-[11px] inline-flex items-center gap-1 rounded-full px-2 py-0.5 border ${
                      geminiStatus === "available"
                        ? "text-emerald-300 border-emerald-400/40 bg-emerald-500/10"
                        : geminiStatus === "unavailable"
                        ? "text-amber-300 border-amber-400/40 bg-amber-500/10"
                        : "text-white/60 border-white/20 bg-white/5"
                    }`}>
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
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                      return;
                    }

                    const latestAiMessage = [...chat].reverse().find((c) => c.sender === "ai" && c.text);
                    if (latestAiMessage) {
                      speakText(latestAiMessage.text);
                    }
                  }}
                  disabled={!supportsVoiceOutput}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/60 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={isSpeaking ? "Stop voice playback" : "Play latest AI reply"}
                >
                  {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => setAutoSpeakReplies((prev) => !prev)}
                  disabled={!supportsVoiceOutput}
                  className={`px-2 py-1 text-[10px] rounded-full border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    autoSpeakReplies
                      ? "text-emerald-300 border-emerald-400/40 bg-emerald-500/10"
                      : "text-white/70 border-white/20 hover:bg-white/10"
                  }`}
                >
                  Auto Voice
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} className="text-white/60" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-red-600/20 scrollbar-track-transparent"
            >
              {chat.map((c, i) => (
                <motion.div
                  initial={{ opacity: 0, x: c.sender === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${c.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${c.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${c.sender === "user" ? "bg-white/10" : "bg-red-600/20"
                      }`}>
                      {c.sender === "user" ? <User size={14} className="text-white/60" /> : <Bot size={14} className="text-red-500" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${c.sender === "user"
                        ? "bg-red-600 text-white rounded-tr-none shadow-lg shadow-red-600/20"
                        : "bg-white/5 text-white/90 border border-white/5 rounded-tl-none"
                      }`}>
                      <p>{c.text}</p>
                      {c.sender === "ai" && supportsVoiceOutput && (
                        <button
                          type="button"
                          onClick={() => speakText(c.text)}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200"
                          title="Read this response"
                        >
                          <Volume2 size={13} />
                          Listen
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-center bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none">
                    <Loader2 size={14} className="text-red-500 animate-spin" />
                    <span className="text-xs text-white/60 italic">Assistant is typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-white/5">
              {(isListening || voiceError) && (
                <p className={`mb-2 text-xs ${voiceError ? "text-rose-300" : "text-red-300"}`}>
                  {voiceError || "Listening... speak now."}
                </p>
              )}
              {isListening && (
                <div className="mb-3">
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-75"
                      style={{ width: `${Math.max(6, voiceLevel)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-red-300/80">Mic level: {voiceLevel}%</p>
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask for travel suggestions..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-24 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isLoading || !supportsVoiceInput}
                  className={`absolute right-12 top-1/2 -translate-y-1/2 p-2 rounded-lg border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    isListening
                      ? "border-rose-400/80 bg-rose-500/15 text-rose-300"
                      : "border-white/15 bg-black/30 text-white/70 hover:border-red-500/50"
                  }`}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !message.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-red-600/20"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${isOpen ? "bg-white text-black" : "bg-red-600 text-white"
          }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
}
