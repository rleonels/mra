import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  FileCheck,
  Building,
  Briefcase,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  FolderOpen,
  Search,
  Filter,
  Users,
  Check,
  Pencil,
  X
} from "lucide-react";
import { User } from "../types";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string; // Base64 data URL
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
  files: {
    art?: UploadedFile;
    projeto?: UploadedFile;
    quadroAreas?: UploadedFile;
    matricula?: UploadedFile;
    iptu?: UploadedFile;
    memorialDescritivo?: UploadedFile;
    pgrcc?: UploadedFile;
    declaracaoInspecao?: UploadedFile;
    pgrccDemolicao?: UploadedFile;
    projetoFossaFiltro?: UploadedFile;
    memorialFossaFiltro?: UploadedFile;
    alvaraExecucao?: UploadedFile;
    clcbCartaHabitacao?: UploadedFile;
    atestadoSabesp?: UploadedFile;
    laudoVistoria?: UploadedFile;
    alvaraAlinhamento?: UploadedFile;
    certidaoEmplacamento?: UploadedFile;
    alvaraAprovacao?: UploadedFile;
    cartaHabitacaoDoc?: UploadedFile;
    certidaoValorVenal?: UploadedFile;
    clcbDoc?: UploadedFile;
    artClcb?: UploadedFile;
    formularioClcb?: UploadedFile;
    requerimentoDoc?: UploadedFile;
    doacaoMudas?: UploadedFile;
    tcaDoc?: UploadedFile;
  };
}

const SERVICE_OPTIONS = [
  "Assessoria",
  "Aprovação",
  "CLCB",
  "Licenciamento Ambiental",
  "Regularização"
] as const;

type ServiceType = typeof SERVICE_OPTIONS[number];

const formatToCurrencyInput = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
};

const handleCurrencyInputChange = (rawValue: string, setter: (val: number) => void) => {
  const cleanDigits = rawValue.replace(/\D/g, "");
  const numValue = cleanDigits ? parseFloat(cleanDigits) / 100 : 0;
  setter(numValue);
};

interface ServicesPanelProps {
  mode?: "form" | "list" | "both";
  currentUser?: User | null;
}

