import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { 
  Users, 
  Search, 
  Download, 
  FileText, 
  FolderOpen, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Briefcase, 
  Percent, 
  ArrowUpRight, 
  AlertCircle
} from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Client {
  id: string;
  name: string;
  taxId: string; // CPF or CNPJ
  phone: string;
  email: string;
  address: string;
  regDate: string;
  files?: {
    idDocument?: UploadedFile;
    socialContract?: UploadedFile;
    partnershipPower?: UploadedFile;
  };
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
}

export const ReportsPanel: React.FC = () => {
  const [reportType, setReportType] = useState<"clients" | "financial">("clients");
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [financialFilter, setFinancialFilter] = useState<"all" | "pending" | "paid">("all");

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
        console.error("Erro ao carregar dados do servidor para o painel de relatórios", e);
      }
    };
    fetchClientsAndServices();
  }, []);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  // Filter lists based on search and sub-filters
  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.taxId.toLowerCase().includes(term) ||
      client.phone.includes(term)
    );
  });

  const filteredServices = services.filter(service => {
    // Search filter
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      service.clientName.toLowerCase().includes(term) ||
      service.serviceType.toLowerCase().includes(term) ||
      (service.numeroProcesso && service.numeroProcesso.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    // Financial state filter
    const totalPaid = (service.entrada || 0) + (service.pagamentos || 0);
    const totalValue = service.valorServico || 0;
    const isPaid = totalValue > 0 && totalPaid >= totalValue;

    if (financialFilter === "pending") {
      return !isPaid;
    } else if (financialFilter === "paid") {
      return isPaid;
    }
    return true;
  });

  // Export to CSV files for clean user management
  const downloadCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = "";

    if (reportType === "clients") {
      filename = "relatorio_clientes_ativos.csv";
      headers = ["ID", "Nome do Cliente", "CPF/CNPJ", "E-mail", "Telefone", "Data de Cadastro", "Nº de Serviços Associados", "Documentos Upados"];
      rows = filteredClients.map(c => {
        const docsCount = Object.keys(c.files || {}).length;
        const linkedServicesCount = services.filter(s => s.clientId === c.id).length;
        return [
          c.id,
          c.name,
          c.taxId,
          c.email,
          c.phone,
          c.regDate,
          linkedServicesCount.toString(),
          docsCount.toString()
        ];
      });
    } else {
      filename = "relatorio_financeiro.csv";
      headers = [
        "ID", 
        "Cliente", 
        "Serviço", 
        "Status", 
        "Processo", 
        "Valor do Serviço", 
        "Entrada/Sinal", 
        "Pagamentos Adicionais", 
        "Valor Pago", 
        "Saldo a Receber"
      ];
      rows = filteredServices.map(s => {
        const val = s.valorServico || 0;
        const ent = s.entrada || 0;
        const pag = s.pagamentos || 0;
        const totalPaid = ent + pag;
        const outstanding = s.aReceber !== undefined ? s.aReceber : Math.max(0, val - totalPaid);

        return [
          s.id,
          s.clientName,
          s.serviceType,
          s.status,
          s.numeroProcesso || "Não Definido",
          val.toFixed(2),
          ent.toFixed(2),
          pag.toFixed(2),
          totalPaid.toFixed(2),
          outstanding.toFixed(2)
        ];
      });
    }

    // Generate CSV content with BOM for Excel compatibility in pt-BR
    const csvContent = "\uFEFF" + 
      [headers.join(";"), ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(";"))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to beautifully styled Vector PDFs with official MR branding
  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    let currentY = 45; // Below header area

    // Top Brand-Decoration Renderer (Two-pass page styling)
    const addPageDecoration = (pdfDoc: jsPDF, pageNum: number, totalPagesPlaceholder: string) => {
      // Header background banner - slate/black background
      pdfDoc.setFillColor(20, 20, 20); 
      pdfDoc.rect(15, 15, 267, 24, "F");

      // Solid gold stripe beneath the header
      pdfDoc.setFillColor(212, 175, 55); // #D4AF37 Gold
      pdfDoc.rect(15, 39, 267, 1.2, "F");

      // DRAW THE GOLD SILHOUETTE MR TOWERS EMBLEM (Crisp client-side vector drawing)
      pdfDoc.setFillColor(212, 175, 55); // Gold Fill
      pdfDoc.setDrawColor(255, 248, 231); // Golden Pearl outline
      pdfDoc.setLineWidth(0.15);

      // Center High-Tower
      pdfDoc.triangle(29, 34.5, 32.5, 17.5, 36, 34.5, "FD");
      // Left Inner Tower
      pdfDoc.triangle(24, 34.5, 27, 21.5, 30, 34.5, "FD");
      // Right Inner Tower
      pdfDoc.triangle(35, 34.5, 38, 21.5, 41, 34.5, "FD");
      // Left Symmetrical Wing
      pdfDoc.triangle(20, 34.5, 22.5, 26, 25, 34.5, "FD");
      // Right Symmetrical Wing
      pdfDoc.triangle(40, 34.5, 42.5, 26, 45, 34.5, "FD");

      // Under-crest dynamic curve
      pdfDoc.setLineWidth(0.5);
      pdfDoc.ellipse(32.5, 36, 12, 1.5, "D");

      // Brand Typography
      pdfDoc.setTextColor(212, 175, 55); 
      pdfDoc.setFont("Helvetica", "bold");
      pdfDoc.setFontSize(19);
      pdfDoc.text("MR", 50, 27);

      pdfDoc.setTextColor(255, 255, 255); 
      pdfDoc.setFont("Helvetica", "normal");
      pdfDoc.setFontSize(8);
      pdfDoc.text("ASSESSORIA E PROJETOS", 50, 32.5);

      // Align Report Title to Right
      pdfDoc.setFont("Helvetica", "bold");
      pdfDoc.setFontSize(11);
      pdfDoc.setTextColor(212, 175, 55); 
      const titleText = reportType === "clients" ? "RELATÓRIO DE CLIENTES ATIVOS" : "DEMONSTRATIVO FINANCEIRO DO PORTFÓLIO";
      pdfDoc.text(titleText, 282 - pdfDoc.getTextWidth(titleText), 25);

      // Time Stamp
      pdfDoc.setFont("Helvetica", "normal");
      pdfDoc.setFontSize(7.5);
      pdfDoc.setTextColor(170, 170, 170);
      const nowOption = new Date();
      const dateStr = `Exportado em: ${nowOption.toLocaleDateString("pt-BR")} às ${nowOption.toLocaleTimeString("pt-BR")}`;
      pdfDoc.text(dateStr, 282 - pdfDoc.getTextWidth(dateStr), 31);

      // Subtle elegant footer divider
      pdfDoc.setDrawColor(220, 220, 215);
      pdfDoc.setLineWidth(0.25);
      pdfDoc.line(15, 196, 282, 196);

      pdfDoc.setFont("Helvetica", "normal");
      pdfDoc.setFontSize(7.5);
      pdfDoc.setTextColor(120, 120, 120);
      pdfDoc.text("MR Assessoria e Projetos - Relatório Operacional Interno", 15, 201);
      
      const pageText = `Página ${pageNum} de ${totalPagesPlaceholder}`;
      pdfDoc.text(pageText, 282 - pdfDoc.getTextWidth(pageText), 201);
    };

    // Draw KPI metric cards at the top
    if (reportType === "clients") {
      const colWidth = 267 / 4;

      doc.setFillColor(248, 248, 246);
      doc.rect(15, 45, 267, 18, "F");
      doc.setDrawColor(220, 220, 215);
      doc.setLineWidth(0.2);
      doc.rect(15, 45, 267, 18, "D");
      doc.setFillColor(212, 175, 55);
      doc.rect(15, 45, 267, 0.8, "F");

      doc.setFontSize(7);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(110, 110, 100);
      doc.text("TOTAL DE CLIENTES CADASTRADOS", 20, 50);
      doc.text("CONTRATOS ATIVOS EM PORTFÓLIO", 20 + colWidth, 50);
      doc.text("FLUXO DE DOCUMENTOS ATIVOS", 20 + colWidth * 2, 50);
      doc.text("DEMANDAS / SERVIÇOS TÉCNICOS", 20 + colWidth * 3, 50);

      doc.setFontSize(10.5);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(`${totalClients} clientes`, 20, 57);
      doc.text(`${clientsWithServicesCount} ativos (${totalClients > 0 ? Math.round((clientsWithServicesCount/totalClients)*100) : 0}%)`, 20 + colWidth, 57);
      doc.text(`${totalClientDocsCount} arquivos anexados`, 20 + colWidth * 2, 57);
      doc.text(`${totalActiveProcesses} projetos registrados`, 20 + colWidth * 3, 57);

      currentY = 70;
    } else {
      const colWidth = 267 / 4;

      doc.setFillColor(248, 248, 246);
      doc.rect(15, 45, 267, 18, "F");
      doc.setDrawColor(220, 220, 215);
      doc.setLineWidth(0.2);
      doc.rect(15, 45, 267, 18, "D");
      doc.setFillColor(212, 175, 55);
      doc.rect(15, 45, 267, 0.8, "F");

      doc.setFontSize(7);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(110, 110, 100);
      doc.text("VOLUME GLOBAL FINANCEIRO", 20, 50);
      doc.text("VALORES ENTRADOS / QUITADOS", 20 + colWidth, 50);
      doc.text("SALDO EM CARTEIRA A RECEBER", 20 + colWidth * 2, 50);
      doc.text("ÍNDICE DE LIQUIDAÇÃO", 20 + colWidth * 3, 50);

      doc.setFontSize(10.5);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(30, 30, 30);

      doc.text(formatCurrency(totalFinancialValue), 20, 57);
      doc.setTextColor(40, 120, 42); 
      doc.text(formatCurrency(totalFinancialReceived), 20 + colWidth, 57);
      doc.setTextColor(190, 80, 10); 
      doc.text(formatCurrency(totalFinancialOutstanding), 20 + colWidth * 2, 57);
      doc.setTextColor(30, 30, 30);
      doc.text(`${receivedPercentage}% de amortização`, 20 + colWidth * 3, 57);

      currentY = 70;
    }

    // DRAW TABLE STRUCTURE
    if (reportType === "clients") {
      const cols = [
        { id: "name", label: "Nome do Cliente", width: 68 },
        { id: "taxId", label: "CPF / CNPJ", width: 42 },
        { id: "email", label: "E-mail de Contato", width: 55 },
        { id: "phone", label: "Telefone", width: 33 },
        { id: "regDate", label: "Data Cadastro", width: 27 },
        { id: "services", label: "Serv. Ativos", width: 22 },
        { id: "docs", label: "Docs Recebidos", width: 20 }
      ];

      const drawTableHeader = (yY: number) => {
        doc.setFillColor(34, 34, 34);
        doc.rect(15, yY, 267, 7, "F");
        
        let xOffset = 15;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(212, 175, 55); 
        
        cols.forEach(col => {
          let textX = xOffset + 3;
          if (col.id === "services" || col.id === "docs") {
            textX = xOffset + (col.width / 2) - (doc.getTextWidth(col.label) / 2);
          }
          doc.text(col.label, textX, yY + 4.8);
          xOffset += col.width;
        });
      };

      drawTableHeader(currentY);
      currentY += 7;

      filteredClients.forEach((client, idx) => {
        if (currentY > 182) {
          doc.addPage();
          currentY = 48;
          drawTableHeader(currentY);
          currentY += 7;
        }

        if (idx % 2 === 0) {
          doc.setFillColor(252, 252, 251);
        } else {
          doc.setFillColor(243, 243, 241);
        }
        doc.rect(15, currentY, 267, 7.5, "F");

        doc.setDrawColor(230, 230, 225);
        doc.setLineWidth(0.12);
        doc.line(15, currentY + 7.5, 282, currentY + 7.5);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(45, 45, 45);

        const clientServices = services.filter(s => s.clientId === client.id);
        const uploadedDocsCount = Object.keys(client.files || {}).length;

        let xOffset = 15;
        cols.forEach(col => {
          let val = "";
          let isCentered = false;

          if (col.id === "name") val = client.name;
          else if (col.id === "taxId") val = client.taxId;
          else if (col.id === "email") val = client.email;
          else if (col.id === "phone") val = client.phone;
          else if (col.id === "regDate") val = client.regDate;
          else if (col.id === "services") {
            val = clientServices.length.toString();
            isCentered = true;
          }
          else if (col.id === "docs") {
            val = `${uploadedDocsCount} / 3`;
            isCentered = true;
          }

          let textWidthLimit = col.width - 4;
          let finalVal = val;
          if (doc.getTextWidth(val) > textWidthLimit) {
            while (doc.getTextWidth(finalVal + "...") > textWidthLimit && finalVal.length > 0) {
              finalVal = finalVal.substring(0, finalVal.length - 1);
            }
            finalVal += "...";
          }

          let textX = xOffset + 3;
          if (isCentered) {
            textX = xOffset + (col.width / 2) - (doc.getTextWidth(finalVal) / 2);
          }

          doc.text(finalVal, textX, currentY + 4.8);
          xOffset += col.width;
        });

        currentY += 7.5;
      });

    } else {
      const cols = [
        { id: "clientName", label: "Cliente / Nº Processo", width: 68 },
        { id: "serviceType", label: "Serviço Técnico", width: 44 },
        { id: "valorServico", label: "Valor Contrato", width: 33 },
        { id: "entrada", label: "Sinal / Entrada", width: 30 },
        { id: "pagamentos", label: "Add. Pagos", width: 30 },
        { id: "status", label: "Status Fin.", width: 25 },
        { id: "aReceber", label: "Saldo a Receber", width: 37 }
      ];

      const drawTableHeader = (yY: number) => {
        doc.setFillColor(34, 34, 34);
        doc.rect(15, yY, 267, 7, "F");
        
        let xOffset = 15;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(212, 175, 55); 
        
        cols.forEach(col => {
          let textX = xOffset + 3;
          if (col.id === "valorServico" || col.id === "entrada" || col.id === "pagamentos" || col.id === "aReceber") {
            textX = xOffset + col.width - doc.getTextWidth(col.label) - 3;
          } else if (col.id === "status") {
            textX = xOffset + (col.width / 2) - (doc.getTextWidth(col.label) / 2);
          }
          doc.text(col.label, textX, yY + 4.8);
          xOffset += col.width;
        });
      };

      drawTableHeader(currentY);
      currentY += 7;

      filteredServices.forEach((service, idx) => {
        if (currentY > 182) {
          doc.addPage();
          currentY = 48;
          drawTableHeader(currentY);
          currentY += 7;
        }

        if (idx % 2 === 0) {
          doc.setFillColor(252, 252, 251);
        } else {
          doc.setFillColor(243, 243, 241);
        }
        doc.rect(15, currentY, 267, 7.5, "F");

        doc.setDrawColor(230, 230, 225);
        doc.setLineWidth(0.12);
        doc.line(15, currentY + 7.5, 282, currentY + 7.5);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(45, 45, 45);

        const price = service.valorServico || 0;
        const ent = service.entrada || 0;
        const pag = service.pagamentos || 0;
        const totalPaid = ent + pag;
        const outstanding = service.aReceber !== undefined ? service.aReceber : Math.max(0, price - totalPaid);
        const isPaidCombined = price > 0 && totalPaid >= price;

        let xOffset = 15;
        cols.forEach(col => {
          let val = "";
          let alignment: "left" | "center" | "right" = "left";

          if (col.id === "clientName") {
            val = service.clientName;
            if (service.numeroProcesso) {
              val += ` (Proc: ${service.numeroProcesso})`;
            }
          }
          else if (col.id === "serviceType") val = service.serviceType;
          else if (col.id === "valorServico") {
            val = formatCurrency(price);
            alignment = "right";
          }
          else if (col.id === "entrada") {
            val = formatCurrency(ent);
            alignment = "right";
          }
          else if (col.id === "pagamentos") {
            val = formatCurrency(pag);
            alignment = "right";
          }
          else if (col.id === "status") {
            val = isPaidCombined ? "QUITADO" : "ABERTO";
            alignment = "center";
          }
          else if (col.id === "aReceber") {
            val = formatCurrency(outstanding);
            alignment = "right";
          }

          let textWidthLimit = col.width - 4;
          let finalVal = val;
          if (doc.getTextWidth(val) > textWidthLimit) {
            while (doc.getTextWidth(finalVal + "...") > textWidthLimit && finalVal.length > 0) {
              finalVal = finalVal.substring(0, finalVal.length - 1);
            }
            finalVal += "...";
          }

          let textX = xOffset + 3;
          if (alignment === "right") {
            textX = xOffset + col.width - doc.getTextWidth(finalVal) - 3;
          } else if (alignment === "center") {
            textX = xOffset + (col.width / 2) - (doc.getTextWidth(finalVal) / 2);
          }

          if (col.id === "status") {
            if (val === "QUITADO") {
              doc.setTextColor(40, 120, 42); 
              doc.setFont("Helvetica", "bold");
            } else {
              doc.setTextColor(190, 80, 10); 
              doc.setFont("Helvetica", "bold");
            }
          } else if (col.id === "aReceber" && outstanding > 0) {
            doc.setTextColor(180, 130, 15); 
            doc.setFont("Helvetica", "bold");
          } else {
            doc.setTextColor(45, 45, 45);
            doc.setFont("Helvetica", "normal");
          }

          doc.text(finalVal, textX, currentY + 4.8);
          xOffset += col.width;
        });

        currentY += 7.5;
      });
    }

    // Pass 2: Draw headers and footers on each generated page
    const totalPages = doc.getNumberOfPages();
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      doc.setPage(pageNum);
      addPageDecoration(doc, pageNum, totalPages.toString());
    }

    const reportFilename = reportType === "clients" 
      ? `relatorio_clientes_ativos_mr_${new Date().toISOString().slice(0, 10)}.pdf`
      : `relatorio_financeiro_mr_${new Date().toISOString().slice(0, 10)}.pdf`;

    doc.save(reportFilename);
  };

  // Computations for Active Clients Report
  const totalClients = clients.length;
  const clientsWithServicesCount = clients.filter(c => services.some(s => s.clientId === c.id)).length;
  const totalClientDocsCount = clients.reduce((acc, c) => acc + Object.keys(c.files || {}).length, 0);
  const totalActiveProcesses = services.length;

  // Computations for Financial Report
  const totalFinancialValue = services.reduce((acc, s) => acc + (s.valorServico || 0), 0);
  const totalFinancialReceived = services.reduce((acc, s) => acc + (s.entrada || 0) + (s.pagamentos || 0), 0);
  const totalFinancialOutstanding = services.reduce((acc, s) => {
    const calculatedOutstanding = (s.valorServico || 0) - ((s.entrada || 0) + (s.pagamentos || 0));
    return acc + Math.max(0, calculatedOutstanding);
  }, 0);

  const receivedPercentage = totalFinancialValue > 0 
    ? Math.round((totalFinancialReceived / totalFinancialValue) * 100) 
    : 0;

  return (
    <section className="w-full max-w-7xl mx-auto px-8 py-24 text-left select-none animate-fade-in" id="reports-section">
      {/* Header section with Swiss style */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase">
          Inteligência Operacional
        </div>
        <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
          Painel de Relatórios
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-[#F5F5F0]/60 uppercase tracking-widest max-w-xl mx-auto">
          Gere, configure e exporte relatórios consolidados de sua base de clientes cadastrados ou portfólio financeiro de operações com facilidade.
        </p>
        <div className="pt-2">
          <span className="inline-block h-[1px] w-12 bg-[#D4AF37]" />
        </div>
      </div>

      {/* Selector & Actions Bar */}
      <div className="bg-[#141414] border border-white/5 p-6 mb-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        {/* Caixa de Seleção para o tipo de Relatório */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-grow max-w-2xl">
          <div className="space-y-1.5 shrink-0">
            <label className="text-[9px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider block">
              Tipo de Relatório
            </label>
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value as "clients" | "financial");
                  setSearchTerm("");
                }}
                className="appearance-none bg-[#1C1C1C] border border-white/10 text-white text-xs px-4 py-3 pr-10 outline-none focus:border-[#D4AF37] cursor-pointer font-sans min-w-[220px]"
                id="report-type-select"
              >
                <option value="clients">👥 Clientes Ativos</option>
                <option value="financial">🪙 Demonstrativo Financeiro</option>
              </select>
              <div className="absolute inset-y-0 right-3 pointer-events-none flex items-center text-[#D4AF37]">
                <span className="text-[10px]">▼</span>
              </div>
            </div>
          </div>

          {/* Quick search specifically for reports data */}
          <div className="space-y-1.5 flex-grow">
            <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
              Filtro por Palavra-chave
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={reportType === "clients" ? "Buscar cliente, e-mail ou CPF/CNPJ..." : "Buscar cliente, serviço ou processo..."}
                className="w-full text-xs text-white placeholder-gray-600 bg-[#1C1C1C] border border-white/10 pl-10 pr-4 py-3 outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Sub-Filters for Financial Report */}
          {reportType === "financial" && (
            <div className="space-y-1.5 shrink-0">
              <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                Filtro de Recebimento
              </label>
              <div className="flex border border-white/10 overflow-hidden bg-[#1C1C1C]">
                {(["all", "pending", "paid"] as const).map((filterOpt) => (
                  <button
                    key={filterOpt}
                    onClick={() => setFinancialFilter(filterOpt)}
                    className={`px-3 py-2.5 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border-r last:border-r-0 border-white/5 ${
                      financialFilter === filterOpt 
                        ? "bg-[#D4AF37] text-black" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {filterOpt === "all" ? "Todos" : filterOpt === "pending" ? "Pendentes" : "Quitados"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons to download CSV & PDF */}
        <div className="flex flex-col sm:flex-row items-stretch md:items-end gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={downloadCSV}
            disabled={reportType === "clients" ? filteredClients.length === 0 : filteredServices.length === 0}
            className="px-5 py-3 bg-[#1C1C1C] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] hover:text-white text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            id="download-report-btn"
            title="Exportar dados para planilha Excel / CSV"
          >
            <Download className="h-3.5 w-3.5 shrink-0" />
            Planilha (CSV)
          </button>
          
          <button
            onClick={downloadPDF}
            disabled={reportType === "clients" ? filteredClients.length === 0 : filteredServices.length === 0}
            className="px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B38F11] hover:from-[#E5C048] hover:to-[#C59F22] text-black text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            id="download-report-pdf-btn"
            title="Exportar relatório oficial em formato PDF"
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-black" />
            Exportar PDF (MR)
          </button>
        </div>
      </div>

      {reportType === "clients" ? (
        /* ==================== CLIENTS REPORT VIEW ==================== */
        <div className="space-y-8">
          {/* Bento Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-[#141414] border border-white/5 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]" />
              <p className="text-[9px] font-mono uppercase font-bold text-[#D4AF37] tracking-widest">Total de Clientes</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-serif text-white">{totalClients}</span>
                <span className="text-[9px] text-gray-500 font-mono">cadastrados</span>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/5 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <p className="text-[9px] font-mono uppercase font-bold text-blue-400 tracking-widest">C/ Serviços Vinculados</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-serif text-white">{clientsWithServicesCount}</span>
                <span className="text-[9px] text-gray-500 font-mono">
                  {totalClients > 0 ? `${Math.round((clientsWithServicesCount / totalClients) * 100)}%` : "0%"} da base
                </span>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/5 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <p className="text-[9px] font-mono uppercase font-bold text-emerald-400 tracking-widest">Documentos Oficiais</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-serif text-white">{totalClientDocsCount}</span>
                <span className="text-[9px] text-gray-500 font-mono">arquivos digitais</span>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/5 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
              <p className="text-[9px] font-mono uppercase font-bold text-purple-400 tracking-widest">Serviços / Projetos Ativos</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-serif text-white">{totalActiveProcesses}</span>
                <span className="text-[9px] text-gray-500 font-mono">demandas registradas</span>
              </div>
            </div>
          </div>

          {/* Table / List View */}
          <div className="bg-[#141414] border border-white/5 overflow-x-auto">
            <table className="w-full text-left border-collapse" id="clients-report-table">
              <thead>
                <tr className="border-b border-white/5 bg-black/35 text-[9px] font-mono uppercase tracking-widest text-[#D4AF37]">
                  <th className="p-4 pl-6 font-semibold">Cliente</th>
                  <th className="p-4 font-semibold">Inscrição Tributária / REG</th>
                  <th className="p-4 font-semibold">Contato</th>
                  <th className="p-4 font-semibold">Data Cadastro</th>
                  <th className="p-4 font-semibold text-center">Serviços Ativos</th>
                  <th className="p-4 pr-6 font-semibold text-right">Documentos Recebidos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500 text-xs">
                      <FolderOpen className="h-8 w-8 text-[#D4AF37]/35 mx-auto mb-3" />
                      Nenhum cliente correspondente encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const clientServices = services.filter(s => s.clientId === client.id);
                    const uploadedDocsCount = Object.keys(client.files || {}).length;

                    return (
                      <tr key={client.id} className="hover:bg-white/[0.02] text-xs transition-colors">
                        <td className="p-4 pl-6 font-serif text-white font-light text-sm max-w-[240px] truncate">
                          {client.name}
                        </td>
                        <td className="p-4 font-mono text-gray-400 text-[11px] tracking-wide">
                          {client.taxId}
                        </td>
                        <td className="p-4 max-w-[200px] truncate">
                          <p className="text-white/90">{client.email}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{client.phone}</p>
                        </td>
                        <td className="p-4 text-gray-400 font-mono text-[11px]">
                          {client.regDate}
                        </td>
                        <td className="p-4 text-center font-mono">
                          {clientServices.length > 0 ? (
                            <span className="inline-block bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] px-2 py-0.5 text-[10px] font-bold">
                              {clientServices.length} {clientServices.length === 1 ? "Ativo" : "Ativos"}
                            </span>
                          ) : (
                            <span className="text-gray-600 font-normal">Nenhum</span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right font-mono text-gray-300">
                          <span className="text-white font-bold">{uploadedDocsCount}</span>
                          <span className="text-gray-600"> / 3</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ==================== FINANCIAL REPORT VIEW ==================== */
        <div className="space-y-8">
          {/* Bento Financial Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-[#141414] border border-white/5 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]" />
              <p className="text-[9px] font-mono uppercase font-bold text-[#D4AF37] tracking-widest">Valor Geral em Contratos</p>
              <p className="text-2xl font-serif text-white mt-1.5">{formatCurrency(totalFinancialValue)}</p>
              <div className="mt-2 text-[9px] text-gray-500 font-mono flex items-center justify-between">
                <span>Contatos faturados</span>
                <span className="text-white">{services.length} projetos</span>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/5 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
              <p className="text-[9px] font-mono uppercase font-bold text-green-400 tracking-widest">Entradas & Pagamentos Recebidos</p>
              <p className="text-2xl font-serif text-green-400 mt-1.5">{formatCurrency(totalFinancialReceived)}</p>
              <div className="mt-2 text-[9px] text-gray-500 font-mono flex items-center justify-between">
                <span>Taxa de liquidação</span>
                <span className="text-green-400 font-bold">{receivedPercentage}% quitado</span>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/5 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
              <p className="text-[9px] font-mono uppercase font-bold text-amber-500 tracking-widest">Carteira a Receber / Pendente</p>
              <p className="text-2xl font-serif text-amber-400 mt-1.5">{formatCurrency(totalFinancialOutstanding)}</p>
              <div className="mt-2 text-[9px] text-gray-500 font-mono flex items-center justify-between">
                <span>Valores programados</span>
                <span className="text-amber-500 font-bold">{100 - receivedPercentage}% a faturar</span>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/5 p-5 relative overflow-hidden flex flex-col justify-between">
              <p className="text-[9px] font-mono uppercase font-bold text-purple-400 tracking-widest">Indicador Desempenho do Portfólio</p>
              {/* Simple inline progress indicator bar */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1.5 text-gray-400">
                  <span>RECEBIDO</span>
                  <span className="text-[#D4AF37]">{receivedPercentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-500 transition-all duration-1000" 
                    style={{ width: `${receivedPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table / List View */}
          <div className="bg-[#141414] border border-white/5 overflow-x-auto">
            <table className="w-full text-left border-collapse" id="financial-report-table">
              <thead>
                <tr className="border-b border-white/5 bg-black/35 text-[9px] font-mono uppercase tracking-widest text-[#D4AF37]">
                  <th className="p-4 pl-6 font-semibold">Cliente / Processo</th>
                  <th className="p-4 font-semibold">Serviço Técnico</th>
                  <th className="p-4 font-semibold text-right">Valor Contratual</th>
                  <th className="p-4 font-semibold text-right">Entrada Efetuada</th>
                  <th className="p-4 font-semibold text-right">Adicionais Pagos</th>
                  <th className="p-4 font-semibold text-right">Status Fin.</th>
                  <th className="p-4 pr-6 font-semibold text-right">A Receber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-500 text-xs">
                      <DollarSign className="h-8 w-8 text-[#D4AF37]/35 mx-auto mb-3" />
                      Nenhum registro financeiro correspondente encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((service) => {
                    const price = service.valorServico || 0;
                    const ent = service.entrada || 0;
                    const pag = service.pagamentos || 0;
                    const totalPaid = ent + pag;
                    const outstanding = service.aReceber !== undefined ? service.aReceber : Math.max(0, price - totalPaid);
                    const isPaidCombined = price > 0 && totalPaid >= price;

                    return (
                      <tr key={service.id} className="hover:bg-white/[0.02] text-xs transition-colors">
                        <td className="p-4 pl-6 max-w-[220px]">
                          <p className="font-serif text-white font-light text-sm truncate" title={service.clientName}>
                            {service.clientName}
                          </p>
                          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest truncate">
                            PROC: {service.numeroProcesso || "Não Definido"}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="text-white/95 font-medium">{service.serviceType}</span>
                        </td>
                        <td className="p-4 text-right font-mono text-white/90">
                          {formatCurrency(price)}
                        </td>
                        <td className="p-4 text-right font-mono text-gray-400">
                          {formatCurrency(ent)}
                        </td>
                        <td className="p-4 text-right font-mono text-gray-400">
                          {formatCurrency(pag)}
                        </td>
                        <td className="p-4 text-right">
                          {isPaidCombined ? (
                            <span className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">
                              Quitado
                            </span>
                          ) : (
                            <span className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">
                              Aberto
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right font-mono font-bold text-white">
                          <span className={outstanding > 0 ? "text-[#D4AF37]" : "text-gray-500"}>
                            {formatCurrency(outstanding)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
