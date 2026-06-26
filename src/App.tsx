import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Monitor, Users, Sliders, Play, AlertCircle, HelpCircle, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Ticket, Counter, LogEntry } from './types';
import TotemView from './components/TotemView';
import CounterView from './components/CounterView';
import PublicDisplayView from './components/PublicDisplayView';
import SupervisorView from './components/SupervisorView';

// Initial state data for beautiful loading state
const INITIAL_COUNTERS: Counter[] = [
  { id: 1, name: 'Ventanilla 1', agentName: 'Andrés Silva', status: 'idle' },
  { id: 2, name: 'Ventanilla 2', agentName: 'Beatriz Soto', status: 'idle' },
  { id: 3, name: 'Ventanilla 3', agentName: 'Claudio Riquelme', status: 'idle' },
];

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 't-1',
    number: 'C-01',
    identifier: '11.222.333-4',
    type: 'general',
    status: 'completed',
    createdAt: '12:45',
    calledAt: '12:48',
    completedAt: '12:52',
    counterId: 1,
    estimatedWaitMinutes: 12,
  },
  {
    id: 't-2',
    number: 'C-02',
    identifier: '20.111.444-K',
    type: 'general',
    status: 'completed',
    createdAt: '12:50',
    calledAt: '12:55',
    completedAt: '12:59',
    counterId: 2,
    estimatedWaitMinutes: 8,
  },
  {
    id: 't-pref-1',
    number: 'P-01',
    identifier: '8.999.888-7',
    type: 'preferencial',
    status: 'no-show',
    createdAt: '12:55',
    calledAt: '12:58',
    completedAt: '13:01',
    counterId: 3,
    estimatedWaitMinutes: 0,
  },
  // Default C-03 ticket as requested by the user: "Turno: C-03 / Tiempo estimado: 15 minutos"
  {
    id: 't-3',
    number: 'C-03',
    identifier: '12.345.678-9',
    type: 'general',
    status: 'waiting',
    createdAt: '13:02',
    estimatedWaitMinutes: 15,
  }
];

