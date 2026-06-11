import React from "react";
import { MRSvgLogo } from "./MRSvgLogo";
import { Mail, MapPin, Phone, MessageSquare, ShieldAlert } from "lucide-react";
import { User } from "../types";

interface FooterProps {
  onNavigate?: (sectionId: string) => void;
  currentUser?: User | null;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentUser }) => {
  return (
    <footer id="app-corporate-footer" className="bg-[#0B0B0B] border-t border-white/10 py-16 text-[#F5F5F0]/50">
      <div className="mx-auto max-w-7xl px-8">
        
        {/* Main upper footer flex wrapper */}
        <div className="grid gap-10 md:grid-cols-12 pb-12 border-b border-white/10">
          
          {/* Column 1: Branding block */}
          <div className="md:col-span-5 space-y-4">
            <MRSvgLogo size={48} showText={true} />
            <p className="text-xs text-[#F5F5F0]/40 max-w-md leading-relaxed mt-2">
              Líder em soluções de assessoria documental corporativa e desenho de projetos. Solidez técnica, excelência jurídica em regularização de imóveis e dedicação absoluta ao sucesso do seu empreendimento.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white">Navegação Geral</h5>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button 
                  onClick={() => onNavigate?.("home")} 
                  className="hover:text-[#D4AF37] transition-all duration-350 text-left cursor-pointer"
                >
                  Início
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.("admin-panel")} 
                  className="hover:text-[#D4AF37] transition-all duration-350 text-left cursor-pointer"
                >
                  Administrativo
                </button>
              </li>
              {currentUser && (
                <>
                  <li>
                    <button 
                      onClick={() => onNavigate?.("register")} 
                      className="hover:text-[#D4AF37] transition-all duration-350 text-left cursor-pointer"
                    >
                      Cadastro
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigate?.("active-clients")} 
                      className="hover:text-[#D4AF37] transition-all duration-350 text-left cursor-pointer"
                    >
                      Clientes Ativos
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigate?.("services")} 
                      className="hover:text-[#D4AF37] transition-all duration-350 text-left cursor-pointer"
                    >
                      Vincular Serviço
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigate?.("active-services")} 
                      className="hover:text-[#D4AF37] transition-all duration-350 text-left cursor-pointer"
                    >
                      Serviços Ativos
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigate?.("reports")} 
                      className="hover:text-[#D4AF37] transition-all duration-350 text-left cursor-pointer"
                    >
                      Relatórios
                    </button>
                  </li>
                </>
              )}
              <li>
                <button 
                  onClick={() => onNavigate?.("contact")} 
                  className="hover:text-[#D4AF37] transition-all duration-350 text-left cursor-pointer"
                >
                  Contato
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Channels */}
          <div className="md:col-span-4 space-y-4">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white font-sans">Central de Relacionamento</h5>
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span>Rua Primeiro de Janeiro, 512, Vila Mirim - Praia Grande/SP</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span>(13) 99717-9202</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span>contato@mraprojetos.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower legal disclaimer layout */}
        <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-[10px] text-gray-500 font-medium">
          <div>
            <p>© 2026 MR Assessoria e Projetos e Participações S.A. Todos os direitos reservados.</p>
            <p className="mt-1">Registro de Incorporação (RI) arquivado conforme as diretrizes regidas pela Lei nº 4.591/64.</p>
          </div>

          <div className="flex gap-4 items-center">
            <a href="#" className="hover:underline flex items-center gap-1 hover:text-[#D4AF37] transition-colors">
              <ShieldAlert className="h-3.5 w-3.5 text-[#D4AF37]" />
              Política de Privacidade
            </a>
            <span>•</span>
            <a href="#" className="hover:underline hover:text-[#D4AF37] transition-colors">Regulamento de Compra</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
