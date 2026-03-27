/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Globe, MessageSquare, X, Send, ChevronRight, Play, BarChart3, Zap, Users, MapPin, LogIn, LogOut, Sparkles, Menu, Linkedin, Instagram, Youtube, ChevronUp, Sun, Moon, User, Star, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'react-qr-code';
import { LGPDConsent } from './components/LGPDConsent';
import { getNeoResponse } from './services/geminiService';
import { auth, db, signInWithGoogle, logout, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const GeminiIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="currentColor" />
  </svg>
);

export default function App() {
  const [user] = useAuthState(auth);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from Firestore
  useEffect(() => {
    if (!user) {
      setMessages([{ role: 'model', text: 'Olá! Eu sou o NEO, seu assistente inteligente da NEOOH. Por favor, faça login para salvar seu histórico e conversar comigo!' }]);
      return;
    }

    const q = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => ({
        role: doc.data().role as 'user' | 'model',
        text: doc.data().text as string
      }));
      
      if (loadedMessages.length === 0) {
        setMessages([{ role: 'model', text: `Olá ${user.displayName}! Eu sou o NEO. Como posso ajudar você hoje?` }]);
      } else {
        setMessages(loadedMessages);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage = input;
    setInput('');
    
    // Save user message to Firestore
    await addDoc(collection(db, 'chats'), {
      text: userMessage,
      role: 'user',
      userId: user.uid,
      createdAt: serverTimestamp()
    });

    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getNeoResponse(userMessage, history);
    
    // Save model response to Firestore
    await addDoc(collection(db, 'chats'), {
      text: response,
      role: 'model',
      userId: user.uid,
      createdAt: serverTimestamp()
    });

    setIsLoading(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} selection:bg-neo-pink selection:text-white`}>
      {/* SEO Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "NEOOH",
          "url": "https://neooh.com.br",
          "logo": "https://ais-pre-gkhqvabus2jvd4kze2rbjg-311133247024.us-east1.run.app/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+55-11-3074-1234",
            "contactType": "customer service",
            "email": "contato@neooh.com.br",
            "areaServed": "BR",
            "availableLanguage": "Portuguese"
          },
          "sameAs": [
            "https://www.linkedin.com/company/neooh/",
            "https://www.instagram.com/neooh.phygital/",
            "https://www.youtube.com/@neooh.phygital"
          ]
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "NEOOH",
          "image": "https://ais-pre-gkhqvabus2jvd4kze2rbjg-311133247024.us-east1.run.app/hero-bg.jpg",
          "@id": "https://neooh.com.br",
          "url": "https://neooh.com.br",
          "telephone": "+55-11-3074-1234",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Av. Brg. Faria Lima, 3477",
            "addressLocality": "São Paulo",
            "addressRegion": "SP",
            "postalCode": "04538-133",
            "addressCountry": "BR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": -23.585,
            "longitude": -46.685
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday"
            ],
            "opens": "09:00",
            "closes": "18:00"
          }
        })}
      </script>
      {/* Navbar */}
      <nav aria-label="Navegação Principal" className={`fixed top-0 w-full z-50 px-4 md:px-6 py-4 flex justify-between items-center transition-all ${isDarkMode ? 'glass-morphism' : 'bg-white/80 backdrop-blur-2xl border-b border-black/5'}`}>
        <a href="#contato" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex items-center">
            <span className={`text-xl md:text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-black'}`}>NEOOH</span>
            <div className="mx-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-neo-purple flex items-center justify-center overflow-hidden border border-white/10">
              <GeminiIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className={`text-xl md:text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-black'}`}>TERRA</span>
          </div>
        </a>

        {/* Desktop Menu - Now visible on Tablet (md) */}
        <div className={`hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
          <a href="#solucoes" className="hover:text-neo-lilac transition-colors">Soluções</a>
          <a href="#tecnologia" className="hover:text-neo-lilac transition-colors">Tecnologia</a>
          <a href="#showroom" className="hover:text-neo-lilac transition-colors">Showroom</a>
          <a href="#cases" className="hover:text-neo-lilac transition-colors">Cases</a>
          <a href="#contato" className="hover:text-neo-lilac transition-colors">Contato</a>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-black/5 text-gray-600 hover:bg-black/10'}`}
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
            aria-label={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-white/20" />
                <button onClick={logout} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} hover:text-neo-pink transition-colors`} aria-label="Sair da conta">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={signInWithGoogle} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/5 text-black hover:bg-black/10'}`}>
                <LogIn className="w-4 h-4" /> Login
              </button>
            )}
          </div>
          
          <a href="#anuncie" className={`px-4 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-tighter transition-all ${isDarkMode ? 'bg-white text-black hover:bg-neo-pink hover:text-white' : 'bg-black text-white hover:bg-neo-pink'}`}>
            Anuncie Agora
          </a>

          {/* Mobile Menu Toggle - Now hidden on Tablet (md) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/5'}`}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className={`fixed inset-0 z-[60] flex flex-col p-8 lg:hidden transition-all ${isDarkMode ? 'bg-black' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center">
                  <span className={`text-xl md:text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-black'}`}>NEOOH</span>
                  <div className="mx-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-neo-purple flex items-center justify-center overflow-hidden border border-white/10">
                    <GeminiIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <span className={`text-xl md:text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-black'}`}>TERRA</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className={`p-2 ${isDarkMode ? 'text-white' : 'text-black'}`} aria-label="Fechar menu mobile">
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <nav aria-label="Menu Mobile" className={`flex flex-col gap-8 text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {[
                  { label: 'Soluções', href: '#solucoes' },
                  { label: 'Tecnologia', href: '#tecnologia' },
                  { label: 'Showroom', href: '#showroom' },
                  { label: 'Cases', href: '#cases' },
                  { label: 'Contato', href: '#contato' }
                ].map((link, i) => (
                  <motion.a
                    key={i}
                    href={link.href}
                    onClick={() => {
                      // Aguarda um pequeno instante para que a animação de scroll inicie suavemente antes de fechar
                      setTimeout(() => {
                        setIsMobileMenuOpen(false);
                      }, 150);
                    }}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.05), duration: 0.4, ease: "easeOut" }}
                    className="hover:text-neo-pink transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              <div className={`mt-auto pt-8 border-t flex flex-col gap-4 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full border border-white/20" />
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{user.displayName}</span>
                    </div>
                    <button onClick={logout} className={`p-3 rounded-full ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`} aria-label="Sair da conta">
                      <LogOut className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      signInWithGoogle();
                      setIsMobileMenuOpen(false);
                    }} 
                    className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/5 text-black hover:bg-black/10'}`}
                  >
                    <LogIn className="w-6 h-6" /> Login com Google
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
      {/* Hero Section */}
      <section id="hero" aria-label="Introdução" className={`relative h-screen flex flex-col justify-center items-center px-6 overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="absolute inset-0 z-0">
          {/* Overlays for depth, glow and color tint */}
          <div className={`absolute inset-0 z-10 ${isDarkMode ? 'bg-gradient-to-b from-black/60 via-transparent to-black' : 'bg-gradient-to-b from-white/30 via-transparent to-white/60'}`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2)_0%,transparent_70%)] z-[5] animate-pulse" />
          <div className={`absolute inset-0 z-[6] mix-blend-overlay ${isDarkMode ? 'bg-gradient-to-tr from-blue-900/20 via-transparent to-purple-900/20' : 'bg-gradient-to-tr from-blue-100/10 via-transparent to-purple-100/10'}`} />
          
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className={`w-full h-full object-cover scale-105 transition-opacity duration-500 ${isDarkMode ? 'opacity-40' : 'opacity-50'}`}
          >
            <source src="https://neooh.com.br/wp-content/uploads/2026/02/REEL-HORIZONTAL-30S-720-2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-20 text-center max-w-4xl"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className={`text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}
          >
            O FUTURO DA <span className="neo-text-gradient">MÍDIA</span> É AGORA.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className={`text-lg md:text-2xl mb-10 font-light max-w-2xl mx-auto px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Conectamos marcas ao público em movimento através da maior rede de Digital Out of Home do Brasil.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <a href="#sobre-nos" className="neo-gradient hover:opacity-90 text-white px-10 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2">
              CONHEÇA A EQUIPE <ChevronRight className="w-5 h-5" />
            </a>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-1 h-12 rounded-full bg-gradient-to-b from-neo-lilac to-transparent" />
        </div>
      </section>

      {/* Stats Section (Soluções) */}
      <section id="solucoes" aria-label="Soluções e Estatísticas" className={`py-24 px-6 transition-colors duration-500 ${isDarkMode ? 'bg-zinc-950' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { label: 'Telas Digitais', value: '15.000+', icon: <BarChart3 className="w-6 h-6 text-neo-lilac" /> },
            { label: 'Cidades', value: '120+', icon: <MapPin className="w-6 h-6 text-neo-lilac" /> },
            { label: 'Impactos Mensais', value: '800M+', icon: <Users className="w-6 h-6 text-neo-lilac" /> },
            { label: 'Engajamento AI', value: '100%', icon: <Zap className="w-6 h-6 text-neo-lilac" /> },
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`mb-4 p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                {stat.icon}
              </div>
              <span className={`text-4xl md:text-5xl font-black tracking-tighter mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>{stat.value}</span>
              <span className={`text-sm uppercase tracking-widest font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section (Tecnologia) */}
      <section id="tecnologia" aria-label="Tecnologia" className={`py-20 md:py-32 px-6 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className={`text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
                TECNOLOGIA QUE <br /> <span className="neo-text-gradient">TRANSFORMA</span> ESPAÇOS.
              </h2>
              <p className={`text-lg md:text-xl mb-12 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Nossa infraestrutura utiliza inteligência artificial para segmentar audiências em tempo real, garantindo que sua mensagem chegue à pessoa certa, no momento certo.
              </p>
              <div className="space-y-6">
                {[
                  'Métricas de audiência em tempo real',
                  'Segmentação por geolocalização',
                  'Integração com dados mobile',
                  'Conteúdo dinâmico e interativo'
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-2 h-2 rounded-full bg-neo-lilac" />
                    <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className={`aspect-square rounded-3xl overflow-hidden border relative group ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                <img 
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800" 
                  alt="Tech Interface" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-neo-purple/20 mix-blend-overlay" />
              </div>
              {/* Floating Element */}
              <div className={`absolute -bottom-10 -left-10 p-8 rounded-3xl border max-w-xs hidden md:block transition-all ${isDarkMode ? 'glass-morphism border-white/10' : 'bg-white/90 backdrop-blur-xl border-black/10 shadow-xl'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-neo-purple flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full bg-neo-lilac animate-ping opacity-30" />
                    <GeminiIcon className="w-6 h-6 text-white relative z-10" />
                  </div>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>NEO AI Ativo</span>
                </div>
                <p className={`text-sm text-justify ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fale com o nosso Especialista em OOH e DOOH, o NEO. Clique no ícone do Agente à sua direita e descubra o poder da Mídia Inteligente.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Showroom Section */}
      <section id="showroom" aria-label="Showroom" className={`py-32 px-6 transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className={`text-5xl font-black tracking-tighter mb-4 uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>NOSSO <span className="neo-text-gradient">SHOWROOM</span></h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>Explore nossa presença nos principais pontos de fluxo do Brasil, com tecnologia de ponta e impacto garantido.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Aeroportos",
                desc: "Presença estratégica nos maiores hubs aéreos do país, impactando um público qualificado.",
                image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=800",
                icon: <Zap className="w-5 h-5" />
              },
              {
                title: "Terminais Marítimos",
                desc: "Presença estratégica nos principais portos e terminais marítimos, conectando marcas a milhões de passageiros e turistas.",
                image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800",
                icon: <Zap className="w-5 h-5" />
              },
              {
                title: "Terminais Rodoviários & Urbanos",
                desc: "Estamos presentes em mais de 50 Terminais Rodoviários e 80 Terminais Urbanos, incluindo o Terminal Tietê em São Paulo.",
                image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
                icon: <Zap className="w-5 h-5" />
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(233, 30, 140, 0.2)" }}
                className={`group relative overflow-hidden rounded-3xl border aspect-[4/5] transition-all duration-300 ${isDarkMode ? 'border-white/10' : 'border-black/10 shadow-lg'}`}
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-neo-purple/80 flex items-center justify-center backdrop-blur-sm">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <section id="cases" aria-label="Cases de Sucesso" className={`py-32 px-6 transition-colors duration-500 ${isDarkMode ? 'bg-zinc-900/50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className={`text-5xl font-black tracking-tighter mb-4 uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>CASES DE <span className="neo-text-gradient">SUCESSO</span></h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>Confira o que nossos parceiros dizem sobre a revolução digital da NEOOH.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Ricardo Almeida",
                company: "Retail Group",
                comment: "A NEOOH transformou nossa presença nos aeroportos. O engajamento aumentou em 40% com as telas interativas.",
                stars: 5,
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
                alt: "Depoimento de Ricardo Almeida da Retail Group sobre NEOOH"
              },
              {
                name: "Juliana Costa",
                company: "Tech Solutions",
                comment: "O Agente NEO facilitou muito a nossa compra de mídia. Tecnologia de ponta e resultados reais.",
                stars: 5,
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
                alt: "Depoimento de Juliana Costa da Tech Solutions sobre NEOOH"
              },
              {
                name: "Marcos Silva",
                company: "Auto Brasil",
                comment: "Excelente segmentação. Conseguimos atingir nosso público-alvo com precisão cirúrgica.",
                stars: 4,
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
                alt: "Depoimento de Marcos Silva da Auto Brasil sobre NEOOH"
              }
            ].map((item, i) => (
              <motion.article 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className={`p-8 rounded-3xl border flex flex-col h-full transition-all ${isDarkMode ? 'glass-morphism border-white/10' : 'bg-gray-50 border-black/5 shadow-sm'}`}
              >
                <div className="flex gap-1 mb-4" aria-label={`${item.stars} de 5 estrelas`}>
                  {[...Array(5)].map((_, starIdx) => (
                    <Zap 
                      key={starIdx} 
                      className={`w-4 h-4 ${starIdx < item.stars ? 'text-neo-pink fill-neo-pink' : (isDarkMode ? 'text-gray-600' : 'text-gray-300')}`} 
                    />
                  ))}
                </div>
                <blockquote className={`italic mb-8 flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  "{item.comment}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.alt} className="w-12 h-12 rounded-full border border-neo-lilac/30" referrerPolicy="no-referrer" loading="lazy" />
                  <footer>
                    <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>{item.name}</h4>
                    <p className="text-xs text-neo-lilac uppercase tracking-widest">{item.company}</p>
                  </footer>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section (Contato) */}
      <section id="contato" aria-label="Onde Estamos" className={`py-32 px-6 transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-5xl font-black tracking-tighter mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>ONDE ESTAMOS</h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Visite nossa sede em São Paulo</p>
          </div>
          <div className={`rounded-3xl overflow-hidden h-[500px] border shadow-2xl relative group ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.123456789!2d-46.685!3d-23.595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5744f1234567%3A0x123456789abcdef!2sNEOOH!5e0!3m2!1spt-BR!2sbr!4v1234567890123" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização da NEOOH em São Paulo"
            ></iframe>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <a 
                href="https://maps.google.com/?q=Av.+Brg.+Faria+Lima,+3477+-+Itaim+Bibi,+São+Paulo+-+SP" 
                target="_blank" 
                rel="noopener noreferrer"
                className="pointer-events-auto bg-neo-purple text-white px-6 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Ver no Google Maps
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className={`p-8 rounded-3xl border ${isDarkMode ? 'glass-morphism border-white/10' : 'bg-gray-50 border-black/5'}`}>
              <MapPin className="w-8 h-8 text-neo-lilac mx-auto mb-4" />
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Endereço</h4>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Av. Brg. Faria Lima, 3477 - Itaim Bibi, São Paulo - SP</p>
            </div>
            <div className={`p-8 rounded-3xl border ${isDarkMode ? 'glass-morphism border-white/10' : 'bg-gray-50 border-black/5'}`}>
              <Users className="w-8 h-8 text-neo-lilac mx-auto mb-4" />
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Contato</h4>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>contato@neooh.com.br<br/>+55 (11) 3074-1234</p>
            </div>
            <div className={`p-8 rounded-3xl border ${isDarkMode ? 'glass-morphism border-white/10' : 'bg-gray-50 border-black/5'}`}>
              <Zap className="w-8 h-8 text-neo-lilac mx-auto mb-4" />
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Horário</h4>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Segunda - Sexta<br/>09:00 - 18:00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Form Section */}
      <section id="anuncie" aria-label="Anuncie Agora" className={`py-20 md:py-32 px-6 transition-colors duration-500 ${isDarkMode ? 'bg-zinc-950' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>ANUNCIE <span className="neo-text-gradient">AGORA</span></h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Preencha os dados abaixo e nossa equipe entrará em contato.</p>
          </div>
          <form aria-label="Formulário de Contato" className={`space-y-6 p-6 md:p-10 rounded-3xl border shadow-2xl transition-all ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white border-black/5'}`} onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="nome" className={`text-xs font-bold uppercase tracking-widest ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nome</label>
                <input 
                  id="nome"
                  type="text" 
                  placeholder="Seu nome completo" 
                  className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-neo-lilac transition-colors ${isDarkMode ? 'bg-zinc-900/50 border-white/10 text-white' : 'bg-gray-50 border-black/10 text-black'}`}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className={`text-xs font-bold uppercase tracking-widest ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>E-mail</label>
                <input 
                  id="email"
                  type="email" 
                  placeholder="seu@email.com" 
                  className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-neo-lilac transition-colors ${isDarkMode ? 'bg-zinc-900/50 border-white/10 text-white' : 'bg-gray-50 border-black/10 text-black'}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="whatsapp" className={`text-xs font-bold uppercase tracking-widest ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>WhatsApp</label>
              <input 
                id="whatsapp"
                type="tel" 
                placeholder="(00) 00000-0000" 
                className={`w-full border rounded-2xl px-6 py-4 focus:outline-none focus:border-neo-lilac transition-colors ${isDarkMode ? 'bg-zinc-900/50 border-white/10 text-white' : 'bg-gray-50 border-black/10 text-black'}`}
              />
            </div>
            <button type="submit" className="w-full neo-gradient py-5 rounded-2xl font-black text-xl uppercase tracking-widest hover:opacity-90 transition-all shadow-xl text-white">
              Enviar
            </button>
          </form>
        </div>
      </section>

      {/* Sobre Nós Section (Team) */}
      <section id="sobre-nos" aria-label="Sobre Nós" className={`py-32 px-6 transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className={`text-5xl font-black tracking-tighter mb-4 uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>GRUPO <span className="neo-text-gradient">TERRA</span></h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>Conheça a equipe de desenvolvedores por trás da inovação.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                name: "Eduardo Oliveira",
                role: "Desenvolvedor de IA",
                linkedin: "https://www.linkedin.com/in/FirminoEduardo",
                image: "/eduardo.jpeg"
              },
              {
                name: "Fernando Galvão",
                role: "Desenvolvedor de IA e Back-end",
                linkedin: "https://www.linkedin.com/in/fernandocsgalvao",
                image: "/fernando.jpeg"
              },
              {
                name: "Marcus Simões",
                role: "Tech Lead, Engenheiro de Software",
                linkedin: "https://www.linkedin.com/in/marcussimoes/",
                image: "/marcus.jpeg"
              },
              {
                name: "Jonathan Gomes",
                role: "Dados e Pesquisa",
                linkedin: "https://www.linkedin.com/in/jonathan-gomes-0a7993134/",
                image: "/jonathan.jpeg"
              },
              {
                name: "Rafaela Barezi",
                role: "Dados e Pesquisa",
                linkedin: "https://www.linkedin.com/in/rafaela-barezi/",
                image: "/rafaela.jpeg"
              }
            ].map((member, i) => (
              <motion.a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="neo-gradient p-8 rounded-3xl flex flex-col items-center text-center shadow-xl border border-white/10 relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/30 shadow-inner overflow-hidden">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-sm text-white/80 font-medium mb-4">{member.role}</p>
                <div className="mt-auto flex gap-3 justify-center relative">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#0077B5] transition-colors">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    {member.name === "Marcus Simões" ? (
                      <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors group/qr">
                    <QrCode className="w-5 h-5 text-white" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover/qr:opacity-100 transition-opacity pointer-events-none bg-white p-2 rounded-xl shadow-2xl z-50">
                      <QRCode value={member.linkedin} size={120} />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      </main>
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className={`py-20 px-6 border-t transition-colors duration-500 ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-black/5'}`}
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center mb-8">
              <span className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-black'}`}>NEOOH</span>
              <div className="mx-2 w-8 h-8 rounded-full bg-neo-purple flex items-center justify-center overflow-hidden">
                <GeminiIcon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-black'}`}>TERRA</span>
            </div>
            <p className={`max-w-sm mb-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              Líder em inovação e tecnologia para mídia Out of Home. Conectando pessoas e marcas através de experiências digitais únicas.
            </p>
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/company/neooh/" target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer group ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-[#0077B5]' : 'bg-gray-100 border-black/5 hover:bg-[#0077B5]'}`} aria-label="LinkedIn da NEOOH">
                <Linkedin className={`w-5 h-5 group-hover:text-white transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </a>
              <a href="https://www.instagram.com/neooh.phygital/" target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer group ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-[#E4405F]' : 'bg-gray-100 border-black/5 hover:bg-[#E4405F]'}`} aria-label="Instagram da NEOOH">
                <Instagram className={`w-5 h-5 group-hover:text-white transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </a>
              <a href="https://www.youtube.com/@neooh.phygital" target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer group ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-[#FF0000]' : 'bg-gray-100 border-black/5 hover:bg-[#FF0000]'}`} aria-label="YouTube da NEOOH">
                <Youtube className={`w-5 h-5 group-hover:text-white transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </a>
              <a href="https://soulcode.com" target="_blank" rel="noopener noreferrer" className="h-10 flex items-center justify-center transition-opacity hover:opacity-80" title="SoulCode">
                <img _ngcontent-ng-c3764693655="" src="https://soulcode.com/assets/logos/logo-soulcode.png" alt="SoulCode" className="h-full w-auto" />
              </a>
              <a href="https://martechacademy.com.br" target="_blank" rel="noopener noreferrer" className="h-10 flex items-center justify-center transition-opacity hover:opacity-80" title="Martech Academy">
                <img src="https://martechacademy.com.br/assets/images/logos/logo_a.png" width="200px" alt="Martech Academy" className={`h-full w-auto transition-all ${isDarkMode ? '' : 'invert brightness-0'}`} />
              </a>
            </div>
          </div>
          <div>
            <h4 className={`font-bold mb-6 uppercase tracking-widest text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Empresa</h4>
            <ul className={`space-y-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              <li><a href="#sobre-nos" className="hover:text-neo-lilac transition-colors">Sobre Nós</a></li>
              <li><a href="#roadmap" className="hover:text-neo-lilac transition-colors">Roadmap</a></li>
              <li><a href="#" className="hover:text-neo-lilac transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-neo-lilac transition-colors">Imprensa</a></li>
              <li><a href="#" className="hover:text-neo-lilac transition-colors">Sustentabilidade</a></li>
            </ul>
          </div>
          <div>
            <h4 className={`font-bold mb-6 uppercase tracking-widest text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>Suporte</h4>
            <ul className={`space-y-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              <li><a href="#" className="hover:text-neo-lilac transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-neo-lilac transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-neo-lilac transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-neo-lilac transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>
        <div className={`max-w-7xl mx-auto mt-20 pt-8 border-t text-center text-sm ${isDarkMode ? 'border-white/5 text-gray-600' : 'border-black/5 text-gray-400'}`}>
          © 2026 NEOOH - TERRA. Todos os direitos reservados. Powered by NEOOH - TERRA.
        </div>
      </motion.footer>

      {/* Floating Actions */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 items-end">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              onClick={scrollToTop}
              className={`w-12 h-12 backdrop-blur-xl border rounded-full flex items-center justify-center shadow-xl hover:bg-neo-purple transition-all group ${isDarkMode ? 'bg-zinc-900/80 border-white/10' : 'bg-white/80 border-black/10'}`}
              title="Voltar ao topo"
              aria-label="Voltar ao topo"
            >
              <ChevronUp className={`w-6 h-6 group-hover:scale-110 transition-transform ${isDarkMode ? 'text-white' : 'text-black'}`} />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              id="chat-panel"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className={`mb-4 w-[calc(100vw-32px)] sm:w-[400px] h-[500px] rounded-3xl overflow-hidden flex flex-col shadow-2xl border transition-all ${isDarkMode ? 'chat-dark-bg border-white/10' : 'bg-white border-black/10'}`}
            >
              {/* Chat Header */}
              <div className="p-6 neo-gradient flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-black/20 flex items-center justify-center overflow-hidden border border-white/10 ${isLoading ? 'animate-pulse ring-2 ring-white/20' : ''}`}>
                    <GeminiIcon className={`w-8 h-8 text-white ${isLoading ? 'animate-spin-slow' : ''}`} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-none text-white">NEO</h3>
                    <span className="text-xs text-white/70">{isLoading ? 'Processando...' : 'Powered by NEOOH - TERRA AI'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-black/20 rounded-full transition-colors text-white"
                  aria-label="Fechar chat"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Chat Messages */}
              <div 
                className={`flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}
                aria-live="polite"
              >
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-neo-purple text-white rounded-tr-none' 
                        : (isDarkMode ? 'bg-zinc-900/80 text-gray-200 rounded-tl-none border border-white/5' : 'bg-white text-gray-800 rounded-tl-none border border-black/5')
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex flex-col gap-1">
                      <div className={`p-4 rounded-2xl rounded-tl-none border flex gap-1.5 items-center ${isDarkMode ? 'bg-zinc-900/80 border-white/5' : 'bg-white border-black/5'}`}>
                        <div className="w-2 h-2 bg-neo-lilac rounded-full animate-bounce [animation-duration:0.8s]" />
                        <div className="w-2 h-2 bg-neo-pink rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-neo-purple rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                      </div>
                      <span className="text-[10px] text-neo-lilac font-bold uppercase tracking-widest ml-1 animate-pulse">NEO está pensando...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className={`p-4 border-t flex flex-col gap-2 ${isDarkMode ? 'border-white/5 bg-black/40' : 'border-black/5 bg-white'}`}>
                {!user && (
                  <button 
                    onClick={signInWithGoogle}
                    className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all mb-2 ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}
                  >
                    Faça login para conversar
                  </button>
                )}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={input}
                    disabled={!user}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={user ? "Pergunte ao NEO..." : "Faça login primeiro"}
                    className={`flex-1 border rounded-full px-6 py-3 text-sm focus:outline-none focus:border-neo-lilac transition-colors disabled:opacity-50 ${isDarkMode ? 'bg-zinc-900/50 border-white/5 text-white placeholder:text-gray-600' : 'bg-gray-50 border-black/10 text-black placeholder:text-gray-400'}`}
                    aria-label="Mensagem para o chat"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !user}
                    className={`w-12 h-12 neo-gradient rounded-full flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 shadow-lg text-white ${isLoading ? 'scale-90 opacity-50' : 'active:scale-95'}`}
                    aria-label="Enviar mensagem"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 neo-gradient rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform relative group"
          aria-expanded={isChatOpen}
          aria-controls="chat-panel"
          aria-label={isChatOpen ? "Fechar chat" : "Abrir chat com NEO"}
        >
          <div className="absolute inset-0 rounded-full bg-neo-lilac animate-ping opacity-20 group-hover:opacity-40" />
          <GeminiIcon className="w-10 h-10 text-white relative z-10" />
        </button>
      </div>
      <LGPDConsent />
    </div>
  );
}
