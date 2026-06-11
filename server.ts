import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Increase payload limits to support base64 document uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Users & Schedulings Types
interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "cliente" | "administrador";
}

interface Scheduling {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  date: string;
  time: string;
  notes?: string;
  createdAt: string;
  status: "Pendente" | "Confirmado" | "Cancelado";
}

// Low-profile local database paths
const DB_DIR = path.join(process.cwd(), "database");
const USERS_FILE = path.join(DB_DIR, "users.json");
const SCHEDULINGS_FILE = path.join(DB_DIR, "schedulings.json");
const CLIENTS_FILE = path.join(DB_DIR, "clients.json");
const SERVICES_FILE = path.join(DB_DIR, "services.json");
const UPLOADS_DIR = path.join(DB_DIR, "uploads");

// Ensure database directories exist
try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Aviso: Falha ao inicializar os diretórios de banco de dados no disco:", e);
}

// Serve uploaded files statically
app.use("/uploads", express.static(UPLOADS_DIR));

// Initial defaults to populate database if empty
const initialUsers: User[] = [
  {
    id: "u-1",
    name: "Administrador Geral",
    email: "admin@mr.com.br",
    password: "admin",
    role: "administrador"
  },
  {
    id: "u-2",
    name: "Carlos Eduardo da Silva",
    email: "carlos.silva@example.com",
    password: "client",
    role: "cliente"
  }
];

const initialSchedulings: Scheduling[] = [
  {
    id: "1",
    name: "Carlos Eduardo da Silva",
    email: "carlos.silva@example.com",
    phone: "(11) 99999-1234",
    property: "MR Sky Residence",
    date: "2026-06-18",
    time: "14:00",
    notes: "Gostaria de ver a maquete e o decorado de 3 suítes.",
    createdAt: new Date().toISOString(),
    status: "Confirmado"
  }
];

// Helper to load schema files
function loadData<T>(filePath: string, defaultData: T[]): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    } else {
      // Create first instance data
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
      return defaultData;
    }
  } catch (err) {
    console.error(`Erro ao ler arquivo ${filePath}, usando dados em memória:`, err);
    return defaultData;
  }
}