export const ServicesPanel: React.FC<ServicesPanelProps> = ({ mode = "both", currentUser }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  // Form states
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>("Assessoria");
  const [notes, setNotes] = useState("");
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [loteamento, setLoteamento] = useState("");
  const [quadra, setQuadra] = useState("");
  const [lote, setLote] = useState("");
  const [endereco, setEndereco] = useState("");
  const [demolicao, setDemolicao] = useState(false);
  const [fossaFiltro, setFossaFiltro] = useState(false);
  const [cartaHabitacao, setCartaHabitacao] = useState(false);
  const [clcb, setClcb] = useState(false);
  const [licenciamentoAmbientalVal, setLicenciamentoAmbientalVal] = useState(false);
  const [valorServico, setValorServico] = useState<number>(0);
  const [entrada, setEntrada] = useState<number>(0);
  const [pagamentos, setPagamentos] = useState<number>(0);

  // Temp upload files state on form
  const [artFile, setArtFile] = useState<UploadedFile | null>(null);
  const [projetoFile, setProjetoFile] = useState<UploadedFile | null>(null);
  const [quadroAreasFile, setQuadroAreasFile] = useState<UploadedFile | null>(null);
  const [matriculaFile, setMatriculaFile] = useState<UploadedFile | null>(null);
  const [iptuFile, setIptuFile] = useState<UploadedFile | null>(null);
  const [memorialFile, setMemorialFile] = useState<UploadedFile | null>(null);
  const [pgrccFile, setPgrccFile] = useState<UploadedFile | null>(null);
  const [declaracaoInspecaoFile, setDeclaracaoInspecaoFile] = useState<UploadedFile | null>(null);
  const [pgrccDemolicaoFile, setPgrccDemolicaoFile] = useState<UploadedFile | null>(null);
  const [projetoFossaFiltroFile, setProjetoFossaFiltroFile] = useState<UploadedFile | null>(null);
  const [memorialFossaFiltroFile, setMemorialFossaFiltroFile] = useState<UploadedFile | null>(null);

  // Drag states for new form
  const [dragActiveArt, setDragActiveArt] = useState(false);
  const [dragActiveProjeto, setDragActiveProjeto] = useState(false);
  const [dragActiveQuadro, setDragActiveQuadro] = useState(false);
  const [dragActiveMatricula, setDragActiveMatricula] = useState(false);
  const [dragActiveIptu, setDragActiveIptu] = useState(false);
  const [dragActiveMemorial, setDragActiveMemorial] = useState(false);
  const [dragActivePgrcc, setDragActivePgrcc] = useState(false);
  const [dragActiveDeclaracao, setDragActiveDeclaracao] = useState(false);
  const [dragActivePgrccDemolicao, setDragActivePgrccDemolicao] = useState(false);
  const [dragActiveProjetoFossaFiltro, setDragActiveProjetoFossaFiltro] = useState(false);
  const [dragActiveMemorialFossaFiltro, setDragActiveMemorialFossaFiltro] = useState(false);

  // Search & Filter list states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("All");

  // Custom Confirmation Modals states
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [deleteFileConfirm, setDeleteFileConfirm] = useState<{ 
    serviceId: string; 
    category: keyof ServiceItem["files"];
  } | null>(null);

  // States for inline editing of service properties in active services list
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editNumeroProcesso, setEditNumeroProcesso] = useState("");
  const [editLoteamento, setEditLoteamento] = useState("");
  const [editQuadra, setEditQuadra] = useState("");
  const [editLote, setEditLote] = useState("");
  const [editEndereco, setEditEndereco] = useState("");

  const [cartaHabitacaoModalService, setCartaHabitacaoModalService] = useState<ServiceItem | null>(null);
  const [clcbModalService, setClcbModalService] = useState<ServiceItem | null>(null);
  const [licenciamentoAmbientalModalService, setLicenciamentoAmbientalModalService] = useState<ServiceItem | null>(null);

  // Drag state for existing service cards
  const [activeCardDrag, setActiveCardDrag] = useState<{ serviceId: string; category: string } | null>(null);

  // Individual card new payments input state
  const [newPaymentInputs, setNewPaymentInputs] = useState<Record<string, number>>({});

  // Success / Error alerts
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // File Inputs references for form
  const fileInputArtRef = useRef<HTMLInputElement>(null);
  const fileInputProjetoRef = useRef<HTMLInputElement>(null);
  const fileInputQuadroRef = useRef<HTMLInputElement>(null);
  const fileInputMatriculaRef = useRef<HTMLInputElement>(null);
  const fileInputIptuRef = useRef<HTMLInputElement>(null);
  const fileInputMemorialRef = useRef<HTMLInputElement>(null);
  const fileInputPgrccRef = useRef<HTMLInputElement>(null);
  const fileInputDeclaracaoRef = useRef<HTMLInputElement>(null);
  const fileInputPgrccDemolicaoRef = useRef<HTMLInputElement>(null);
  const fileInputProjetoFossaFiltroRef = useRef<HTMLInputElement>(null);
  const fileInputMemorialFossaFiltroRef = useRef<HTMLInputElement>(null);

  // File Inputs references for Carta de Habitação modal
  const fileRefAlvara = useRef<HTMLInputElement>(null);
  const fileRefClcb = useRef<HTMLInputElement>(null);
  const fileRefSabesp = useRef<HTMLInputElement>(null);
  const fileRefVistoria = useRef<HTMLInputElement>(null);
  const fileRefCartaHabitacao = useRef<HTMLInputElement>(null);
  const fileRefValorVenal = useRef<HTMLInputElement>(null);

  // File Inputs references for CLCB modal
  const fileRefClcbPremium = useRef<HTMLInputElement>(null);
  const fileRefArtClcb = useRef<HTMLInputElement>(null);
  const fileRefFormularioClcb = useRef<HTMLInputElement>(null);

  // File Inputs references for Licenciamento Ambiental modal
  const fileRefTca = useRef<HTMLInputElement>(null);
  const fileRefRequerimento = useRef<HTMLInputElement>(null);
  const fileRefDoacaoMudas = useRef<HTMLInputElement>(null);

  // Load clients and services database
  useEffect(() => {
    const fetchClientsAndServices = async () => {
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
        console.error("Erro ao carregar dados do servidor para o painel de serviços", e);
      }
    };
    fetchClientsAndServices();
  }, []);

  // Auto scroll and highlight referenced service from dashboard redirection
  useEffect(() => {
    if (services.length > 0) {
      const viewServiceId = localStorage.getItem("mr_view_service_id");
      if (viewServiceId) {
        const found = services.some(s => s.id === viewServiceId);
        if (found) {
          // Clear any active search or category filters to ensure it's visible
          setSearchTerm("");
          setFilterType("All");
          
          setTimeout(() => {
            const cardElement = document.getElementById(`service-card-${viewServiceId}`);
            if (cardElement) {
              cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
              // Apply active highlighting style
              cardElement.classList.add("ring-2", "ring-[#D4AF37]", "scale-[1.01]", "transition-all");
              setTimeout(() => {
                cardElement.classList.remove("ring-2", "ring-[#D4AF37]", "scale-[1.01]");
              }, 4000);
            }
          }, 400);
        }
        localStorage.removeItem("mr_view_service_id");
      }
    }
  }, [services]);

  const servicesRef = useRef<ServiceItem[]>([]);
  useEffect(() => {
    servicesRef.current = services;
  }, [services]);

  // Save services
  const saveServices = async (list: ServiceItem[]) => {
    setServices(list);

    const oldList = servicesRef.current;

    // 1. Added service
    if (list.length > oldList.length) {
      const added = list.find(s => !oldList.some(old => old.id === s.id));
      if (added) {
        try {
          const res = await fetch("/api/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(added)
          });
          const data = await res.json();
          if (data.success) {
            setServices(prev => prev.map(s => s.id === added.id ? data.data : s));
          }
        } catch (e) {
          console.error("Erro ao criar serviço no servidor", e);
        }
      }
    }
    // 2. Deleted service
    else if (list.length < oldList.length) {
      const deleted = oldList.find(old => !list.some(s => s.id === old.id));
      if (deleted) {
        try {
          await fetch(`/api/services/${deleted.id}`, { method: "DELETE" });
        } catch (e) {
          console.error("Erro ao deletar serviço no servidor", e);
        }
      }
    }
    // 3. Updated service
    else {
      const updated = list.find(s => {
        const old = oldList.find(o => o.id === s.id);
        if (!old) return false;
        return JSON.stringify(old) !== JSON.stringify(s);
      });

      if (updated) {
        try {
          const res = await fetch(`/api/services/${updated.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
          });
          const data = await res.json();
          if (data.success) {
            setServices(prev => prev.map(s => s.id === updated.id ? data.data : s));
          }
        } catch (e) {
          console.error("Erro ao atualizar serviço no servidor", e);
        }
      }
    }
  };

  // Base64 helper
  const processUploadedFile = (file: File, callback: (uploaded: UploadedFile) => void) => {
    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      callback({
        name: file.name,
        size: file.size,
        type: file.type,
        url: reader.result as string
      });
      setIsProcessingFile(false);
    };
    reader.onerror = (err) => {
      console.error(err);
      setErrorMsg("Falha ao ler arquivo de documento.");
      setIsProcessingFile(false);
    };
  };

  // Manual File Selectors for Form
  const handleFormFileChange = (e: React.ChangeEvent<HTMLInputElement>, category: "art" | "projeto" | "quadro" | "matricula" | "iptu" | "memorial" | "pgrcc" | "declaracao" | "pgrccDemolicao" | "projetoFossa" | "memorialFossa") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processUploadedFile(file, (processed) => {
        if (category === "art") setArtFile(processed);
        if (category === "projeto") setProjetoFile(processed);
        if (category === "quadro") setQuadroAreasFile(processed);
        if (category === "matricula") setMatriculaFile(processed);
        if (category === "iptu") setIptuFile(processed);
        if (category === "memorial") setMemorialFile(processed);
        if (category === "pgrcc") setPgrccFile(processed);
        if (category === "declaracao") setDeclaracaoInspecaoFile(processed);
        if (category === "pgrccDemolicao") setPgrccDemolicaoFile(processed);
        if (category === "projetoFossa") setProjetoFossaFiltroFile(processed);
        if (category === "memorialFossa") setMemorialFossaFiltroFile(processed);
      });
    }
  };

  // Drag event handler helper
  const handleDrag = (e: React.DragEvent, stateSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      stateSetter(true);
    } else if (e.type === "dragleave") {
      stateSetter(false);
    }
  };

  // Drop helper for form
  const handleFormDrop = (
    e: React.DragEvent, 
    stateSetter: React.Dispatch<React.SetStateAction<boolean>>, 
    category: "art" | "projeto" | "quadro" | "matricula" | "iptu" | "memorial" | "pgrcc" | "declaracao" | "pgrccDemolicao" | "projetoFossa" | "memorialFossa"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    stateSetter(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file, (processed) => {
        if (category === "art") setArtFile(processed);
        if (category === "projeto") setProjetoFile(processed);
        if (category === "quadro") setQuadroAreasFile(processed);
        if (category === "matricula") setMatriculaFile(processed);
        if (category === "iptu") setIptuFile(processed);
        if (category === "memorial") setMemorialFile(processed);
        if (category === "pgrcc") setPgrccFile(processed);
        if (category === "declaracao") setDeclaracaoInspecaoFile(processed);
        if (category === "pgrccDemolicao") setPgrccDemolicaoFile(processed);
        if (category === "projetoFossa") setProjetoFossaFiltroFile(processed);
        if (category === "memorialFossa") setMemorialFossaFiltroFile(processed);
      });
    }
  };

  // Drag/Drop for existing Cards
  const handleCardDrag = (e: React.DragEvent, serviceId: string, category: string, isOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOver) {
      setActiveCardDrag({ serviceId, category });
    } else {
      setActiveCardDrag(null);
    }
  };

  const handleCardDrop = (
    e: React.DragEvent, 
    serviceId: string, 
    category: keyof ServiceItem["files"]
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveCardDrag(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const updated = services.map((s) => {
          if (s.id === serviceId) {
            return {
              ...s,
              files: {
                ...s.files,
                [category]: {
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  url: reader.result as string,
                },
              },
            };
          }
          return s;
        });
        saveServices(updated);
      };
    }
  };

  // Handle Card File Select Change
  const handleCardFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    serviceId: string, 
    category: keyof ServiceItem["files"]
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const updated = services.map((s) => {
          if (s.id === serviceId) {
            return {
              ...s,
              files: {
                ...s.files,
                [category]: {
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  url: reader.result as string,
                },
              },
            };
          }
          return s;
        });
        saveServices(updated);
      };
    }
  };

  const triggerCardFileInput = (serviceId: string, category: string) => {
    document.getElementById(`card-file-${category}-${serviceId}`)?.click();
  };

  // Submit service form
  const handleRegisterService = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedClientId) {
      setErrorMsg("Selecione um cliente para vincular este serviço.");
      return;
    }

    const matchedClient = clients.find(c => c.id === selectedClientId);
    if (!matchedClient) {
      setErrorMsg("O cliente selecionado é inválido.");
      return;
    }

    const newService: ServiceItem = {
      id: "ser_" + Date.now(),
      clientId: selectedClientId,
      clientName: matchedClient.name,
      serviceType: selectedServiceType,
      status: "Pendente",
      regDate: new Date().toLocaleDateString("pt-BR"),
      notes: notes.trim(),
      numeroProcesso: numeroProcesso.trim(),
      loteamento: loteamento.trim(),
      quadra: quadra.trim(),
      lote: lote.trim(),
      endereco: endereco.trim(),
      demolicao,
      fossaFiltro,
      cartaHabitacao,
      clcb,
      licenciamentoAmbiental: licenciamentoAmbientalVal,
      valorServico,
      entrada,
      pagamentos,
      aReceber: valorServico - entrada - pagamentos,
      files: {
        ...(artFile && { art: artFile }),
        ...(projetoFile && { projeto: projetoFile }),
        ...(quadroAreasFile && { quadroAreas: quadroAreasFile }),
        ...(matriculaFile && { matricula: matriculaFile }),
        ...(iptuFile && { iptu: iptuFile }),
        ...(memorialFile && { memorialDescritivo: memorialFile }),
        ...(pgrccFile && { pgrcc: pgrccFile }),
        ...(demolicao && declaracaoInspecaoFile && { declaracaoInspecao: declaracaoInspecaoFile }),
        ...(demolicao && pgrccDemolicaoFile && { pgrccDemolicao: pgrccDemolicaoFile }),
        ...(fossaFiltro && projetoFossaFiltroFile && { projetoFossaFiltro: projetoFossaFiltroFile }),
        ...(fossaFiltro && memorialFossaFiltroFile && { memorialFossaFiltro: memorialFossaFiltroFile }),
      }
    };

    const updated = [newService, ...services];
    saveServices(updated);

    // Clear form
    setSelectedClientId("");
    setSelectedServiceType("Assessoria");
    setNotes("");
    setNumeroProcesso("");
    setLoteamento("");
    setQuadra("");
    setLote("");
    setEndereco("");
    setDemolicao(false);
    setFossaFiltro(false);
    setCartaHabitacao(false);
    setClcb(false);
    setLicenciamentoAmbientalVal(false);
    setValorServico(0);
    setEntrada(0);
    setPagamentos(0);
    setArtFile(null);
    setProjetoFile(null);
    setQuadroAreasFile(null);
    setMatriculaFile(null);
    setIptuFile(null);
    setMemorialFile(null);
    setPgrccFile(null);
    setDeclaracaoInspecaoFile(null);
    setPgrccDemolicaoFile(null);
    setProjetoFossaFiltroFile(null);
    setMemorialFossaFiltroFile(null);

    setShowSuccess(true);
    window.scrollTo({ top: 400, behavior: "smooth" });
    setTimeout(() => {
      setShowSuccess(false);
    }, 6000);
  };

  // Helper file size format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Filter service cards
  const filteredServices = services.filter((s) => {
    // Check if logged in user is a client and owns this service
    if (currentUser && currentUser.role === "cliente") {
      const matchedClients = clients.filter(c => 
        (c.email && c.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (c.name && c.name.toLowerCase() === currentUser.name.toLowerCase())
      );
      const clientTaxIds = matchedClients.map(c => c.taxId.replace(/\D/g, ""));
      const clientIds = matchedClients.map(c => c.id);

      let allowed = false;
      if (clientIds.includes(s.clientId)) {
        allowed = true;
      } else {
        const svcClient = clients.find(c => c.id === s.clientId);
        if (svcClient && clientTaxIds.includes(svcClient.taxId.replace(/\D/g, ""))) {
          allowed = true;
        } else if (s.clientName && currentUser.name && 
                 (s.clientName.toLowerCase().includes(currentUser.name.toLowerCase()) || 
                  currentUser.name.toLowerCase().includes(s.clientName.toLowerCase()))) {
          allowed = true;
        }
      }
      if (!allowed) return false;
    }

    const matchesSearch = 
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.numeroProcesso || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.loteamento || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.quadra || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.lote || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.endereco || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.cartaHabitacao && "carta de habitação".includes(searchTerm.toLowerCase())) ||
      (s.clcb && "clcb".includes(searchTerm.toLowerCase())) ||
      (s.licenciamentoAmbiental && "licenciamento ambiental".includes(searchTerm.toLowerCase()));
    
    if (filterType === "All") return matchesSearch;
    return matchesSearch && s.serviceType === filterType;
  });

  return (
    <section className="mx-auto max-w-7xl px-8 py-24 sm:py-32 w-full animate-fade-in" id="services-tab-panel">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase">
          Divisão Técnica e Corporativa
        </div>
        <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
          {mode === "form" 
            ? "Abertura de Serviços Técnicos" 
            : mode === "list" 
            ? "Portfólio de Serviços Ativos" 
            : "Gestão de Serviços e Laudos"}
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-[#F5F5F0]/60 uppercase tracking-widest max-w-xl mx-auto">
          {mode === "form"
            ? "Selecione o proponente credenciado e crie um novo serviço técnico, definindo notas de controle técnico e inserindo os documentos regulatórios primários."
            : mode === "list"
            ? "Monitore e atualize os laudos de serviços ativos, realize controle de pendências e faça downloads de documentos em tempo real."
            : "Gerencie e vincule serviços técnicos a proponentes credenciados. Efetue uploads e downloads de ARTs, Projetos, Quadros de Áreas, Matrículas e IPTUs oficiais em tempo real."}
        </p>
        <div className="pt-2">
          <span className="inline-block h-[1px] w-12 bg-[#D4AF37]" />
        </div>
      </div>

      {/* Main Grid: Form + List of saved services */}
      <div className={mode === "both" ? "grid gap-12 lg:grid-cols-12 items-start" : "w-full max-w-5xl mx-auto space-y-8"}>
        
        {/* LEFT COLUMN: REGISTRATION FORM (40%) */}
        {(mode === "both" || mode === "form") && (
          <div id="services-form-section" className={`${mode === "both" ? "lg:col-span-12 xl:col-span-5" : "w-full max-w-2xl mx-auto"} bg-[#141414] border border-white/5 p-6 sm:p-8 space-y-6 relative shadow-2xl`}>
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          
          <div className="text-left border-b border-white/5 pb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4AF37]">Laudo Técnico</span>
            <h3 className="font-serif text-xl text-white font-light mt-0.5">Vincular Novo Serviço</h3>
          </div>

          {showSuccess && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3 animate-fade-in" id="service-success">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div className="text-[11px] leading-relaxed">
                Serviço de alta governança registrado com sucesso! Os arquivos de controle técnico foram anexados.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-fade-in" id="service-error">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="text-xs font-semibold">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleRegisterService} className="space-y-5 text-left" id="service-registration-form">
            
            {/* 1. Client Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                Cliente Cadastrado *
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full rounded-none border border-white/10 bg-[#1A1A1A] px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37] appearance-none"
                >
                  <option value="" className="text-gray-500">Selecione o Cliente Proponente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id} className="text-white">
                      {c.name} ({c.taxId})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#D4AF37]">
                  <Users className="h-3.5 w-3.5" />
                </div>
              </div>
              {clients.length === 0 && (
                <span className="text-[9px] text-amber-500 font-mono tracking-wide">
                  * Nenhum cliente cadastrado. Por favor, registre um cliente na aba correspondente primeiro.
                </span>
              )}
            </div>

            {/* 2. Service Type select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                Tipo de Serviço *
              </label>
              <div className="relative">
                <select
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value as ServiceType)}
                  className="w-full rounded-none border border-white/10 bg-[#1A1A1A] px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37] appearance-none"
                >
                  {SERVICE_OPTIONS.map(opt => (
                    <option key={opt} value={opt} className="text-white">{opt}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#D4AF37]">
                  <Briefcase className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            {/* 3. Text notes */}
            <div className="flex flex-col gap-1.5 animate-fade-in">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                Notas de Controle Interno / Escopo
              </label>
              <textarea
                id="service-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Exemplo: Edificação na Zona Oeste. Alvará em processo de despacho."
                rows={2}
                className="w-full rounded-none border border-white/10 bg-[#1A1A1A] px-4 py-3 text-xs text-white placeholder-gray-700 outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Localization and Process data below notes */}
            <div className="space-y-3.5 pt-3 border-t border-white/5 animate-fade-in">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#D4AF37] block">
                Localização e Processo do Terreno
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="service-numero-processo" className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    Número do Processo
                  </label>
                  <input
                    id="service-numero-processo"
                    type="text"
                    value={numeroProcesso}
                    onChange={(e) => setNumeroProcesso(e.target.value)}
                    placeholder="Exemplo: E-23.456/2026"
                    className="w-full rounded-none border border-white/10 bg-[#1A1A1A] px-4 py-3 text-xs text-white placeholder-gray-700 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="service-loteamento" className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    Loteamento
                  </label>
                  <input
                    id="service-loteamento"
                    type="text"
                    value={loteamento}
                    onChange={(e) => setLoteamento(e.target.value)}
                    placeholder="Exemplo: Jardim das Flores"
                    className="w-full rounded-none border border-white/10 bg-[#1A1A1A] px-4 py-3 text-xs text-white placeholder-gray-700 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="service-quadra" className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                        Quadra
                      </label>
                      <input
                        id="service-quadra"
                        type="text"
                        value={quadra}
                        onChange={(e) => setQuadra(e.target.value)}
                        placeholder="Ex: H"
                        className="w-full rounded-none border border-white/10 bg-[#1A1A1A] px-4 py-3 text-xs text-white placeholder-gray-700 outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="service-lote" className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                        Lote
                      </label>
                      <input
                        id="service-lote"
                        type="text"
                        value={lote}
                        onChange={(e) => setLote(e.target.value)}
                        placeholder="Ex: 42"
                        className="w-full rounded-none border border-white/10 bg-[#1A1A1A] px-4 py-3 text-xs text-white placeholder-gray-700 outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="service-endereco" className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    Endereço
                  </label>
                  <input
                    id="service-endereco"
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Ex: Av. Governador, 567 - Centro"
                    className="w-full rounded-none border border-white/10 bg-[#1A1A1A] px-4 py-3 text-xs text-white placeholder-gray-700 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {/* 3.5 Finance Section */}
            <div className="space-y-3.5 pt-3 border-t border-white/5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#D4AF37] block">
                Dados Financeiros do Serviço
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    Valor do Serviço
                  </label>
                  <input
                    type="text"
                    value={formatToCurrencyInput(valorServico)}
                    onChange={(e) => handleCurrencyInputChange(e.target.value, setValorServico)}
                    className="w-full rounded-none border border-white/10 bg-[#1A1A1A] px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37]"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    Entrada
                  </label>
                  <input
                    type="text"
                    value={formatToCurrencyInput(entrada)}
                    onChange={(e) => handleCurrencyInputChange(e.target.value, setEntrada)}
                    className="w-full rounded-none border border-white/10 bg-[#1A1A1A] px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37]"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    Pagamentos
                  </label>
                  <input
                    type="text"
                    value={formatToCurrencyInput(pagamentos)}
                    onChange={(e) => handleCurrencyInputChange(e.target.value, setPagamentos)}
                    className="w-full rounded-none border border-white/10 bg-[#1A1A1A] px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37]"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    A Receber
                  </label>
                  <div className="w-full h-[42px] border border-white/5 bg-[#1F1F1F]/40 px-4 flex items-center text-xs text-[#D4AF37] font-semibold select-none">
                    {formatToCurrencyInput(valorServico - entrada - pagamentos)}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Service Documentation Box */}
            <div className="space-y-3.5 pt-3 border-t border-white/5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#D4AF37] block">
                Controles e Arquivos Opcionais
              </span>

              {/* Checkboxes de Confirmação Acima do Campo ART */}
              <div className="bg-[#1C1C1C] border border-white/5 p-3 space-y-3">
                <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] block">
                  Confirmações de Escopo
                </span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2.5 group cursor-pointer text-left select-none">
                    <input
                      type="checkbox"
                      checked={demolicao}
                      onChange={(e) => setDemolicao(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-3.5 h-3.5 border transition-all flex items-center justify-center ${
                      demolicao ? "border-[#D4AF37] bg-[#D4AF37]" : "border-white/20 bg-transparent group-hover:border-[#D4AF37]/50"
                    }`}>
                      {demolicao && <Check className="h-2.5 w-2.5 text-black stroke-[3]" />}
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-white">Demolição</span>
                  </label>

                  <label className="flex items-center gap-2.5 group cursor-pointer text-left select-none">
                    <input
                      type="checkbox"
                      checked={fossaFiltro}
                      onChange={(e) => setFossaFiltro(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-3.5 h-3.5 border transition-all flex items-center justify-center ${
                      fossaFiltro ? "border-[#D4AF37] bg-[#D4AF37]" : "border-white/20 bg-transparent group-hover:border-[#D4AF37]/50"
                    }`}>
                      {fossaFiltro && <Check className="h-2.5 w-2.5 text-black stroke-[3]" />}
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-white">Fossa e Filtro</span>
                  </label>

                  <label className="flex items-center gap-2.5 group cursor-pointer text-left select-none">
                    <input
                      type="checkbox"
                      checked={cartaHabitacao}
                      onChange={(e) => setCartaHabitacao(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-3.5 h-3.5 border transition-all flex items-center justify-center ${
                      cartaHabitacao ? "border-[#D4AF37] bg-[#D4AF37]" : "border-white/20 bg-transparent group-hover:border-[#D4AF37]/50"
                    }`}>
                      {cartaHabitacao && <Check className="h-2.5 w-2.5 text-black stroke-[3]" />}
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-white">Carta de Habitação</span>
                  </label>

                  <label className="flex items-center gap-2.5 group cursor-pointer text-left select-none">
                    <input
                      type="checkbox"
                      checked={clcb}
                      onChange={(e) => setClcb(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-3.5 h-3.5 border transition-all flex items-center justify-center ${
                      clcb ? "border-[#D4AF37] bg-[#D4AF37]" : "border-white/20 bg-transparent group-hover:border-[#D4AF37]/50"
                    }`}>
                      {clcb && <Check className="h-2.5 w-2.5 text-black stroke-[3]" />}
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-white">CLCB</span>
                  </label>

                  <label className="flex items-center gap-2.5 group cursor-pointer text-left select-none">
                    <input
                      type="checkbox"
                      checked={licenciamentoAmbientalVal}
                      onChange={(e) => setLicenciamentoAmbientalVal(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-3.5 h-3.5 border transition-all flex items-center justify-center ${
                      licenciamentoAmbientalVal ? "border-[#D4AF37] bg-[#D4AF37]" : "border-white/20 bg-transparent group-hover:border-[#D4AF37]/50"
                    }`}>
                      {licenciamentoAmbientalVal && <Check className="h-2.5 w-2.5 text-black stroke-[3]" />}
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-white">Licenciamento Ambiental</span>
                  </label>
                </div>
              </div>

              {/* Document fields rows */}
              <div className="space-y-2.5">
                
                {/* 1. ART */}
                <div 
                  className={`border p-2.5 transition-all relative flex flex-col items-center justify-center text-center ${
                    dragActiveArt ? "border-[#D4AF37] bg-[#D4AF37]/5" : artFile ? "border-green-500/20 bg-green-500/5" : "border-white/5 bg-[#1F1F1F]/40 hover:border-white/10"
                  }`}
                  onDragEnter={(e) => handleDrag(e, setDragActiveArt)}
                  onDragOver={(e) => handleDrag(e, setDragActiveArt)}
                  onDragLeave={(e) => handleDrag(e, setDragActiveArt)}
                  onDrop={(e) => handleFormDrop(e, setDragActiveArt, "art")}
                  onClick={() => !artFile && fileInputArtRef.current?.click()}
                  style={{ cursor: artFile ? "default" : "pointer" }}
                >
                  <input ref={fileInputArtRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleFormFileChange(e, "art")} />
                  {artFile ? (
                    <div className="w-full flex items-center justify-between text-left gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="h-4 w-4 text-green-400 shrink-0" />
                        <span className="text-[10px] text-white font-medium truncate max-w-[150px]">{artFile.name}</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setArtFile(null); }} className="text-gray-500 hover:text-red-400 p-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="pointer-events-none flex items-center gap-2">
                      <Upload className="h-3.5 w-3.5 text-[#D4AF37]/60" />
                      <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">ART / RRT</span>
                      <span className="text-[9px] text-gray-500">(Arraste ou clique)</span>
                    </div>
                  )}
                </div>

                {/* 2. Projeto */}
                <div 
                  className={`border p-2.5 transition-all relative flex flex-col items-center justify-center text-center ${
                    dragActiveProjeto ? "border-[#D4AF37] bg-[#D4AF37]/5" : projetoFile ? "border-green-500/20 bg-green-500/5" : "border-white/5 bg-[#1F1F1F]/40 hover:border-white/10"
                  }`}
                  onDragEnter={(e) => handleDrag(e, setDragActiveProjeto)}
                  onDragOver={(e) => handleDrag(e, setDragActiveProjeto)}
                  onDragLeave={(e) => handleDrag(e, setDragActiveProjeto)}
                  onDrop={(e) => handleFormDrop(e, setDragActiveProjeto, "projeto")}
                  onClick={() => !projetoFile && fileInputProjetoRef.current?.click()}
                  style={{ cursor: projetoFile ? "default" : "pointer" }}
                >
                  <input ref={fileInputProjetoRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleFormFileChange(e, "projeto")} />
                  {projetoFile ? (
                    <div className="w-full flex items-center justify-between text-left gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="h-4 w-4 text-green-400 shrink-0" />
                        <span className="text-[10px] text-white font-medium truncate max-w-[150px]">{projetoFile.name}</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setProjetoFile(null); }} className="text-gray-500 hover:text-red-400 p-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="pointer-events-none flex items-center gap-2">
                      <Upload className="h-3.5 w-3.5 text-[#D4AF37]/60" />
                      <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Projeto de Arquitetura</span>
                      <span className="text-[9px] text-gray-500">(Arraste ou clique)</span>
                    </div>
                  )}
                </div>

                {/* 3. Quadro de Áreas */}
                <div 
                  className={`border p-2.5 transition-all relative flex flex-col items-center justify-center text-center ${
                    dragActiveQuadro ? "border-[#D4AF37] bg-[#D4AF37]/5" : quadroAreasFile ? "border-green-500/20 bg-green-500/5" : "border-white/5 bg-[#1F1F1F]/40 hover:border-white/10"
                  }`}
                  onDragEnter={(e) => handleDrag(e, setDragActiveQuadro)}
                  onDragOver={(e) => handleDrag(e, setDragActiveQuadro)}
                  onDragLeave={(e) => handleDrag(e, setDragActiveQuadro)}
                  onDrop={(e) => handleFormDrop(e, setDragActiveQuadro, "quadro")}
                  onClick={() => !quadroAreasFile && fileInputQuadroRef.current?.click()}
                  style={{ cursor: quadroAreasFile ? "default" : "pointer" }}
                >
                  <input ref={fileInputQuadroRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleFormFileChange(e, "quadro")} />
                  {quadroAreasFile ? (
                    <div className="w-full flex items-center justify-between text-left gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="h-4 w-4 text-green-400 shrink-0" />
                        <span className="text-[10px] text-white font-medium truncate max-w-[150px]">{quadroAreasFile.name}</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setQuadroAreasFile(null); }} className="text-gray-500 hover:text-red-400 p-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="pointer-events-none flex items-center gap-2">
                      <Upload className="h-3.5 w-3.5 text-[#D4AF37]/60" />
                      <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Quadro de Áreas</span>
                      <span className="text-[9px] text-gray-500">(Arraste ou clique)</span>
                    </div>
                  )}
                </div>

                {/* 4. Matrícula */}
                <div 
                  className={`border p-2.5 transition-all relative flex flex-col items-center justify-center text-center ${
                    dragActiveMatricula ? "border-[#D4AF37] bg-[#D4AF37]/5" : matriculaFile ? "border-green-500/20 bg-green-500/5" : "border-white/5 bg-[#1F1F1F]/40 hover:border-white/10"
                  }`}
                  onDragEnter={(e) => handleDrag(e, setDragActiveMatricula)}
                  onDragOver={(e) => handleDrag(e, setDragActiveMatricula)}
                  onDragLeave={(e) => handleDrag(e, setDragActiveMatricula)}
                  onDrop={(e) => handleFormDrop(e, setDragActiveMatricula, "matricula")}
                  onClick={() => !matriculaFile && fileInputMatriculaRef.current?.click()}
                  style={{ cursor: matriculaFile ? "default" : "pointer" }}
                >
                  <input ref={fileInputMatriculaRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleFormFileChange(e, "matricula")} />
                  {matriculaFile ? (
                    <div className="w-full flex items-center justify-between text-left gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="h-4 w-4 text-green-400 shrink-0" />
                        <span className="text-[10px] text-white font-medium truncate max-w-[150px]">{matriculaFile.name}</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setMatriculaFile(null); }} className="text-gray-500 hover:text-red-400 p-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="pointer-events-none flex items-center gap-2">
                      <Upload className="h-3.5 w-3.5 text-[#D4AF37]/60" />
                      <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Matrícula do Imóvel</span>
                      <span className="text-[9px] text-gray-500">(Arraste ou clique)</span>
                    </div>
                  )}
                </div>

                {/* 5. IPTU */}
                <div 
                  className={`border p-2.5 transition-all relative flex flex-col items-center justify-center text-center ${
                    dragActiveIptu ? "border-[#D4AF37] bg-[#D4AF37]/5" : iptuFile ? "border-green-500/20 bg-green-500/5" : "border-white/5 bg-[#1F1F1F]/40 hover:border-white/10"
                  }`}
                  onDragEnter={(e) => handleDrag(e, setDragActiveIptu)}
                  onDragOver={(e) => handleDrag(e, setDragActiveIptu)}
                  onDragLeave={(e) => handleDrag(e, setDragActiveIptu)}
                  onDrop={(e) => handleFormDrop(e, setDragActiveIptu, "iptu")}
                  onClick={() => !iptuFile && fileInputIptuRef.current?.click()}
                  style={{ cursor: iptuFile ? "default" : "pointer" }}
                >
                  <input ref={fileInputIptuRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleFormFileChange(e, "iptu")} />
                  {iptuFile ? (
                    <div className="w-full flex items-center justify-between text-left gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="h-4 w-4 text-green-400 shrink-0" />
                        <span className="text-[10px] text-white font-medium truncate max-w-[150px]">{iptuFile.name}</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setIptuFile(null); }} className="text-gray-500 hover:text-red-400 p-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="pointer-events-none flex items-center gap-2">
                      <Upload className="h-3.5 w-3.5 text-[#D4AF37]/60" />
                      <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Cópia do IPTU</span>
                      <span className="text-[9px] text-gray-500">(Arraste ou clique)</span>
                    </div>
                  )}
                </div>

                {/* 6. Memorial Descritivo */}
                <div 
                  className={`border p-2.5 transition-all relative flex flex-col items-center justify-center text-center ${
                    dragActiveMemorial ? "border-[#D4AF37] bg-[#D4AF37]/5" : memorialFile ? "border-green-500/20 bg-green-500/5" : "border-white/5 bg-[#1F1F1F]/40 hover:border-white/10"
                  }`}
                  onDragEnter={(e) => handleDrag(e, setDragActiveMemorial)}
                  onDragOver={(e) => handleDrag(e, setDragActiveMemorial)}
                  onDragLeave={(e) => handleDrag(e, setDragActiveMemorial)}
                  onDrop={(e) => handleFormDrop(e, setDragActiveMemorial, "memorial")}
                  onClick={() => !memorialFile && fileInputMemorialRef.current?.click()}
                  style={{ cursor: memorialFile ? "default" : "pointer" }}
                >
                  <input ref={fileInputMemorialRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleFormFileChange(e, "memorial")} />
                  {memorialFile ? (
                    <div className="w-full flex items-center justify-between text-left gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="h-4 w-4 text-green-400 shrink-0" />
                        <span className="text-[10px] text-white font-medium truncate max-w-[150px]">{memorialFile.name}</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setMemorialFile(null); }} className="text-gray-500 hover:text-red-400 p-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="pointer-events-none flex items-center gap-2">
                      <Upload className="h-3.5 w-3.5 text-[#D4AF37]/60" />
                      <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Memorial Descritivo</span>
                      <span className="text-[9px] text-gray-500">(Arraste ou clique)</span>
                    </div>
                  )}
                </div>

                {/* 7. PGRCC */}
                <div 
                  className={`border p-2.5 transition-all relative flex flex-col items-center justify-center text-center ${
                    dragActivePgrcc ? "border-[#D4AF37] bg-[#D4AF37]/5" : pgrccFile ? "border-green-500/20 bg-green-500/5" : "border-white/5 bg-[#1F1F1F]/40 hover:border-white/10"
                  }`}
                  onDragEnter={(e) => handleDrag(e, setDragActivePgrcc)}
                  onDragOver={(e) => handleDrag(e, setDragActivePgrcc)}
                  onDragLeave={(e) => handleDrag(e, setDragActivePgrcc)}
                  onDrop={(e) => handleFormDrop(e, setDragActivePgrcc, "pgrcc")}
                  onClick={() => !pgrccFile && fileInputPgrccRef.current?.click()}
                  style={{ cursor: pgrccFile ? "default" : "pointer" }}
                >
                  <input ref={fileInputPgrccRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleFormFileChange(e, "pgrcc")} />
                  {pgrccFile ? (
                    <div className="w-full flex items-center justify-between text-left gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="h-4 w-4 text-green-400 shrink-0" />
                        <span className="text-[10px] text-white font-medium truncate max-w-[150px]">{pgrccFile.name}</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setPgrccFile(null); }} className="text-gray-500 hover:text-red-400 p-1">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="pointer-events-none flex items-center gap-2">
                      <Upload className="h-3.5 w-3.5 text-[#D4AF37]/60" />
                      <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">PGRCC</span>
                      <span className="text-[9px] text-gray-500">(Arraste ou clique)</span>
                    </div>
                  )}
                </div>

                {/* Conditional Demolição Uploads */}
                {demolicao && (
                  <>
                    {/* Declaração de Inspeção */}
                    <div 
                      className={`border p-2.5 transition-all relative flex flex-col items-center justify-center text-center ${
                        dragActiveDeclaracao ? "border-[#D4AF37] bg-[#D4AF37]/5" : declaracaoInspecaoFile ? "border-green-500/20 bg-green-500/5" : "border-[#D4AF37]/25 bg-[#1F1F1F]/40 hover:border-[#D4AF37]/50"
                      }`}
                      onDragEnter={(e) => handleDrag(e, setDragActiveDeclaracao)}
                      onDragOver={(e) => handleDrag(e, setDragActiveDeclaracao)}
                      onDragLeave={(e) => handleDrag(e, setDragActiveDeclaracao)}
                      onDrop={(e) => handleFormDrop(e, setDragActiveDeclaracao, "declaracao")}
                      onClick={() => !declaracaoInspecaoFile && fileInputDeclaracaoRef.current?.click()}
                      style={{ cursor: declaracaoInspecaoFile ? "default" : "pointer" }}
                    >
                      <input ref={fileInputDeclaracaoRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleFormFileChange(e, "declaracao")} />
                      {declaracaoInspecaoFile ? (
                        <div className="w-full flex items-center justify-between text-left gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCheck className="h-4 w-4 text-green-400 shrink-0" />
                            <span className="text-[10px] text-white font-medium truncate max-w-[150px]">{declaracaoInspecaoFile.name}</span>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setDeclaracaoInspecaoFile(null); }} className="text-gray-500 hover:text-red-400 p-1">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="pointer-events-none flex items-center gap-2">
                          <Upload className="h-3.5 w-3.5 text-[#D4AF37]/70" />
                          <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">Declaração de Inspeção</span>
                          <span className="text-[9px] text-[#D4AF37]/70 font-semibold">(Demolição)</span>
                        </div>
                      )}
                    </div>

                    {/* PGRCC da Demolição */}
                    <div 
                      className={`border p-2.5 transition-all relative flex flex-col items-center justify-center text-center ${
                        dragActivePgrccDemolicao ? "border-[#D4AF37] bg-[#D4AF37]/5" : pgrccDemolicaoFile ? "border-green-500/20 bg-green-500/5" : "border-[#D4AF37]/25 bg-[#1F1F1F]/40 hover:border-[#D4AF37]/50"
                      }`}
                      onDragEnter={(e) => handleDrag(e, setDragActivePgrccDemolicao)}
                      onDragOver={(e) => handleDrag(e, setDragActivePgrccDemolicao)}
                      onDragLeave={(e) => handleDrag(e, setDragActivePgrccDemolicao)}
                      onDrop={(e) => handleFormDrop(e, setDragActivePgrccDemolicao, "pgrccDemolicao")}
                      onClick={() => !pgrccDemolicaoFile && fileInputPgrccDemolicaoRef.current?.click()}
                      style={{ cursor: pgrccDemolicaoFile ? "default" : "pointer" }}
                    >
                      <input ref={fileInputPgrccDemolicaoRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleFormFileChange(e, "pgrccDemolicao")} />
                      {pgrccDemolicaoFile ? (
                        <div className="w-full flex items-center justify-between text-left gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCheck className="h-4 w-4 text-green-400 shrink-0" />
                            <span className="text-[10px] text-white font-medium truncate max-w-[150px]">{pgrccDemolicaoFile.name}</span>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setPgrccDemolicaoFile(null); }} className="text-gray-500 hover:text-red-400 p-1">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="pointer-events-none flex items-center gap-2">
                          <Upload className="h-3.5 w-3.5 text-[#D4AF37]/70" />
                          <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">PGRCC da Demolição</span>
                          <span className="text-[9px] text-[#D4AF37]/70 font-semibold">(Demolição)</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Conditional Fossa e Filtro Uploads */}
                {fossaFiltro && (
                  <>
                    {/* Projeto de Fossa e Filtro */}
                    <div 
                      className={`border p-2.5 transition-all relative flex flex-col items-center justify-center text-center ${
                        dragActiveProjetoFossaFiltro ? "border-green-500/25 bg-green-500/5" : projetoFossaFiltroFile ? "border-green-500/20 bg-green-500/5" : "border-green-500/20 bg-[#1F1F1F]/40 hover:border-green-500/40"
                      }`}
                      onDragEnter={(e) => handleDrag(e, setDragActiveProjetoFossaFiltro)}
                      onDragOver={(e) => handleDrag(e, setDragActiveProjetoFossaFiltro)}
                      onDragLeave={(e) => handleDrag(e, setDragActiveProjetoFossaFiltro)}
                      onDrop={(e) => handleFormDrop(e, setDragActiveProjetoFossaFiltro, "projetoFossa")}
                      onClick={() => !projetoFossaFiltroFile && fileInputProjetoFossaFiltroRef.current?.click()}
                      style={{ cursor: projetoFossaFiltroFile ? "default" : "pointer" }}
                    >
                      <input ref={fileInputProjetoFossaFiltroRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleFormFileChange(e, "projetoFossa")} />
                      {projetoFossaFiltroFile ? (
                        <div className="w-full flex items-center justify-between text-left gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCheck className="h-4 w-4 text-green-400 shrink-0" />
                            <span className="text-[10px] text-white font-medium truncate max-w-[150px]">{projetoFossaFiltroFile.name}</span>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setProjetoFossaFiltroFile(null); }} className="text-gray-500 hover:text-red-400 p-1">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="pointer-events-none flex items-center gap-2">
                          <Upload className="h-3.5 w-3.5 text-green-400/70" />
                          <span className="text-[10px] font-mono font-bold text-green-400 uppercase tracking-wider">Projeto de Fossa e Filtro</span>
                          <span className="text-[9px] text-green-400/70 font-semibold">(Fossa/Filtro)</span>
                        </div>
                      )}
                    </div>

                    {/* Memorial de Fossa e Filtro */}
                    <div 
                      className={`border p-2.5 transition-all relative flex flex-col items-center justify-center text-center ${
                        dragActiveMemorialFossaFiltro ? "border-green-500/25 bg-green-500/5" : memorialFossaFiltroFile ? "border-green-500/20 bg-green-500/5" : "border-green-500/20 bg-[#1F1F1F]/40 hover:border-green-500/40"
                      }`}
                      onDragEnter={(e) => handleDrag(e, setDragActiveMemorialFossaFiltro)}
                      onDragOver={(e) => handleDrag(e, setDragActiveMemorialFossaFiltro)}
                      onDragLeave={(e) => handleDrag(e, setDragActiveMemorialFossaFiltro)}
                      onDrop={(e) => handleFormDrop(e, setDragActiveMemorialFossaFiltro, "memorialFossa")}
                      onClick={() => !memorialFossaFiltroFile && fileInputMemorialFossaFiltroRef.current?.click()}
                      style={{ cursor: memorialFossaFiltroFile ? "default" : "pointer" }}
                    >
                      <input ref={fileInputMemorialFossaFiltroRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(e) => handleFormFileChange(e, "memorialFossa")} />
                      {memorialFossaFiltroFile ? (
                        <div className="w-full flex items-center justify-between text-left gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCheck className="h-4 w-4 text-green-400 shrink-0" />
                            <span className="text-[10px] text-white font-medium truncate max-w-[150px]">{memorialFossaFiltroFile.name}</span>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setMemorialFossaFiltroFile(null); }} className="text-gray-500 hover:text-red-400 p-1">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="pointer-events-none flex items-center gap-2">
                          <Upload className="h-3.5 w-3.5 text-green-400/70" />
                          <span className="text-[10px] font-mono font-bold text-green-400 uppercase tracking-wider">Memorial de Fossa e Filtro</span>
                          <span className="text-[9px] text-green-400/70 font-semibold">(Fossa/Filtro)</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Submission button */}
            <div className="pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={isProcessingFile || clients.length === 0}
                className={`w-full flex items-center justify-center gap-3 rounded-none bg-[#D4AF37] py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F0F0F] transition-all hover:bg-[#D4AF37]/85 cursor-pointer ${
                  (isProcessingFile || clients.length === 0) ? "opacity-40 cursor-not-allowed" : ""
                }`}
                id="submit-service-btn"
              >
                <Plus className="h-4 w-4" />
                Registrar Serviço Técnico
              </button>
            </div>
          </form>
        </div>
        )}

        {/* RIGHT COLUMN: ACTIVE SERVICES VIEWER (60%) */}
        {(mode === "both" || mode === "list") && (
          <div className={`${mode === "both" ? "lg:col-span-7" : "w-full"} space-y-6`}>
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            
            {/* Search input */}
            <div className="relative flex-1 w-full text-left">
              <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente, tipo ou notas..."
                className="w-full text-xs text-white placeholder-gray-600 bg-[#141414] border border-white/10 pl-10 pr-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Filter select */}
            <div className="relative w-full sm:w-56 text-left">
              <Filter className="absolute left-3.5 top-3 h-3.5 w-3.5 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-none border border-white/10 bg-[#141414] pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37] appearance-none"
              >
                <option value="All">Todos os Tipos</option>
                {SERVICE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-text stats */}
          {services.length > 0 && (
            <p className="text-[10px] text-gray-500 font-mono text-left uppercase tracking-widest pl-1">
              Exibindo {filteredServices.length} de {services.length} serviços técnicos registrados
            </p>
          )}

          {/* Service items panels list */}
          {filteredServices.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 bg-[#141414] px-6 relative">
              <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
              <FolderOpen className="h-10 w-10 text-[#D4AF37]/35 mx-auto mb-4" />
              <h3 className="font-serif text-lg text-white font-light mb-1">Nenhum Serviço Encontrado</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                {services.length === 0 
                  ? "Adicione o primeiro serviço corporativo no formulário lateral vinculando a um proponente credenciado." 
                  : "Nenhum serviço atendeu aos filtros ou termos de pesquisa inseridos."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1">
              {filteredServices.map((service) => {
                
                // Array representation of documents to easily iterate and display
                const docCategories: { key: keyof ServiceItem["files"]; label: string; desc: string; }[] = [
                  { key: "art", label: "ART / RRT", desc: "Anotação de Responsabilidade Técnica" },
                  { key: "projeto", label: "Projeto de Arquitetura", desc: "Desenhos e plantas executivas" },
                  { key: "quadroAreas", label: "Quadro de Áreas", desc: "Tabela quantitativa de áreas" },
                  { key: "matricula", label: "Matrícula do Imóvel", desc: "Registro em cartório (RI)" },
                  { key: "iptu", label: "Cópia do IPTU", desc: "Cadastro tributário municipal" },
                  { key: "memorialDescritivo", label: "Memorial Descritivo", desc: "Memorial técnico descritivo" },
                  { key: "pgrcc", label: "PGRCC", desc: "Plano de Gerenciamento de Resíduos" }
                ];

                const officialDocCategories: { key: keyof ServiceItem["files"]; label: string; desc: string; }[] = [
                  { key: "alvaraAlinhamento", label: "Alvará de Alinhamento", desc: "Alvará de alinhamento oficial" },
                  { key: "certidaoEmplacamento", label: "Certidão de Emplacamento", desc: "Certidão de emplacamento do imóvel" },
                  { key: "alvaraAprovacao", label: "Alvará de Aprovação", desc: "Alvará de aprovação oficial do projeto" },
                  { key: "alvaraExecucao", label: "Alvará de Execução", desc: "Alvará de execução oficial da obra" }
                ];

                if (service.demolicao) {
                  docCategories.push(
                    { key: "declaracaoInspecao", label: "Declaração de Inspeção", desc: "Declaração de inspeção de demolição" },
                    { key: "pgrccDemolicao", label: "PGRCC da Demolição", desc: "PGRCC específico para obra de demolição" }
                  );
                }

                if (service.fossaFiltro) {
                  docCategories.push(
                    { key: "projetoFossaFiltro", label: "Projeto de Fossa e Filtro", desc: "Projeto técnico de fossa e filtro" },
                    { key: "memorialFossaFiltro", label: "Memorial de Fossa e Filtro", desc: "Memorial técnico de fossa e filtro" }
                  );
                }

                return (
                  <div 
                    key={service.id} 
                    id={`service-card-${service.id}`}
                    className="bg-[#141414] border border-white/5 p-6 text-left relative space-y-4 shadow-xl transition-all duration-300"
                  >
                    {/* Upper decorative bar reflecting service type */}
                    <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

                    {/* Metadata Header with service name, brand, delete action, toggles, and status */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-white/5">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-[#D4AF37] font-bold tracking-widest uppercase">
                          Registrado em {service.regDate}
                        </span>
                        <h4 className="font-serif text-lg text-white font-light tracking-wide">
                          {service.serviceType}
                        </h4>
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] text-gray-400 font-sans tracking-wide">
                            Proponente: <strong className="text-white font-medium">{service.clientName}</strong>
                          </p>
                          
                          {/* Confirmações Checkbox status badges */}
                          {(service.demolicao || service.fossaFiltro) && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {service.demolicao && (
                                <span className="inline-flex items-center gap-1 text-[8px] font-mono uppercase bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] px-2 py-0.5 font-bold">
                                  <span className="w-1 h-1 bg-[#D4AF37] rounded-full" /> Demolição
                                </span>
                              )}
                              {service.fossaFiltro && (
                                <span className="inline-flex items-center gap-1 text-[8px] font-mono uppercase bg-green-500/10 border border-green-500/35 text-green-400 px-2 py-0.5 font-bold">
                                  <span className="w-1 h-1 bg-green-400 rounded-full" /> Fossa e Filtro
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Interactive Requirement Buttons (Linked inside the service, next to status) */}
                      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto md:justify-end">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCartaHabitacaoModalService(service)}
                            className={`px-2.5 py-1 text-[8px] font-mono font-bold uppercase tracking-wider transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${
                              service.cartaHabitacao 
                                ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] shadow-sm shadow-[#D4AF37]/10" 
                                : "bg-[#111111]/40 border-white/5 text-gray-500 hover:border-[#D4AF37]/35 hover:text-white"
                            }`}
                            title="Gerenciar Documentos da Carta de Habitação"
                          >
                            <span className={`w-1 h-1 rounded-full ${service.cartaHabitacao ? "bg-[#D4AF37]" : "bg-gray-600"}`} />
                            Carta de Habitação
                          </button>

                          <button
                            type="button"
                            onClick={() => setClcbModalService(service)}
                            className={`px-2.5 py-1 text-[8px] font-mono font-bold uppercase tracking-wider transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${
                              service.clcb 
                                ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] shadow-sm shadow-[#D4AF37]/10" 
                                : "bg-[#111111]/40 border-white/5 text-gray-500 hover:border-[#D4AF37]/35 hover:text-white"
                            }`}
                            title="Gerenciar Documentos do CLCB"
                          >
                            <span className={`w-1 h-1 rounded-full ${service.clcb ? "bg-[#D4AF37]" : "bg-gray-600"}`} />
                            CLCB
                          </button>

                          <button
                            type="button"
                            onClick={() => setLicenciamentoAmbientalModalService(service)}
                            className={`px-2.5 py-1 text-[8px] font-mono font-bold uppercase tracking-wider transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${
                              service.licenciamentoAmbiental 
                                ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] shadow-sm shadow-[#D4AF37]/10" 
                                : "bg-[#111111]/40 border-white/5 text-gray-500 hover:border-[#D4AF37]/35 hover:text-white"
                            }`}
                            title="Gerenciar Documentos do Licenciamento Ambiental"
                          >
                            <span className={`w-1 h-1 rounded-full ${service.licenciamentoAmbiental ? "bg-[#D4AF37]" : "bg-gray-600"}`} />
                            Licenciamento Ambiental
                          </button>
                        </div>

                        <div className="flex items-center gap-2 ml-auto md:ml-0">
                          {/* Status tag */}
                          <select
                            value={service.status}
                            onChange={(e) => {
                              const nextStatus = e.target.value as "Pendente" | "Em Andamento" | "Concluído";
                              const updated = services.map(s => s.id === service.id ? { ...s, status: nextStatus } : s);
                              saveServices(updated);
                            }}
                            className={`text-[8px] font-mono tracking-widest uppercase font-bold border px-2.5 py-1 appearance-none outline-none cursor-pointer text-center ${
                              service.status === "Concluído" 
                                ? "bg-green-500/10 border-green-500/30 text-green-400" 
                                : service.status === "Em Andamento" 
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                                  : "bg-white/5 border-white/10 text-gray-400"
                            }`}
                          >
                            <option value="Pendente" className="bg-[#141414] text-white">PENDENTE</option>
                            <option value="Em Andamento" className="bg-[#141414] text-white">EM ANDAMENTO</option>
                            <option value="Concluído" className="bg-[#141414] text-white">CONCLUÍDO</option>
                          </select>
                          
                          {/* Delete Service */}
                          <button
                            onClick={() => setDeleteServiceId(service.id)}
                            className="text-gray-500 hover:text-red-400 p-1 bg-white/5 border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 transition-all cursor-pointer"
                            title="Remover Serviço"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notas de Controle + Dados do Terreno / Localização (Editáveis Online) */}
                    {editingServiceId === service.id ? (
                      <div className="bg-[#171717] border border-[#D4AF37]/40 p-4 space-y-4 relative">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                            <Pencil className="h-3 w-3 text-[#D4AF37]" /> Editar Dados do Terreno & Notas
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = services.map(s => {
                                  if (s.id === service.id) {
                                    return {
                                      ...s,
                                      notes: editNotes.trim(),
                                      numeroProcesso: editNumeroProcesso.trim(),
                                      loteamento: editLoteamento.trim(),
                                      quadra: editQuadra.trim(),
                                      lote: editLote.trim(),
                                      endereco: editEndereco.trim()
                                    };
                                  }
                                  return s;
                                });
                                saveServices(updated);
                                setEditingServiceId(null);
                              }}
                              className="px-2.5 py-1 bg-[#D4AF37] hover:bg-[#E5C048] text-black text-[9px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingServiceId(null)}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[9px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Notes */}
                          <div className="space-y-1">
                            <label className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider">Notas de Controle Interno / Escopo</label>
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              rows={2}
                              className="w-full bg-black/40 border border-white/10 text-white p-2 text-xs outline-none focus:border-[#D4AF37] resize-none font-sans"
                              placeholder="Adicione notas ou escopo de controle interno..."
                            />
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {/* Process Number */}
                            <div className="col-span-2 space-y-1">
                              <label className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider">Número do Processo</label>
                              <input
                                type="text"
                                value={editNumeroProcesso}
                                onChange={(e) => setEditNumeroProcesso(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 text-white px-2 py-1.5 text-xs outline-none focus:border-[#D4AF37] font-mono"
                                placeholder="Nº Processo"
                              />
                            </div>

                            {/* Loteamento */}
                            <div className="col-span-1 space-y-1">
                              <label className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider">Loteamento</label>
                              <input
                                type="text"
                                value={editLoteamento}
                                onChange={(e) => setEditLoteamento(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 text-white px-2 py-1.5 text-xs outline-none focus:border-[#D4AF37]"
                                placeholder="Loteamento"
                              />
                            </div>

                            {/* Quadra / Lote */}
                            <div className="col-span-1 grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="block text-[8px] font-mono text-gray-400 uppercase tracking-wider">Q</label>
                                <input
                                  type="text"
                                  value={editQuadra}
                                  onChange={(e) => setEditQuadra(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 text-white px-2 py-1.5 text-xs outline-none focus:border-[#D4AF37] text-center"
                                  placeholder="Q"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[8px] font-mono text-gray-400 uppercase tracking-wider">L</label>
                                <input
                                  type="text"
                                  value={editLote}
                                  onChange={(e) => setEditLote(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 text-white px-2 py-1.5 text-xs outline-none focus:border-[#D4AF37] text-center"
                                  placeholder="L"
                                />
                              </div>
                            </div>

                            {/* Endereço */}
                            <div className="col-span-2 sm:col-span-4 space-y-1">
                              <label className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider">Endereço</label>
                              <input
                                type="text"
                                value={editEndereco}
                                onChange={(e) => setEditEndereco(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 text-white px-2 py-1.5 text-xs outline-none focus:border-[#D4AF37]"
                                placeholder="Endereço Completo do Imóvel"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#171717] border border-white/5 p-4 space-y-3.5 relative group">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingServiceId(service.id);
                            setEditNotes(service.notes || "");
                            setEditNumeroProcesso(service.numeroProcesso || "");
                            setEditLoteamento(service.loteamento || "");
                            setEditQuadra(service.quadra || "");
                            setEditLote(service.lote || "");
                            setEditEndereco(service.endereco || "");
                          }}
                          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/60 flex items-center gap-1.5 text-[9px] font-mono uppercase bg-white/5 hover:bg-[#D4AF37]/10 px-2.5 py-1 border border-white/10 transition-all cursor-pointer shadow-sm"
                          title="Editar notas e dados geográficos do terreno"
                        >
                          <Pencil className="h-2.5 w-2.5" /> Editar Dados
                        </button>

                        {/* Notes Section */}
                        <div className="space-y-1">
                          <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider">Notas de Controle Interno / Escopo</span>
                          {service.notes ? (
                            <p className="text-[11px] leading-relaxed text-gray-300 font-sans italic pr-16 bg-black/5 p-2 border border-white/[0.03] rounded-sm">
                              "{service.notes}"
                            </p>
                          ) : (
                            <p className="text-[10px] text-gray-600 font-sans italic pr-16">
                              Nenhuma nota interna vinculada. Clique em Editar para registrar.
                            </p>
                          )}
                        </div>

                        {/* Localização Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-xs leading-relaxed">
                          <div>
                            <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">Nº do Processo</span>
                            <span className="text-white font-medium break-all font-mono text-[11px]">{service.numeroProcesso || "Não Definido"}</span>
                          </div>

                          <div>
                            <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">Loteamento</span>
                            <span className="text-white font-medium">{service.loteamento || "N/A"}</span>
                          </div>

                          <div>
                            <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">Quadra / Lote</span>
                            <span className="text-white font-medium">
                              {service.quadra || service.lote ? (
                                <>
                                  {service.quadra ? `Q: ${service.quadra}` : ""}
                                  {service.quadra && service.lote ? " - " : ""}
                                  {service.lote ? `L: ${service.lote}` : ""}
                                </>
                              ) : "N/A"}
                            </span>
                          </div>

                          <div className="col-span-2 sm:col-span-4">
                            <span className="block text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">Endereço</span>
                            <span className="text-white font-medium">{service.endereco || "Não Informado"}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Financial details box on card */}
                    {(() => {
                      const val = service.valorServico ?? 0;
                      const ent = service.entrada ?? 0;
                      const pag = service.pagamentos ?? 0;
                      const rec = service.aReceber ?? (val - ent - pag);
                      
                      return (
                        <div className="bg-[#1C1C1C]/45 border border-white/5 p-3 sm:p-4 space-y-2.5">
                          <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#D4AF37]">
                              Controle Financeiro
                            </span>
                            <span className="text-[8px] font-mono text-gray-500 uppercase">
                              BRL (R$)
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div>
                              <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">Valor do Serviço</p>
                              <p className="text-xs font-semibold text-white">{formatToCurrencyInput(val)}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">Entrada</p>
                              <p className="text-xs font-semibold text-white">{formatToCurrencyInput(ent)}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">Pagamentos</p>
                              <p className="text-xs font-semibold text-white">{formatToCurrencyInput(pag)}</p>
                            </div>
                            <div>
                              <p className="text-[8px] font-mono text-[#D4AF37]/80 uppercase tracking-wider mb-0.5">A Receber</p>
                              <p className="text-xs font-bold text-[#D4AF37]">{formatToCurrencyInput(rec)}</p>
                            </div>
                          </div>

                          {/* Dynamic payments inclusion form */}
                          <div className="pt-2 border-t border-white/5 flex flex-col md:flex-row gap-2.5 items-end justify-between">
                            <div className="flex-1 w-full text-left">
                              <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-gray-400 block mb-1">
                                Incluir Novo Pagamento
                              </span>
                              <input
                                type="text"
                                value={formatToCurrencyInput(newPaymentInputs[service.id] ?? 0)}
                                onChange={(e) => {
                                  const clean = e.target.value.replace(/\D/g, "");
                                  const num = clean ? parseFloat(clean) / 100 : 0;
                                  setNewPaymentInputs(prev => ({ ...prev, [service.id]: num }));
                                }}
                                className="w-full bg-[#111111] border border-white/10 px-3 py-1.5 text-xs text-white outline-none focus:border-[#D4AF37] text-left antialiased font-mono"
                                placeholder="R$ 0,00"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const valToAdd = newPaymentInputs[service.id] ?? 0;
                                if (valToAdd > 0) {
                                  const nextPag = pag + valToAdd;
                                  const nextRec = val - ent - nextPag;
                                  const updated = services.map(s => s.id === service.id ? {
                                    ...s,
                                    pagamentos: nextPag,
                                    aReceber: nextRec
                                  } : s);
                                  saveServices(updated);
                                  setNewPaymentInputs(prev => ({ ...prev, [service.id]: 0 }));
                                }
                              }}
                              className="w-full md:w-auto px-4 py-1.5 bg-[#D4AF37] text-black font-mono font-bold text-[9px] uppercase tracking-wider hover:bg-[#D4AF37]/85 transition-all shrink-0 cursor-pointer h-[30px] flex items-center justify-center"
                            >
                              Registrar
                            </button>
                          </div>
                        </div>
                      );
                    })()}
 
                    {/* Documentos Oficiais section */}
                    <div className="space-y-2.5 pt-2">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase block border-b border-white/5 pb-1">
                        Documentos Oficiais
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {officialDocCategories.map((doc) => {
                          const fileObj = service.files[doc.key];

                          return (
                            <div
                              key={doc.key}
                              className={`border p-3 transition-all relative flex flex-col justify-between min-h-[90px] ${
                                activeCardDrag?.serviceId === service.id && activeCardDrag?.category === doc.key
                                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                                  : fileObj
                                    ? "border-green-500/15 bg-green-500/5"
                                    : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.08]"
                              }`}
                              onDragEnter={(e) => handleCardDrag(e, service.id, doc.key, true)}
                              onDragOver={(e) => handleCardDrag(e, service.id, doc.key, true)}
                              onDragLeave={(e) => handleCardDrag(e, service.id, doc.key, false)}
                              onDrop={(e) => handleCardDrop(e, service.id, doc.key)}
                              onClick={() => !fileObj && triggerCardFileInput(service.id, doc.key)}
                              style={{ cursor: fileObj ? "default" : "pointer" }}
                            >
                              {/* Hidden file input for this block */}
                              <input
                                id={`card-file-${doc.key}-${service.id}`}
                                type="file"
                                className="hidden"
                                accept=".pdf,.png,.jpg,.jpeg,.docx"
                                onChange={(e) => handleCardFileChange(e, service.id, doc.key)}
                              />

                              {fileObj ? (
                                <div className="space-y-2 w-full text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8.5px] font-bold text-white uppercase tracking-wider block">
                                      {doc.label}
                                    </span>
                                    <span className="text-[7.5px] font-mono text-green-400 font-bold bg-green-500/10 px-1 py-0.2">
                                      Carregado
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 bg-black/25 p-1.5 border border-white/5 min-w-0">
                                    <FileText className="h-4 w-4 text-[#D4AF37] shrink-0" />
                                    <div className="min-w-0 flex-grow">
                                      <p className="text-[9px] font-medium text-white truncate max-w-full" title={fileObj.name}>
                                        {fileObj.name}
                                      </p>
                                      <p className="text-[8px] font-mono text-gray-500">{formatBytes(fileObj.size)}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 pt-1">
                                    <a
                                      href={fileObj.url}
                                      download={`DocumentosOficiais_${doc.label.replace(/\s+/g, "_")}_${fileObj.name}`}
                                      className="flex-1 py-1 bg-white/5 border border-[#D4AF37]/35 text-[8.5px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <Download className="h-2.5 w-2.5" /> Baixar
                                    </a>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteFileConfirm({ serviceId: service.id, category: doc.key });
                                      }}
                                      className="py-1 px-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                      title="Remover documento"
                                    >
                                      <Trash2 className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1.5 py-1 pointer-events-none text-center">
                                  <Upload className="h-3.5 w-3.5 text-[#D4AF37]/50 mx-auto" />
                                  <p className="text-[9px] font-mono uppercase tracking-wider text-white font-bold leading-none">
                                    {doc.label}
                                  </p>
                                  <p className="text-[8px] text-gray-400 leading-none">
                                    Arraste ou clique para enviar
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive upload-download fields identical to registration design */}
                    <div className="space-y-2.5 pt-2">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase block border-b border-white/5 pb-1">
                        Portfólio de Documentações do Serviço
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {docCategories.map((doc) => {
                          const fileObj = service.files[doc.key];

                          return (
                            <div
                              key={doc.key}
                              className={`border p-3 transition-all relative flex flex-col justify-between ${
                                activeCardDrag?.serviceId === service.id && activeCardDrag?.category === doc.key
                                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                                  : fileObj
                                    ? "border-green-500/15 bg-green-500/5"
                                    : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.08]"
                              }`}
                              onDragEnter={(e) => handleCardDrag(e, service.id, doc.key, true)}
                              onDragOver={(e) => handleCardDrag(e, service.id, doc.key, true)}
                              onDragLeave={(e) => handleCardDrag(e, service.id, doc.key, false)}
                              onDrop={(e) => handleCardDrop(e, service.id, doc.key)}
                              onClick={() => !fileObj && triggerCardFileInput(service.id, doc.key)}
                              style={{ cursor: fileObj ? "default" : "pointer" }}
                            >
                              {/* Hidden file input for this block */}
                              <input
                                id={`card-file-${doc.key}-${service.id}`}
                                type="file"
                                className="hidden"
                                accept=".pdf,.png,.jpg,.jpeg,.docx"
                                onChange={(e) => handleCardFileChange(e, service.id, doc.key)}
                              />

                              {fileObj ? (
                                <div className="space-y-2 w-full text-left">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8.5px] font-bold text-white uppercase tracking-wider block">
                                      {doc.label}
                                    </span>
                                    <span className="text-[7.5px] font-mono text-green-400 font-bold bg-green-500/10 px-1 py-0.2">
                                      Carregado
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 bg-black/25 p-1.5 border border-white/5 min-w-0">
                                    <FileText className="h-4 w-4 text-[#D4AF37] shrink-0" />
                                    <div className="min-w-0 flex-grow">
                                      <p className="text-[9px] font-medium text-white truncate max-w-full" title={fileObj.name}>
                                        {fileObj.name}
                                      </p>
                                      <p className="text-[8px] font-mono text-gray-500">{formatBytes(fileObj.size)}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 pt-1">
                                    <a
                                      href={fileObj.url}
                                      download={`${doc.label.replace(/\s+/g, "_")}_${fileObj.name}`}
                                      className="flex-1 py-1 bg-white/5 border border-[#D4AF37]/35 text-[8.5px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <Download className="h-2.5 w-2.5" /> Baixar
                                    </a>
                                    <button
                                      onClick={() => setDeleteFileConfirm({ serviceId: service.id, category: doc.key })}
                                      className="py-1 px-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                      title="Remover documento"
                                    >
                                      <Trash2 className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1.5 py-1 pointer-events-none text-center">
                                  <Upload className="h-3.5 w-3.5 text-[#D4AF37]/50 mx-auto" />
                                  <p className="text-[9px] font-mono uppercase tracking-wider text-white font-bold leading-none">
                                    {doc.label}
                                  </p>
                                  <p className="text-[8px] text-gray-400 leading-none">
                                    Arraste ou clique para enviar
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
        )}

      </div>

      {/* Confirmation modal for complete service deletion */}
      {deleteServiceId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#D4AF37]/30 max-w-md w-full p-6 sm:p-8 space-y-6 relative shadow-2xl text-left">
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            <div className="space-y-2">
              <h3 className="font-serif text-lg text-white font-light">Confirmar Exclusão de Serviço</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tem certeza de que deseja remover os registros e documentos oficiais deste serviço técnico? Esta ação é irreversível e apagará todas as ARTs, projetos e cadastros vinculados.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteServiceId(null)}
                className="flex-1 py-3 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const id = deleteServiceId;
                  const filtered = services.filter(s => s.id !== id);
                  saveServices(filtered);
                  setDeleteServiceId(null);
                }}
                className="flex-1 py-3 bg-[#D4AF37] text-[10px] text-black font-mono font-bold uppercase tracking-wider hover:bg-[#D4AF37]/80 transition-all cursor-pointer"
              >
                Remover Serviço
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal for document file deletion */}
      {deleteFileConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#D4AF37]/30 max-w-sm w-full p-6 sm:p-8 space-y-6 relative shadow-2xl text-left">
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            <div className="space-y-2">
              <h3 className="font-serif text-lg text-white font-light">Excluir Arquivo</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tem certeza de que deseja excluir permanentemente esta documentação de laudo da pasta desse serviço?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteFileConfirm(null)}
                className="flex-1 py-3 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const { serviceId, category } = deleteFileConfirm;
                  const updated = services.map((s) => {
                    if (s.id === serviceId) {
                      const nextFiles = { ...s.files };
                      delete nextFiles[category];
                      return {
                        ...s,
                        files: nextFiles,
                      };
                    }
                    return s;
                  });
                  saveServices(updated);
                  setDeleteFileConfirm(null);
                }}
                className="flex-1 py-3 bg-red-600/95 text-[10px] text-white font-mono font-bold uppercase tracking-wider hover:bg-red-700 transition-all cursor-pointer"
              >
                Excluir Arquivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup / Modal for Carta de Habitação Document Management */}
      {cartaHabitacaoModalService && (
        (() => {
          const liveService = services.find(s => s.id === cartaHabitacaoModalService.id) || cartaHabitacaoModalService;
          
          const officialDocFields = [
            { key: "cartaHabitacaoDoc" as const, label: "Carta de Habitação", desc: "Documento oficial da Carta de Habitação" },
            { key: "certidaoValorVenal" as const, label: "Certidão de Valor Venal", desc: "Certidões de valor venal do imóvel" },
          ];

          const otherDocFields = [
            { key: "alvaraExecucao" as const, label: "Alvará de Execução", desc: "Alvará de execução oficial da obra" },
            { key: "clcbCartaHabitacao" as const, label: "CLCB", desc: "Certificação de Licença do Corpo de Bombeiros" },
            { key: "atestadoSabesp" as const, label: "Atestado da SABESP", desc: "Atestado de ligação de água e esgoto" },
            { key: "laudoVistoria" as const, label: "Laudo de Vistoria", desc: "Laudo técnico de vistoria final" },
          ];

          const renderDocField = (field: { key: "alvaraExecucao" | "clcbCartaHabitacao" | "atestadoSabesp" | "laudoVistoria" | "cartaHabitacaoDoc" | "certidaoValorVenal"; label: string; desc: string; }) => {
            const fileObj = liveService.files?.[field.key];
            
            const triggerFileSelect = () => {
              if (field.key === "alvaraExecucao") fileRefAlvara.current?.click();
              else if (field.key === "clcbCartaHabitacao") fileRefClcb.current?.click();
              else if (field.key === "atestadoSabesp") fileRefSabesp.current?.click();
              else if (field.key === "laudoVistoria") fileRefVistoria.current?.click();
              else if (field.key === "cartaHabitacaoDoc") fileRefCartaHabitacao.current?.click();
              else if (field.key === "certidaoValorVenal") fileRefValorVenal.current?.click();
            };

            const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                processUploadedFile(file, (processed) => {
                  const updated = services.map(s => {
                    if (s.id === liveService.id) {
                      const nextFiles = {
                        ...s.files,
                        [field.key]: processed
                      };
                      if (field.key === "clcbCartaHabitacao") {
                        nextFiles.clcbDoc = processed;
                      }
                      return {
                        ...s,
                        cartaHabitacao: true, // Auto-bind on file load
                        clcb: field.key === "clcbCartaHabitacao" ? true : s.clcb,
                        files: nextFiles
                      };
                    }
                    return s;
                  });
                  saveServices(updated);
                });
              }
            };

            return (
              <div key={field.key} className="bg-[#1A1A1A] border border-white/5 p-4 flex flex-col justify-between space-y-3.5 min-h-[140px]">
                {/* Category Details */}
                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-gray-300">
                      {field.label}
                    </span>
                    {fileObj ? (
                      <span className="text-[7.5px] font-mono font-bold uppercase text-green-400 bg-green-500/10 px-1.5 py-0.5">
                        Carregado
                      </span>
                    ) : (
                      <span className="text-[7.5px] font-mono font-bold uppercase text-gray-400 bg-white/5 px-1.5 py-0.5">
                        Pendente
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400 leading-tight">{field.desc}</p>
                </div>

                {/* Attachment State / Controls */}
                {fileObj ? (
                  <div className="space-y-2 w-full text-left">
                    <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-2 min-w-0">
                      <FileText className="h-4 w-4 text-[#D4AF37] shrink-0" />
                      <div className="min-w-0 flex-grow">
                        <p className="text-[10px] font-medium text-white truncate max-w-full" title={fileObj.name}>
                          {fileObj.name}
                        </p>
                        <p className="text-[8px] font-mono text-gray-500">{formatBytes(fileObj.size)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <a
                        href={fileObj.url}
                        download={`CartaHabitacao_${field.label.replace(/\s+/g, "_")}_${fileObj.name}`}
                        className="flex-1 py-1.5 bg-white/5 border border-[#D4AF37]/35 text-[9px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download className="h-2.5 w-2.5" /> Baixar
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteFileConfirm({ serviceId: liveService.id, category: field.key });
                        }}
                        className="py-1.5 px-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Remover documento"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Hidden input */}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleLocalChange}
                      ref={
                        field.key === "alvaraExecucao" ? fileRefAlvara :
                        field.key === "clcbCartaHabitacao" ? fileRefClcb :
                        field.key === "atestadoSabesp" ? fileRefSabesp :
                        field.key === "laudoVistoria" ? fileRefVistoria :
                        field.key === "cartaHabitacaoDoc" ? fileRefCartaHabitacao :
                        fileRefValorVenal
                      }
                    />
                    <button
                      type="button"
                      onClick={triggerFileSelect}
                      className="w-full py-3.5 border border-dashed border-white/10 hover:border-[#D4AF37]/50 bg-[#1E1E1E]/50 hover:bg-[#D4AF37]/5 text-center transition-all cursor-pointer group flex flex-col items-center justify-center space-y-1"
                    >
                      <Upload className="h-4 w-4 text-[#D4AF37]/60 group-hover:text-[#D4AF37]" />
                      <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider group-hover:text-white">
                        Carregar Documento
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          };

          return (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
              <div className="bg-[#141414] border border-[#D4AF37]/35 max-w-xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl text-left">
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="space-y-0.5 min-w-0 pr-2 text-left">
                    <span className="text-[8px] font-mono text-[#D4AF37] font-bold tracking-widest uppercase block truncate">
                      Processo: {liveService.numeroProcesso || "Não Definido"}
                    </span>
                    <h3 className="font-serif text-xl text-white font-light">Carta de Habitação</h3>
                    <p className="text-[10px] text-gray-400 truncate">
                      Cliente: <strong className="text-white font-medium">{liveService.clientName}</strong>
                    </p>
                  </div>

                  {/* Check/uncheck linking status */}
                  <button
                    onClick={() => {
                      const updated = services.map(s => s.id === liveService.id ? {
                        ...s,
                        cartaHabitacao: !s.cartaHabitacao
                      } : s);
                      saveServices(updated);
                    }}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors duration-200 border flex items-center gap-2 cursor-pointer shrink-0 ${
                      liveService.cartaHabitacao 
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]" 
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <Check className={`h-3 w-3 ${liveService.cartaHabitacao ? "text-[#D4AF37]" : "text-gray-500"}`} />
                    {liveService.cartaHabitacao ? "Vinculado" : "Não Vinculado"}
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-6">
                  {/* Documentos Oficiais section */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase block border-b border-white/10 pb-1.5 text-left">
                      documentos oficiais
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {officialDocFields.map(renderDocField)}
                    </div>
                  </div>

                  {/* Documentos Auxiliares section */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase block border-b border-white/10 pb-1.5 text-left">
                      outros documentos
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {otherDocFields.map(renderDocField)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => setCartaHabitacaoModalService(null)}
                    className="px-8 py-3 bg-[#D4AF37] text-[10px] text-black font-mono font-bold uppercase tracking-wider hover:bg-[#D4AF37]/85 transition-all cursor-pointer"
                  >
                    Concluído
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Popup / Modal for CLCB Document Management */}
      {clcbModalService && (
        (() => {
          const liveService = services.find(s => s.id === clcbModalService.id) || clcbModalService;
          
          const officialDocFields = [
            { key: "clcbDoc" as const, label: "CLCB", desc: "Laudo / Certificado CLCB Oficial" },
          ];

          const otherDocFields = [
            { key: "artClcb" as const, label: "ART / RRT", desc: "Anotação de Responsabilidade Técnica" },
            { key: "formularioClcb" as const, label: "Formulário", desc: "Formulário de solicitação de CLCB" },
          ];

          const renderDocField = (field: { key: "clcbDoc" | "artClcb" | "formularioClcb"; label: string; desc: string; }) => {
            const fileObj = liveService.files?.[field.key];
            
            const triggerFileSelect = () => {
              if (field.key === "clcbDoc") fileRefClcbPremium.current?.click();
              else if (field.key === "artClcb") fileRefArtClcb.current?.click();
              else if (field.key === "formularioClcb") fileRefFormularioClcb.current?.click();
            };

            const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                processUploadedFile(file, (processed) => {
                  const updated = services.map(s => {
                    if (s.id === liveService.id) {
                      const nextFiles = {
                        ...s.files,
                        [field.key]: processed
                      };
                      if (field.key === "clcbDoc") {
                        nextFiles.clcbCartaHabitacao = processed;
                      }
                      return {
                        ...s,
                        clcb: true, // Auto-bind on file load
                        cartaHabitacao: field.key === "clcbDoc" ? true : s.cartaHabitacao,
                        files: nextFiles
                      };
                    }
                    return s;
                  });
                  saveServices(updated);
                });
              }
            };

            return (
              <div key={field.key} className="bg-[#1A1A1A] border border-white/5 p-4 flex flex-col justify-between space-y-3.5 min-h-[140px]">
                {/* Category Details */}
                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-gray-300">
                      {field.label}
                    </span>
                    {fileObj ? (
                      <span className="text-[7.5px] font-mono font-bold uppercase text-green-400 bg-green-500/10 px-1.5 py-0.5">
                        Carregado
                      </span>
                    ) : (
                      <span className="text-[7.5px] font-mono font-bold uppercase text-gray-400 bg-white/5 px-1.5 py-0.5">
                        Pendente
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400 leading-tight">{field.desc}</p>
                </div>

                {/* Attachment State / Controls */}
                {fileObj ? (
                  <div className="space-y-2 w-full text-left">
                    <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-2 min-w-0">
                      <FileText className="h-4 w-4 text-[#D4AF37] shrink-0" />
                      <div className="min-w-0 flex-grow">
                        <p className="text-[10px] font-medium text-white truncate max-w-full" title={fileObj.name}>
                          {fileObj.name}
                        </p>
                        <p className="text-[8px] font-mono text-gray-500">{formatBytes(fileObj.size)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <a
                        href={fileObj.url}
                        download={`CLCB_${field.label.replace(/\s+/g, "_")}_${fileObj.name}`}
                        className="flex-1 py-1.5 bg-white/5 border border-[#D4AF37]/35 text-[9px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download className="h-2.5 w-2.5" /> Baixar
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteFileConfirm({ serviceId: liveService.id, category: field.key });
                        }}
                        className="py-1.5 px-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Remover documento"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Hidden input */}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleLocalChange}
                      ref={
                        field.key === "clcbDoc" ? fileRefClcbPremium :
                        field.key === "artClcb" ? fileRefArtClcb :
                        fileRefFormularioClcb
                      }
                    />
                    <button
                      type="button"
                      onClick={triggerFileSelect}
                      className="w-full py-3.5 border border-dashed border-white/10 hover:border-[#D4AF37]/50 bg-[#1E1E1E]/50 hover:bg-[#D4AF37]/5 text-center transition-all cursor-pointer group flex flex-col items-center justify-center space-y-1"
                    >
                      <Upload className="h-4 w-4 text-[#D4AF37]/60 group-hover:text-[#D4AF37]" />
                      <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider group-hover:text-white">
                        Carregar Documento
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          };

          return (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
              <div className="bg-[#141414] border border-[#D4AF37]/35 max-w-xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl text-left">
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="space-y-0.5 min-w-0 pr-2 text-left">
                    <span className="text-[8px] font-mono text-[#D4AF37] font-bold tracking-widest uppercase block truncate">
                      Processo: {liveService.numeroProcesso || "Não Definido"}
                    </span>
                    <h3 className="font-serif text-xl text-white font-light">CLCB</h3>
                    <p className="text-[10px] text-gray-400 truncate">
                      Cliente: <strong className="text-white font-medium">{liveService.clientName}</strong>
                    </p>
                  </div>

                  {/* Check/uncheck linking status */}
                  <button
                    onClick={() => {
                      const updated = services.map(s => s.id === liveService.id ? {
                        ...s,
                        clcb: !s.clcb
                      } : s);
                      saveServices(updated);
                    }}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors duration-200 border flex items-center gap-2 cursor-pointer shrink-0 ${
                      liveService.clcb 
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]" 
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <Check className={`h-3 w-3 ${liveService.clcb ? "text-[#D4AF37]" : "text-gray-500"}`} />
                    {liveService.clcb ? "Vinculado" : "Não Vinculado"}
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-6">
                  {/* Documentos Oficiais section */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase block border-b border-white/10 pb-1.5 text-left">
                      documento oficial
                    </span>
                    <div className="grid grid-cols-1 gap-4">
                      {officialDocFields.map(renderDocField)}
                    </div>
                  </div>

                  {/* Documentos Auxiliares section */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase block border-b border-white/10 pb-1.5 text-left">
                      outros documentos
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {otherDocFields.map(renderDocField)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => setClcbModalService(null)}
                    className="px-8 py-3 bg-[#D4AF37] text-[10px] text-black font-mono font-bold uppercase tracking-wider hover:bg-[#D4AF37]/85 transition-all cursor-pointer"
                  >
                    Concluído
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Popup / Modal for Licenciamento Ambiental Document Management */}
      {licenciamentoAmbientalModalService && (
        (() => {
          const liveService = services.find(s => s.id === licenciamentoAmbientalModalService.id) || licenciamentoAmbientalModalService;
          
          const officialDocFields = [
            { key: "tcaDoc" as const, label: "TCA", desc: "Termo de Compromisso Ambiental (TCA) Oficial" },
          ];

          const otherDocFields = [
            { key: "requerimentoDoc" as const, label: "Requerimento", desc: "Requerimento de Licenciamento Ambiental" },
            { key: "doacaoMudas" as const, label: "Doação de Mudas", desc: "Termo ou Comprovante de Doação de Mudas" },
          ];

          const renderDocField = (field: { key: "tcaDoc" | "requerimentoDoc" | "doacaoMudas"; label: string; desc: string; }) => {
            const fileObj = liveService.files?.[field.key];
            
            const triggerFileSelect = () => {
              if (field.key === "tcaDoc") fileRefTca.current?.click();
              else if (field.key === "requerimentoDoc") fileRefRequerimento.current?.click();
              else if (field.key === "doacaoMudas") fileRefDoacaoMudas.current?.click();
            };

            const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                processUploadedFile(file, (processed) => {
                  const updated = services.map(s => {
                    if (s.id === liveService.id) {
                      return {
                        ...s,
                        licenciamentoAmbiental: true, // Auto-bind on file load
                        files: {
                          ...s.files,
                          [field.key]: processed
                        }
                      };
                    }
                    return s;
                  });
                  saveServices(updated);
                });
              }
            };

            return (
              <div key={field.key} className="bg-[#1A1A1A] border border-white/5 p-4 flex flex-col justify-between space-y-3.5 min-h-[140px]">
                {/* Category Details */}
                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-gray-300">
                      {field.label}
                    </span>
                    {fileObj ? (
                      <span className="text-[7.5px] font-mono font-bold uppercase text-green-400 bg-green-500/10 px-1.5 py-0.5">
                        Carregado
                      </span>
                    ) : (
                      <span className="text-[7.5px] font-mono font-bold uppercase text-gray-400 bg-white/5 px-1.5 py-0.5">
                        Pendente
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400 leading-tight">{field.desc}</p>
                </div>

                {/* Attachment State / Controls */}
                {fileObj ? (
                  <div className="space-y-2 w-full text-left">
                    <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-2 min-w-0">
                      <FileText className="h-4 w-4 text-[#D4AF37] shrink-0" />
                      <div className="min-w-0 flex-grow">
                        <p className="text-[10px] font-medium text-white truncate max-w-full" title={fileObj.name}>
                          {fileObj.name}
                        </p>
                        <p className="text-[8px] font-mono text-gray-500">{formatBytes(fileObj.size)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <a
                        href={fileObj.url}
                        download={`LicenciamentoAmbiental_${field.label.replace(/\s+/g, "_")}_${fileObj.name}`}
                        className="flex-1 py-1.5 bg-white/5 border border-[#D4AF37]/35 text-[9px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download className="h-2.5 w-2.5" /> Baixar
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteFileConfirm({ serviceId: liveService.id, category: field.key });
                        }}
                        className="py-1.5 px-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Remover documento"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Hidden input */}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleLocalChange}
                      ref={
                        field.key === "tcaDoc" ? fileRefTca :
                        field.key === "requerimentoDoc" ? fileRefRequerimento :
                        fileRefDoacaoMudas
                      }
                    />
                    <button
                      type="button"
                      onClick={triggerFileSelect}
                      className="w-full py-3.5 border border-dashed border-white/10 hover:border-[#D4AF37]/50 bg-[#1E1E1E]/50 hover:bg-[#D4AF37]/5 text-center transition-all cursor-pointer group flex flex-col items-center justify-center space-y-1"
                    >
                      <Upload className="h-4 w-4 text-[#D4AF37]/60 group-hover:text-[#D4AF37]" />
                      <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider group-hover:text-white">
                        Carregar Documento
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          };

          return (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
              <div className="bg-[#141414] border border-[#D4AF37]/35 max-w-xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl text-left">
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="space-y-0.5 min-w-0 pr-2 text-left">
                    <span className="text-[8px] font-mono text-[#D4AF37] font-bold tracking-widest uppercase block truncate">
                      Processo: {liveService.numeroProcesso || "Não Definido"}
                    </span>
                    <h3 className="font-serif text-xl text-white font-light">Licenciamento Ambiental</h3>
                    <p className="text-[10px] text-gray-400 truncate">
                      Cliente: <strong className="text-white font-medium">{liveService.clientName}</strong>
                    </p>
                  </div>

                  {/* Check/uncheck linking status */}
                  <button
                    onClick={() => {
                      const updated = services.map(s => s.id === liveService.id ? {
                        ...s,
                        licenciamentoAmbiental: !s.licenciamentoAmbiental
                      } : s);
                      saveServices(updated);
                    }}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors duration-200 border flex items-center gap-2 cursor-pointer shrink-0 ${
                      liveService.licenciamentoAmbiental 
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]" 
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <Check className={`h-3 w-3 ${liveService.licenciamentoAmbiental ? "text-[#D4AF37]" : "text-gray-500"}`} />
                    {liveService.licenciamentoAmbiental ? "Vinculado" : "Não Vinculado"}
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-6">
                  {/* Documentos Oficiais section */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase block border-b border-white/10 pb-1.5 text-left">
                      documento oficial
                    </span>
                    <div className="grid grid-cols-1 gap-4">
                      {officialDocFields.map(renderDocField)}
                    </div>
                  </div>

                  {/* Documentos Auxiliares section */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase block border-b border-white/10 pb-1.5 text-left">
                      outros documentos
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {otherDocFields.map(renderDocField)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => setLicenciamentoAmbientalModalService(null)}
                    className="px-8 py-3 bg-[#D4AF37] text-[10px] text-black font-mono font-bold uppercase tracking-wider hover:bg-[#D4AF37]/85 transition-all cursor-pointer"
                  >
                    Concluído
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}

    </section>
  );
};
