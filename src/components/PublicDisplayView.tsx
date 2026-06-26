import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Landmark, Monitor, Sparkles, FileText, BadgeAlert, AlertCircle } from 'lucide-react';
import { Ticket, Counter } from '../types';

interface PublicDisplayViewProps {
  tickets: Ticket[];
  counters: Counter[];
  lastCalledTicket: Ticket | null;
  triggerAnnounceId: string | null; // changes when a call/recall happens
}

export default function PublicDisplayView({
  tickets,
  counters,
  lastCalledTicket,
  triggerAnnounceId,
}: PublicDisplayViewProps) {
  const [muted, setMuted] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const lastAnnouncedRef = useRef<string | null>(null);

  // Filter out currently called tickets (status 'called')
  const calledTickets = tickets
    .filter(t => t.status === 'called')
    .sort((a, b) => {
      const timeA = a.calledAt ? new Date(`1970-01-01T${a.calledAt}`).getTime() : 0;
      const timeB = b.calledAt ? new Date(`1970-01-01T${b.calledAt}`).getTime() : 0;
      return timeB - timeA; // newest called first
    });

  // Main banner called ticket (newest called)
  const currentMainTicket = calledTickets[0] || null;
  const currentMainCounter = currentMainTicket
    ? counters.find(c => c.id === currentMainTicket.counterId)
    : null;

  // History list of other active/recent called tickets (excluding the very main one)
  const calledHistory = calledTickets.slice(1, 5);

  // Trigger sound chime & Text To Speech on new triggerAnnounceId
  useEffect(() => {
    if (triggerAnnounceId && lastCalledTicket) {
      // Trigger visual flashing
      setFlashActive(true);
      const timer = setTimeout(() => setFlashActive(false), 4000);

      // Play audio announcement if not muted
      if (!muted) {
        speakTicketAnnouncement(lastCalledTicket);
      }

      return () => clearTimeout(timer);
    }
  }, [triggerAnnounceId]);

  const speakTicketAnnouncement = (ticket: Ticket) => {
    const counter = counters.find(c => c.id === ticket.counterId);
    if (!counter) return;

    // 1. Play Electronic Ding Dong
    playDigitalChime();

    // 2. Speak via Web Speech Synthesis (TTS) after a short delay
    setTimeout(() => {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel(); // cancel current speech

          const ticketLetters = ticket.number.split('').join(' '); // C - 0 - 3 -> "C cero tres"
          const textToSpeak = `Atención. Turno, ${ticketLetters}. Dirigirse a Ventanilla ${counter.id}.`;
          
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = 'es-CL'; // Chilean spanish
          utterance.rate = 0.95; // slightly slower for clarity
          utterance.pitch = 1.0;

          // Find a Spanish voice if available
          const voices = window.speechSynthesis.getVoices();
          const spanishVoice = voices.find(voice => voice.lang.includes('es'));
          if (spanishVoice) {
            utterance.voice = spanishVoice;
          }

          window.speechSynthesis.speak(utterance);
        }
      } catch (e) {
        console.error('Speech synthesis failed', e);
      }
    }, 600);
  };

  const playDigitalChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Standard pleasant airport chime: E5 -> G5 -> C6
      playTone(659.25, 0, 0.4);      // E5
      playTone(783.99, 0.15, 0.4);   // G5
      playTone(1046.50, 0.3, 0.6);   // C6
    } catch (e) {
      // AudioContext blocked
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-2 space-y-6" id="public-screen-container">
      {/* Top Warning/Status Row */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 text-slate-300 px-5 py-3 rounded-xl shadow" id="public-top-ticker">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
          <span className="text-xs uppercase font-bold tracking-widest text-[#00a8e8] font-mono">PANTALLA DE SALA EN TIEMPO REAL</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-400">Hora local: {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          <button
            onClick={() => setMuted(!muted)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs text-slate-300 font-semibold cursor-pointer border border-slate-700 transition-colors"
          >
            {muted ? (
              <>
                <VolumeX size={14} className="text-red-400" />
                <span>Audio Desactivado</span>
              </>
            ) : (
              <>
                <Volume2 size={14} className="text-emerald-400" />
                <span>Audio Activado</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Massive Call, Right is History and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left 8 Columns: Massive Active Called Turn */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-slate-950 text-white rounded-2xl border-2 border-slate-800 p-8 shadow-2xl relative overflow-hidden min-h-[500px]" id="public-led-board">
          
          {/* Subtle grid lines background to resemble actual LED screens */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.1)_1px,transparent_1px)] bg-[size:4px_4px] pointer-events-none"></div>

          {/* Glowing neon background elements */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Border Glow Flash Alert */}
          {flashActive && (
            <div className="absolute inset-0 border-4 border-amber-500 animate-pulse pointer-events-none rounded-2xl shadow-[inset_0_0_20px_rgba(245,158,11,0.4)]"></div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <Landmark className="text-[#00a8e8]" size={28} />
              <div>
                <h1 className="text-lg font-black tracking-widest font-mono">SERVICIOS DE ADUANAS</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Control de Pasajeros y Declaraciones</p>
              </div>
            </div>
            <span className="text-xs uppercase tracking-widest font-bold px-3 py-1 bg-red-600 rounded text-white font-mono">
              Llamado Activo
            </span>
          </div>

          {/* Massive Central Turn indicator */}
          <div className="my-auto py-8 text-center space-y-4 relative z-10" id="main-turn-billboard">
            <AnimatePresence mode="wait">
              {currentMainTicket ? (
                <motion.div
                  key={currentMainTicket.id + '-' + triggerAnnounceId}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.05, opacity: 0 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="text-slate-400 font-mono text-sm tracking-[0.3em] uppercase block mb-1">TURNO</span>
                    <h2 className="text-9xl md:text-[10rem] font-black font-mono tracking-tighter text-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.2)] animate-pulse">
                      {currentMainTicket.number}
                    </h2>
                  </div>

                  <div className="inline-block h-6 w-12 bg-slate-800 rounded-full mx-auto relative">
                    <div className="absolute inset-1 bg-amber-400/20 rounded-full blur-[2px]"></div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-slate-400 font-mono text-sm tracking-[0.3em] uppercase block">DIRIGIRSE A</span>
                    <h3 className="text-5xl md:text-6xl font-extrabold text-[#00a8e8] tracking-tight">
                      {currentMainCounter ? currentMainCounter.name : 'Ventanilla'}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                      {currentMainCounter ? `Agente: ${currentMainCounter.agentName}` : ''}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-billboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 py-12"
                >
                  <Monitor size={64} className="text-slate-700 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-slate-400">Esperando Llamado</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                      Por favor, tome asiento y espere a que su número aparezca resaltado en esta pantalla.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Scrolling News Ticker */}
          <div className="border-t border-slate-900 pt-4 mt-4 text-xs font-mono text-slate-400 overflow-hidden relative z-10 w-full" id="led-ticker-container">
            <div className="whitespace-nowrap flex gap-12 animate-[marquee_25s_linear_infinite]" id="led-ticker">
              <span>🇨🇱 ADUANA DE CHILE: Declare todo producto vegetal o animal para evitar demoras y multas al ingresar al país.</span>
              <span>⚠️ ATENCIÓN: Tenga a mano su pasaporte, cédula de identidad y ticket impreso por el tótem.</span>
              <span>ℹ️ VIAJEROS PREFERENCIALES: El sistema otorga prioridad automática a adultos mayores y embarazadas.</span>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: History & Information Carousel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Recent Calls Grid */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 shadow-xl flex-1 flex flex-col" id="public-history-card">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest font-mono border-b border-slate-800 pb-3 mb-4">
              Llamados Recientes
            </h3>

            <div className="space-y-3 flex-1 flex flex-col justify-start">
              {calledHistory.length > 0 ? (
                calledHistory.map((t, index) => {
                  const cnt = counters.find(c => c.id === t.counterId);
                  return (
                    <div
                      key={t.id}
                      className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between font-mono hover:bg-slate-950 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-2xl font-bold text-slate-200">{t.number}</span>
                        <span className={`block text-[9px] font-bold uppercase px-1 py-0.2 w-max rounded ${
                          t.type === 'preferencial' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {t.type}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-md font-extrabold text-[#00a8e8]">{cnt ? cnt.name : `Ventanilla ${t.counterId}`}</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">Llamado: {t.calledAt}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 my-auto text-center text-slate-600 text-xs italic border border-dashed border-slate-800 rounded-xl">
                  No hay historial de llamados.
                </div>
              )}
            </div>
          </div>

          {/* Customs declaration rules information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg space-y-4" id="customs-rules-box">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BadgeAlert className="text-amber-500" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">Información de Declaración</h3>
            </div>
            
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded font-bold text-[10px]">OK</div>
                <p>Efectos de uso personal, equipajes y regalos que no excedan el monto libre de impuestos de USD 500.</p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="bg-amber-50 text-amber-600 p-1.5 rounded font-bold text-[10px]">DECLARACIÓN</div>
                <p>Comida, semillas, plantas, maderas o artesanías rústicas deben declararse ante el SAG aduanero.</p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="bg-rose-50 text-rose-600 p-1.5 rounded font-bold text-[10px]">PROHIBIDO</div>
                <p>Armas de fuego, material pornográfico ofensivo, químicos peligrosos y falsificaciones de marcas comerciales.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg text-[10px] text-slate-500 flex items-center gap-1.5">
              <AlertCircle size={12} className="text-[#002366] shrink-0" />
              <span>Para consultas, pregunte al personal de chaleco azul.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
