import React, { useState, useEffect } from "react";
import { MRSvgLogo } from "./MRSvgLogo";
import { Menu, X, Phone, Building2, Calculator, MessageSquare, ShieldCheck, HeartHandshake, Mail, FileText, Users, Briefcase, FolderOpen, BarChart3 } from "lucide-react";
import { User } from "../types";

interface HeaderProps {
  onNavigate: (section: string) => void;
  activeSection: string;
  currentUser: User | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNavigate, 
  activeSection,
  currentUser,
  onLogout,
  onOpenLoginModal
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const baseNavItems = [
    { label: "Início", value: "home", icon: Building2 },
    { label: "Administrativo", value: "admin-panel", icon: ShieldCheck },
    { label: "Cadastro", value: "register", icon: FileText },
    { label: "Clientes Ativos", value: "active-clients", icon: Users },
    { label: "Vincular Serviço", value: "services", icon: Briefcase },
    { label: "Serviços Ativos", value: "active-services", icon: FolderOpen },
    { label: "Relatórios", value: "reports", icon: BarChart3 },
    { label: "Contato", value: "contact", icon: Mail },
  ];

  const navItems = currentUser
    ? currentUser.role === "cliente"
      ? baseNavItems.filter((item) => ["home", "admin-panel", "active-services", "contact"].includes(item.value))
      : baseNavItems
    : baseNavItems.filter((item) => ["home", "admin-panel", "contact"].includes(item.value));

  const handleItemClick = (val: string) => {
    onNavigate(val);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="main-app-header"
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/10 bg-[#0F0F0F]/95 py-3.5 shadow-xl backdrop-blur-md"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8">
        {/* Brand Logo */}
        <div className="cursor-pointer" onClick={() => handleItemClick("home")} id="brand-logo-container">
          <MRSvgLogo size={40} showText={true} />
        </div>

        {/* Desktop Navigation - editorial style */}
        <nav className="hidden items-center gap-2 md:flex" id="desktop-nav-menu">
          {navItems.map((item) => {
            const isActive = activeSection === item.value;
            return (
              <button
                key={item.value}
                onClick={() => handleItemClick(item.value)}
                className={`group relative px-4 py-2 font-sans text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-300 ${
                  isActive
                    ? "text-[#D4AF37]"
                    : "text-[#F5F5F0]/60 hover:text-[#F5F5F0]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-[1px] bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick CTA Desk */}
        <div className="hidden items-center gap-4 lg:flex">
          <a
            href="https://wa.me/5513997179202"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-none border border-white/10 bg-transparent px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-400 hover:text-white transition-all"
          >
            <Phone className="h-3 w-3 text-[#D4AF37]" />
            (13) 99717-9202
          </a>

          {currentUser ? (
            <div className="flex items-center gap-3 pl-3 border-l border-white/10" id="header-user-status">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider max-w-[120px] truncate">
                  {currentUser.name}
                </span>
                <span className="text-[8px] text-[#D4AF37] uppercase tracking-widest font-mono font-bold">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="rounded-none border border-white/15 bg-transparent px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#F5F5F0]/60 hover:text-red-400 hover:border-red-500/40 transition-all cursor-pointer"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="rounded-none border border-[#D4AF37] bg-transparent px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] transition-all hover:bg-[#D4AF37]/20 cursor-pointer"
              id="header-login-btn"
            >
              Acessar
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-none p-2 text-[#F5F5F0]/80 transition-colors hover:text-white md:hidden"
          aria-label="Toggle Menu"
          id="mobile-menu-btn"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-drawer-overlay"
          className="fixed inset-0 top-[70px] z-40 h-[calc(100vh-70px)] w-full bg-[#0F0F0F]/98 px-8 py-8 backdrop-blur-lg md:hidden"
        >
          <div className="flex flex-col gap-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => handleItemClick(item.value)}
                  className={`flex items-center gap-4 border-l-2 py-2 pl-4 text-left font-sans text-xs uppercase tracking-[0.2em] font-medium transition-all ${
                    isActive
                      ? "border-[#D4AF37] text-[#D4AF37] bg-white/5"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
            
            <div className="mt-8 border-t border-white/10 pt-6 space-y-4">
              {currentUser ? (
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10" id="mobile-user-status">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{currentUser.name}</span>
                    <span className="text-[9px] text-[#D4AF37] uppercase tracking-widest font-mono font-bold mt-0.5">{currentUser.role}</span>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="rounded-none border border-white/20 bg-transparent px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenLoginModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 rounded-none bg-[#D4AF37] py-4 font-sans text-xs font-bold uppercase tracking-[0.15em] text-black shadow-lg cursor-pointer"
                >
                  Acessar Minha Conta
                </button>
              )}

              <a
                href="https://wa.me/5513997179202"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 rounded-none bg-white/5 border border-white/10 py-4 font-sans text-xs font-bold uppercase tracking-[0.15em] text-white shadow-lg"
              >
                <Phone className="h-4 w-4 text-[#D4AF37]" />
                Falar com Corretor Elite
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
