import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Printer, Clock, HelpCircle, Shield, CheckCircle, FlameKindling, Globe, LifeBuoy } from 'lucide-react';
import { Ticket } from '../types';

interface TotemViewProps {
  onGenerateTicket: (identifier: string, type: 'general' | 'preferencial') => Ticket;
  lastGeneratedTicket: Ticket | null;
  waitingCount: number;
  onCallAssistance: () => void;
  assistanceActive: boolean;
}

const T = {
  es: {
    title: "Obtenga su turno de atención",
    subtitle: "Dispositivo de autoatención para control aduanero y trámites de ingreso/salida de pasajeros.",
    attentionType: "Tipo de Atención",
    general: "Atención General",
    generalDesc: "Trámites y declaraciones estándar",
    preferencial: "Preferencial",
    preferencialDesc: "Tercera edad, embarazadas, movilidad reducida",
    identifierLabel: "RUT o Pasaporte del Viajero",
    placeholder: "INGRESE RUT O PASAPORTE",
    helpExample: "Ej: 12.345.678-9 o número pasaporte",
    errorEmpty: "Por favor ingrese su RUT o Pasaporte para continuar.",
    errorInvalid: "Identificación inválida. Ingrese un RUT o Pasaporte válido.",
    keyboardTitle: "Teclado Táctil",
    clear: "LIMPIAR",
    backspace: "BORRAR",
    getTicket: "Obtener Turno",
    printing: "Imprimiendo Ticket...",
    online: "Tótem En Línea",
    currentWait: "Espera actual aproximada:",
    slotTitle: "Ranura Impresora de Turnos",
    slotPrompt: "Ingrese RUT/Pasaporte en el panel de la izquierda para emitir su ticket.",
    simulationTip: "Haga clic en Obtener Turno para ver la animación de impresión física y generar nuevos turnos correlativos.",
    customsHeader: "Servicio Nacional de Aduanas",
    regionalDir: "DIRECCIÓN REGIONAL METROPOLITANA",
    welcome: "¡Bienvenido a Chile!",
    ticketNumberLabel: "Su Número de Atención",
    estimatedTime: "Tiempo estimado:",
    minutes: "minutos",
    docLabel: "DOCUMENTO:",
    serviceTypeLabel: "TIPO SERVICIO:",
    dateTimeLabel: "FECHA & HORA:",
    assignedModuleLabel: "MÓDULO ASIGNADO:",
    hallScreen: "PANTALLA DE SALA",
    ticketInstructions1: "Espere en la sala de embarque.",
    ticketInstructions2: "Mire las pantallas públicas de llamados.",
    controlSystem: "SISTEMA ELECTRÓNICO DE CONTROL ADUANERO",
    tearOff: "DESPRENDER",
    assistanceBtn: "Solicitar Asistencia Presencial",
    assistanceActiveMsg: "Asistencia solicitada. Un funcionario se dirige a este tótem.",
    toggleKeyboard: "Alternar Teclado",
    numeric: "Teclado Numérico",
    alphabetic: "Teclado Pasaporte",
  },
  en: {
    title: "Get your service ticket",
    subtitle: "Self-service kiosk for customs control and passenger entry/exit procedures.",
    attentionType: "Attention Type",
    general: "General Service",
    generalDesc: "Standard procedures and declarations",
    preferencial: "Priority Service",
    preferencialDesc: "Seniors, pregnant women, reduced mobility",
    identifierLabel: "Traveler ID or Passport",
    placeholder: "ENTER ID OR PASSPORT",
    helpExample: "e.g., 12.345.678-9 or passport number",
    errorEmpty: "Please enter your ID or Passport to continue.",
    errorInvalid: "Invalid identification. Enter a valid ID or Passport.",
    keyboardTitle: "Touchscreen Keyboard",
    clear: "CLEAR",
    backspace: "BACKSPACE",
    getTicket: "Get Ticket",
    printing: "Printing Ticket...",
    online: "Kiosk Online",
    currentWait: "Current estimated wait:",
    slotTitle: "Ticket Printer Slot",
    slotPrompt: "Enter ID/Passport on the left panel to issue your ticket.",
    simulationTip: "Click Get Ticket to see the physical printing animation and generate new sequential tickets.",
    customsHeader: "National Customs Service",
    regionalDir: "METROPOLITAN REGIONAL DIRECTION",
    welcome: "Welcome to Chile!",
    ticketNumberLabel: "Your Queue Number",
    estimatedTime: "Estimated wait time:",
    minutes: "minutes",
    docLabel: "DOCUMENT:",
    serviceTypeLabel: "SERVICE TYPE:",
    dateTimeLabel: "DATE & TIME:",
    assignedModuleLabel: "ASSIGNED MODULE:",
    hallScreen: "HALL DISPLAY",
    ticketInstructions1: "Please wait in the boarding lounge.",
    ticketInstructions2: "Watch public announcement displays.",
    controlSystem: "ELECTRONIC CUSTOMS CONTROL SYSTEM",
    tearOff: "TEAR OFF",
    assistanceBtn: "Request Assistance",
    assistanceActiveMsg: "Assistance requested. An officer is coming to this kiosk.",
    toggleKeyboard: "Toggle Keyboard",
    numeric: "Numeric Keyboard",
    alphabetic: "Passport Keyboard",
  }
};

