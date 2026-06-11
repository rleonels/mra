import React, { useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { ContactSection } from "./components/ContactSection";
import { ClientRegistration } from "./components/ClientRegistration";
import { ActiveClientsList } from "./components/ActiveClientsList";
import { ServicesPanel } from "./components/ServicesPanel";
import { ReportsPanel } from "./components/ReportsPanel";
import { AdminPanel } from "./components/AdminPanel";
import { User } from "./types";

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("mr_logged_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("mr_logged_user");
    setCurrentUser(null);
  };

  const handleAuthSuccess = (user: User) => {
    localStorage.setItem("mr_logged_user", JSON.stringify(user));
    setCurrentUser(user);
  };

  const isAllowedSection = (sectionId: string) => {
    if (!currentUser) {
      return ["home", "admin-panel", "contact"].includes(sectionId);
    }
    if (currentUser.role === "cliente") {
      return ["home", "admin-panel", "active-services", "contact"].includes(sectionId);
    }
    return true; // administrador has access to all
  };

  const handleNavigate = (sectionId: string) => {
    if (isAllowedSection(sectionId)) {
      setActiveSection(sectionId);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const resolvedSection = isAllowedSection(activeSection) ? activeSection : "home";

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-gray-150 selection:bg-[#D4AF37]/30 selection:text-[#D4AF37] flex flex-col justify-between">
      {/* Dynamic Navigation Bar */}
      <Header 
        onNavigate={handleNavigate} 
        activeSection={resolvedSection} 
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main minimal Centerpiece / Contact / Registration Section */}
      <main className="flex-grow flex flex-col items-center justify-center">
        {resolvedSection === "home" ? (
          <div className="max-w-3xl space-y-6 px-8 py-32 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase">
              MR Assessoria e Projetos
            </div>
            <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight">
              Assessoria Documental & Desenho de Projetos
            </h1>
            <p className="mx-auto max-w-xl text-xs sm:text-sm leading-relaxed text-[#F5F5F0]/65 uppercase tracking-widest">
              Soluções corporativas completas para regularização de imóveis, licenciamento técnico e elaboração de projetos arquitetônicos with precisão e excelência estética.
            </p>
            <div className="pt-4">
              <span className="inline-block h-[1px] w-12 bg-[#D4AF37]" />
            </div>
          </div>
        ) : resolvedSection === "register" ? (
          <ClientRegistration />
        ) : resolvedSection === "active-clients" ? (
          <ActiveClientsList onNavigate={handleNavigate} />
        ) : resolvedSection === "services" ? (
          <ServicesPanel mode="form" currentUser={currentUser} />
        ) : resolvedSection === "active-services" ? (
          <ServicesPanel mode="list" currentUser={currentUser} />
        ) : resolvedSection === "reports" ? (
          <ReportsPanel />
        ) : resolvedSection === "admin-panel" ? (
          <AdminPanel 
            currentUser={currentUser} 
            onAuthSuccess={handleAuthSuccess}
            onOpenLoginModal={() => setIsAuthModalOpen(true)}
          />
        ) : (
          <ContactSection />
        )}
      </main>

      {/* Branded corporate Footer */}
      <Footer onNavigate={handleNavigate} currentUser={currentUser} />

      {/* Corporate Authentication Dialog Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
