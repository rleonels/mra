import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Download, 
  Trash2, 
  FileText, 
  MessageSquare,
  FolderOpen,
  Upload,
  FileCheck
} from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string; // Base64 data URL for persistence
}

interface Client {
  id: string;
  name: string;
  taxId: string; // CPF or CNPJ
  phone: string;
  email: string;
  address: string;
  regDate: string;
  files: {
    idDocument?: UploadedFile;
    socialContract?: UploadedFile;
    partnershipPower?: UploadedFile;
  };
}

interface ActiveClientsListProps {
  onNavigate?: (sectionId: string) => void;
}

export const ActiveClientsList: React.FC<ActiveClientsListProps> = ({ onNavigate }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDrag, setActiveDrag] = useState<string | null>(null);
  const [deleteClientConfirmId, setDeleteClientConfirmId] = useState<string | null>(null);
  const [deleteFileConfirm, setDeleteFileConfirm] = useState<{ clientId: string; category: "idDocument" | "socialContract" | "partnershipPower" } | null>(null);

  // Load clients and services on mount
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
        console.error("Erro ao carregar lista de clientes/serviços do servidor", e);
      }
    };
    fetchClientsAndServices();
  }, []);

  const handleViewService = (serviceId: string) => {
    localStorage.setItem("mr_view_service_id", serviceId);
    if (onNavigate) {
      onNavigate("active-services");
    }
  };

  // Save changes back to backend database
  const handleUpdateClient = async (updatedClient: Client) => {
    try {
      const res = await fetch(`/api/clients/${updatedClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedClient)
      });
      const data = await res.json();
      if (data.success) {
        setClients(prev => prev.map(c => c.id === updatedClient.id ? data.data : c));
      }
    } catch (e) {
      console.error("Erro ao atualizar cliente", e);
    }
  };

  // Delete client handler
  const handleDeleteClient = (id: string) => {
    setDeleteClientConfirmId(id);
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent, token: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setActiveDrag(token);
    } else if (e.type === "dragleave") {
      setActiveDrag(null);
    }
  };

  // Drop helper
  const handleDrop = (
    e: React.DragEvent, 
    category: "idDocument" | "socialContract" | "partnershipPower", 
    clientId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDrag(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const targetClient = clients.find(c => c.id === clientId);
        if (!targetClient) return;
        const updatedClient = {
          ...targetClient,
          files: {
            ...targetClient.files,
            [category]: {
              name: file.name,
              size: file.size,
              type: file.type,
              url: reader.result as string,
            },
          },
        };
        handleUpdateClient(updatedClient);
      };
    }
  };

  // Manual File Selector Change Handler
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    category: "idDocument" | "socialContract" | "partnershipPower", 
    clientId: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const targetClient = clients.find(c => c.id === clientId);
        if (!targetClient) return;
        const updatedClient = {
          ...targetClient,
          files: {
            ...targetClient.files,
            [category]: {
              name: file.name,
              size: file.size,
              type: file.type,
              url: reader.result as string,
            },
          },
        };
        handleUpdateClient(updatedClient);
      };
    }
  };

  // Trigger click on hidden file inputs
  const triggerFileInput = (clientId: string, category: string) => {
    document.getElementById(`file-${category}-${clientId}`)?.click();
  };

  // Remove Single File from existing active client
  const handleRemoveFile = (clientId: string, category: "idDocument" | "socialContract" | "partnershipPower") => {
    setDeleteFileConfirm({ clientId, category });
  };

  // Filter clients based on inputs
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.taxId.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, "")) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper file size conversion
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <section className="mx-auto max-w-7xl px-8 py-24 sm:py-32 w-full animate-fade-in" id="active-clients-section">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase">
          Operação Integrada
        </div>
        <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
          Base de Clientes Ativos
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-[#F5F5F0]/60 uppercase tracking-widest max-w-xl mx-auto">
          Consulte as fichas de credenciamento e gerencie os documentos oficiais diretamente de cada card. Efetue uploads, exclusões e downloads imediatos.
        </p>
        <div className="pt-2">
          <span className="inline-block h-[1px] w-12 bg-[#D4AF37]" />
        </div>
      </div>

      {/* Database control bar */}
      <div className="mb-10 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, e-mail ou CPF/CNPJ..."
            className="w-full text-xs text-white placeholder-gray-600 bg-[#141414] border border-white/10 pl-11 pr-4 py-3.5 outline-none focus:border-[#D4AF37]"
          />
        </div>
        {clients.length > 0 && (
          <p className="text-[10px] text-gray-500 font-mono text-center mt-2.5 uppercase tracking-widest">
            Exibindo {filteredClients.length} de {clients.length} corporações/proponentes
          </p>
        )}
      </div>

      {filteredClients.length === 0 ? (
        <div className="max-w-xl mx-auto py-20 text-center border border-dashed border-white/10 bg-[#141414] px-6 relative">
          <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
          <FolderOpen className="h-10 w-10 text-[#D4AF37]/40 mx-auto mb-4" />
          <h3 className="font-serif text-lg text-white font-light mb-1">A base de dados está vazia</h3>
          <p className="text-xs text-[#F5F5F0]/50 max-w-xs mx-auto leading-relaxed">
            {clients.length === 0 
              ? "Nenhum cliente foi credenciado até o momento. Utilize a aba 'Cadastro' para iniciar a inserção." 
              : "Não encontramos nenhum registro correspondente ao termo de pesquisa digitado."}
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => {
            const cleanPhone = client.phone.replace(/\D/g, "");

            return (
              <div 
                key={client.id} 
                className="bg-[#141414] border border-white/5 p-6 space-y-5 relative group flex flex-col justify-between shadow-lg"
                id={`client-card-${client.id}`}
              >
                {/* Horizontal Gold Line Accent */}
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/35 to-transparent transition-opacity" />

                {/* Card Title & Header Details */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-[8px] font-mono text-[#D4AF37] tracking-widest uppercase font-bold">
                      Cadastrado em {client.regDate}
                    </span>
                    <button 
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-gray-500 hover:text-red-400 p-1 bg-white/5 border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 transition-all cursor-pointer"
                      title="Excluir cliente"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h4 className="font-serif text-lg text-white font-light tracking-wide truncate pr-4">
                    {client.name}
                  </h4>
                  <p className="text-[10px] font-mono text-gray-500 tracking-wider">
                    REG: {client.taxId}
                  </p>
                </div>

                {/* Informational Contacts */}
                <div className="text-xs text-gray-400 space-y-2 border-t border-white/5 pt-4 font-sans leading-relaxed">
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                    <a href={`tel:${cleanPhone}`} className="hover:text-white transition-colors">{client.phone}</a>
                  </div>
                  <div className="flex items-center gap-2.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                    <a href={`mailto:${client.email}`} className="hover:text-white transition-colors">{client.email}</a>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-3.5 w-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">{client.address}</span>
                  </div>
                </div>

                {/* Upload & Download Document Fields (the same components as in Registration page) */}
                <div className="border-t border-white/5 pt-4 space-y-3 flex-grow text-left">
                  <span className="text-[9px] font-mono text-[#D4AF37] tracking-[0.2em] uppercase font-bold block mb-1">
                    Documentos Societários e Oficiais
                  </span>

                  <div className="grid grid-cols-1 gap-2.5">
                    
                    {/* Doc 1: Identificação */}
                    <div 
                      className={`flex flex-col items-center justify-center border p-3.5 text-center transition-all relative ${
                        activeDrag === `${client.id}-idDocument`
                          ? "border-[#D4AF37] bg-[#D4AF37]/10" 
                          : client.files.idDocument 
                            ? "border-green-500/20 bg-green-500/5" 
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                      }`}
                      onDragEnter={(e) => handleDrag(e, `${client.id}-idDocument`)}
                      onDragOver={(e) => handleDrag(e, `${client.id}-idDocument`)}
                      onDragLeave={(e) => handleDrag(e, null)}
                      onDrop={(e) => handleDrop(e, "idDocument", client.id)}
                      onClick={() => !client.files.idDocument && triggerFileInput(client.id, "idDocument")}
                      style={{ cursor: client.files.idDocument ? "default" : "pointer" }}
                    >
                      <input 
                        id={`file-idDocument-${client.id}`}
                        type="file"
                        className="hidden"
                        accept=".pdf, .png, .jpg, .jpeg, .docx"
                        onChange={(e) => handleFileChange(e, "idDocument", client.id)}
                      />

                      {client.files.idDocument ? (
                        <div className="w-full space-y-1.5 text-left">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] text-[#F5F5F0]/65 font-mono font-bold uppercase tracking-wider block">
                              1. Identificação *
                            </span>
                            <span className="text-[8px] font-mono text-green-400 font-bold bg-green-500/10 px-1 py-0.2">
                              OK
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-black/20 p-2 border border-white/5">
                            <FileText className="h-5 w-5 text-[#D4AF37] shrink-0" />
                            <div className="min-w-0 flex-grow">
                              <p className="text-[9px] font-medium text-white truncate max-w-full" title={client.files.idDocument.name}>
                                {client.files.idDocument.name}
                              </p>
                              <p className="text-[8px] font-mono text-gray-500">{formatBytes(client.files.idDocument.size)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1.5">
                            <a 
                              href={client.files.idDocument.url}
                              download={`ID_${client.files.idDocument.name}`}
                              className="flex-1 py-1.5 bg-white/5 border border-[#D4AF37]/35 text-[9px] font-mono font-bold uppercase tracking-widest text-center text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Download className="h-2.5 w-2.5" /> Baixar
                            </a>
                            <button 
                              onClick={() => handleRemoveFile(client.id, "idDocument")}
                              className="py-1.5 px-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              title="Remover documento"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 pointer-events-none">
                          <Upload className="h-4.5 w-4.5 text-[#D4AF37]/50 mx-auto" />
                          <p className="text-[9px] font-mono uppercase tracking-wider text-white font-bold leading-none">
                            1. Identificação *
                          </p>
                          <p className="text-[8px] text-gray-400 leading-none">
                            Arraste ou clique para enviar RG/CNH
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Doc 2: Contrato Social */}
                    <div 
                      className={`flex flex-col items-center justify-center border p-3.5 text-center transition-all relative ${
                        activeDrag === `${client.id}-socialContract`
                          ? "border-[#D4AF37] bg-[#D4AF37]/10" 
                          : client.files.socialContract 
                            ? "border-green-500/20 bg-green-500/5" 
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                      }`}
                      onDragEnter={(e) => handleDrag(e, `${client.id}-socialContract`)}
                      onDragOver={(e) => handleDrag(e, `${client.id}-socialContract`)}
                      onDragLeave={(e) => handleDrag(e, null)}
                      onDrop={(e) => handleDrop(e, "socialContract", client.id)}
                      onClick={() => !client.files.socialContract && triggerFileInput(client.id, "socialContract")}
                      style={{ cursor: client.files.socialContract ? "default" : "pointer" }}
                    >
                      <input 
                        id={`file-socialContract-${client.id}`}
                        type="file"
                        className="hidden"
                        accept=".pdf, .png, .jpg, .jpeg, .docx"
                        onChange={(e) => handleFileChange(e, "socialContract", client.id)}
                      />

                      {client.files.socialContract ? (
                        <div className="w-full space-y-1.5 text-left">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] text-[#F5F5F0]/65 font-mono font-bold uppercase tracking-wider block">
                              2. Contrato Social
                            </span>
                            <span className="text-[8px] font-mono text-green-400 font-bold bg-green-500/10 px-1 py-0.2">
                              OK
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-black/20 p-2 border border-white/5">
                            <FileText className="h-5 w-5 text-[#D4AF37] shrink-0" />
                            <div className="min-w-0 flex-grow">
                              <p className="text-[9px] font-medium text-white truncate max-w-full" title={client.files.socialContract.name}>
                                {client.files.socialContract.name}
                              </p>
                              <p className="text-[8px] font-mono text-gray-500">{formatBytes(client.files.socialContract.size)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1.5">
                            <a 
                              href={client.files.socialContract.url}
                              download={`CONTRATO_${client.files.socialContract.name}`}
                              className="flex-1 py-1.5 bg-white/5 border border-[#D4AF37]/35 text-[9px] font-mono font-bold uppercase tracking-widest text-center text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Download className="h-2.5 w-2.5" /> Baixar
                            </a>
                            <button 
                              onClick={() => handleRemoveFile(client.id, "socialContract")}
                              className="py-1.5 px-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              title="Remover documento"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 pointer-events-none">
                          <Upload className="h-4.5 w-4.5 text-[#D4AF37]/50 mx-auto" />
                          <p className="text-[9px] font-mono uppercase tracking-wider text-white font-bold leading-none">
                            2. Contrato Social
                          </p>
                          <p className="text-[8px] text-gray-400 leading-none">
                            Constituição societária PJ
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Doc 3: Procuração */}
                    <div 
                      className={`flex flex-col items-center justify-center border p-3.5 text-center transition-all relative ${
                        activeDrag === `${client.id}-partnershipPower`
                          ? "border-[#D4AF37] bg-[#D4AF37]/10" 
                          : client.files.partnershipPower 
                            ? "border-green-500/20 bg-green-500/5" 
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                      }`}
                      onDragEnter={(e) => handleDrag(e, `${client.id}-partnershipPower`)}
                      onDragOver={(e) => handleDrag(e, `${client.id}-partnershipPower`)}
                      onDragLeave={(e) => handleDrag(e, null)}
                      onDrop={(e) => handleDrop(e, "partnershipPower", client.id)}
                      onClick={() => !client.files.partnershipPower && triggerFileInput(client.id, "partnershipPower")}
                      style={{ cursor: client.files.partnershipPower ? "default" : "pointer" }}
                    >
                      <input 
                        id={`file-partnershipPower-${client.id}`}
                        type="file"
                        className="hidden"
                        accept=".pdf, .png, .jpg, .jpeg, .docx"
                        onChange={(e) => handleFileChange(e, "partnershipPower", client.id)}
                      />

                      {client.files.partnershipPower ? (
                        <div className="w-full space-y-1.5 text-left">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] text-[#F5F5F0]/65 font-mono font-bold uppercase tracking-wider block">
                              3. Procuração
                            </span>
                            <span className="text-[8px] font-mono text-green-400 font-bold bg-green-500/10 px-1 py-0.2">
                              OK
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-black/20 p-2 border border-white/5">
                            <FileText className="h-5 w-5 text-[#D4AF37] shrink-0" />
                            <div className="min-w-0 flex-grow">
                              <p className="text-[9px] font-medium text-white truncate max-w-full" title={client.files.partnershipPower.name}>
                                {client.files.partnershipPower.name}
                              </p>
                              <p className="text-[8px] font-mono text-gray-500">{formatBytes(client.files.partnershipPower.size)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1.5">
                            <a 
                              href={client.files.partnershipPower.url}
                              download={`PROCURACAO_${client.files.partnershipPower.name}`}
                              className="flex-1 py-1.5 bg-white/5 border border-[#D4AF37]/35 text-[9px] font-mono font-bold uppercase tracking-widest text-center text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <Download className="h-2.5 w-2.5" /> Baixar
                            </a>
                            <button 
                              onClick={() => handleRemoveFile(client.id, "partnershipPower")}
                              className="py-1.5 px-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              title="Remover documento"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 pointer-events-none">
                          <Upload className="h-4.5 w-4.5 text-[#D4AF37]/50 mx-auto" />
                          <p className="text-[9px] font-mono uppercase tracking-wider text-white font-bold leading-none">
                            3. Procuração
                          </p>
                          <p className="text-[8px] text-gray-400 leading-none">
                            Representações legal outorgada
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Linked Services Section */}
                {(() => {
                  const clientServices = services.filter((s: any) => s.clientId === client.id);
                  return (
                    <div className="border-t border-white/5 pt-4 space-y-2.5 text-left">
                      <span className="text-[9px] font-mono text-[#D4AF37] tracking-[0.2em] uppercase font-bold block mb-1">
                        Serviços Técnicos Vinculados
                      </span>
                      {clientServices.length === 0 ? (
                        <p className="text-[10px] text-gray-500 italic pb-1">
                          Nenhum serviço registrado para este cliente.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                          {clientServices.map((service: any) => (
                            <div 
                              key={service.id} 
                              className="bg-black/25 p-2.5 border border-white/5 flex flex-col gap-2"
                            >
                              <div className="flex items-center justify-between gap-2.5">
                                <div className="min-w-0 flex-grow">
                                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                    <span className="text-[10.5px] font-serif font-light text-white truncate max-w-[140px]">
                                      {service.serviceType}
                                    </span>
                                    <span className={`text-[7px] font-mono font-bold px-1 py-0.2 uppercase ${
                                      service.status === "Concluído" 
                                        ? "bg-green-500/10 text-green-400 border border-green-500/25" 
                                        : service.status === "Em Andamento" 
                                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" 
                                        : "bg-gray-500/10 text-gray-400 border border-white/10"
                                    }`}>
                                      {service.status}
                                    </span>
                                  </div>
                                  {service.regDate && (
                                    <p className="text-[8px] font-mono text-gray-500">
                                      Ref: {service.regDate}
                                    </p>
                                  )}
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => handleViewService(service.id)}
                                  className="shrink-0 flex items-center gap-1 bg-white/5 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#D4AF37]/35 hover:border-[#D4AF37] text-[8px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 transition-all cursor-pointer"
                                >
                                  <FolderOpen className="h-2 w-2" />
                                  Ver
                                </button>
                              </div>

                              {/* Additional detailed fields */}
                              {(service.notes || service.numeroProcesso || service.loteamento || service.quadra || service.lote || service.endereco) && (
                                <div className="border-t border-white/5 pt-2 mt-0.5 space-y-1.5 text-[9px] text-gray-400 leading-normal font-sans">
                                  {service.numeroProcesso && (
                                    <p>
                                      <strong className="text-gray-500 uppercase font-mono text-[7.5px] tracking-wider block">Nº Processo:</strong>
                                      <span className="text-white font-mono">{service.numeroProcesso}</span>
                                    </p>
                                  )}
                                  {(service.loteamento || service.quadra || service.lote || service.endereco) && (
                                    <p>
                                      <strong className="text-gray-500 uppercase font-mono text-[7.5px] tracking-wider block">Localização / Dados de Terreno:</strong>
                                      <span className="text-white font-medium">
                                        {service.endereco || "Sem endereço cadastrado"}
                                        {(service.loteamento || service.quadra || service.lote) && " ("}
                                        {service.loteamento && `Loteamento: ${service.loteamento}`}
                                        {service.quadra && `${service.loteamento ? " - " : ""}Q: ${service.quadra}`}
                                        {service.lote && `${service.loteamento || service.quadra ? " - " : ""}L: ${service.lote}`}
                                        {(service.loteamento || service.quadra || service.lote) && ")"}
                                      </span>
                                    </p>
                                  )}
                                  {service.notes && (
                                    <p>
                                      <strong className="text-gray-500 uppercase font-mono text-[7.5px] tracking-wider block">Notas de Controle Interno / Escopo:</strong>
                                      <span className="text-gray-300 italic">"{service.notes}"</span>
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Instant Mobile WhatsApp Contact CTA */}
                <div className="pt-3 border-t border-white/5">
                  <a
                    href={`https://wa.me/55${cleanPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 border border-[#D4AF37]/30 hover:border-[#D4AF37] bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 text-[9px] font-mono tracking-widest uppercase font-bold text-[#D4AF37] py-2.5 transition-all"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Atendimento no WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Elegant confirmation modal for client deletion */}
      {deleteClientConfirmId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#D4AF37]/30 max-w-md w-full p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            <div className="space-y-2 text-center text-left-0">
              <h3 className="font-serif text-lg text-white font-light">Confirmar Exclusão de Cliente</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tem certeza de que deseja remover os registros e documentos oficiais deste cliente? Esta ação é definitiva e removerá todos os arquivos cadastrados.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteClientConfirmId(null)}
                className="flex-1 py-3 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const id = deleteClientConfirmId;
                  if (id) {
                    fetch(`/api/clients/${id}`, { method: "DELETE" })
                      .then(res => res.json())
                      .then(json => {
                        if (json.success) {
                          setClients(prev => prev.filter(c => c.id !== id));
                        }
                      })
                      .catch(e => console.error("Erro ao deletar cliente", e));
                  }
                  setDeleteClientConfirmId(null);
                }}
                className="flex-1 py-3 bg-[#D4AF37] text-[10px] text-black font-mono font-bold uppercase tracking-wider hover:bg-[#D4AF37]/80 transition-all cursor-pointer"
              >
                Remover Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Elegant confirmation modal for document deletion */}
      {deleteFileConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#D4AF37]/30 max-w-sm w-full p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            <div className="space-y-2 text-center">
              <h3 className="font-serif text-lg text-white font-light">Excluir Documento</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tem certeza de que deseja remover este documento oficial da ficha de inscrição do cliente?
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
                  const { clientId, category } = deleteFileConfirm;
                  const targetClient = clients.find(c => c.id === clientId);
                  if (targetClient) {
                    const nextFiles = { ...targetClient.files };
                    delete nextFiles[category];
                    const updatedClient = {
                      ...targetClient,
                      files: nextFiles,
                    };
                    handleUpdateClient(updatedClient);
                  }
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
    </section>
  );
};
