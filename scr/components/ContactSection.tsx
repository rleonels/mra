import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Geral",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API request to server or save contact locally
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Geral",
        message: "",
      });
    }, 1000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="mx-auto max-w-7xl px-8 py-24 sm:py-32 w-full animate-fade-in" id="contact-tab-section">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-24">
        <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase">
          Atendimento Exclusivo
        </div>
        <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
          Inicie sua Jornada Conosco
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-[#F5F5F0]/60 uppercase tracking-widest max-w-xl mx-auto">
          Estamos prontos para atender suas demandas de assessoria documental e desenhos técnicos de projetos com agilidade e máxima excelência.
        </p>
        <div className="pt-2">
          <span className="inline-block h-[1px] w-12 bg-[#D4AF37]" />
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 items-start">
        {/* Left Column: Rich Context Details */}
        <div className="lg:col-span-5 space-y-10 text-left">
          <div className="space-y-4">
            <h3 className="font-serif text-xl sm:text-2xl text-white font-light tracking-wide">
              MR Assessoria e Projetos
            </h3>
            <p className="text-xs sm:text-sm text-[#F5F5F0]/50 leading-relaxed font-sans max-w-md">
              Oferecemos suporte integral em todo o processo de regularização técnica e jurídica, além de traduzir suas ideias em projetos arquitetônicos requintados e viáveis. Entre em contato ou visite nosso escritório físico.
            </p>
          </div>

          <div className="space-y-6 border-t border-white/5 pt-8">
            {/* Address Info */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-[#D4AF37]/35 bg-[#D4AF37]/5 text-[#D4AF37]">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#D4AF37] tracking-widest uppercase block font-bold">Escritório Central</span>
                <p className="text-[13px] text-white font-medium leading-relaxed">
                  Rua Primeiro de Janeiro, 512, Vila Mirim
                </p>
                <p className="text-xs text-gray-400">Praia Grande / SP</p>
              </div>
            </div>

            {/* Phone Info */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-[#D4AF37]/35 bg-[#D4AF37]/5 text-[#D4AF37]">
                <Phone className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#D4AF37] tracking-widest uppercase block font-bold">Fale Diretamente</span>
                <p className="text-[13px] text-white font-medium leading-relaxed hover:text-[#D4AF37] transition-colors">
                  <a href="tel:+5513997179202" className="cursor-pointer">(13) 99717-9202</a>
                </p>
                <p className="text-xs text-gray-400">Ligação ou WhatsApp</p>
              </div>
            </div>

            {/* Email Info */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-[#D4AF37]/35 bg-[#D4AF37]/5 text-[#D4AF37]">
                <Mail className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#D4AF37] tracking-widest uppercase block font-bold">Correio Eletrônico</span>
                <p className="text-[13px] text-white font-medium leading-relaxed hover:text-[#D4AF37] transition-colors">
                  <a href="mailto:contato@mraprojetos.com" className="cursor-pointer">contato@mraprojetos.com</a>
                </p>
                <p className="text-xs text-gray-400">Respostas em até 24h úteis</p>
              </div>
            </div>

            {/* Hours Info */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-[#D4AF37]/35 bg-[#D4AF37]/5 text-[#D4AF37]">
                <Clock className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#D4AF37] tracking-widest uppercase block font-bold">Horário de Funcionamento</span>
                <p className="text-[13px] text-white font-medium leading-relaxed">
                  Segunda a Sexta: 08:00h às 18:00h
                </p>
                <p className="text-xs text-gray-400">Sábado sob agendamento prévio</p>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp CTA Button */}
          <div className="pt-4">
            <a
              href="https://wa.me/5513997179202"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-none border border-[#D4AF37] bg-transparent text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] px-8 py-4 transition-all hover:bg-[#D4AF37]/10"
              id="whatsapp-cta-contact-page"
            >
              <Phone className="h-4 w-4" />
              Iniciar Conversa no WhatsApp
            </a>
          </div>
        </div>

        {/* Right Column: Custom Message Form */}
        <div className="lg:col-span-7 bg-[#141414] border border-white/5 p-8 sm:p-10 relative">
          <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/45 to-transparent" />

          {submitted ? (
            <div className="py-16 text-center space-y-6 animate-fade-in" id="contact-success-state">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-xl text-white font-medium">Sua Mensagem foi Enviada!</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Agradecemos seu contato. Nossa equipe técnica responsável analisará sua mensagem e retornará em breve.
                </p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="rounded-none border border-white/10 bg-transparent px-6 py-3 text-[10px] uppercase tracking-wider text-[#D4AF37] hover:bg-white/5 transition-all text-center cursor-pointer"
              >
                Enviar Outra Mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" id="corporate-contact-form">
              <div className="space-y-2 text-left">
                <h4 className="font-serif text-lg text-white font-light tracking-wide">Fale Conosco</h4>
                <p className="text-xs text-gray-500">
                  Preencha o formulário abaixo e receba atendimento personalizado de um de nossos engenheiros ou assessores.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Name */}
                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="contact-name" className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Carlos Daniel"
                    className="rounded-none border border-white/10 bg-white/5 px-4 py-3.5 text-xs text-white placeholder-gray-600 outline-none transition-all focus:border-[#D4AF37] focus:bg-white/10"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="contact-email" className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    E-mail de Contato *
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="parceiro@exemplo.com"
                    className="rounded-none border border-white/10 bg-white/5 px-4 py-3.5 text-xs text-white placeholder-gray-600 outline-none transition-all focus:border-[#D4AF37] focus:bg-white/10"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Phone */}
                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="contact-phone" className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    Telefone celular *
                  </label>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Ex: (13) 99717-9202"
                    className="rounded-none border border-white/10 bg-white/5 px-4 py-3.5 text-xs text-white placeholder-gray-600 outline-none transition-all focus:border-[#D4AF37] focus:bg-white/10"
                  />
                </div>

                {/* Subject Option */}
                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="contact-subject" className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    Assunto de Interesse
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="rounded-none border border-white/10 bg-white/5 px-4 py-[15px] text-xs text-white placeholder-gray-600 outline-none transition-all focus:border-[#D4AF37] focus:bg-white/10"
                  >
                    <option value="Assessoria Documental" className="bg-[#141414] text-white">Assessoria Documental</option>
                    <option value="Desenho de Projetos" className="bg-[#141414] text-white">Desenho de Projetos</option>
                    <option value="Parceria Corporativa" className="bg-[#141414] text-white">Parceria Corporativa</option>
                    <option value="Outros Assuntos" className="bg-[#141414] text-white">Outros Assuntos</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2 text-left">
                <label htmlFor="contact-message" className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                  Sua Mensagem *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Descreva detalhadamente sua solicitação ou dúvida técnica..."
                  className="rounded-none border border-white/10 bg-white/5 px-4 py-3.5 text-xs text-white placeholder-gray-600 outline-none transition-all focus:border-[#D4AF37] focus:bg-white/10 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-none bg-[#D4AF37] py-4 text-xs font-bold uppercase tracking-widest text-[#0F0F0F] transition-all hover:bg-[#D4AF37]/90 disabled:opacity-50 cursor-pointer"
                id="contact-form-submit-btn"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#1a1a1a] border-t-transparent" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Enviar Solicitação
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
