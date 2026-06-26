import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserCheck, Play, RotateCcw, CheckCircle, AlertTriangle, ShieldAlert, MonitorPlay } from 'lucide-react';
import { Ticket, Counter } from '../types';

interface CounterViewProps {
  tickets: Ticket[];
  counters: Counter[];
  onCallNext: (counterId: number) => Ticket | null;
  onRecall: (counterId: number) => void;
  onComplete: (counterId: number, status: 'completed' | 'no-show') => void;
  activeCounterId: number;
  setActiveCounterId: (id: number) => void;
}

export default function CounterView({
  tickets,
  counters,
  onCallNext,
  onRecall,
  onComplete,
  activeCounterId,
  setActiveCounterId,
}: CounterViewProps) {
  const [selectedCounterId, setSelectedCounterId] = useState<number>(activeCounterId);

  const currentCounter = counters.find(c => c.id === selectedCounterId) || counters[0];
  const activeTicket = tickets.find(t => t.id === currentCounter.currentTicketId && t.status === 'called');

  // Next up in the queue (first waiting ticket)
  const waitingTickets = tickets.filter(t => t.status === 'waiting');
  
  // Stagger tickets prioritising preferencial first, then by creation date
  const sortedWaitingTickets = [...waitingTickets].sort((a, b) => {
    if (a.type === 'preferencial' && b.type !== 'preferencial') return -1;
    if (a.type !== 'preferencial' && b.type === 'preferencial') return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const nextTicket = sortedWaitingTickets[0] || null;

  const handleCounterChange = (id: number) => {
    setSelectedCounterId(id);
    setActiveCounterId(id);
  };

  const handleCallNext = () => {
    onCallNext(selectedCounterId);
  };

  const handleRecall = () => {
    onRecall(selectedCounterId);
  };

  const handleComplete = () => {
    onComplete(selectedCounterId, 'completed');
  };

  const handleAbsent = () => {
    onComplete(selectedCounterId, 'no-show');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-2 space-y-6" id="counter-module-container">
      {/* Header and Desk Switcher */}
      <div className="bg-[#002366] text-white p-8 rounded-2xl border-2 border-slate-200/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="counter-top-panel">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-500 w-2.5 h-2.5 rounded-full inline-block animate-pulse"></span>
            <span className="text-xs tracking-wider uppercase font-mono text-slate-300 font-bold">Terminal de Funcionario Público</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display">Consola de Control de Ventanillas</h2>
          <p className="text-slate-200 text-sm mt-0.5 font-medium">Gestione y llame pasajeros para control aduanero presencial.</p>
        </div>

        {/* Counter selector tabs */}
        <div className="flex flex-wrap gap-2" id="counter-tabs-list">
          {counters.map(counter => (
            <button
              key={counter.id}
              onClick={() => handleCounterChange(counter.id)}
              className={`px-4 py-2.5 rounded-xl text-sm transition-all border-2 cursor-pointer ${
                selectedCounterId === counter.id
                  ? 'bg-white text-[#002366] border-white shadow-md font-black font-display'
                  : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:bg-slate-700 font-bold'
              }`}
            >
              🏢 {counter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Agent Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Serving Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Serving Area */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-lg p-6 relative overflow-hidden" id="serving-screen">
            {/* Status badge */}
            <div className="absolute right-6 top-6">
              {activeTicket ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-[#002366] text-white animate-pulse">
                  Serving • Atendiendo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-500">
                  Libre • Disponible
                </span>
              )}
            </div>

            <h3 className="text-slate-500 text-xs font-black uppercase tracking-wider mb-4">
              Estado de {currentCounter.name} ({currentCounter.agentName})
            </h3>

            <AnimatePresence mode="wait">
              {activeTicket ? (
                <motion.div
                  key={activeTicket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 uppercase tracking-widest font-mono font-bold">Turno en Atención</span>
                      <div className="text-6xl font-black font-mono text-[#002366]" id="counter-active-number">
                        {activeTicket.number}
                      </div>
                      <div className="text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-black bg-blue-100 text-[#002366] uppercase tracking-wide">
                        {activeTicket.type === 'preferencial' ? '♿ Preferencial' : '👤 General'}
                      </div>
                    </div>

                    <div className="space-y-2 font-mono text-xs text-slate-600 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                      <div className="flex justify-between">
                        <span>VIAJERO:</span>
                        <strong className="text-slate-800">{activeTicket.identifier}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>GENERADO:</span>
                        <span className="text-slate-800">{activeTicket.createdAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TIEMPO ESPERA:</span>
                        <span className="text-amber-700 font-bold">{activeTicket.estimatedWaitMinutes} MINS</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleRecall}
                      className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-sm border-2 border-[#002366] text-[#002366] hover:bg-slate-50 transition-colors cursor-pointer uppercase tracking-wider"
                      title="Volver a llamar en la pantalla grande con alarma sonora"
                      id="btn-re-llamar"
                    >
                      <RotateCcw size={16} />
                      Re-llamar Turno
                    </button>
                    
                    <button
                      onClick={handleAbsent}
                      className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-sm border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer uppercase tracking-wider"
                      id="btn-marcar-ausente"
                    >
                      <AlertTriangle size={16} />
                      Pasajero Ausente
                    </button>

                    <button
                      onClick={handleComplete}
                      className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all cursor-pointer uppercase tracking-wider"
                      id="btn-atendido"
                    >
                      <CheckCircle size={16} />
                      Turno Atendido
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-serving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <UserCheck size={32} />
                  </div>
                  <div className="max-w-md">
                    <p className="font-bold text-slate-700 text-lg">No hay ningún turno en atención</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Su ventanilla está disponible. Llame al siguiente viajero de la fila presionando el botón azul.
                    </p>
                  </div>

                  {nextTicket ? (
                    <button
                      onClick={handleCallNext}
                      className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-black uppercase tracking-wider bg-[#002366] text-white hover:bg-[#001740] shadow-lg transition-all cursor-pointer animate-bounce"
                      id="btn-llamar-proximo-empty"
                    >
                      <Play size={16} />
                      Llamar Siguiente ({nextTicket.number})
                    </button>
                  ) : (
                    <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
                      📭 Fila de espera vacía. No hay viajeros registrados.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Next Ticket Preview Block (HU-04 requirement: "Conocer el turno actual y el turno siguiente") */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow p-5" id="next-ticket-preview-box">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Turno Siguiente en Cola</h4>
            {nextTicket ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100" id="next-ticket-block">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black font-mono text-slate-700">
                    {nextTicket.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-700">{nextTicket.identifier}</span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        nextTicket.type === 'preferencial' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {nextTicket.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Creado hace unos momentos • Espera estimada: {nextTicket.estimatedWaitMinutes} min</p>
                  </div>
                </div>

                <button
                  onClick={handleCallNext}
                  disabled={!!activeTicket}
                  className={`py-2.5 px-4.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeTicket 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200' 
                      : 'bg-[#002366] text-white hover:bg-[#001740] shadow-sm'
                  }`}
                  title={activeTicket ? "Finalice el turno actual primero" : "Llamar turno ahora"}
                >
                  <Play size={12} />
                  Llamar Turno
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2 text-center">No hay turnos siguientes esperando en este momento.</p>
            )}
          </div>
        </div>

        {/* Right Column: Waiting Queue */}
        <div className="lg:col-span-4 bg-white border-2 border-slate-200 rounded-2xl shadow-lg p-5" id="waiting-queue-panel">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#002366]" />
              <h3 className="font-black text-slate-900 text-md font-display">Viajeros en Espera</h3>
            </div>
            <span className="bg-[#002366]/10 text-[#002366] text-xs font-black px-2.5 py-1 rounded-full font-mono">
              {sortedWaitingTickets.length} en fila
            </span>
          </div>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1" id="scrolling-queue">
            <AnimatePresence>
              {sortedWaitingTickets.length > 0 ? (
                sortedWaitingTickets.map((t, idx) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                      t.type === 'preferencial'
                        ? 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50'
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 text-lg">{t.number}</span>
                        {t.type === 'preferencial' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            ♿ PREF
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {t.identifier}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] text-slate-400 block font-mono">Llegada: {t.createdAt}</span>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        ⌛ {t.estimatedWaitMinutes} min
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-100 rounded-xl">
                  No hay pasajeros en fila.
                </div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Legend/Priority notes */}
          <div className="mt-4 bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Políticas del Sistema:</p>
            <p className="text-[10px] text-slate-500">• Los turnos <span className="text-emerald-700 font-semibold">♿ Preferenciales</span> saltan automáticamente al principio de la fila para dar prioridad legal.</p>
            <p className="text-[10px] text-slate-500">• Tiempo base estimado: 4 minutos por viajero.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