// Helper to save data back to files
function saveData<T>(filePath: string, data: T[]): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Falha ao salvar dados de persistência local em ${filePath}:`, err);
  }
}

// Load current datasets
const users: User[] = loadData(USERS_FILE, initialUsers);
const schedulings: Scheduling[] = loadData(SCHEDULINGS_FILE, initialSchedulings);
const clients: any[] = loadData(CLIENTS_FILE, []);
const services: any[] = loadData(SERVICES_FILE, []);

// Helper to recursively process and decode base64 file attachments to physical files
function processFiles(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => processFiles(item));
  }

  const updatedObj = { ...obj };

  if (
    typeof updatedObj.name === "string" &&
    typeof updatedObj.size === "number" &&
    typeof updatedObj.type === "string" &&
    typeof updatedObj.url === "string" &&
    updatedObj.url.startsWith("data:")
  ) {
    try {
      const match = updatedObj.url.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");
        
        // Clean filename to prevent path traversal or special chars issues
        const cleanName = updatedObj.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const uniqueName = `${Date.now()}_${cleanName}`;
        const filePath = path.join(UPLOADS_DIR, uniqueName);
        
        fs.writeFileSync(filePath, buffer);
        console.log(`[File Saved] ${filePath}`);
        
        updatedObj.url = `/uploads/${uniqueName}`;
      }
    } catch (e) {
      console.error(`Erro ao salvar arquivo decodificado: ${updatedObj.name}`, e);
    }
  } else {
    for (const key in updatedObj) {
      if (Object.prototype.hasOwnProperty.call(updatedObj, key)) {
        updatedObj[key] = processFiles(updatedObj[key]);
      }
    }
  }

  return updatedObj;
}

// Lazy-loaded Gemini AI client to prevent crash on startup if API key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("Aviso: GEMINI_API_KEY não foi configurada. Algumas respostas podem ser simuladas.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// 1. API: List Schedulings
app.get("/api/schedulings", (req, res) => {
  res.json({ success: true, count: schedulings.length, data: schedulings });
});

// 2. API: Create Scheduling
app.post("/api/schedulings", (req, res) => {
  const { name, email, phone, property, date, time, notes } = req.body;
  if (!name || !email || !phone || !property || !date || !time) {
    return res.status(400).json({ success: false, error: "Campos obrigatórios ausentes" });
  }

  const newScheduling: Scheduling = {
    id: String(schedulings.length + 1),
    name,
    email,
    phone,
    property,
    date,
    time,
    notes,
    createdAt: new Date().toISOString(),
    status: "Pendente"
  };

  schedulings.push(newScheduling);
  saveData(SCHEDULINGS_FILE, schedulings);
  res.status(201).json({ success: true, data: newScheduling });
});

// 2b. API: Update Scheduling (for Admins)
app.put("/api/schedulings/:id", (req, res) => {
  const { id } = req.params;
  const { status, date, time, notes } = req.body;
  const index = schedulings.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Agendamento não localizado" });
  }

  const current = schedulings[index];
  if (status) current.status = status;
  if (date) current.date = date;
  if (time) current.time = time;
  if (notes !== undefined) current.notes = notes;

  saveData(SCHEDULINGS_FILE, schedulings);
  res.json({ success: true, data: current });
});

// 2c. API: Delete Scheduling
app.delete("/api/schedulings/:id", (req, res) => {
  const { id } = req.params;
  const index = schedulings.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Agendamento não localizado" });
  }
  schedulings.splice(index, 1);
  saveData(SCHEDULINGS_FILE, schedulings);
  res.json({ success: true, message: "Agendamento excluído com sucesso" });
});

// 2d. API: Auth Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, error: "Todos os campos (nome, email, senha, perfil) são obrigatórios" });
  }

  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, error: "Este endereço de e-mail já está cadastrado" });
  }

  const newUser: User = {
    id: "u-" + (users.length + 1),
    name,
    email,
    password,
    role: role === "administrador" ? "administrador" : "cliente"
  };

  users.push(newUser);
  saveData(USERS_FILE, users);

  // Redacted password in response
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ success: true, data: safeUser });
});

// 2e. API: Auth Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "E-mail e senha são obrigatórios" });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: "E-mail ou senha incorretos" });
  }

  const { password: _, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

// 2f. API: Get Users (Admins only / general for dashboard)
app.get("/api/users", (req, res) => {
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json({ success: true, data: safeUsers });
});

// 2g. API: List Clients
app.get("/api/clients", (req, res) => {
  res.json({ success: true, count: clients.length, data: clients });
});

// 2h. API: Create Client
app.post("/api/clients", (req, res) => {
  try {
    const processedClient = processFiles(req.body);
    const { name, taxId, phone, email, address } = processedClient;
    if (!name || !taxId || !phone || !email || !address) {
      return res.status(400).json({ success: false, error: "Campos obrigatórios ausentes" });
    }

    const isDuplicate = clients.some(c => c.taxId.replace(/\D/g, "") === taxId.replace(/\D/g, ""));
    if (isDuplicate) {
      return res.status(400).json({ success: false, error: "Este CPF/CNPJ já está cadastrado no sistema." });
    }

    if (!processedClient.id) {
      processedClient.id = "cli_" + Date.now();
    }
    if (!processedClient.regDate) {
      processedClient.regDate = new Date().toLocaleDateString("pt-BR");
    }
    if (!processedClient.files) {
      processedClient.files = {};
    }

    clients.unshift(processedClient); // Unshift to match frontend prepending
    saveData(CLIENTS_FILE, clients);
    res.status(201).json({ success: true, data: processedClient });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2i. API: Update Client
app.put("/api/clients/:id", (req, res) => {
  try {
    const { id } = req.params;
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Cliente não localizado" });
    }

    const processedClient = processFiles(req.body);
    clients[index] = { ...clients[index], ...processedClient, id }; // preserve ID

    saveData(CLIENTS_FILE, clients);
    res.json({ success: true, data: clients[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2j. API: Delete Client
app.delete("/api/clients/:id", (req, res) => {
  try {
    const { id } = req.params;
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Cliente não localizado" });
    }

    clients.splice(index, 1);
    saveData(CLIENTS_FILE, clients);
    res.json({ success: true, message: "Cliente excluído com sucesso" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2k. API: List Services
app.get("/api/services", (req, res) => {
  res.json({ success: true, count: services.length, data: services });
});

// 2l. API: Create Service
app.post("/api/services", (req, res) => {
  try {
    const processedService = processFiles(req.body);
    const { clientId, clientName, serviceType } = processedService;
    if (!clientId || !clientName || !serviceType) {
      return res.status(400).json({ success: false, error: "Campos obrigatórios ausentes" });
    }

    if (!processedService.id) {
      processedService.id = "ser_" + Date.now();
    }
    if (!processedService.regDate) {
      processedService.regDate = new Date().toLocaleDateString("pt-BR");
    }
    if (!processedService.files) {
      processedService.files = {};
    }
    if (processedService.valorServico === undefined) processedService.valorServico = 0;
    if (processedService.entrada === undefined) processedService.entrada = 0;
    if (processedService.pagamentos === undefined) processedService.pagamentos = 0;
    processedService.aReceber = processedService.valorServico - processedService.entrada - processedService.pagamentos;

    services.unshift(processedService);
    saveData(SERVICES_FILE, services);
    res.status(201).json({ success: true, data: processedService });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2m. API: Update Service
app.put("/api/services/:id", (req, res) => {
  try {
    const { id } = req.params;
    const index = services.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Serviço não localizado" });
    }

    const processedService = processFiles(req.body);
    const existing = services[index];
    const updated = { ...existing, ...processedService, id };

    const val = updated.valorServico !== undefined ? updated.valorServico : 0;
    const ent = updated.entrada !== undefined ? updated.entrada : 0;
    const pag = updated.pagamentos !== undefined ? updated.pagamentos : 0;
    updated.aReceber = val - ent - pag;

    services[index] = updated;
    saveData(SERVICES_FILE, services);
    res.json({ success: true, data: services[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2n. API: Delete Service
app.delete("/api/services/:id", (req, res) => {
  try {
    const { id } = req.params;
    const index = services.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Serviço não localizado" });
    }

    services.splice(index, 1);
    saveData(SERVICES_FILE, services);
    res.json({ success: true, message: "Serviço excluído com sucesso" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. API: Gemini AI Virtual Assistant Chat
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, error: "Formato de chat inválido" });
  }

  const systemInstruction = `Você é o "Virtual Assistant MR", o assistente de inteligência artificial de elite da MR Assessoria e Projetos.
