import React, { useState } from "react";
import { Mail, Lock, User as UserIcon, X, ShieldAlert, Sparkles, LogIn, ChevronRight } from "lucide-react";
import { User } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"cliente" | "administrador">("cliente");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" 
        ? { email, password } 
        : { name, email, password, role };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Ocorreu um erro no processamento");
      }

      if (mode === "register") {
        setSuccessMsg("Conta criada com sucesso! Realizando autenticação automática...");
        // Auto logo after successful registration
        setTimeout(async () => {
          try {
            const loginResp = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password })
            });
            const loginResult = await loginResp.json();
            if (loginResp.ok && loginResult.success) {
              onAuthSuccess(loginResult.data);
              onClose();
            } else {
              setMode("login");
              setSuccessMsg("");
            }
          } catch {
            setMode("login");
            setSuccessMsg("");
          } finally {
            setLoading(false);
          }
        }, 1200);
      } else {
        onAuthSuccess(result.data);
        onClose();
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor de autenticação");
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setSuccessMsg("");
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
    >
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-none border border-white/10 bg-[#0F0F0F] text-left shadow-2xl p-8"
        id="auth-modal-box"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-none bg-black/60 p-2 text-[#F5F5F0]/60 hover:text-white border border-white/10 transition-colors"
          aria-label="Close"
          id="close-auth-modal-btn"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Branding */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-[9px] tracking-[0.3em] uppercase mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            MR Credenciais Elite
          </div>
          <h3 className="font-serif italic text-2xl font-light text-white">
            {mode === "login" ? "Acessar Plataforma" : "Criar Nova Conta"}
          </h3>
          <p className="text-[11px] text-[#F5F5F0]/50 tracking-wider uppercase mt-1">
            {mode === "login" 
              ? "Insira seus dados de acesso corporativo" 
              : "Cadastre-se para acompanhar visitas e portfólio"
            }
          </p>
        </div>

        {/* Demo Accounts Tip block */}
        {mode === "login" && (
          <div className="mb-4 bg-white/5 border border-white/5 p-3 text-[10px] text-[#F5F5F0]/60 font-sans uppercase tracking-wider leading-relaxed">
            <p className="font-bold text-[#D4AF37] mb-1">Acesso de Demonstração:</p>
            <p>• <strong className="text-white">Admin:</strong> admin@mr.com.br | Senha: <span className="text-white">admin</span></p>
            <p>• <strong className="text-white">Cliente:</strong> carlos.silva@example.com | Senha: <span className="text-white">client</span></p>
          </div>
        )}

        {/* Error/Success message area */}
        {error && (
          <div className="mb-4 rounded-none bg-red-950/30 border border-red-500/20 p-3 text-red-300 text-[10px] uppercase tracking-wider flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-none bg-emerald-950/30 border border-emerald-500/20 p-3 text-emerald-300 text-[10px] uppercase tracking-wider">
            {successMsg}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form-submit">
          {mode === "register" && (
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-[0.22em] mb-1.5">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-none bg-[#1A1A1A] border border-white/10 py-3 pl-10 pr-4 text-xs font-semibold tracking-wider text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] transition-all"
                  required
                />
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-[0.22em] mb-1.5">
              Endereço de E-mail <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="nome@corporativo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-none bg-[#1A1A1A] border border-white/10 py-3 pl-10 pr-4 text-xs font-semibold tracking-wider text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] transition-all"
                required
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-[0.22em] mb-1.5">
              Senha de Acesso <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-none bg-[#1A1A1A] border border-white/10 py-3 pl-10 pr-4 text-xs font-semibold tracking-wider text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] transition-all"
                required
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-[0.22em] mb-2">
                Tipo de Perfil de Usuário <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3" id="auth-role-select-box">
                <button
                  type="button"
                  onClick={() => setRole("cliente")}
                  className={`rounded-none border py-3.5 text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    role === "cliente"
                      ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                      : "border-white/10 bg-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  Cliente / Comprador
                  <span className="block text-[7px] font-normal lowercase text-gray-400 mt-1">Acompanhe seus agendamentos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("administrador")}
                  className={`rounded-none border py-3.5 text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    role === "administrador"
                      ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                      : "border-white/10 bg-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  Administrador MR
                  <span className="block text-[7px] font-normal lowercase text-gray-400 mt-1">Gerencie visitas de clientes</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-none bg-[#D4AF37] py-3.5 mt-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-white transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            {loading ? (
              "Processando..."
            ) : (
              <>
                {mode === "login" ? "Entrar na Plataforma" : "Cadastrar Conta Elite"}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode footer banner */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <button
            onClick={toggleMode}
            className="text-[10px] font-bold text-[#D4AF37] hover:text-white uppercase tracking-widest underline transition-colors"
          >
            {mode === "login" 
              ? "Não possui conta? Cadastre-se aqui" 
              : "Já possui uma conta? Faça Login"
            }
          </button>
        </div>
      </div>
    </div>
  );
};
