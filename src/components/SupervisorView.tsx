import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, BookOpen, Clock, Activity, ShieldCheck, PlusCircle, Trash2, ArrowRight, HelpCircle, UserCheck } from 'lucide-react';
import { Ticket, Counter, LogEntry } from '../types';

interface SupervisorViewProps {
  tickets: Ticket[];
  counters: Counter[];
  logs: LogEntry[];
  onAddSimulatedPassenger: () => void;
  onResetSystem: () => void;
  onClearLogs: () => void;
  averageWaitTime: number;
}

export default function SupervisorView({
  tickets,
  counters,
  logs,
  onAddSimulatedPassenger,
  onResetSystem,
  onClearLogs,
  averageWaitTime,
}: SupervisorViewProps) {
  const [activeTab, setActiveTab] = useState<'monitor' | 'how-it-works'>('monitor');
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  // Auto-generation timer for demo purposes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoGenerating) {
      interval = setInterval(() => {
        onAddSimulatedPassenger();
      }, 10000); // add passenger every 10 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoGenerating]);

  // Statistics calculation
  const totalTickets = tickets.length;
  const waitingTickets = tickets.filter(t => t.status === 'waiting').length;
  const calledTickets = tickets.filter(t => t.status === 'called').length;
  const completedTickets = tickets.filter(t => t.status === 'completed').length;
  const absentTickets = tickets.filter(t => t.status === 'no-show').length;

  const generalCount = tickets.filter(t => t.type === 'general').length;
  const prefCount = tickets.filter(t => t.type === 'preferencial').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-2 space-y-6" id="supervisor-container">
      {/* Top Banner */}
      <div className="bg-[#002366] text-white p-8 rounded-2xl border-2 border-slate-200/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="supervisor-top">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-500 w-2.5 h-2.5 rounded-full inline-block animate-pulse"></span>
            <span className="text-xs tracking-wider uppercase font-mono text-slate-300 font-bold">Modulo de Operaciones Especiales</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display">Consola del Supervisor de Aduana</h2>
          <p className="text-slate-200 text-sm mt-0.5 font-medium">Monitoree la salud del flujo, administre colas y consulte el manual interactivo.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800" id="supervisor-tabs">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`px-4 py-2.5 rounded-lg text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'monitor' ? 'bg-white text-[#002366] shadow font-black font-display' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity size={14} />
            Métricas y Simulación
          </button>
          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`px-4 py-2.5 rounded-lg text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'how-it-works' ? 'bg-white text-[#002366] shadow font-black font-display' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={14} />
            ¿Cómo Funciona?
          </button>
        </div>
      </div>

      {activeTab === 'monitor' ? (
        <div className="space-y-6 animate-fadeIn" id="monitor-tab-content">
          
          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Emisiones</span>
              <p className="text-3xl font-black text-slate-800 mt-1 font-mono">{totalTickets}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center border-l-4 border-l-blue-500">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">En Espera (Cola)</span>
              <p className="text-3xl font-black text-blue-600 mt-1 font-mono">{waitingTickets}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center border-l-4 border-l-amber-500">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Siendo Atendidos</span>
              <p className="text-3xl font-black text-amber-600 mt-1 font-mono">{calledTickets}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center border-l-4 border-l-emerald-500">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Atendidos Éxito</span>
              <p className="text-3xl font-black text-emerald-600 mt-1 font-mono">{completedTickets}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center border-l-4 border-l-red-500 col-span-2 md:col-span-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">No se Presentó</span>
              <p className="text-3xl font-black text-red-600 mt-1 font-mono">{absentTickets}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Simulation controls & Active counters */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Simulator Panel */}
              <div className="bg-white border-2 border-slate-200 p-5 rounded-xl shadow-lg space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sliders size={18} className="text-[#002366]" />
                  <h3 className="font-black text-slate-900 text-sm font-display">Simulación Operativa</h3>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={onAddSimulatedPassenger}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#002366] text-white hover:bg-[#001740] font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                  >
                    <PlusCircle size={15} />
                    Simular Entrada de Viajero
                  </button>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <p className="font-semibold text-slate-700">Simulación Inteligente Continua</p>
                      <p className="text-slate-400 text-[10px]">Agrega viajeros automáticamente cada 10s</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAutoGenerating}
                        onChange={() => setIsAutoGenerating(!isAutoGenerating)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={onResetSystem}
                      className="flex-1 py-2.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 size={13} />
                      Reiniciar Colas
                    </button>
                  </div>
                </div>
              </div>

              {/* Counter status list */}
              <div className="bg-white border-2 border-slate-200 p-5 rounded-xl shadow-lg flex-1">
                <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-3 mb-4 font-display">
                  Estado de Ventanillas ({counters.length})
                </h3>

                <div className="space-y-3">
                  {counters.map(c => {
                    const activeT = tickets.find(t => t.id === c.currentTicketId && t.status === 'called');
                    return (
                      <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-slate-900 font-bold block">{c.name}</strong>
                          <span className="text-slate-400 text-[10px]">{c.agentName}</span>
                        </div>

                        <div className="text-right">
                          {activeT ? (
                            <span className="bg-[#002366] text-white px-2.5 py-1 rounded font-mono font-black text-xs">
                              Atendiendo {activeT.number}
                            </span>
                          ) : (
                            <span className="bg-slate-200 text-slate-500 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                              Libre
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Event log & Graphs */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Distribution & Load */}
              <div className="bg-white border-2 border-slate-200 p-5 rounded-xl shadow-lg">
                <h3 className="font-black text-slate-950 text-sm border-b border-slate-100 pb-3 mb-4 font-display">
                  Distribución de Carga del Tótem
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category bars */}
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Demanda según categoría</p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-700 font-bold">Atención General</span>
                          <span className="font-mono font-black text-slate-900">{generalCount} ({totalTickets > 0 ? Math.round((generalCount / totalTickets) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#002366] h-full rounded-full transition-all duration-500"
                            style={{ width: `${totalTickets > 0 ? (generalCount / totalTickets) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-emerald-700 font-semibold">♿ Atención Preferencial</span>
                          <span className="font-mono font-semibold">{prefCount} ({totalTickets > 0 ? Math.round((prefCount / totalTickets) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${totalTickets > 0 ? (prefCount / totalTickets) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flow Health Status */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Salud del Flujo del Puesto</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-[#002366] font-mono">{averageWaitTime} min</span>
                        <span className="text-xs text-slate-500 font-bold">espera promedio</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 pt-3 border-t border-slate-200">
                      {waitingTickets > 6 ? (
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                          ⚠️ Demanda Alta. Considere abrir Ventanilla 4.
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          ✓ Flujo Óptimo. Capacidad de atención suficiente.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Logs */}
              <div className="bg-white border-2 border-slate-200 rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden min-h-[300px]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">Bitácora Técnica en Vivo</span>
                  <button
                    onClick={onClearLogs}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest cursor-pointer"
                  >
                    Limpiar Bitácora
                  </button>
                </div>

                <div className="p-4 space-y-2 overflow-y-auto font-mono text-xs flex-1 max-h-[320px]">
                  {logs.length > 0 ? (
                    logs.map(log => (
                      <div key={log.id} className="border-b border-slate-100 pb-2 flex gap-3 text-slate-600">
                        <span className="text-slate-400 flex-shrink-0">{log.timestamp}</span>
                        <div>
                          <strong className="text-slate-800 uppercase text-[10px] mr-1.5 inline-block px-1 bg-slate-100 rounded">
                            {log.action}
                          </strong>
                          <span>{log.details}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 italic text-center py-12">No hay registros de eventos aún.</div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* Interactive Totem manual / HOW IT WORKS tab (Specifically for HU-02) */
        <div className="bg-white border-2 border-slate-200 p-8 rounded-xl shadow-lg space-y-8 animate-fadeIn" id="how-it-works-content">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-[#002366] flex items-center gap-2 mb-2 font-display">
              <ShieldCheck size={22} className="text-blue-600" />
              Manual Técnico de Funcionamiento del Tótem
            </h3>
            <p className="text-slate-600 text-sm font-medium">
              Esta sección detalla el funcionamiento mecánico y digital de nuestro dispositivo de autoatención para la inducción de supervisores y asistentes del terminal aduanero.
            </p>
          </div>

          {/* Workflow Stepper Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-xl text-center space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-[#002366] text-white font-black flex items-center justify-center mx-auto text-sm">
                1
              </div>
              <strong className="text-xs text-slate-900 font-black block">Identificación</strong>
              <p className="text-[10px] text-slate-500 font-medium">El viajero ingresa su RUT o pasaporte en el teclado táctil del tótem.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-xl text-center space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-[#002366] text-white font-black flex items-center justify-center mx-auto text-sm">
                2
              </div>
              <strong className="text-xs text-slate-900 font-black block">Clasificación</strong>
              <p className="text-[10px] text-slate-500 font-medium">El viajero selecciona si califica para Atención General o Preferencial.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-xl text-center space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-[#002366] text-white font-black flex items-center justify-center mx-auto text-sm">
                3
              </div>
              <strong className="text-xs text-slate-900 font-black block">Cálculo de Espera</strong>
              <p className="text-[10px] text-slate-500 font-medium">La CPU analiza las personas activas en cola para calcular el tiempo estimado.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-xl text-center space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-[#002366] text-white font-black flex items-center justify-center mx-auto text-sm">
                4
              </div>
              <strong className="text-xs text-slate-900 font-black block">Impresión</strong>
              <p className="text-[10px] text-slate-500 font-medium">Se activa la impresora térmica y cae el boleto físico numerado.</p>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-xl text-center space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-[#002366] text-white font-black flex items-center justify-center mx-auto text-sm">
                5
              </div>
              <strong className="text-xs text-slate-900 font-black block">Llamado</strong>
              <p className="text-[10px] text-slate-500 font-medium">El llamado de ventanilla dispara la síntesis de voz en la TV pública.</p>
            </div>
          </div>

          {/* Interactive Help & FAQ specifically designed for the supervisor to guide tourists */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <HelpCircle size={16} className="text-slate-500" />
              Guía de Resolución de Problemas para el Supervisor
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-slate-50/50">
                <strong className="text-slate-800 font-bold block">❓ ¿Cómo se calcula el tiempo de espera estimado?</strong>
                <p className="text-slate-600">
                  Se basa en la cantidad de personas esperando en la cola multiplicado por un factor de 4 minutos por persona. Los turnos preferenciales se calculan de manera prioritaria.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-slate-50/50">
                <strong className="text-slate-800 font-bold block">❓ El boleto de un viajero preferencial no tiene prioridad. ¿Qué hacer?</strong>
                <p className="text-slate-600">
                  Verifique que hayan pulsado la opción "Preferencial" (botón verde) antes de imprimir. Las colas preferenciales pasan automáticamente por delante de los turnos generales.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-slate-50/50">
                <strong className="text-slate-800 font-bold block">❓ ¿Qué significa el código de letra en el número del ticket?</strong>
                <p className="text-slate-600">
                  La letra <strong className="font-bold">C</strong> indica Servicio General. La letra <strong className="font-bold">P</strong> indica Atención Preferencial prioritaria.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl space-y-1 bg-slate-50/50">
                <strong className="text-slate-800 font-bold block">❓ ¿El sistema requiere internet para operar localmente?</strong>
                <p className="text-slate-600">
                  El motor de sincronización de colas está diseñado para operar en la intranet de la aduana, permitiendo la resiliencia incluso si la conexión externa al puerto marítimo o aeropuerto falla temporalmente.
                </p>
              </div>
            </div>
          </div>

          {/* Supervisor disclaimer */}
          <div className="p-4 bg-blue-50 border border-blue-100 text-[#002366] text-xs rounded-xl flex items-start gap-2.5">
            <UserCheck size={18} className="shrink-0 mt-0.5" />
            <div className="font-semibold">
              <strong className="font-black text-[#002366]">Nota de Operaciones:</strong> En caso de contingencias, el supervisor tiene la facultad legal de reorganizar físicamente la fila presencial o utilizar la pestaña de Ventanilla para forzar llamados manuales.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