const INITIAL_LOGS: LogEntry[] = [
  { id: 'log-1', timestamp: '12:45:21', action: 'TOTEM', details: 'Ticket C-01 generado para viajero 11.222.333-4' },
  { id: 'log-2', timestamp: '12:48:10', action: 'VENTANILLA', details: 'Ventanilla 1 llamó a Ticket C-01' },
  { id: 'log-3', timestamp: '12:50:42', action: 'TOTEM', details: 'Ticket C-02 generado para viajero 20.111.444-K' },
  { id: 'log-4', timestamp: '12:52:15', action: 'VENTANILLA', details: 'Ventanilla 1 completó atención de Ticket C-01' },
  { id: 'log-5', timestamp: '12:55:03', action: 'VENTANILLA', details: 'Ventanilla 2 llamó a Ticket C-02' },
  { id: 'log-6', timestamp: '12:55:12', action: 'TOTEM', details: 'Ticket Preferencial P-01 generado para viajero 8.999.888-7' },
  { id: 'log-7', timestamp: '12:58:30', action: 'VENTANILLA', details: 'Ventanilla 3 llamó a Ticket Preferencial P-01' },
  { id: 'log-8', timestamp: '12:59:45', action: 'VENTANILLA', details: 'Ventanilla 2 completó atención de Ticket C-02' },
  { id: 'log-9', timestamp: '13:01:10', action: 'VENTANILLA', details: 'Ventanilla 3 marcó Ticket P-01 como No Presentado (Ausente)' },
  { id: 'log-10', timestamp: '13:02:15', action: 'TOTEM', details: 'Ticket C-03 generado para viajero 12.345.678-9 (Simulado Inicial)' },
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'totem' | 'display' | 'counter' | 'supervisor'>('totem');
  
  // Persisted state loading from localStorage or fallback
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('aduana_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [counters, setCounters] = useState<Counter[]>(() => {
    const saved = localStorage.getItem('aduana_counters');
    return saved ? JSON.parse(saved) : INITIAL_COUNTERS;
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('aduana_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [activeCounterId, setActiveCounterId] = useState<number>(1);
  const [lastCalledTicket, setLastCalledTicket] = useState<Ticket | null>(null);
  const [triggerAnnounceId, setTriggerAnnounceId] = useState<string | null>(null);

  // Counter sequences
  const [nextGenNum, setNextGenNum] = useState<number>(() => {
    const saved = localStorage.getItem('aduana_seq_gen');
    return saved ? parseInt(saved, 10) : 4;
  });

  const [nextPrefNum, setNextPrefNum] = useState<number>(() => {
    const saved = localStorage.getItem('aduana_seq_pref');
    return saved ? parseInt(saved, 10) : 2;
  });

  // Save state to localStorage on modification
  useEffect(() => {
    localStorage.setItem('aduana_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('aduana_counters', JSON.stringify(counters));
  }, [counters]);

  useEffect(() => {
    localStorage.setItem('aduana_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('aduana_seq_gen', nextGenNum.toString());
  }, [nextGenNum]);

  useEffect(() => {
    localStorage.setItem('aduana_seq_pref', nextPrefNum.toString());
  }, [nextPrefNum]);

  // Helper to add system logs
  const addLog = (action: string, details: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: timeStr,
      action,
      details,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // 1. Totem Handler: Generate a ticket
  const handleGenerateTicket = (identifier: string, type: 'general' | 'preferencial'): Ticket => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

    let ticketNumber = '';
    if (type === 'general') {
      ticketNumber = `C-${String(nextGenNum).padStart(2, '0')}`;
      setNextGenNum(prev => prev + 1);
    } else {
      ticketNumber = `P-${String(nextPrefNum).padStart(2, '0')}`;
      setNextPrefNum(prev => prev + 1);
    }

    // Wait calculation: count how many people are already waiting ahead
    const aheadCount = tickets.filter(t => t.status === 'waiting').length;
    const estimatedMinutes = Math.max(4, aheadCount * 4) + (type === 'preferencial' ? 0 : 2);

    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      number: ticketNumber,
      identifier,
      type,
      status: 'waiting',
      createdAt: timeStr,
      estimatedWaitMinutes: estimatedMinutes,
    };

    setTickets(prev => [...prev, newTicket]);
    addLog('TOTEM', `Ticket ${ticketNumber} (${type}) generado para viajero: ${identifier}`);

    return newTicket;
  };

  // 2. Counter Handler: Call next waiting ticket
  const handleCallNext = (counterId: number): Ticket | null => {
    // Select candidates (waiting tickets)
    const waitingList = tickets.filter(t => t.status === 'waiting');
    if (waitingList.length === 0) return null;

    // Sort by priority (Preferential first, then FIFO)
    const sortedWaiting = [...waitingList].sort((a, b) => {
      if (a.type === 'preferencial' && b.type !== 'preferencial') return -1;
      if (a.type !== 'preferencial' && b.type === 'preferencial') return 1;
      return new Date(`1970-01-01T${a.createdAt}`).getTime() - new Date(`1970-01-01T${b.createdAt}`).getTime();
    });

    const targetTicket = sortedWaiting[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

    // Update tickets
    setTickets(prev =>
      prev.map(t =>
        t.id === targetTicket.id
          ? { ...t, status: 'called', counterId, calledAt: timeStr }
          : t
      )
    );

    // Update counter
    setCounters(prev =>
      prev.map(c =>
        c.id === counterId
          ? { ...c, status: 'serving', currentTicketId: targetTicket.id }
          : c
      )
    );

    // Track for announcement
    setLastCalledTicket({ ...targetTicket, status: 'called', counterId, calledAt: timeStr });
    setTriggerAnnounceId(`ann-${Date.now()}`);

    const counterName = counters.find(c => c.id === counterId)?.name || `Ventanilla ${counterId}`;
    addLog('VENTANILLA', `${counterName} llamó a Ticket ${targetTicket.number} (Viajero: ${targetTicket.identifier})`);

    return targetTicket;
  };

  // 3. Counter Handler: Re-trigger announcement chime + speech
  const handleRecall = (counterId: number) => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    const ticket = tickets.find(t => t.id === counter.currentTicketId && t.status === 'called');
    if (!ticket) return;

    setLastCalledTicket(ticket);
    setTriggerAnnounceId(`recall-${Date.now()}`);

    addLog('VENTANILLA', `Llamado de REPETICIÓN de Ticket ${ticket.number} re-enviado a Pantalla de Sala por ${counter.name}`);
  };

  // 4. Counter Handler: Complete or no-show
  const handleComplete = (counterId: number, status: 'completed' | 'no-show') => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

    setTickets(prev =>
      prev.map(t =>
        t.id === counter.currentTicketId
          ? { ...t, status, completedAt: timeStr }
          : t
      )
    );

    setCounters(prev =>
      prev.map(c =>
        c.id === counterId
          ? { ...c, status: 'idle', currentTicketId: undefined }
          : c
      )
    );

    const ticket = tickets.find(t => t.id === counter.currentTicketId);
    const actionLabel = status === 'completed' ? 'ATENDIDO' : 'AUSENTE';
    const logDetails = status === 'completed' 
      ? `${counter.name} completó exitosamente la atención del ticket ${ticket?.number}`
      : `${counter.name} registró como AUSENTE (no se presentó) el ticket ${ticket?.number}`;

    addLog('VENTANILLA', logDetails);
  };

  // 5. Supervisor Handler: Add a random simulated traveler
  const handleAddSimulatedPassenger = () => {
    const ruts = [
      '19.345.891-2', '21.054.398-K', '15.782.110-3', '18.442.909-7', '22.841.522-8',
      '17.912.443-1', '14.502.991-6', 'PAS-B981244', 'PAS-N229041', 'PAS-C349012'
    ];
    const isPref = Math.random() < 0.25; // 25% priority travelers
    const randomRut = ruts[Math.floor(Math.random() * ruts.length)];
    handleGenerateTicket(randomRut, isPref ? 'preferencial' : 'general');
  };

  // 6. Reset System
  const handleResetSystem = () => {
    if (window.confirm('¿Está seguro de que desea reiniciar todas las colas de atención? Esto restablecerá los tickets iniciales.')) {
      setTickets(INITIAL_TICKETS);
      setCounters(INITIAL_COUNTERS);
      setLogs(INITIAL_LOGS);
      setNextGenNum(4);
      setNextPrefNum(2);
      setLastCalledTicket(null);
      setTriggerAnnounceId(null);
      localStorage.removeItem('aduana_tickets');
      localStorage.removeItem('aduana_counters');
      localStorage.removeItem('aduana_logs');
      localStorage.removeItem('aduana_seq_gen');
      localStorage.removeItem('aduana_seq_pref');
      addLog('SISTEMA', 'Sistema reiniciado por completo a valores por defecto.');
    }
  };

  // Clear Logs
  const handleClearLogs = () => {
    setLogs([]);
    localStorage.removeItem('aduana_logs');
  };

  // Active waiting queue calculation
  const waitingCount = tickets.filter(t => t.status === 'waiting').length;

  // Average wait calculation
  const completedTicketsList = tickets.filter(t => t.status === 'completed');
  const averageWaitTime = completedTicketsList.length > 0 
    ? Math.round(completedTicketsList.reduce((acc, t) => acc + t.estimatedWaitMinutes, 0) / completedTicketsList.length)
    : 15; // default average fallback

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app-root-wrapper">
      
      {/* Upper Navigation Perspective Hub */}
      <nav className="bg-[#002366] text-white border-b border-slate-200/20 shadow-md sticky top-0 z-50" id="global-nav">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center py-3.5 gap-3">
          
          {/* Logo & Service Name */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/15">
              <Shield size={22} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-md font-black tracking-tight font-display">SISTEMA INTEGRADO DE TURNOS</h1>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest font-mono font-bold">Dirección Nacional de Aduanas • Gobierno de Chile</p>
            </div>
          </div>

          {/* Perspective View Selectors (Specifically mapped to requested HUs) */}
          <div className="flex flex-wrap justify-center bg-slate-950 p-1.5 rounded-xl border border-slate-800" id="role-nav-switch">
            <button
              onClick={() => setActiveScreen('totem')}
              className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeScreen === 'totem' ? 'bg-[#002366] text-white shadow-lg border border-white/10' : 'text-slate-400 hover:text-white'
              }`}
              id="nav-to-totem"
            >
              <Monitor size={13} />
              <span>🖥️ Tótem Viajero</span>
            </button>

            <button
              onClick={() => setActiveScreen('display')}
              className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeScreen === 'display' ? 'bg-[#002366] text-white shadow-lg border border-white/10' : 'text-slate-400 hover:text-white'
              }`}
              id="nav-to-display"
            >
              <Monitor size={13} className="text-amber-400" />
              <span>📺 Pantalla Sala</span>
            </button>

            <button
              onClick={() => setActiveScreen('counter')}
              className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeScreen === 'counter' ? 'bg-[#002366] text-white shadow-lg border border-white/10' : 'text-slate-400 hover:text-white'
              }`}
              id="nav-to-counter"
            >
              <Users size={13} />
              <span>💼 Ventanilla</span>
            </button>

            <button
              onClick={() => setActiveScreen('supervisor')}
              className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeScreen === 'supervisor' ? 'bg-[#002366] text-white shadow-lg border border-white/10' : 'text-slate-400 hover:text-white'
              }`}
              id="nav-to-supervisor"
            >
              <Sliders size={13} />
              <span>📊 Supervisor</span>
            </button>
          </div>

        </div>
      </nav>

      {/* Interactive State Sync Notification Hub */}
      <div className="bg-slate-100 py-2 border-b border-slate-200 text-center text-xs text-slate-600 px-4" id="sync-disclaimer">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
            <CheckCircle2 size={13} />
            <span>Sincronización en Tiempo Real Activa</span>
          </span>
          <span className="hidden md:inline text-slate-300">|</span>
          <span>
            Las pantallas comparten la misma cola de datos. Pruebe emitir un boleto en el <strong>Tótem</strong>, llámelo en la <strong>Ventanilla</strong> y mírelo anunciarse en la <strong>Pantalla de Sala</strong>.
          </span>
        </div>
      </div>

      {/* Main Perspective Body View Wrapper */}
      <main className="flex-1 py-8" id="perspective-main-stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {activeScreen === 'totem' && (
              <TotemView
                onGenerateTicket={handleGenerateTicket}
                lastGeneratedTicket={tickets.find(t => t.status === 'waiting') || null}
                waitingCount={waitingCount}
              />
            )}

            {activeScreen === 'display' && (
              <PublicDisplayView
                tickets={tickets}
                counters={counters}
                lastCalledTicket={lastCalledTicket}
                triggerAnnounceId={triggerAnnounceId}
              />
            )}

            {activeScreen === 'counter' && (
              <CounterView
                tickets={tickets}
                counters={counters}
                onCallNext={handleCallNext}
                onRecall={handleRecall}
                onComplete={handleComplete}
                activeCounterId={activeCounterId}
                setActiveCounterId={setActiveCounterId}
              />
            )}

            {activeScreen === 'supervisor' && (
              <SupervisorView
                tickets={tickets}
                counters={counters}
                logs={logs}
                onAddSimulatedPassenger={handleAddSimulatedPassenger}
                onResetSystem={handleResetSystem}
                onClearLogs={handleClearLogs}
                averageWaitTime={averageWaitTime}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Branding Area */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400" id="app-footer">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© 2026 Servicio Nacional de Aduanas - Gobierno de Chile. Todos los derechos reservados.</p>
          <div className="flex justify-center gap-4 text-[10px] text-slate-400 font-mono">
            <span>DISPOSITIVO: ADUANA-KIOSK-T01</span>
            <span>VERS: v2.4.1</span>
            <span>INTEGRACIÓN: MULTI-PANTALLA LOCAL</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
