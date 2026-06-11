import React, { useState, useEffect, useRef } from "react";
import { Message } from "../types";
import { MessageSquare, Send, Sparkles, Bot, User, RefreshCw, X, ArrowUpRight } from "lucide-react";

export const VirtualAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      role: "assistant",
      content: `Olá! Sou o **Assistente Virtual MR**, seu consultor exclusivo de Inteligência Artificial para a incorporadora **MR Empreendimentos**. 

Estou aqui para apresentar nosso portfólio de imóveis de luxo de forma detalhada, esclarecer condições de parcelamento e simulações, bem como ajudar você no agendamento de visitas com nossos corretores elite.

Como posso enriquecer seu planejamento patrimonial hoje?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggested questions chips for outstanding usability
  const SUGGESTED_CHIPS = [
    { label: "Diferenciais do Sky Residence 🏢", query: "Quais os principais diferenciais construtivos e áreas comuns do MR Sky Residence em Porto Alegre?" },
    { label: "Financiamento direto MR? 💰", query: "Quais as formas e opções de financiamento que a MR oferece nos seus empreendimentos?" },
    { label: "Mansões em Curitiba 🌲", query: "Gostaria de saber mais informações sobre o condomínio ecológico MR Green Valley no Ecoville em Curitiba." },
    { label: "Sede Corporativa AAA em SP 💼", query: "Preciso de detalhes sobre as lajes comerciais corporativas do MR Corporate Center na Faria Lima." }
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message to history
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Create request payload matching server.ts API structure
      const chatHistory = [...messages, userMsg].map((msg) => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
      });

      const data = await res.json();
      
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.reply,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error(data.error || "Resposta malsucedida da IA.");
      }
    } catch (err: any) {
      console.error("Erro na comunicação com o assistente:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          role: "assistant",
          content: "Lamento, ocorreu um erro de conexão temporário com nossa central de processamento. Por favor, tente enviar novamente.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: "init-reset",
        role: "assistant",
        content: "Histórico redefinido. Olá! Deseja explorar alguma unidade imobiliária específica hoje ou tirar dúvidas de financiamento?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <section id="ai-assistant-section" className="bg-[#0F0F0F] py-24 text-[#F5F5F0] border-t border-white/10">
      <div className="mx-auto max-w-4xl px-8">
        
        {/* Header Block */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase mb-2">
            <Sparkles className="h-4 w-4" />
            Atendimento Exclusivo IA
          </div>
          <h2 className="font-serif italic text-3xl font-light text-white sm:text-4xl">
            Assistência Virtual MR
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-[#F5F5F0]/65">
            Fale diretamente com nossa inteligência artificial para obter especificações construtivas detalhadas ou simular cenários de aquisição.
          </p>
        </div>

        {/* Chat Widget Container */}
        <div className="rounded-none border border-white/10 bg-[#141414] overflow-hidden flex flex-col h-[600px] shadow-2xl relative">
          
          {/* Widget sub header */}
          <div className="bg-[#1A1A1A] px-6 py-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-none bg-gradient-to-tr from-[#D4AF37] to-[#FFF8E7] flex items-center justify-center text-black shadow-inner">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-white">Consultor Virtual MR</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-none bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Atendimento Online</span>
                </div>
              </div>
            </div>

            <button
              onClick={clearChatHistory}
              title="Limpar Conversa"
              className="p-2 rounded-none bg-black/40 hover:bg-black/80 hover:text-white transition-all text-gray-400 border border-white/5"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/5 via-[#141414] to-[#141414]" id="chat-messages-scroll">
            
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
                  }`}
                >
                  {/* Icon Avatar */}
                  <div className={`h-8 w-8 rounded-none shrink-0 flex items-center justify-center text-xs font-bold ${
                    isAssistant 
                      ? "bg-white/5 text-[#D4AF37] border border-white/15" 
                      : "bg-[#D4AF37] text-black"
                  }`}>
                    {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  {/* Bubble content */}
                  <div className={`rounded-none px-5 py-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                    isAssistant
                      ? "bg-[#1F1F1F] text-[#F5F5F0]/90 border border-white/5"
                      : "bg-[#D4AF37] text-black font-semibold"
                  }`}>
                    <div className="whitespace-pre-line prose prose-invert max-w-none text-xs sm:text-sm">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Waiting/Typing indicator bubble */}
            {isLoading && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="h-8 w-8 rounded-none bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-[#D4AF37]" />
                </div>
                <div className="rounded-none px-5 py-3.5 bg-[#1F1F1F] border border-white/5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-none bg-[#D4AF37] animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-none bg-[#D4AF37] animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-none bg-[#D4AF37] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Quick chip suggestion bar */}
          <div className="px-6 py-3 bg-[#1A1A1A] overflow-x-auto flex gap-2 border-t border-white/10 font-sans" id="suggested-chips-scroll">
            {SUGGESTED_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip.query)}
                className="whitespace-nowrap rounded-none bg-white/5 border border-white/10 px-4 py-2 text-[10px] tracking-wider uppercase text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all duration-300"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Text Input area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-5 bg-[#1A1A1A] border-t border-white/10 flex gap-3 relative"
            id="assistant-chat-form"
          >
            <input
              type="text"
              placeholder="Digite aqui sua pergunta (Ex: Como agendar visita?)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-black/40 border border-white/10 rounded-none px-5 py-4 text-xs font-semibold tracking-wider uppercase text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-[#D4AF37] text-black font-bold uppercase tracking-widest rounded-none px-6 flex items-center justify-center transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-[#D4AF37] disabled:hover:text-black"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
