import React from "react";
import { ArrowRight, Sparkles, Trophy, Flame } from "lucide-react";

interface HeroProps {
  onLearnMore: () => void;
  onTalkToIA: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLearnMore, onTalkToIA }) => {
  return (
    <section
      id="hero-banner-section"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0F0F0F] pt-28"
    >
      {/* Background Architectural Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80"
          alt="MR Architecture Background"
          className="h-full w-full object-cover opacity-15 filter brightness-[0.35]"
        />
        {/* Soft elegant linear and radial gradients to focus attention */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F] via-transparent to-[#0F0F0F]/60" />
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#D4AF37]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-8 text-center">
        {/* Decorative Tag - Vogue editorial label */}
        <div className="mx-auto mb-8 flex max-w-fit items-center gap-2 border-b border-white/20 pb-2">
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-semibold">
            Edição No. 01 — MR Empreendimentos
          </span>
        </div>

        {/* Dynamic Typography Header (Playfair Display) */}
        <h1 className="font-serif italic text-4xl leading-[1.1] text-[#F5F5F0] sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
          Arquitetura para <br />
          <span className="block mt-2 bg-gradient-to-r from-[#D4AF37] via-[#FFF8E7] to-[#D4AF37] bg-clip-text text-transparent font-normal pl-4 sm:pl-8">
            Inspirar Gerações.
          </span>
        </h1>

        {/* Descriptive Copy - Editorial style side boundary line */}
        <div className="mx-auto mt-8 max-w-2xl border-l border-[#D4AF37] pl-6 text-left">
          <p className="font-sans text-sm leading-relaxed text-[#F5F5F0]/70 md:text-base">
            Na <strong className="text-white font-medium">MR Empreendimentos</strong>, cada projeto é uma obra de arte monumental.
            Fundimos engenharia de precisão com estética silenciosa para erguer residências e lajes corporativas icônicas nas melhores localizações do Brasil.
          </p>
        </div>

        {/* CTA Button Actions - Sharp, elegant minimalist styling */}
        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <button
            onClick={onLearnMore}
            className="group flex w-full items-center justify-center gap-2.5 rounded-none bg-[#D4AF37] px-8 py-4 font-sans text-[10px] uppercase tracking-[0.25em] font-bold text-black transition-all hover:bg-white sm:w-auto"
          >
            Conhecer Portfólio
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onTalkToIA}
            className="flex w-full items-center justify-center gap-2 rounded-none border border-white/20 bg-transparent px-8 py-4 font-sans text-[10px] uppercase tracking-[0.25em] font-bold text-[#F5F5F0] transition-colors hover:border-[#D4AF37] hover:bg-white/5 sm:w-auto"
          >
            Falar com Consultor IA
          </button>
        </div>

        {/* Highlighting Corporate Figures - Minimalist Editorial table style */}
        <div className="mt-20 grid grid-cols-2 gap-6 border-t border-white/10 py-12 md:grid-cols-4">
          <div className="flex flex-col items-center border-r border-[#CDA07E]/5 last:border-none">
            <span className="font-serif italic text-3xl font-light text-[#F5F5F0] md:text-4xl">
              100%
            </span>
            <span className="mt-2 text-center font-sans text-[9px] font-bold tracking-[0.2em] text-[#F5F5F0]/45 uppercase">
              Obras Entregues
            </span>
          </div>

          <div className="flex flex-col items-center border-r border-[#CDA07E]/5 last:border-none">
            <span className="font-serif italic text-3xl font-light text-[#F5F5F0] md:text-4xl">
              R$ 1.5B+
            </span>
            <span className="mt-2 text-center font-sans text-[9px] font-bold tracking-[0.2em] text-[#F5F5F0]/45 uppercase">
              Sob Gestão de Obras
            </span>
          </div>

          <div className="flex flex-col items-center border-r border-[#CDA07E]/5 last:border-none">
            <span className="font-serif italic text-3xl font-semibold text-[#D4AF37] md:text-4xl">
              AAA
            </span>
            <span className="mt-2 text-center font-sans text-[9px] font-bold tracking-[0.2em] text-[#F5F5F0]/45 uppercase">
              Acabamento de Luxo
            </span>
          </div>

          <div className="flex flex-col items-center last:border-none">
            <span className="font-serif italic text-3xl font-light text-[#F5F5F0] md:text-4xl">
              LEED Gold
            </span>
            <span className="mt-2 text-center font-sans text-[9px] font-bold tracking-[0.2em] text-[#F5F5F0]/45 uppercase">
              Sustentabilidade
            </span>
          </div>
        </div>
      </div>

      {/* Decorative vertical mask line */}
      <div className="absolute bottom-0 h-16 w-[1px] bg-gradient-to-b from-[#D4AF37]/50 to-transparent" />
    </section>
  );
};
