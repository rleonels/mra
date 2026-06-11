import React, { useState } from "react";
import { PROPERTIES } from "../data/properties";
import { Property } from "../types";
import { Search, MapPin, Minimize2, CheckCircle2, ArrowUpRight, Sparkles, Building } from "lucide-react";

interface PropertiesCatalogProps {
  onSelectPropertyForSimulation: (propId: string) => void;
  onSelectPropertyForScheduling: (propName: string) => void;
}

export const PropertiesCatalog: React.FC<PropertiesCatalogProps> = ({
  onSelectPropertyForSimulation,
  onSelectPropertyForScheduling,
}) => {
  const [filterType, setFilterType] = useState<"all" | "residential" | "commercial">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Filter properties based on type and search query
  const filteredProperties = PROPERTIES.filter((p) => {
    const matchesType =
      filterType === "all" ||
      (filterType === "residential" && p.type === "residential") ||
      (filterType === "commercial" && p.type === "commercial");

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.highlights.some((h) => h.toLowerCase().includes(query));

    return matchesType && matchesSearch;
  });

  return (
    <section id="properties-catalog-section" className="bg-[#0F0F0F] py-24 text-[#F5F5F0]">
      <div className="mx-auto max-w-7xl px-8">
        {/* Section Header */}
        <div className="mb-14 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-[10px] tracking-[0.3em] uppercase mb-2">
              <Building className="h-4 w-4" />
              Coleções Exclusivas
            </div>
            <h2 className="font-serif italic text-3xl font-light text-white sm:text-4xl">
              Nossos Empreendimentos
            </h2>
            <p className="mt-3 text-[#F5F5F0]/65 max-w-xl text-xs sm:text-sm leading-relaxed">
              Obras de arte imobiliárias estrategicamente desenhadas e implantadas em áreas metropolitanas premium do Brasil.
            </p>
          </div>

          {/* Filter Navigation */}
          <div className="flex flex-wrap gap-2 justify-center" id="catalog-filters-div">
            <button
              onClick={() => setFilterType("all")}
              className={`rounded-none px-6 py-3 font-sans text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                filterType === "all"
                  ? "bg-[#D4AF37] text-black"
                  : "bg-white/5 text-[#F5F5F0]/60 hover:text-[#F5F5F0] hover:bg-white/10"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType("residential")}
              className={`rounded-none px-6 py-3 font-sans text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                filterType === "residential"
                  ? "bg-[#D4AF37] text-black"
                  : "bg-white/5 text-[#F5F5F0]/60 hover:text-[#F5F5F0] hover:bg-white/10"
              }`}
            >
              Residenciais
            </button>
            <button
              onClick={() => setFilterType("commercial")}
              className={`rounded-none px-6 py-3 font-sans text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                filterType === "commercial"
                  ? "bg-[#D4AF37] text-black"
                  : "bg-white/5 text-[#F5F5F0]/60 hover:text-[#F5F5F0] hover:bg-white/10"
              }`}
            >
              Comerciais
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="mb-12 max-w-md relative" id="search-input-wrapper">
          <input
            type="text"
            placeholder="PESQUISAR POR CIDADE, BAIRRO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-none border border-white/10 bg-[#1A1A1A] py-4 pl-12 pr-6 font-sans text-[11px] uppercase tracking-widest text-white placeholder-gray-500 outline-none focus:border-[#D4AF37] transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>

        {/* Empty Search Result */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-none bg-white/5">
            <p className="text-gray-400 font-sans text-sm">Nenhum empreendimento localizado com esses termos de pesquisa.</p>
            <button onClick={() => setSearchQuery("")} className="mt-4 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest underline">
              Limpar Filtro
            </button>
          </div>
        )}

        {/* Grid Container */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-2" id="properties-grid-container">
          {filteredProperties.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-none border border-white/10 bg-[#141414] transition-all duration-500 hover:border-[#D4AF37]/50"
              id={`property-card-${p.id}`}
            >
              {/* Image Section */}
              <div className="relative h-64 overflow-hidden bg-black sm:h-72">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-[1000ms] group-hover:scale-105"
                />
                
                {/* Status Badge */}
                <span className={`absolute left-4 top-4 rounded-none px-3 py-1.5 font-sans text-[9px] font-bold uppercase tracking-[0.15em] ${
                  p.status === "Pronto"
                    ? "bg-emerald-950/90 text-emerald-400 border border-emerald-500/30"
                    : p.status === "Em Obras"
                    ? "bg-amber-950/90 text-amber-400 border border-amber-500/30"
                    : "bg-cyan-950/90 text-cyan-400 border border-cyan-500/30"
                }`}>
                  {p.status}
                </span>

                <span className="absolute right-4 top-4 rounded-none bg-black/80 px-3 py-1.5 font-sans text-[9px] font-bold tracking-[0.15em] uppercase text-gray-300 border border-white/10">
                  {p.type === "residential" ? "Residencial" : "Corporativo AAA"}
                </span>
                
                {/* Price Label Cover */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent p-6 pt-12">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">Preços a partir de</p>
                  <p className="text-lg font-serif italic text-white mt-1 font-light">{p.priceRange}</p>
                </div>
              </div>

              {/* Information Body */}
              <div className="flex flex-1 flex-col p-8">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <MapPin className="h-4 w-4 text-[#D4AF37]" />
                  <span>{p.city}</span>
                </div>
                
                <h3 className="mt-2 font-serif italic text-2xl font-light text-white group-hover:text-[#D4AF37] transition-all duration-300">
                  {p.name}
                </h3>
                
                <p className="mt-3 text-xs sm:text-sm text-[#F5F5F0]/65 leading-relaxed line-clamp-3">
                  {p.description}
                </p>

                {/* Main Spec Indicators */}
                <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/10 py-4 text-[11px] uppercase tracking-wider font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[#D4AF37] text-[9px]">Área Privativa</span>
                    <span className="text-white mt-1">{p.area}</span>
                  </div>
                  {p.type === "residential" ? (
                    <>
                      <div className="flex flex-col">
                        <span className="text-[#D4AF37] text-[9px]">Suítes</span>
                        <span className="text-white mt-1">{p.suites} Suítes</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#D4AF37] text-[9px]">Garagem</span>
                        <span className="text-white mt-1">{p.garageSpaces} Vagas</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <span className="text-[#D4AF37] text-[9px]">Selo Verde</span>
                        <span className="text-white mt-1">LEED Gold</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#D4AF37] text-[9px]">Acesso VIP</span>
                        <span className="text-white mt-1">Heliponto</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Highlights Summary List */}
                <div className="mt-6 space-y-2 flex-1">
                  {p.highlights.slice(0, 2).map((h, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#F5F5F0]/70">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Action */}
                <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                  <button
                    onClick={() => setSelectedProperty(p)}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] hover:text-white transition-colors duration-300"
                  >
                    Ficha Técnica Completa
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Property Detailed Specs Modal Box */}
      {selectedProperty && (
        <div
          id="property-modal-box"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <div className="relative w-full max-w-4xl overflow-hidden rounded-none border border-white/10 bg-[#0F0F0F] text-left shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute right-4 top-4 z-10 rounded-none bg-black/60 p-2 text-[#F5F5F0]/60 hover:text-white border border-white/10 transition-colors"
              aria-label="Close details"
              id="close-modal-btn"
            >
              <Minimize2 className="h-4 w-4" />
            </button>

            {/* Modal Image banner */}
            <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-full">
              <img
                src={selectedProperty.imageUrl}
                alt={selectedProperty.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0F0F0F] via-[#0F0F0F]/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="rounded-none bg-[#D4AF37] px-3 py-1 font-sans text-[9px] font-bold uppercase tracking-[0.15em] text-black">
                  {selectedProperty.status}
                </span>
                <h3 className="mt-3 font-serif italic text-3xl font-light text-white">
                  {selectedProperty.name}
                </h3>
                <p className="mt-1 text-[11px] text-[#F5F5F0]/60 font-semibold uppercase tracking-wider">{selectedProperty.address}</p>
              </div>
            </div>

            {/* Modal Info Column */}
            <div className="w-full md:w-1/2 p-8 overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
              <span className="font-sans text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] block border-b border-white/10 pb-2">FICHA TÉCNICA DO IMÓVEL</span>
              <p className="mt-4 font-sans text-xs sm:text-sm leading-relaxed text-[#F5F5F0]/70">
                {selectedProperty.description}
              </p>

              {/* Comprehensive parameters Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-xs text-[#F5F5F0]">
                <div className="bg-white/5 rounded-none p-4 border border-white/5">
                  <p className="text-[#D4AF37] font-semibold text-[9px] uppercase tracking-widest">Área Territorial</p>
                  <p className="text-white mt-1 font-serif italic text-lg leading-none">{selectedProperty.area}</p>
                </div>

                <div className="bg-white/5 rounded-none p-4 border border-white/5">
                  <p className="text-[#D4AF37] font-semibold text-[9px] uppercase tracking-widest">Preço Estimado</p>
                  <p className="text-white mt-1 font-serif italic text-lg leading-none tracking-wide">{selectedProperty.priceRange}</p>
                </div>

                {selectedProperty.type === "residential" ? (
                  <>
                    <div className="bg-white/5 rounded-none p-4 border border-white/5">
                      <p className="text-[#D4AF37] font-semibold text-[9px] uppercase tracking-widest">Suítes / Dormitórios</p>
                      <p className="text-white mt-1 font-serif italic text-base leading-none">
                        {selectedProperty.bedrooms} dorms. ({selectedProperty.suites} suítes)
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-none p-4 border border-white/5">
                      <p className="text-[#D4AF37] font-semibold text-[9px] uppercase tracking-widest">Vagas de Garagem</p>
                      <p className="text-white mt-1 font-serif italic text-base leading-none">{selectedProperty.garageSpaces} vagas</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white/5 rounded-none p-4 border border-white/5">
                      <p className="text-[#D4AF37] font-semibold text-[9px] uppercase tracking-widest">Estilo Corporativo</p>
                      <p className="text-white mt-1 font-serif italic text-base leading-none">Laje Comercial AAA</p>
                    </div>

                    <div className="bg-white/5 rounded-none p-4 border border-white/5">
                      <p className="text-[#D4AF37] font-semibold text-[9px] uppercase tracking-widest">Certificações</p>
                      <p className="text-[#D4AF37] mt-1 font-serif italic text-base leading-none flex items-center gap-1">
                        LEED Gold <Sparkles className="h-4 w-4" />
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Complete Highlights List */}
              <div className="mt-8 border-t border-white/5 pt-6">
                <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-4">DIFERENCIAIS CONSTRUTIVOS</p>
                <div className="space-y-3">
                  {selectedProperty.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#F5F5F0]/70">
                      <CheckCircle2 className="h-4 w-4 text-[#D4AF37] mt-0.5 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom CTAs directly in high detail modal block */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onSelectPropertyForSimulation(selectedProperty.id);
                    setSelectedProperty(null);
                  }}
                  className="theme-btn-calc flex-1 rounded-none bg-transparent border border-[#D4AF37] py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
                >
                  Simular Financiamento
                </button>
                <button
                  onClick={() => {
                    onSelectPropertyForScheduling(selectedProperty.name);
                    setSelectedProperty(null);
                  }}
                  className="theme-btn-visit flex-1 rounded-none bg-[#D4AF37] py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-white hover:text-black transition-all duration-300 shadow-md"
                >
                  Agendar Visita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
