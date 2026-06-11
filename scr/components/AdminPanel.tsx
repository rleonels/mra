import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  FolderOpen, 
  CheckCircle2, 
  Search, 
  SlidersHorizontal, 
  FileEdit, 
  Check, 
  X, 
  Calculator, 
  Activity, 
  Landmark, 
  User as UserIcon,
  HelpCircle,
  PiggyBank
} from "lucide-react";
import { User } from "../types";

interface ServiceItem {
  id: string;
  clientId: string;
  clientName: string;
  serviceType: "Assessoria" | "Aprovação" | "CLCB" | "Licenciamento Ambiental" | "Regularização";
  status: "Pendente" | "Em Andamento" | "Concluído";
  regDate: string;
  notes: string;
  demolicao?: boolean;
  fossaFiltro?: boolean;
  cartaHabitacao?: boolean;
  clcb?: boolean;
  licenciamentoAmbiental?: boolean;
  numeroProcesso?: string;
  loteamento?: string;
  quadra?: string;
  lote?: string;
  endereco?: string;
  valorServico?: number;
  entrada?: number;
  pagamentos?: number;
  aReceber?: number;
}

interface Client {
  id: string;
  name: string;
  taxId: string;
  phone: string;
  email: string;
  address: string;
  regDate: string;
}

interface AdminPanelProps {
  currentUser: User | null;
  onAuthSuccess: (user: User) => void;
  onOpenLoginModal: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  currentUser, 
  onAuthSuccess,
  onOpenLoginModal 
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all");

  // Editing state
  const [editId, setEditId] = useState<string | null>(null);
  const [editValorServico, setEditValorServico] = useState("");
  const [editEntrada, setEditEntrada] = useState("");
  const [editPagamentos, setEditPagamentos] = useState("");

