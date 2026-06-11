export interface Property {
  id: string;
  name: string;
  city: string;
  address: string;
  type: "residential" | "commercial";
  status: "Lançamento" | "Em Obras" | "Pronto";
  description: string;
  priceRange: string;
  minPrice: number; // For calculator and sorting
  area: string;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  garageSpaces?: number;
  highlights: string[];
  imageUrl: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "cliente" | "administrador";
}

export interface Scheduling {
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
