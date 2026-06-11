import React from "react";
import { Award, Compass, ShieldCheck, Leaf, Sparkles, CheckCircle2 } from "lucide-react";

export const AboutUs: React.FC = () => {
  const values = [
    {
      icon: Award,
      title: "Padrão Triple A (AAA)",
      desc: "Trabalhamos exclusivamente com o mais alto escalão de acabamentos, mármores importados selecionados, esquadrias termoacústicas alemãs e concreto protendido de alta resistência."
    },
    {
      icon: Leaf,
      title: "Sustentabilidade Ativa",
      desc: "Todos os nossos projetos contam com autogeração solar, eficiência no consumo hídrico, áreas comuns arborizadas nativas integradas ao condomínio e gestão inteligente de resíduos corporativos."
    },
    {
      icon: ShieldCheck,
      title: "Solidez e Confidencialidade",
      desc: "Fundada sobre bases seguras de capital próprio, a incorporadora MR assegura 100% de pontualidade na entrega, além de sistemas avançados de segurança militarizada para confidencialidade dos moradores."
    },
    {
      icon: Compass,
      title: "Estética Contemporânea",
      desc: "Colaboramos com renomados designers internacionais e escritórios de arquitetura contemporânea para desenvolver layouts fluidos, pé-direito imponente e integração biofílica total."
    }
  ];

  return (
    <section id="about-us-section" className="bg-[#0F0F0F] py-24 text-[#F5F5F0] relative border-t border-white/10">
      <div className="mx-auto max-w-7xl px-8">
        
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase mb-2">
            <Sparkles className="h-4 w-4" />
            Nossa Essência
          </div>
          <h2 className="font-serif italic text-3xl font-light text-white sm:text-4xl">
            Compromisso com o Extraordinário
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-[#F5F5F0]/65">
            A MR Empreendimentos não ergue apenas edifícios. Nós esculpimos marcos geográficos que transformam e valorizam as metrópoles brasileiras.
          </p>
        </div>

        {/* Dual blocks for corporate values */}
        <div className="grid gap-12 lg:grid-cols-2 items-center" id="about-content-grid">
          
          {/* Left Text Block */}
          <div className="space-y-6">
            <h3 className="font-serif italic text-2xl font-light text-white tracking-tight leading-snug">
              Uma história esculpida em <span className="text-[#D4AF37] font-serif italic font-normal">Engenharia de Precisão</span> e Design Monumental.
            </h3>
            <p className="text-xs sm:text-sm text-[#F5F5F0]/70 leading-relaxed border-l border-[#D4AF37] pl-5">
              Há mais de duas décadas, a MR Empreendimentos lidera o mercado imobiliário premium nacional. Unimos a solidez financeira de nossos sócios à ousadia de nossa equipe de engenharia para redefinir o conceito de exclusividade no morar e trabalhar.
            </p>
            <p className="text-xs sm:text-sm text-[#F5F5F0]/55 leading-relaxed">
              Acreditamos que um imóvel de luxo deve ser autônomo, seguro e atemporal. É por isso que fomos pioneiros na integração de usinas fotovoltaicas prediais de série em nossos residenciais e na obtenção sistemática de certificados ambientais de prestígio em todos os nossos corporativos AAA.
            </p>

            {/* Quick bullets list cards */}
            <div className="grid gap-3 pt-4 sm:grid-cols-2">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-[#F5F5F0]/80 tracking-wide uppercase">
                <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span>100% de entregas no prazo</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-[#F5F5F0]/80 tracking-wide uppercase">
                <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span>Capital privado garantido</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-[#F5F5F0]/80 tracking-wide uppercase">
                <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span>Suporte Concierge VIP</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-[#F5F5F0]/80 tracking-wide uppercase">
                <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span>Incorporação registrada</span>
              </div>
            </div>
          </div>

          {/* Right Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((v, index) => {
              const Icon = v.icon;
              return (
                <div
                  key={index}
                  className="bg-[#141414] p-6 rounded-none border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col justify-between h-56"
                >
                  <div className="h-10 w-10 rounded-none bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-white">
                      {v.title}
                    </h4>
                    <p className="text-xs text-[#F5F5F0]/60 mt-3 leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