Sua missão é atender clientes corporativos e particulares com extrema habilidade, profissionalismo e educação técnica.
Sempre responda em português do Brasil e use formatação markdown rica para destacar pontos importantes, listas e diferenciais dos nossos serviços.

Aqui estão os serviços oficiais da MR Assessoria e Projetos:
1. **Assessoria Documental Técnica**:
   - Descrição: Regularização de certidões, licenciamentos, aprovações, habite-se, laudos de corpo de bombeiros, vigilância sanitária, registros em cartórios, escrituração e retificação de áreas.
   - Prazos: Agilidade e conformidade legal total em curto prazo.
   - Foco: Proteção jurídica para construtoras, empresas de engenharia e proprietários particulares.

2. **Desenho e Planejamento de Projetos**:
   - Descrição: Projetos arquitetônicos residenciais e comerciais, desenho técnico em CAD/BIM, plantas de prefeitura, projetos executivos de alta detalhação, maquete 3D e design de interiores refinado.
   - Plantas: Desenhos sob medida, unindo ergonomia, legislação local de zoneamento urbano e requinte estético.

Seu objetivo é:
1. Apresentar nossos serviços com foco em segurança documental e alto padrão técnico de desenho de projetos.
2. Tirar dúvidas sobre os trâmites burocráticos imobiliários e desenvolvimento criativo/técnico de plantas.
3. Incentivar o usuário a preencher o formulário para agendar uma reunião em nosso escritório na Rua Primeiro de Janeiro, 512, Vila Mirim, Praia Grande/SP.
4. Ser prestativo, formal, elegante e técnico.`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Return a structured simulated fallback response if API key is not present, avoiding crash for the user
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      let simulatedReply = "Olá! Me chamo Assistente Virtual MR. No momento estou operando em modo de simulação, mas posso ajudar a apresentar nossos serviços de assessoria e projetos!\n\n";
      
      const lowerInput = lastUserMsg.toLowerCase();
      if (lowerInput.includes("documento") || lowerInput.includes("regulariz") || lowerInput.includes("certid") || lowerInput.includes("alvar") || lowerInput.includes("habite")) {
        simulatedReply += "Nossa **Assessoria Documental** cuida de toda a burocracia para você! Realizamos a regularização de certidões, licenciamento técnico, emissão de Habite-se, alvarás e retificação de áreas em cartório com rapidez e total conformidade jurídica. Deseja agendar uma consulta técnica para analisarmos seu caso?";
      } else if (lowerInput.includes("desenho") || lowerInput.includes("projeto") || lowerInput.includes("planta") || lowerInput.includes("arquitet")) {
        simulatedReply += "Nossos serviços de **Desenho de Projetos** utilizam ferramentas de ponta (BIM/CAD) para criar plantas arquitetônicas, projetos executivos completos e maquetes 3D realistas, tudo em estrita conformidade com as leis de zoneamento municipais. Gostaria de idealizar um design exclusivo para seu terreno ou imóvel comercial?";
      } else if (lowerInput.includes("endereço") || lowerInput.includes("onde") || lowerInput.includes("local") || lowerInput.includes("praia grande")) {
        simulatedReply += "Nosso escritório está localizado na **Rua Primeiro de Janeiro, 512, Vila Mirim - Praia Grande/SP**. Estamos prontos para receber você para um café e planejar a regularização e o design do seu próximo projeto!";
      } else {
        simulatedReply += "A **MR Assessoria e Projetos** é especialista em duas grandes frentes para o seu imóvel:\n\n1. **Assessoria Documental**: Regularização completa diante de órgãos públicos, cartórios de registro, habite-se, alvarás e licenciamentos.\n2. **Desenho de Projetos**: Desenvolvimento de plantas de engenharia e arquitetura sob medida com assinatura técnica de alta qualidade.\n\nComo posso ajudar você hoje? Conte-me se precisa de auxílio com a burocracia ou no desenho de uma nova planta!";
      }
      return res.json({ success: true, reply: simulatedReply });
    }

    // Configure the GoogleGenAI API call using the recommended 2.5 SDK structures
    const client = getGeminiClient();
    
    // Process messages into Content structure for Gemini API
    const contentsPayload = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentsPayload,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "Peço desculpas, não consegui processar sua mensagem agora. Como posso ajudar?";
    res.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error("Erro na chamada do Gemini API:", error);
    res.status(500).json({ success: false, error: "Ocorreu um erro ao consultar o assistente de inteligência artificial.", details: error.message });
  }
});

// Serve static assets or mount Vite dev server
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Iniciando servidor Express e montando Vite como middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Servidor em modo de produção. Servindo arquivos compilados da pasta dist/...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`Sua aplicação MR Assessoria está rodando!`);
    console.log(`Porta de escuta: ${PORT}`);
    console.log(`Acesse através de: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
};

startServer().catch((err) => {
  console.error("Falha fatal ao iniciar o servidor de desenvolvimento:", err);
});
