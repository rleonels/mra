import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  FileCheck,
  User, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  AlertCircle,
  Plus,
  Trash2,
  X
} from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string; // Base64 data URL
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

const formatTaxId = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    let formatted = digits;
    if (digits.length > 9) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }
    return formatted;
  } else {
    let formatted = digits;
    if (digits.length > 12) {
      formatted = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
    } else if (digits.length > 8) {
      formatted = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    } else if (digits.length > 5) {
      formatted = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }
    return formatted;
  }
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  let formatted = digits;
  if (digits.length > 6) {
    if (digits.length > 10) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
  } else if (digits.length > 2) {
    formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  } else if (digits.length > 0) {
    formatted = `(${digits}`;
  }
  return formatted;
};

const isValidEmailAddress = (emailStr: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailStr);
};

export const ClientRegistration: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);

  // Form states
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Files state
  const [idDocument, setIdDocument] = useState<UploadedFile | null>(null);
  const [socialContract, setSocialContract] = useState<UploadedFile | null>(null);
  const [partnershipPower, setPartnershipPower] = useState<UploadedFile | null>(null);

  // Drag & drop status indicators
  const [dragActiveId, setDragActiveId] = useState(false);
  const [dragActiveContract, setDragActiveContract] = useState(false);
  const [dragActivePower, setDragActivePower] = useState(false);

  // Success / Error triggers
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // File Inputs references
  const fileInputIdRef = useRef<HTMLInputElement>(null);
  const fileInputContractRef = useRef<HTMLInputElement>(null);
  const fileInputPowerRef = useRef<HTMLInputElement>(null);

  // Load database
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients");
        const json = await response.json();
        if (json.success) {
          setClients(json.data);
        }
      } catch (e) {
        console.error("Erro ao carregar clientes do servidor", e);
      }
    };
    fetchClients();
  }, []);

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
        url: reader.result as string // Storage-safe base64 data URL
      });
      setIsProcessingFile(false);
    };
    reader.onerror = (err) => {
      console.error(err);
      setErrorMsg("Falha ao ler o arquivo selecionado.");
      setIsProcessingFile(false);
    };
  };

  // Manual select change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, category: "id" | "contract" | "power") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processUploadedFile(file, (processed) => {
        if (category === "id") setIdDocument(processed);
        if (category === "contract") setSocialContract(processed);
        if (category === "power") setPartnershipPower(processed);
      });
    }
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent, stateSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      stateSetter(true);
    } else if (e.type === "dragleave") {
      stateSetter(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent, 
    stateSetter: React.Dispatch<React.SetStateAction<boolean>>, 
    category: "id" | "contract" | "power"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    stateSetter(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file, (processed) => {
        if (category === "id") setIdDocument(processed);
        if (category === "contract") setSocialContract(processed);
        if (category === "power") setPartnershipPower(processed);
      });
    }
  };

  const handleRemoveFile = (category: "id" | "contract" | "power") => {
    if (category === "id") setIdDocument(null);
    if (category === "contract") setSocialContract(null);
    if (category === "power") setPartnershipPower(null);
  };

  // Form submit
  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanTax = taxId.replace(/\D/g, "");
    const cleanPhone = phone.replace(/\D/g, "");

    if (!name.trim()) {
      setErrorMsg("Por favor, preencha o Nome ou Razão Social.");
      return;
    }
    if (!taxId.trim()) {
      setErrorMsg("O preenchimento do CPF/CNPJ é obrigatório.");
      return;
    }
    if (cleanTax.length !== 11 && cleanTax.length !== 14) {
      setErrorMsg("O CPF deve conter exatamente 11 dígitos ou o CNPJ deve conter exatamente 14 dígitos.");
      return;
    }

    // CPF/CNPJ Duplicate Verification
    const isDuplicate = clients.some(
      (client) => client.taxId.replace(/\D/g, "") === cleanTax
    );
    if (isDuplicate) {
      setErrorMsg(`Este CPF/CNPJ (${taxId}) já está cadastrado no sistema.`);
      return;
    }

    if (!phone.trim()) {
      setErrorMsg("Por favor, forneça o telefone de contato.");
      return;
    }
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setErrorMsg("O telefone de contato deve conter 10 ou 11 dígitos (com o código de área DDD).");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Por favor, forneça o endereço de e-mail.");
      return;
    }
    if (!isValidEmailAddress(email.trim())) {
      setErrorMsg("O endereço de e-mail informado não possui uma estrutura válida (ex: nome@dominio.com).");
      return;
    }
    if (!address.trim()) {
      setErrorMsg("Por favor, preencha o endereço residencial ou corporativo.");
      return;
    }

    // Build client object
    const newClient: Client = {
      id: "cli_" + Date.now(),
      name: name.trim(),
      taxId: taxId.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      regDate: new Date().toLocaleDateString("pt-BR"),
      files: {
        ...(idDocument && { idDocument }),
        ...(socialContract && { socialContract }),
        ...(partnershipPower && { partnershipPower })
      }
    };

    setIsProcessingFile(true);
    fetch("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newClient)
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setClients([json.data, ...clients]);

          // Clear form
          setName("");
          setTaxId("");
          setPhone("");
          setEmail("");
          setAddress("");
          setIdDocument(null);
          setSocialContract(null);
          setPartnershipPower(null);

          setShowSuccess(true);
          window.scrollTo({ top: 300, behavior: "smooth" });
          setTimeout(() => {
            setShowSuccess(false);
          }, 6000);
        } else {
          setErrorMsg(json.error || "Ocorreu um erro ao salvar o cliente no servidor.");
        }
      })
      .catch(err => {
        console.error(err);
        setErrorMsg("Erro ao se conectar com o servidor.");
      })
      .finally(() => {
        setIsProcessingFile(false);
      });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <section className="mx-auto max-w-4xl px-8 py-24 sm:py-32 w-full animate-fade-in" id="client-registration-section">
      {/* Editorial Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase">
          Portal de Credenciamento
        </div>
        <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
          Cadastro de Clientes
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-[#F5F5F0]/60 uppercase tracking-widest leading-relaxed max-w-xl mx-auto">
          Insira as informações cadastrais e societárias essenciais. Os arquivos originais anexados serão criptografados e salvos para assessoria jurídica.
        </p>
        <div className="pt-2">
          <span className="inline-block h-[1px] w-12 bg-[#D4AF37]" />
        </div>
      </div>

      {/* Main Single Form Container */}
      <div className="bg-[#141414] border border-white/5 p-8 sm:p-12 relative shadow-2xl">
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

        {showSuccess && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-4 animate-fade-in" id="reg-success">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold block text-[13px] mb-0.5">Cliente Cadastrado com Sucesso!</span>
              Os dados e os documentos societários foram salvos localmente e já podem ser consultados na aba <strong className="text-[#D4AF37]">Clientes Ativos</strong> no menu superior.
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 animate-fade-in" id="reg-error">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-xs font-semibold">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleRegisterClient} className="space-y-8" id="client-registration-form">
          {/* Section 1: Contact Details */}
          <div className="space-y-6">
            <div className="text-left border-b border-white/5 pb-3">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#D4AF37]">Seção I</span>
              <h3 className="font-serif text-lg text-white font-light mt-0.5">Identificação e Contato</h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F5F5F0]/60">
                  Nome do Cliente / Razão Social *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-[#D4AF37]/45" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Empreendimentos Mirim Ltda"
                    className="w-full rounded-none border border-white/10 bg-white/5 pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 outline-none transition-all focus:border-[#D4AF37] focus:bg-white/10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F5F5F0]/60">
                  CPF ou CNPJ *
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-3.5 h-4 w-4 text-[#D4AF37]/45" />
                  <input
                    type="text"
                    required
                    value={taxId}
                    onChange={(e) => setTaxId(formatTaxId(e.target.value))}
                    placeholder="Ex: 000.000.000-00 ou CNPJ"
                    className="w-full rounded-none border border-white/10 bg-white/5 pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 outline-none transition-all focus:border-[#D4AF37] focus:bg-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F5F5F0]/60">
                  Telefone de Contato *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-4 w-4 text-[#D4AF37]/45" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="Ex: (13) 99717-9202"
                    className="w-full rounded-none border border-white/10 bg-white/5 pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 outline-none transition-all focus:border-[#D4AF37] focus:bg-white/10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F5F5F0]/60">
                  E-mail do Cliente *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-[#D4AF37]/45" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value.replace(/\s/g, "").toLowerCase())}
                    placeholder="contato@empresa.com.br"
                    className="w-full rounded-none border border-white/10 bg-white/5 pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 outline-none transition-all focus:border-[#D4AF37] focus:bg-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-left">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F5F5F0]/60">
                Endereço Completo *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-[#D4AF37]/45" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua Primeiro de Janeiro, 512, Vila Mirim - Praia Grande/SP"
                  className="w-full rounded-none border border-white/10 bg-white/5 pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 outline-none transition-all focus:border-[#D4AF37] focus:bg-white/10"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Upload Files */}
          <div className="space-y-6 pt-4">
            <div className="text-left border-b border-white/5 pb-3">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#D4AF37]">Seção II</span>
              <h3 className="font-serif text-lg text-white font-light mt-0.5">Upload de Documentos Societários</h3>
              <p className="text-[10.5px] text-gray-500 leading-normal mt-1">
                Envie documentos autênticos e legíveis. Formatos aceitos: <strong>PDF, PNG, JPG, DOCX</strong>. Arraste os arquivos ou selecione-os diretamente.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {/* Box 1: ID DOCUMENT */}
              <div 
                className={`flex flex-col items-center justify-center border p-5 text-center transition-all min-h-[170px] relative ${
                  dragActiveId 
                    ? "border-[#D4AF37] bg-[#D4AF37]/10" 
                    : idDocument 
                      ? "border-green-500/30 bg-green-500/5 shadow-inner" 
                      : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.07]"
                }`}
                onDragEnter={(e) => handleDrag(e, setDragActiveId)}
                onDragOver={(e) => handleDrag(e, setDragActiveId)}
                onDragLeave={(e) => handleDrag(e, setDragActiveId)}
                onDrop={(e) => handleDrop(e, setDragActiveId, "id")}
                onClick={() => !idDocument && fileInputIdRef.current?.click()}
                style={{ cursor: idDocument ? "default" : "pointer" }}
              >
                <input
                  ref={fileInputIdRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "id")}
                  accept=".pdf, .png, .jpg, .jpeg, .docx"
                />
                
                {idDocument ? (
                  <div className="space-y-3 w-full animate-fade-in relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile("id");
                      }}
                      className="absolute -top-3 -right-3 text-gray-500 hover:text-red-400 p-1 bg-[#1A1A1A] border border-white/5 hover:border-red-500/20"
                      title="Excluir arquivo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <FileCheck className="h-8 w-8 text-green-400 mx-auto" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-white font-medium truncate max-w-full px-2" title={idDocument.name}>
                        {idDocument.name}
                      </p>
                      <p className="text-[9px] text-gray-500 font-mono">{formatBytes(idDocument.size)}</p>
                    </div>
                    <span className="inline-block text-[8px] font-mono uppercase bg-green-500/20 text-green-400 px-2 py-0.5 font-bold tracking-widest">
                      Carregado
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 pointer-events-none">
                    <Upload className="h-6 w-6 text-[#D4AF37]/50 mx-auto" />
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white font-bold">Documento de Identificação *</p>
                    <p className="text-[9px] text-gray-500 leading-normal max-w-[150px] mx-auto">Upload de RG, CNH ou Passaporte do Titular</p>
                  </div>
                )}
              </div>

              {/* Box 2: SOCIAL CONTRACT */}
              <div 
                className={`flex flex-col items-center justify-center border p-5 text-center transition-all min-h-[170px] relative ${
                  dragActiveContract 
                    ? "border-[#D4AF37] bg-[#D4AF37]/10" 
                    : socialContract 
                      ? "border-green-500/30 bg-green-500/5 shadow-inner" 
                      : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.07]"
                }`}
                onDragEnter={(e) => handleDrag(e, setDragActiveContract)}
                onDragOver={(e) => handleDrag(e, setDragActiveContract)}
                onDragLeave={(e) => handleDrag(e, setDragActiveContract)}
                onDrop={(e) => handleDrop(e, setDragActiveContract, "contract")}
                onClick={() => !socialContract && fileInputContractRef.current?.click()}
                style={{ cursor: socialContract ? "default" : "pointer" }}
              >
                <input
                  ref={fileInputContractRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "contract")}
                  accept=".pdf, .png, .jpg, .jpeg, .docx"
                />
                
                {socialContract ? (
                  <div className="space-y-3 w-full animate-fade-in relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile("contract");
                      }}
                      className="absolute -top-3 -right-3 text-gray-500 hover:text-red-400 p-1 bg-[#1A1A1A] border border-white/5 hover:border-red-500/20"
                      title="Excluir arquivo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <FileCheck className="h-8 w-8 text-green-400 mx-auto" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-white font-medium truncate max-w-full px-2" title={socialContract.name}>
                        {socialContract.name}
                      </p>
                      <p className="text-[9px] text-gray-500 font-mono">{formatBytes(socialContract.size)}</p>
                    </div>
                    <span className="inline-block text-[8px] font-mono bg-green-500/20 text-green-400 px-2 py-0.5 font-bold tracking-widest">
                      Carregado
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 pointer-events-none">
                    <Upload className="h-6 w-6 text-[#D4AF37]/50 mx-auto" />
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white font-bold">Contrato Social</p>
                    <p className="text-[9px] text-gray-500 leading-normal max-w-[150px] mx-auto">Constituição Societária de Pessoa Jurídica</p>
                  </div>
                )}
              </div>

              {/* Box 3: PARTNERSHIP POWER (Procuraçao) */}
              <div 
                className={`flex flex-col items-center justify-center border p-5 text-center transition-all min-h-[170px] relative ${
                  dragActivePower 
                    ? "border-[#D4AF37] bg-[#D4AF37]/10" 
                    : partnershipPower 
                      ? "border-green-500/30 bg-green-500/5 shadow-inner" 
                      : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.07]"
                }`}
                onDragEnter={(e) => handleDrag(e, setDragActivePower)}
                onDragOver={(e) => handleDrag(e, setDragActivePower)}
                onDragLeave={(e) => handleDrag(e, setDragActivePower)}
                onDrop={(e) => handleDrop(e, setDragActivePower, "power")}
                onClick={() => !partnershipPower && fileInputPowerRef.current?.click()}
                style={{ cursor: partnershipPower ? "default" : "pointer" }}
              >
                <input
                  ref={fileInputPowerRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "power")}
                  accept=".pdf, .png, .jpg, .jpeg, .docx"
                />
                
                {partnershipPower ? (
                  <div className="space-y-3 w-full animate-fade-in relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile("power");
                      }}
                      className="absolute -top-3 -right-3 text-gray-500 hover:text-red-400 p-1 bg-[#1A1A1A] border border-white/5 hover:border-red-500/20"
                      title="Excluir arquivo"
                    >
                      <Trash2 className="h-3 w-3" />
                  </button>
                    <FileCheck className="h-8 w-8 text-green-400 mx-auto" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-white font-medium truncate max-w-full px-2" title={partnershipPower.name}>
                        {partnershipPower.name}
                      </p>
                      <p className="text-[9px] text-gray-500 font-mono">{formatBytes(partnershipPower.size)}</p>
                    </div>
                    <span className="inline-block text-[8px] font-mono bg-green-500/20 text-green-400 px-2 py-0.5 font-bold tracking-widest">
                      Carregado
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 pointer-events-none">
                    <Upload className="h-6 w-6 text-[#D4AF37]/50 mx-auto" />
                    <p className="text-[10px] font-mono uppercase tracking-wider text-white font-bold">Procuração</p>
                    <p className="text-[9px] text-gray-500 leading-normal max-w-[150px] mx-auto">Atos outorgados a procuradores (opcional)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submission button */}
          <div className="pt-6 border-t border-white/5">
            <button
              type="submit"
              disabled={isProcessingFile}
              className={`w-full flex items-center justify-center gap-3 rounded-none bg-[#D4AF37] py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#0F0F0F] transition-all hover:bg-[#D4AF37]/90 cursor-pointer ${
                isProcessingFile ? "opacity-50 cursor-wait" : ""
              }`}
              id="submit-register-btn"
            >
              <Plus className="h-4 w-4" />
              {isProcessingFile ? "Processando documentos..." : "Registrar e Credenciar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