  // Demo auto-login states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load database from server
  const loadDatabase = async () => {
    try {
      const clientsRes = await fetch("/api/clients");
      const clientsData = await clientsRes.json();
      if (clientsData.success) {
        setClients(clientsData.data);
      }

      const servicesRes = await fetch("/api/services");
      const servicesData = await servicesRes.json();
      if (servicesData.success) {
        setServices(servicesData.data);
      }
    } catch (e) {
      console.error("Erro ao carregar dados do servidor", e);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@mr.com.br", password: "admin" })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        onAuthSuccess(result.data);
      } else {
        throw new Error(result.error || "Credenciais inválidas");
      }
    } catch (err: any) {
      // Fallback local mock in case server is not ready
      console.warn("Express endpoint auth failed, logging in locally:", err);
      const mockAdmin: User = {
        id: "u-1",
        name: "Administrador Geral (Demo)",
        email: "admin@mr.com.br",
        role: "administrador"
      };
      onAuthSuccess(mockAdmin);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFinancials = async (id: string) => {
    const original = services.find(s => s.id === id);
    if (!original) return;

    const valServico = parseFloat(editValorServico) || 0;
    const ent = parseFloat(editEntrada) || 0;
    const pag = parseFloat(editPagamentos) || 0;
    const aRec = Math.max(0, valServico - (ent + pag));

    const updatedService = {
      ...original,
      valorServico: valServico,
      entrada: ent,
      pagamentos: pag,
      aReceber: aRec
    };

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedService)
      });
      const data = await res.json();
      if (data.success) {
        setServices(prev => prev.map(s => s.id === id ? data.data : s));
      }
    } catch (e) {
      console.error("Erro ao salvar faturamento no servidor", e);
    }
    setEditId(null);
  };

  const handleEditClick = (s: ServiceItem) => {
    setEditId(s.id);
    setEditValorServico((s.valorServico || 0).toString());
    setEditEntrada((s.entrada || 0).toString());
    setEditPagamentos((s.pagamentos || 0).toString());
  };

  // Calculations for financial overview
  const totalFinancialValue = services.reduce((acc, s) => acc + (s.valorServico || 0), 0);
  const totalFinancialReceived = services.reduce((acc, s) => acc + (s.entrada || 0) + (s.pagamentos || 0), 0);
  const totalFinancialOutstanding = services.reduce((acc, s) => {
    const calc = (s.valorServico || 0) - ((s.entrada || 0) + (s.pagamentos || 0));
    return acc + Math.max(0, calc);
  }, 0);

  const receivedPercentage = totalFinancialValue > 0 
    ? Math.round((totalFinancialReceived / totalFinancialValue) * 100) 
    : 0;

  // Filter Services
  const filteredServices = services.filter(service => {
    const clientName = service.clientName || "";
    const serviceType = service.serviceType || "";
    const processNum = service.numeroProcesso || "";
    const matchesSearch = 
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processNum.toLowerCase().includes(searchTerm.toLowerCase());

    const isPaidCombined = (service.valorServico || 0) > 0 && 
      ((service.entrada || 0) + (service.pagamentos || 0)) >= (service.valorServico || 0);

    const matchesStatus = 
      statusFilter === "all" ? true :
      statusFilter === "paid" ? isPaidCombined : 
      !isPaidCombined; // Pending / open balance

    const matchesType = serviceTypeFilter === "all" ? true : serviceType === serviceTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics per category for chart
  const categories: ("Assessoria" | "Aprovação" | "CLCB" | "Licenciamento Ambiental" | "Regularização")[] = [
    "Assessoria", "Aprovação", "CLCB", "Licenciamento Ambiental", "Regularização"
  ];

  const categoryStats = categories.map(cat => {
    const catServices = services.filter(s => s.serviceType === cat);
    const volume = catServices.reduce((acc, s) => acc + (s.valorServico || 0), 0);
    const count = catServices.length;
    return { name: cat, volume, count };
  });

  const maxVolume = Math.max(...categoryStats.map(c => c.volume), 1);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  // If user is not logged in as Admin, show a stunning authentication portal/notice
  if (!currentUser || currentUser.role !== "administrador") {
    return (
      <section className="w-full max-w-4xl mx-auto px-6 py-28 text-left animate-fade-in" id="admin-lock-screen">
        <div className="relative border border-[#D4AF37]/30 bg-black/40 p-8 sm:p-12 shadow-2xl backdrop-blur-md">
          <div className="absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="rounded-full bg-[#D4AF37]/10 p-5 border border-[#D4AF37]/20 flex items-center justify-center animate-pulse">
              <ShieldAlert className="h-10 w-10 text-[#D4AF37]" />
            </div>

            <div className="space-y-2 max-w-md">
              <div className="text-[10px] uppercase font-mono tracking-[0.3em] font-semibold text-[#D4AF37]">
                Área Restrita MR Assessoria
              </div>
              <h2 className="font-serif italic text-2xl sm:text-3xl text-white">
                Controle de Inteligência Financeira
              </h2>
              <p className="text-xs text-paragraph/75 leading-relaxed font-sans">
                A Central Administrativa e Resumo de Finanças é restrita para contas com privilégios de **Administrador**. Faça login com uma conta autorizada para visualizar relatórios, faturamentos e fluxo de caixa.
              </p>
            </div>

            <div className="w-full max-w-sm border-t border-white/5 pt-6 flex flex-col gap-3">
              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B38F11] hover:from-[#E5C048] hover:to-[#C59F22] text-black font-mono text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-md active:scale-[0.98] disabled:opacity-40"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-black border-t-transparent" />
                ) : (
                  <Check className="h-3.5 w-3.5 text-black" />
                )}
                Acesso de Demo (admin@mr.com.br)
              </button>

              <button
                onClick={onOpenLoginModal}
                className="w-full py-3 bg-transparent border border-white/10 hover:border-white/30 text-white font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 text-[#D4AF37]" />
                Entrar com Outra Conta
              </button>
            </div>

            <div className="text-[9px] font-mono text-gray-500 bg-white/2 p-3 border border-white/5 rounded-md w-full max-w-xs uppercase tracking-wider">
              Usuário de Testes Geral:<br/>
              <span className="text-[#D4AF37]">Email: admin@mr.com.br</span><br/>
              <span className="text-[#D4AF37]">Senha: admin</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-8 py-24 text-left animate-fade-in" id="admin-panel-section">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase">
          <Activity className="h-3.5 w-3.5" /> Administração Consolidada
        </div>
        <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
          Painel Financeiro & de Caixa
        </h2>
        <p className="mx-auto max-w-xl text-xs sm:text-sm leading-relaxed text-[#F5F5F0]/65 uppercase tracking-widest text-center">
          Monitoramento do faturamento por serviço, amortização de parcelas, valores inadimplentes e balanço patrimonial.
        </p>
      </div>

      {/* Financial KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="border border-white/5 bg-[#121212]/50 p-6 relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D4AF37]" />
          <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Landmark className="h-3 w-3 text-[#D4AF37]" /> Valor Global Portfólio
          </p>
          <p className="text-3xl font-serif text-white mt-1.5 font-light">
            {formatCurrency(totalFinancialValue)}
          </p>
          <p className="text-[10px] font-mono text-[#D4AF37] mt-2 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" /> {services.length} Contratos Registrados
          </p>
        </div>

        <div className="border border-white/5 bg-[#121212]/50 p-6 relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Caixa Líquido Recebido
          </p>
          <p className="text-3xl font-serif text-emerald-400 mt-1.5 font-light">
            {formatCurrency(totalFinancialReceived)}
          </p>
          <p className="text-[10px] font-mono text-gray-400 mt-2">
            Entrada / Sinal + Parcelas quitadas
          </p>
        </div>

        <div className="border border-white/5 bg-[#121212]/50 p-6 relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <DollarSign className="h-3 w-3 text-amber-500" /> Saldo Pendente a Receber
          </p>
          <p className="text-3xl font-serif text-amber-400 mt-1.5 font-light">
            {formatCurrency(totalFinancialOutstanding)}
          </p>
          <p className="text-[10px] font-mono text-amber-500/80 mt-2">
            Contratos em aberto ou parcelados
          </p>
        </div>

        {/* Amortization Radial Gauges / Progress */}
        <div className="border border-white/5 bg-[#121212]/50 p-6 relative">
          <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-[#D4AF37]" /> Índice de Liquidação
          </p>
          
          <div className="flex items-center gap-4 mt-2">
            {/* Minimal SVG Dial Indicator */}
            <div className="relative shrink-0 w-14 h-14">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="28" 
                  cy="28" 
                  r="23" 
                  className="stroke-white/5" 
                  strokeWidth="3.5" 
                  fill="none" 
                />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="23" 
                  className="stroke-[#D4AF37]" 
                  strokeWidth="3.5" 
                  fill="none" 
                  strokeDasharray={2 * Math.PI * 23} 
                  strokeDashoffset={2 * Math.PI * 23 * (1 - receivedPercentage / 100)} 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white">
                {receivedPercentage}%
              </div>
            </div>

            <div>
              <p className="text-sm font-sans font-medium text-white">Progresso de Caixa</p>
              <p className="text-[10px] text-gray-500 leading-tight">
                {formatCurrency(totalFinancialReceived)} arrecadados de {formatCurrency(totalFinancialValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Block: Dynamic SVGs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Chart 1: Revenue Volume by Service Class */}
        <div className="lg:col-span-8 border border-white/5 bg-[#121212]/30 p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div>
              <h3 className="font-serif italic text-base text-white">Distribuição por Categoria</h3>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Volume de faturados por classe técnica de serviço</p>
            </div>
            <span className="px-2.5 py-0.5 text-[9px] font-mono bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase">
              Consolidado
            </span>
          </div>

          <div className="space-y-5">
            {categoryStats.map((stat, idx) => {
              const widthPct = Math.max(8, Math.round((stat.volume / maxVolume) * 100));
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-sans text-gray-400">
                    <span className="text-white hover:text-[#D4AF37] transition-colors">{stat.name} ({stat.count} contratos)</span>
                    <span className="font-mono text-white tracking-widest">{formatCurrency(stat.volume)}</span>
                  </div>
                  <div className="h-2.5 bg-white/5 relative">
                    <div 
                      className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#D4AF37]/60 to-[#D4AF37] transition-all duration-1000"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info panel - Quick breakdown explanation */}
        <div className="lg:col-span-4 border border-white/5 bg-[#121212]/30 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-serif italic text-base text-white">Dicas de Faturamento</h3>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Gestão estratégica de cobrança</p>
            </div>

            <div className="space-y-3.5">
              <div className="text-xs bg-white/2 border border-white/5 p-3 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-[#D4AF37] rounded-full" />
                  Regra de Entrada Técnica
                </p>
                <p className="text-[11px] text-gray-400">
                  É altamente recomendado exigir pelo menos **30% a 50% de Sinal / Entrada** no fechamento do contrato para mitigar custos de documentação e taxas corporativas.
                </p>
              </div>

              <div className="text-xs bg-white/2 border border-white/5 p-3 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
                  Acompanhamento Técnico
                </p>
                <p className="text-[11px] text-gray-400">
                  Existem no momento <span className="text-amber-400 font-bold">{services.filter(s => {
                    const totalPaid = (s.entrada || 0) + (s.pagamentos || 0);
                    return (s.valorServico || 0) > 0 && totalPaid < (s.valorServico || 0);
                  }).length}</span> contratos em aberto estruturando recebimentos. O saldo restante totaliza <span className="text-[#D4AF37] font-semibold">{formatCurrency(totalFinancialOutstanding)}</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 text-center">
            <span className="inline-block text-[9px] font-mono text-gray-500 uppercase tracking-widest italic">
              Gerado pelo sistema interno MR Assessoria
            </span>
          </div>
        </div>
      </div>

      {/* Main Ledger & Search Table */}
      <div className="border border-white/5 bg-[#121212]/30 shadow-xl overflow-hidden" id="financial-ledger-block">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div>
            <h3 className="font-serif italic text-lg text-white">Central de Custódia & Recebimentos</h3>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Gerenciamento itemizado de faturamento de serviços vinculados</p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente, processo..."
                className="bg-black/40 border border-white/15 outline-none text-xs text-white pl-9 pr-4 py-2 w-52 focus:border-[#D4AF37]"
              />
            </div>

            {/* Status Filter buttons */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-black/40 border border-white/15 outline-none text-xs text-white px-3 py-2 focus:border-[#D4AF37]"
            >
              <option value="all">Saldos: Todos</option>
              <option value="pending">Saldos: Em Aberto</option>
              <option value="paid">Saldos: Quitados</option>
            </select>

            {/* Category Filter */}
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="bg-black/40 border border-white/15 outline-none text-xs text-white px-3 py-2 focus:border-[#D4AF37]"
            >
              <option value="all">Serviços: Todos</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 border-b border-white/5 text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest">
                <th className="p-4">Cliente / Nº Processo</th>
                <th className="p-4">Categoria Técnica</th>
                <th className="p-4 text-right">Valor Contrato</th>
                <th className="p-4 text-right">Sinal / Entrada</th>
                <th className="p-4 text-right">Add. Recebido</th>
                <th className="p-4 text-right">Saldo Pendente</th>
                <th className="p-4 text-center">Status Faturamento</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-xs">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 font-sans italic text-xs">
                    Nenhum lançamento financeiro correspondente aos filtros foi encontrado.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service, index) => {
                  const price = service.valorServico || 0;
                  const ent = service.entrada || 0;
                  const pag = service.pagamentos || 0;
                  const totalPaid = ent + pag;
                  const outstanding = service.aReceber !== undefined ? service.aReceber : Math.max(0, price - totalPaid);
                  const isPaidCombined = price > 0 && totalPaid >= price;

                  const isEditingThis = editId === service.id;

                  return (
                    <tr 
                      key={service.id} 
                      className={`hover:bg-white/[0.02] transition-colors ${
                        index % 2 === 0 ? "bg-[#111111]/30" : "bg-transparent"
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-semibold text-white">{service.clientName}</div>
                        {service.numeroProcesso && (
                          <div className="text-[10px] text-[#D4AF37] font-mono mt-0.5">Proc: {service.numeroProcesso}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-none font-mono text-[9px] bg-white/5 border border-white/10 text-gray-300">
                          {service.serviceType}
                        </span>
                      </td>

                      {/* VALOR DO CONTRATO EDITING / VIEWING */}
                      <td className="p-4 text-right">
                        {isEditingThis ? (
                          <div className="flex items-center justify-end">
                            <span className="text-[10px] text-gray-500 font-mono mr-1">R$</span>
                            <input 
                              type="number"
                              value={editValorServico}
                              onChange={(e) => setEditValorServico(e.target.value)}
                              className="bg-black border border-white/20 text-xs text-white p-1 w-24 text-right focus:border-[#D4AF37]"
                              placeholder="0.00"
                            />
                          </div>
                        ) : (
                          <span className="font-mono text-white text-[13px]">{formatCurrency(price)}</span>
                        )}
                      </td>

                      {/* SINAL/ENTRADA EDITING / VIEWING */}
                      <td className="p-4 text-right">
                        {isEditingThis ? (
                          <div className="flex items-center justify-end">
                            <span className="text-[10px] text-gray-500 font-mono mr-1">R$</span>
                            <input 
                              type="number"
                              value={editEntrada}
                              onChange={(e) => setEditEntrada(e.target.value)}
                              className="bg-black border border-white/20 text-xs text-white p-1 w-20 text-right focus:border-[#D4AF37]"
                              placeholder="0.00"
                            />
                          </div>
                        ) : (
                          <span className="font-mono text-gray-300">{formatCurrency(ent)}</span>
                        )}
                      </td>

                      {/* ADICIONAIS PAGOS EDITING / VIEWING */}
                      <td className="p-4 text-right">
                        {isEditingThis ? (
                          <div className="flex items-center justify-end">
                            <span className="text-[10px] text-gray-500 font-mono mr-1">R$</span>
                            <input 
                              type="number"
                              value={editPagamentos}
                              onChange={(e) => setEditPagamentos(e.target.value)}
                              className="bg-black border border-white/20 text-xs text-white p-1 w-20 text-right focus:border-[#D4AF37]"
                              placeholder="0.00"
                            />
                          </div>
                        ) : (
                          <span className="font-mono text-gray-350">{formatCurrency(pag)}</span>
                        )}
                      </td>

                      {/* SALDO PENDENTE (Dynamically recalculated) */}
                      <td className="p-4 text-right">
                        {isEditingThis ? (
                          <span className="font-mono text-gray-550 italic text-[11px]">Auto calculado</span>
                        ) : (
                          <span className={`font-mono text-[13px] ${outstanding > 0 ? "text-amber-400 font-bold" : "text-gray-500"}`}>
                            {formatCurrency(outstanding)}
                          </span>
                        )}
                      </td>

                      {/* STATUS FATURAMENTO */}
                      <td className="p-4 text-center">
                        {isPaidCombined ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 uppercase tracking-wide">
                            <CheckCircle2 className="h-3 w-3 shrink-0" /> Quitado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 uppercase tracking-wide">
                            <Calculator className="h-3 w-3 shrink-0" /> A receber
                          </span>
                        )}
                      </td>

                      {/* ACTION BUTTONS */}
                      <td className="p-4 text-center">
                        {isEditingThis ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSaveFinancials(service.id)}
                              className="p-1 px-2.5 bg-[#D4AF37] hover:bg-[#E5C048] text-black text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer"
                              title="Salvar alterações"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="p-1 text-gray-400 hover:text-white"
                              title="Cancelar edição"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditClick(service)}
                            className="inline-flex items-center gap-1 text-[10px] font-mono border border-white/10 hover:border-[#D4AF37] text-gray-400 hover:text-white px-2.5 py-1 transition-all cursor-pointer bg-white/2 hover:bg-[#D4AF37]/10"
                            title="Editar valores de faturamento do serviço"
                          >
                            <FileEdit className="h-3 w-3 text-[#D4AF37]" /> Lançar Valores
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
