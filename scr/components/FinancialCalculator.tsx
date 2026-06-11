import React, { useState, useEffect } from "react";
import { PROPERTIES } from "../data/properties";
import { Calculator, Percent, Sparkles, Building, Info, HelpCircle } from "lucide-react";

interface FinancialCalculatorProps {
  selectedPropertyId?: string;
  onSelectProperty?: (propId: string) => void;
}

export const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({
  selectedPropertyId = "",
  onSelectProperty,
}) => {
  // Available pre-configured property baselines or custom choice
  const [propertyChoice, setPropertyChoice] = useState<string>("custom");
  const [propertyValue, setPropertyValue] = useState<number>(1500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);
  const [amortizationSystem, setAmortizationSystem] = useState<"price" | "sac">("price");
  const [termYears, setTermYears] = useState<number>(15);
  const [interestRate, setInterestRate] = useState<number>(9.5); // 9.5% p.a.

  // Sync selectedPropertyId to calculator baseline
  useEffect(() => {
    if (selectedPropertyId && selectedPropertyId !== "custom") {
      const match = PROPERTIES.find((p) => p.id === selectedPropertyId);
      if (match) {
        setPropertyChoice(selectedPropertyId);
        setPropertyValue(match.minPrice);
      }
    }
  }, [selectedPropertyId]);

  const handlePropertyChoiceChange = (choice: string) => {
    setPropertyChoice(choice);
    if (choice === "custom") {
      setPropertyValue(1500000);
    } else {
      const match = PROPERTIES.find((p) => p.id === choice);
      if (match) {
        setPropertyValue(match.minPrice);
      }
    }
    if (onSelectProperty) {
      onSelectProperty(choice);
    }
  };

  // Computations
  const downPaymentAmount = (propertyValue * downPaymentPercent) / 100;
  const financedAmount = propertyValue - downPaymentAmount;
  const totalMonths = termYears * 12;
  const monthlyRateDecimal = interestRate / 100 / 12;

  // Calculo de Parcela Price e SAC
  let firstInstallment = 0;
  let lastInstallment = 0;
  let totalPayments = 0;
  let totalInterest = 0;

  if (financedAmount > 0) {
    if (amortizationSystem === "price") {
      // Tabela PRICE: PMT = PV * [i * (1+i)^n] / [(1+i)^n - 1]
      if (monthlyRateDecimal === 0) {
        firstInstallment = financedAmount / totalMonths;
      } else {
        firstInstallment =
          (financedAmount * (monthlyRateDecimal * Math.pow(1 + monthlyRateDecimal, totalMonths))) /
          (Math.pow(1 + monthlyRateDecimal, totalMonths) - 1);
      }
      lastInstallment = firstInstallment;
      totalPayments = firstInstallment * totalMonths;
      totalInterest = totalPayments - financedAmount;
    } else {
      // Tabela SAC: Amortização constante (A = PV / n)
      // Primeira Parcela = A + PV * i
      // Última Parcela = A + A * i
      const constantAmortization = financedAmount / totalMonths;
      firstInstallment = constantAmortization + financedAmount * monthlyRateDecimal;
      lastInstallment = constantAmortization + constantAmortization * monthlyRateDecimal;
      
      // Soma de P.A para Juros Totais: Juros_Total = (n * J1 + n * Jn) / 2 ...onde o juro diminui linearmente
      // Total Pago = Financiado + Total Juros
      totalInterest = ((totalMonths * (financedAmount * monthlyRateDecimal + constantAmortization * monthlyRateDecimal)) / 2);
      totalPayments = financedAmount + totalInterest;
    }
  }

  // Formatting currency in local BRL format
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Pie chart computations
  const totalFinancialVolume = downPaymentAmount + financedAmount + totalInterest;
  const downPaymentPctOfTotal = (downPaymentAmount / totalFinancialVolume) * 100;
  const principalPctOfTotal = (financedAmount / totalFinancialVolume) * 100;
  const interestPctOfTotal = (totalInterest / totalFinancialVolume) * 100;

  // SVG circular segments
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const downPaymentStroke = (downPaymentPctOfTotal / 100) * circumference;
  const principalStroke = (principalPctOfTotal / 100) * circumference;
  const interestStroke = (interestPctOfTotal / 100) * circumference;

  return (
    <section id="financing-calculator-section" className="bg-[#0F0F0F] py-24 text-[#F5F5F0] relative overflow-hidden border-t border-white/10">
      <div className="mx-auto max-w-7xl px-8 relative z-10">
        
        {/* Header Block */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase mb-2">
            <Calculator className="h-4 w-4" />
            Simulador Financeiro
          </div>
          <h2 className="font-serif italic text-3xl font-light text-white sm:text-4xl">
            Planejamento Sob Medida
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-[#F5F5F0]/65">
            Simule com transparência as condições ideais e planeje a aquisição da sua próxima unidade imobiliária premium.
          </p>
        </div>

        {/* Dual columns */}
        <div className="grid gap-12 lg:grid-cols-12 items-start" id="calculator-columns-grid">
          
          {/* Controls Form column */}
          <div className="lg:col-span-7 bg-[#141414] p-8 rounded-none border border-white/10 space-y-6">
            
            {/* Choose baseline drop down */}
            <div>
              <label htmlFor="calculator-property-choice" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2.5">
                Empreendimento de Referência
              </label>
              <select
                id="calculator-property-choice"
                value={propertyChoice}
                onChange={(e) => handlePropertyChoiceChange(e.target.value)}
                className="w-full rounded-none border border-white/10 bg-[#1A1A1A] px-4 py-3 text-xs uppercase tracking-widest text-[#F5F5F0] focus:border-[#D4AF37] outline-none"
              >
                <option value="custom">Escolher Valor Customizado (Simulação Livre)</option>
                {PROPERTIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city}) • Mínimo {formatBRL(p.minPrice)}
                  </option>
                ))}
              </select>
            </div>

            {/* Property value slider */}
            <div>
              <div className="flex justify-between text-xs mb-2 font-sans uppercase tracking-widest">
                <span className="text-gray-400 font-semibold">Valor Estimado do Imóvel</span>
                <span className="text-white font-bold text-sm">{formatBRL(propertyValue)}</span>
              </div>
              <input
                type="range"
                min={300000}
                max={15000000}
                step={50000}
                value={propertyValue}
                onChange={(e) => {
                  setPropertyValue(Number(e.target.value));
                  setPropertyChoice("custom");
                }}
                className="w-full h-1 bg-[#222222] rounded-none appearance-none cursor-pointer accent-[#D4AF37]"
              />
              <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono uppercase tracking-widest">
                <span>R$ 300 Mil</span>
                <span>R$ 7.5 Mi</span>
                <span>R$ 15 Milhões</span>
              </div>
            </div>

            {/* Downpayment slider */}
            <div>
              <div className="flex justify-between text-xs mb-2 font-sans uppercase tracking-widest">
                <span className="text-gray-400 font-semibold flex items-center gap-1">
                  Valor de Entrada 
                  <span className="text-[10px] text-gray-500 font-mono">({downPaymentPercent}%)</span>
                </span>
                <span className="text-white font-bold text-sm">{formatBRL(downPaymentAmount)}</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full h-1 bg-[#222222] rounded-none appearance-none cursor-pointer accent-[#D4AF37]"
              />
              <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono uppercase tracking-widest">
                <span>10% (RECOMENDADO)</span>
                <span>50% (METADE)</span>
                <span>90% (MÁXIMO)</span>
              </div>
            </div>

            {/* Flexible row for Term and Rate */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                  <span>Prazo Financiamento</span>
                  <span className="text-white font-semibold">{termYears} Anos ({totalMonths} parcelas)</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={termYears}
                  onChange={(e) => setTermYears(Number(e.target.value))}
                  className="w-full h-1 bg-[#222222] rounded-none appearance-none cursor-pointer accent-[#D4AF37]"
                />
                <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono uppercase tracking-widest">
                  <span>5 Anos</span>
                  <span>30 Anos</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
                  <span>Taxa de Juros</span>
                  <span className="text-[#D4AF37] font-semibold">{interestRate}% ao ano</span>
                </div>
                <input
                  type="range"
                  min={5.0}
                  max={16.0}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-1 bg-[#222222] rounded-none appearance-none cursor-pointer accent-[#D4AF37]"
                />
                <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono uppercase tracking-widest">
                  <span>5.0% Min</span>
                  <span>16.0% Max</span>
                </div>
              </div>
            </div>

            {/* Amortization Switch Choice */}
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                Sistema de Amortização
              </span>
              <div className="grid grid-cols-2 gap-3" id="amortization-picker-container">
                <button
                  type="button"
                  onClick={() => setAmortizationSystem("price")}
                  className={`rounded-none border py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    amortizationSystem === "price"
                      ? "border-[#D4AF37] bg-white/5 text-[#D4AF37]"
                      : "border-white/10 bg-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  Tabela PRICE <span className="block text-[8px] font-normal lowercase text-gray-400 mt-1">Parcelas totalmente fixas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAmortizationSystem("sac")}
                  className={`rounded-none border py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    amortizationSystem === "sac"
                      ? "border-[#D4AF37] bg-white/5 text-[#D4AF37]"
                      : "border-white/10 bg-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  Tabela SAC <span className="block text-[8px] font-normal lowercase text-gray-400 mt-1">Parcelas decrescentes</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Graphic Column */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full justify-between">
            
            {/* Monthly value box (Hero indicator) */}
            <div className="bg-[#141414] border border-white/10 rounded-none p-8 text-center">
              <span className="text-gray-400 font-semibold text-[10px] uppercase tracking-[0.2em] block">
                {amortizationSystem === "price" ? "Parcela Mensal Fixa" : "Primeira Parcela (Amortização SAC)"}
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif italic font-light mt-3 text-[#D4AF37] tracking-tight">
                {formatBRL(firstInstallment)}
              </h3>
              {amortizationSystem === "sac" && (
                <p className="text-[11px] text-gray-400 mt-2 font-medium">
                  Última parcela cai para <strong className="text-white">{formatBRL(lastInstallment)}</strong>
                </p>
              )}
              <div className="mt-5 inline-flex items-center gap-1.5 rounded-none bg-[#D4AF37]/10 px-3 py-1.5 text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest border border-[#D4AF37]/20">
                <Percent className="h-3.5 w-3.5" />
                Financiamento Direto MR ou Banco
              </div>
            </div>

            {/* Details breakdown card */}
            <div className="bg-[#141414] p-6 rounded-none border border-white/10 space-y-4">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] block border-b border-white/5 pb-2">Resumo do Investimento</span>

              <div className="text-xs space-y-3 font-medium uppercase tracking-wider">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400 text-[10px]">Total Pago em Entrada</span>
                  <span className="text-[#F5F5F0] font-bold">{formatBRL(downPaymentAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400 text-[10px]">Saldo Financiado (Principal)</span>
                  <span className="text-[#F5F5F0] font-bold">{formatBRL(financedAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 text-[11px]">
                  <span className="text-[#D4AF37] text-[10px]">Juros Totais Calculados</span>
                  <span className="text-[#D4AF37] font-bold">{formatBRL(totalInterest)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/15 text-sm">
                  <span className="text-white font-semibold">Volume Financeiro Total</span>
                  <span className="text-[#D4AF37] font-bold font-serif italic text-base">{formatBRL(totalPayments + downPaymentAmount)}</span>
                </div>
              </div>

              {/* Graphical Circular Chart */}
              <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                {/* SVG Pie Circular Diagram */}
                <svg width="120" height="120" className="rotate-[-90deg]">
                  {/* Base Circle background */}
                  <circle cx="60" cy="60" r={radius} fill="none" stroke="#222222" strokeWidth="12" />

                  {/* Down payment circle segment */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="12"
                    strokeDasharray={`${downPaymentStroke} ${circumference - downPaymentStroke}`}
                    strokeDashoffset="0"
                  />

                  {/* Financed Principal segment */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#888888"
                    strokeWidth="12"
                    strokeDasharray={`${principalStroke} ${circumference - principalStroke}`}
                    strokeDashoffset={-downPaymentStroke}
                  />

                  {/* Interest payment segment */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#444444"
                    strokeWidth="12"
                    strokeDasharray={`${interestStroke} ${circumference - interestStroke}`}
                    strokeDashoffset={-(downPaymentStroke + principalStroke)}
                  />
                </svg>

                {/* Subtitle list */}
                <div className="space-y-2 text-[10px] text-gray-300 font-semibold flex-1 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-none bg-[#D4AF37]" />
                    <span>Entrada: {downPaymentPercent}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-none bg-[#888888]" />
                    <span>Principal: {Math.round(100 - downPaymentPercent)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-none bg-[#444444]" />
                    <span>Juros Estimados</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini explanatory banner */}
            <div className="bg-[#141414] rounded-none p-4 border border-white/10 flex gap-3 text-xs text-[#F5F5F0]/60">
              <Info className="h-5 w-5 text-[#D4AF37] shrink-0" />
              <p className="leading-relaxed text-[11px]">
                As simulações acima são baseadas nas taxas atuais de mercado e destinam-se exclusivamente como referência preliminar. Fale com um de nossos assessores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
