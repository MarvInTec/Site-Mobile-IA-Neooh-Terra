import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceChatProps {
  isDarkMode: boolean;
  user: any;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({ isDarkMode, user }) => {
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const stopLive = useCallback(async () => {
    if (sessionRef.current) {
      await sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsLive(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  const playNextInQueue = useCallback(() => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0 || isPlayingRef.current) {
      if (audioQueueRef.current.length === 0) setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const chunk = audioQueueRef.current.shift()!;
    const buffer = audioContextRef.current.createBuffer(1, chunk.length, 24000);
    buffer.getChannelData(0).set(chunk);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      isPlayingRef.current = false;
      playNextInQueue();
    };
    source.start();
  }, []);

  const startLive = async () => {
    if (!user) return;
    setIsConnecting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "Você é o NEO, o assistente inteligente da NEOOH. Você é prestativo, moderno e fala de forma clara e profissional sobre mídia OOH e DOOH. Mantenha suas respostas concisas e naturais para uma conversa por voz.",
        },
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setIsConnecting(false);
            
            // Start sending audio
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            processorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert to 16-bit PCM
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
              session.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=24000' }
              });
            };

            source.connect(processorRef.current);
            processorRef.current.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const binary = atob(base64Audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              
              // Convert 16-bit PCM to Float32
              const pcm16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 0x7FFF;
              
              audioQueueRef.current.push(float32);
              playNextInQueue();
            }
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
              setIsSpeaking(false);
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Erro na conexão de voz.");
            stopLive();
          },
          onclose: () => {
            stopLive();
          }
        }
      });

      sessionRef.current = session;
    } catch (err) {
      console.error("Failed to start voice chat:", err);
      setError("Não foi possível acessar o microfone ou conectar ao servidor.");
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => {
      stopLive();
    };
  }, [stopLive]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <AnimatePresence mode="wait">
        {isLive ? (
          <motion.div
            key="live-ui"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: isSpeaking ? [1, 1.2, 1] : 1,
                  opacity: isSpeaking ? [0.3, 0.6, 0.3] : 0.2,
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full bg-neo-purple blur-xl"
              />
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/10'} shadow-2xl`}>
                {isSpeaking ? (
                  <div className="flex gap-1 items-center">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [8, 24, 8] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                        className="w-1 bg-neo-lilac rounded-full"
                      />
                    ))}
                  </div>
                ) : (
                  <Volume2 className={`w-10 h-10 ${isDarkMode ? 'text-white' : 'text-black'}`} />
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : (isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black')}`}
                title={isMuted ? "Ativar microfone" : "Desativar microfone"}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button
                onClick={stopLive}
                className="px-8 py-4 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all shadow-lg"
              >
                Encerrar Conversa
              </button>
            </div>
            
            <p className={`text-sm font-medium animate-pulse ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isSpeaking ? "NEO está falando..." : "Ouvindo você..."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="start-ui"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={startLive}
              disabled={isConnecting}
              className={`group relative flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white transition-all shadow-xl overflow-hidden ${isConnecting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            >
              <div className="absolute inset-0 neo-gradient" />
              <div className="relative z-10 flex items-center gap-3">
                {isConnecting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Mic className="w-6 h-6 group-hover:animate-pulse" />
                )}
                <span>{isConnecting ? "Conectando..." : "Iniciar Conversa por Voz"}</span>
              </div>
            </button>
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            <p className={`text-xs text-center max-w-[250px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Converse em tempo real com o NEO usando sua voz.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
