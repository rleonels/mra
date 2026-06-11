import React, { useState, useEffect } from "react";
import { PROPERTIES } from "../data/properties";
import { Scheduling, User } from "../types";
import { HeartHandshake, Phone, Mail, Calendar, Clock, User as UserIcon, CheckCircle, List, ArrowDown } from "lucide-react";

interface SchedulingFormProps {
  preselectedPropertyName?: string;
  currentUser: User | null;
  refreshTrigger?: number;
}

export const SchedulingForm: React.FC<SchedulingFormProps> = ({ 
  preselectedPropertyName = "",
  currentUser,
  refreshTrigger = 0
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [property, setProperty] = useState(preselectedPropertyName || "MR Sky Residence");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  
  const [schedulesList, setSchedulesList] = useState<Scheduling[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Populate data if user logs in
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
    } else {
      setName("");
      setEmail("");
    }
  }, [currentUser]);

  // Sync pre-selected property
  useEffect(() => {
    if (preselectedPropertyName) {
      setProperty(preselectedPropertyName);
    }
  }, [preselectedPropertyName]);

  // Load schedules on mounting and when user submits custom items or trigger updates
  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedulings");
      const data = await res.json();
      if (data.success && data.data) {
        setSchedulesList(data.data);
      }
    } catch (err) {
      console.error("Erro ao listar agendamentos do servidor:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [refreshTrigger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !property || !date || !time) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/schedulings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, property, date, time, notes }),
      });

      const resData = await response.json();
      if (resData.success) {
        setSubmitSuccess(true);
        // Reset form controls
        setName("");
        setEmail("");
        setPhone("");
        setDate("");
        setTime("");
        setNotes("");
        // Reload list directly
        fetchSchedules();
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error(resData.error || "Erro desconhecido.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Ocorreu um erro ao registrar seu agendamento no servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="visit-scheduling-section" className="bg-[#0F0F0F] py-24 text-[#F5F5F0] relative border-t border-white/10">
      <div className="mx-auto max-w-7xl px-8">
        
        {/* Section Header */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase mb-2">
            <HeartHandshake className="h-4 w-4" />
            Visitas & Atendimento
          </div>
          <h2 className="font-serif italic text-3xl font-light text-white sm:text-4xl">
            Vivencie a Exclusividade
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-[#F5F5F0]/65">
            Agende uma visita privada presencial guiada por nossa equipe ou videoconferência de demonstração de alta fidelidade.
          </p>
        </div>

        {/* Dual Form + Live List Schedulings Panel */}
        <div className="grid gap-12 lg:grid-cols-12 items-start" id="scheduling-panel-grid">
          
          {/* Scheduling inputs form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-6 bg-[#141414] p-8 rounded-none border border-white/10 space-y-5"
            id="visit-booking-form"
          >
            <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-3 flex items-center gap-2 mb-2">
              Solicitar Agendamento
            </h3>

            {submitSuccess && (
              <div className="rounded-none bg-emerald-950/40 border border-emerald-500/30 p-4 text-emerald-300 text-xs sm:text-sm flex gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="block text-white uppercase tracking-wider text-xs">Solicitação registrada com sucesso!</strong>
                  Seu consultor elite entrará em contato em menos de 1 hora para confirmar os detalhes.
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-none bg-red-950/40 border border-red-500/30 p-4 text-red-300 text-xs uppercase tracking-widest">
                {errorMessage}
              </div>
            )}

            {/* Field Name */}
            <div>
              <label htmlFor="booking-name" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="booking-name"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-none bg-[#1A1A1A] border border-white/10 py-3.5 pl-11 pr-4 text-xs font-semibold tracking-wider text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] transition-all"
                  required
                />
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* Field Contact (Email / Phone) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="booking-email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">
                  E-mail de Trabalho <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="booking-email"
                    placeholder="exemplo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-none bg-[#1A1A1A] border border-white/10 py-3.5 pl-11 pr-4 text-xs font-semibold tracking-wider text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] transition-all"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div>
                <label htmlFor="booking-phone" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">
                  Telefone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="booking-phone"
                    placeholder="(51) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-none bg-[#1A1A1A] border border-white/10 py-3.5 pl-11 pr-4 text-xs font-semibold tracking-wider text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] transition-all"
                    required
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Field Property selector */}
            <div>
              <label htmlFor="booking-property" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">
                Escolha o Empreendimento <span className="text-red-500">*</span>
              </label>
              <select
                id="booking-property"
                value={property}
                onChange={(e) => setProperty(e.target.value)}
                className="w-full rounded-none bg-[#1A1A1A] border border-white/10 px-4 py-3.5 text-xs font-semibold tracking-wider uppercase text-white focus:border-[#D4AF37] outline-none"
              >
                {PROPERTIES.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Field Date & Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="booking-date" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">
                  Data Desejada <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="booking-date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-none bg-[#1A1A1A] border border-white/10 py-3.5 pl-11 pr-4 text-xs text-white focus:border-[#D4AF37] outline-none"
                    required
                  />
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div>
                <label htmlFor="booking-time" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">
                  Horário Desejado <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    id="booking-time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-none bg-[#1A1A1A] border border-white/10 py-3.5 pl-11 pr-4 text-xs text-white focus:border-[#D4AF37] outline-none"
                    required
                  />
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Special notes */}
            <div>
              <label htmlFor="booking-notes" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">
                Mensagem ou Observações Especiais
              </label>
              <textarea
                id="booking-notes"
                placeholder="Exemplo: Preciso de intérprete em inglês, ou tenho interesse em andar alto..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-none bg-[#1A1A1A] border border-white/10 p-4 text-xs text-white focus:border-[#D4AF37] outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-none bg-[#D4AF37] py-4 text-center text-xs font-bold uppercase tracking-widest text-black hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              {isSubmitting ? "Enviando Requisição..." : "Agendar Atendimento Elite"}
            </button>
          </form>

          {/* List and check schedules in real time column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#141414] p-8 rounded-none border border-white/10">
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs uppercase tracking-widest border-b border-white/10 pb-3 mb-4">
                <List className="h-4 w-4" />
                Seus Agendamentos de Visita
              </div>
              
              {currentUser?.role === "administrador" ? (
                <div className="text-center py-10 px-4" id="admin-notice">
                  <p className="text-xs text-[#F5F5F0]/70 uppercase tracking-widest mb-4 leading-relaxed font-semibold">
                    Você está autenticado como <strong className="text-[#D4AF37]">Administrador</strong>
                  </p>
                  <p className="text-xs text-[#F5F5F0]/50 mb-6 leading-relaxed">
                    Para visualizar, confirmar, cancelar ou apagar os agendamentos de todos os clientes, utilize o Painel de Controle administrativo integrado no rodapé do sistema.
                  </p>
                  <a
                    href="#admin-dashboard-section"
                    className="inline-block rounded-none border border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 hover:bg-[#D4AF37] hover:text-black transition-all"
                  >
                    Ir para o Painel Admin
                  </a>
                </div>
              ) : (
                <>
                  <p className="text-xs text-[#F5F5F0]/60 leading-relaxed mb-6">
                    {currentUser 
                      ? `Exibindo agendamentos exclusivos de ${currentUser.name} (${currentUser.email}).` 
                      : "Faça login ou digite seu e-mail no formulário para acompanhar seus agendamentos exclusivos em tempo real."
                    }
                  </p>

                  {/* Schedules Loop */}
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1" id="scheduled-visits-loop">
                    {schedulesList.filter(item => {
                      const targetEmail = currentUser ? currentUser.email : email;
                      if (!targetEmail) return false;
                      return item.email.toLowerCase().trim() === targetEmail.toLowerCase().trim();
                    }).length === 0 ? (
                      <div className="text-center py-12 border border-white/5 bg-white/2">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                          {currentUser ? "Nenhum agendamento encontrado para sua conta." : "Digite seu e-mail ou logue-se para ver agendamentos."}
                        </p>
                      </div>
                    ) : (
                      schedulesList.filter(item => {
                        const targetEmail = currentUser ? currentUser.email : email;
                        if (!targetEmail) return false;
                        return item.email.toLowerCase().trim() === targetEmail.toLowerCase().trim();
                      }).map((item) => (
                        <div
                          key={item.id}
                          className="bg-white/5 rounded-none p-5 border border-white/10 flex items-start justify-between gap-4 shadow-sm hover:border-[#D4AF37]/40 transition-all duration-300"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-serif italic text-sm font-light text-white capitalize">{item.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono">• ID #{item.id}</span>
                            </div>
                            
                            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                              Empreendimento: {item.property}
                            </p>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-400 font-medium">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-500 shrink-0" />
                                <span>Data: {item.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-500 shrink-0" />
                                <span>Hora: {item.time}</span>
                              </div>
                              <div className="col-span-2 flex items-center gap-1 mt-1 font-mono text-[10px]">
                                <Mail className="h-3 w-3 text-gray-600 shrink-0" />
                                <span className="truncate">{item.email}</span>
                              </div>
                            </div>
                            {item.notes && (
                              <p className="text-[11px] text-gray-500 italic mt-2.5 max-w-sm line-clamp-2">
                                "{item.notes}"
                              </p>
                            )}
                          </div>

                          {/* Status Badge */}
                          <span className={`shrink-0 rounded-none px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${
                            item.status === "Confirmado"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/20"
                              : item.status === "Cancelado"
                              ? "bg-red-950/80 text-red-400 border border-red-500/20"
                              : "bg-amber-950/80 text-amber-400 border border-amber-500/20"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