export default function TotemView({
  onGenerateTicket,
  lastGeneratedTicket,
  waitingCount,
  onCallAssistance,
  assistanceActive,
}: TotemViewProps) {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [identifier, setIdentifier] = useState('');
  const [attentionType, setAttentionType] = useState<'general' | 'preferencial'>('general');
  const [error, setError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState<'num' | 'alpha'>('num');
  
  const dict = T[lang];

  const [printedTicket, setPrintedTicket] = useState<Ticket | null>(
    // Default simulated ticket as requested: "Turno: C-03 / Tiempo estimado: 15 minutos"
    {
      id: 'default-sim',
      number: 'C-03',
      identifier: '12.345.678-9',
      type: 'general',
      status: 'waiting',
      createdAt: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      estimatedWaitMinutes: 15,
    }
  );

  // Helper for formatting Chilean RUT
  const formatRut = (value: string) => {
    const clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length <= 1) return clean;
    
    const hasManyLetters = /[A-Z]{2,}/.test(clean);
    if (hasManyLetters || clean.length > 9) {
      return clean.slice(0, 15);
    }

    const dv = clean.slice(-1);
    const nums = clean.slice(0, -1);
    
    let formatted = '';
    for (let i = nums.length - 1, j = 0; i >= 0; i--, j++) {
      if (j > 0 && j % 3 === 0) {
        formatted = '.' + formatted;
      }
      formatted = nums[i] + formatted;
    }
    
    return `${formatted}-${dv}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    
    // Clean to allow complete alphabet (A-Z) and numbers, plus dot and dash
    const cleanAlphanumeric = val.replace(/[^A-Z0-9.-]/g, '');
    
    // Check if it's purely a Chilean RUT format attempt
    const rawDigitsAndK = cleanAlphanumeric.replace(/[^0-9K]/g, '');
    const hasOtherLetters = /[A-JL-OQ-Z]/.test(cleanAlphanumeric);
    
    if (!hasOtherLetters && rawDigitsAndK.length <= 9) {
      setIdentifier(formatRut(cleanAlphanumeric));
    } else {
      // Passport mode - allow full abecedario/alphabet freely up to 15 chars
      setIdentifier(cleanAlphanumeric.slice(0, 15));
    }
    setError('');
  };

  const handleKeyboardClick = (char: string) => {
    setError('');
    if (char === 'BORRAR' || char === 'BACKSPACE') {
      setIdentifier(prev => prev.slice(0, -1));
    } else if (char === 'LIMPIAR' || char === 'CLEAR') {
      setIdentifier('');
    } else {
      if (identifier.length < 15) {
        const nextVal = identifier + char;
        const rawDigitsAndK = nextVal.replace(/[^0-9K]/g, '');
        const hasOtherLetters = /[A-JL-OQ-Z]/.test(nextVal.toUpperCase());
        
        if (!hasOtherLetters && rawDigitsAndK.length <= 9) {
          setIdentifier(formatRut(nextVal));
        } else {
          setIdentifier(nextVal.toUpperCase());
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId) {
      setError(dict.errorEmpty);
      return;
    }

    if (cleanId.length < 5) {
      setError(dict.errorInvalid);
      return;
    }

    setIsPrinting(true);
    setError('');

    playPrintChime();

    setTimeout(() => {
      const ticket = onGenerateTicket(cleanId, attentionType);
      setPrintedTicket(ticket);
      setIsPrinting(false);
      setIdentifier('');
    }, 1200);
  };

  const playPrintChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 2.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
      
      oscGain.gain.setValueAtTime(0.05, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start();
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Ignored if blocked
    }
  };

  const ALPHABET = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z'],
    ['X', 'C', 'V', 'B', 'N', 'M', '-', '.', '0', '1'],
    ['2', '3', '4', '5', '6', '7', '8', '9']
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto px-4 py-2" id="totem-container">
      
      {/* Kiosk Left Column: Instruction & Input */}
      <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden" id="totem-form-card">
        
        {/* Institutional Blue Top Bar with Language Selector */}
        <div className="bg-[#002366] text-white p-8 relative overflow-hidden" id="totem-banner-header">
          <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-6">
            <Shield size={160} className="text-white" />
          </div>

          <div className="flex justify-between items-center mb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 bg-red-500 rounded-full"></div>
              <span className="text-xs tracking-widest font-mono uppercase text-slate-300 font-bold">
                {lang === 'es' ? 'Aduana de Chile • Sistema de Turnos' : 'Chile Customs • Queue System'}
              </span>
            </div>

            {/* Language Switcher */}
            <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/10" id="language-switcher">
              <button
                type="button"
                onClick={() => setLang('es')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all uppercase flex items-center gap-1 cursor-pointer ${
                  lang === 'es' ? 'bg-white text-[#002366] shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Globe size={10} />
                <span>ES</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all uppercase flex items-center gap-1 cursor-pointer ${
                  lang === 'en' ? 'bg-white text-[#002366] shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Globe size={10} />
                <span>EN</span>
              </button>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-black tracking-tight font-display text-white mb-2" id="totem-main-title">
            {dict.title}
          </h2>
          <p className="text-slate-200 text-sm font-medium">
            {dict.subtitle}
          </p>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6" id="totem-interactive-form">
          
          {/* Attention Type Selection with font increased from 12px to 16px as requested! */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 block">
              {dict.attentionType}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAttentionType('general')}
                className={`py-4 px-4 rounded-xl border-3 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  attentionType === 'general'
                    ? 'border-[#002366] bg-slate-50 text-[#002366] font-black font-display shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white font-bold'
                }`}
                id="btn-select-general"
              >
                <span className="text-xl">{dict.general}</span>
                {/* Font size set to text-base (16px) instead of text-xs for accessibility! */}
                <span className="text-base text-slate-500 font-medium">
                  {dict.generalDesc}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAttentionType('preferencial')}
                className={`py-4 px-4 rounded-xl border-3 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  attentionType === 'preferencial'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black font-display shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white font-bold'
                }`}
                id="btn-select-preferencial"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{dict.preferencial}</span>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                {/* Font size set to text-base (16px) instead of text-xs for accessibility! */}
                <span className="text-base text-emerald-700 font-medium">
                  {dict.preferencialDesc}
                </span>
              </button>
            </div>
          </div>

          {/* Identifier Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="rut-input" className="text-xs font-black uppercase tracking-widest text-slate-500 block">
                {dict.identifierLabel}
              </label>
              <span className="text-xs text-slate-500 font-mono font-bold">
                {dict.helpExample}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <CreditCard size={20} />
              </div>
              <input
                id="rut-input"
                type="text"
                autoComplete="off"
                placeholder={dict.placeholder}
                value={identifier}
                onChange={handleInputChange}
                className="block w-full pl-12 pr-4 py-5 border-3 border-slate-200 rounded-xl focus:border-[#002366] focus:ring-0 bg-slate-50 text-2xl font-mono font-black text-slate-950 tracking-widest uppercase transition-colors placeholder:text-slate-300 placeholder:font-sans placeholder:text-sm"
              />
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1"
                id="totem-form-error"
              >
                <span>⚠️ {error}</span>
              </motion.p>
            )}
          </div>

          {/* On-Screen Keyboard switcher for complete passport alphabet / numpad */}
          <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 space-y-3" id="virtual-keyboard">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                {dict.keyboardTitle}
              </p>
              
              {/* Keyboard Switcher Buttons */}
              <div className="flex bg-slate-200 p-0.5 rounded-lg border border-slate-300 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setKeyboardMode('num')}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    keyboardMode === 'num' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {dict.numeric}
                </button>
                <button
                  type="button"
                  onClick={() => setKeyboardMode('alpha')}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    keyboardMode === 'alpha' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {dict.alphabetic}
                </button>
              </div>
            </div>

            {keyboardMode === 'num' ? (
              /* Numeric Keyboard Grid with RUT letters K & P and clear/delete controls */
              <div className="grid grid-cols-4 gap-2 animate-fadeIn">
                {['1', '2', '3', 'K'].map(char => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleKeyboardClick(char)}
                    className="py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-black border-2 border-slate-200 rounded-xl shadow-sm transition-all text-center text-lg active:scale-95 cursor-pointer"
                  >
                    {char}
                  </button>
                ))}
                {['4', '5', '6', 'P'].map(char => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleKeyboardClick(char)}
                    className="py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-black border-2 border-slate-200 rounded-xl shadow-sm transition-all text-center text-lg active:scale-95 cursor-pointer"
                  >
                    {char}
                  </button>
                ))}
                {['7', '8', '9', '0'].map(char => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleKeyboardClick(char)}
                    className="py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-black border-2 border-slate-200 rounded-xl shadow-sm transition-all text-center text-lg active:scale-95 cursor-pointer"
                  >
                    {char}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleKeyboardClick('LIMPIAR')}
                  className="col-span-2 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black border-2 border-rose-100 rounded-xl shadow-sm transition-all text-xs active:scale-95 cursor-pointer"
                >
                  {dict.clear}
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyboardClick('BORRAR')}
                  className="col-span-2 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black border-2 border-slate-300 rounded-xl shadow-sm transition-all text-xs active:scale-95 cursor-pointer"
                >
                  {dict.backspace}
                </button>
              </div>
            ) : (
              /* Passport Keyboard Layout: Full Alphabet A-Z allowing complete passport validation */
              <div className="space-y-1.5 animate-fadeIn">
                {ALPHABET.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1 justify-center">
                    {row.map(char => (
                      <button
                        key={char}
                        type="button"
                        onClick={() => handleKeyboardClick(char)}
                        className="flex-1 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold border border-slate-200 rounded-lg shadow-xs transition-all text-center text-sm active:scale-95 cursor-pointer"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                ))}
                <div className="flex gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => handleKeyboardClick('LIMPIAR')}
                    className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black border-2 border-rose-100 rounded-xl shadow-sm transition-all text-xs active:scale-95 cursor-pointer"
                  >
                    {dict.clear}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeyboardClick('BORRAR')}
                    className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black border-2 border-slate-300 rounded-xl shadow-sm transition-all text-xs active:scale-95 cursor-pointer"
                  >
                    {dict.backspace}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Large Blue Submit Button */}
          <button
            type="submit"
            disabled={isPrinting}
            className={`w-full py-4.5 px-6 rounded-xl font-black text-xl text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest ${
              isPrinting
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-[#002366] hover:bg-[#001740] hover:shadow-xl active:scale-[0.99]'
            }`}
            id="btn-obtener-turno"
          >
            {isPrinting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{dict.printing}</span>
              </>
            ) : (
              <>
                <Printer size={22} />
                <span>{dict.getTicket}</span>
              </>
            )}
          </button>
        </form>

        {/* Assistance Button & Indicator integrated perfectly */}
        <div className="p-4 mx-6 mb-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LifeBuoy className={`shrink-0 ${assistanceActive ? 'text-red-500 animate-spin' : 'text-blue-500'}`} size={20} />
            <div className="text-left">
              <p className="text-xs font-black text-slate-800">{lang === 'es' ? '¿Necesita ayuda?' : 'Need assistance?'}</p>
              <p className="text-[10px] text-slate-400 font-medium">
                {assistanceActive ? dict.assistanceActiveMsg : (lang === 'es' ? 'Presione el botón para alertar al supervisor.' : 'Press the button to alert the supervisor.')}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onCallAssistance}
            disabled={assistanceActive}
            className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              assistanceActive 
                ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white shadow active:scale-95'
            }`}
            id="totem-assistance-btn"
          >
            {dict.assistanceBtn}
          </button>
        </div>

        {/* Totem Footer Status Bar */}
        <div className="bg-slate-100 border-t border-slate-200 py-3 px-6 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{dict.online}</span>
          </div>
          <span>{dict.currentWait} <strong className="text-slate-700">{waitingCount * 4} min</strong></span>
        </div>
      </div>

      {/* Kiosk Right Column: Physical Ticket Simulator */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 self-start lg:self-center">
          {dict.slotTitle}
        </span>

        {/* Kiosk Ticket Slot Frame */}
        <div className="w-full max-w-sm bg-slate-800 p-4 pt-1 pb-6 rounded-2xl shadow-inner border-t-8 border-b-8 border-slate-700 flex flex-col items-center relative">
          {/* Simulated LED status light */}
          <div className="absolute top-2 left-6 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
          
          {/* Laser Cut Dispenser Slot */}
          <div className="w-11/12 h-3 bg-black rounded-full mb-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] relative">
            <div className="absolute inset-x-4 top-0.5 h-1 bg-cyan-400/40 rounded-full blur-[1px]"></div>
          </div>

          <AnimatePresence mode="wait">
            {printedTicket && (
              <motion.div
                key={printedTicket.id}
                initial={{ y: -150, opacity: 0.1, scaleY: 0.2 }}
                animate={{ y: 0, opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="w-11/12 bg-white text-slate-800 p-6 shadow-2xl rounded-sm relative border-t-2 border-dashed border-slate-300 overflow-hidden"
                style={{ transformOrigin: 'top center' }}
                id="simulated-printed-ticket"
              >
                {/* Decorative border cut line */}
                <div className="absolute top-0 inset-x-0 flex justify-between overflow-hidden h-2 -translate-y-1">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-slate-800 rounded-full -mt-1 flex-shrink-0"></div>
                  ))}
                </div>

                {/* Ticket Header */}
                <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
                  <div className="text-[10px] font-mono font-black text-[#002366] tracking-widest uppercase">
                    {dict.customsHeader}
                  </div>
                  <div className="text-[9px] font-mono font-bold text-slate-400">
                    {dict.regionalDir}
                  </div>
                  <div className="text-xs font-serif font-bold mt-1 text-slate-700 italic">
                    {dict.welcome}
                  </div>
                </div>

                {/* Main Ticket Turn Indicator (As specified: Turno: C-03 / Tiempo estimado: 15 minutos) */}
                <div className="text-center space-y-2 py-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block tracking-widest">
                    {dict.ticketNumberLabel}
                  </span>
                  <div className="text-5xl font-black font-mono text-[#002366] tracking-tight py-1 bg-slate-50 rounded-xl border-2 border-slate-100" id="ticket-number-display">
                    {printedTicket.number}
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 text-slate-600 font-extrabold py-1">
                    <Clock size={14} className="text-red-500" />
                    <span className="text-xs">{dict.estimatedTime} <strong className="text-slate-950 font-black" id="ticket-time-display">{printedTicket.estimatedWaitMinutes} {dict.minutes}</strong></span>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="border-t-2 border-dashed border-slate-200 pt-4 mt-2 text-xs font-mono space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>{dict.docLabel}</span>
                    <span className="font-black text-slate-900">{printedTicket.identifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{dict.serviceTypeLabel}</span>
                    <span className="font-black text-slate-900 uppercase">
                      {printedTicket.type === 'preferencial' ? '♿ PREFERENCIAL' : '👤 GENERAL'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{dict.dateTimeLabel}</span>
                    <span className="font-bold text-slate-800">{printedTicket.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{dict.assignedModuleLabel}</span>
                    <span className="font-black text-[#002366]">{dict.hallScreen}</span>
                  </div>
                </div>

                {/* Ticket Instructions */}
                <div className="text-center text-[10px] text-slate-400 mt-6 pt-3 border-t border-slate-100 space-y-1">
                  <p>{dict.ticketInstructions1}</p>
                  <p>{dict.ticketInstructions2}</p>
                  <p className="font-black text-[#002366] text-[9px] mt-1">{dict.controlSystem}</p>
                </div>

                {/* Barcode representation */}
                <div className="mt-5 flex flex-col items-center justify-center gap-1">
                  <div className="flex justify-between w-4/5 h-8 bg-slate-100 p-1 opacity-80 overflow-hidden">
                    {Array.from({ length: 42 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800 h-full"
                        style={{
                          width: `${(idx % 3 === 0 ? 3 : idx % 2 === 0 ? 1 : 2)}px`,
                          opacity: idx % 5 === 0 ? 0.3 : 1
                        }}
                      ></div>
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 tracking-[0.2em] uppercase">
                    *T-{printedTicket.number}-{printedTicket.id.slice(0, 4)}*
                  </span>
                </div>

                {/* Pull off/tear instruction icon */}
                <div className="absolute bottom-1 right-2 text-[8px] text-slate-300 font-mono flex items-center gap-0.5">
                  <span>{dict.tearOff}</span>
                  <span>✂️</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompt to use */}
          {!printedTicket && (
            <div className="w-11/12 h-64 bg-slate-700/50 rounded flex flex-col items-center justify-center border-2 border-dashed border-slate-600 p-4 text-center">
              <HelpCircle className="text-slate-500 mb-2" size={36} />
              <p className="text-slate-400 text-sm">{dict.slotPrompt}</p>
            </div>
          )}
        </div>
        
        {/* Ticket reset simulation tool */}
        <p className="text-xs text-slate-400 mt-3 text-center">
          {dict.simulationTip}
        </p>
      </div>
    </div>
  );
}
