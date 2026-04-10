
import React from 'react';

// --- Auth System ---
export type UserRole = 'admin' | 'moderator' | 'client';

// FIX: Add PdvAccessStatus type definition
export type PdvAccessStatus = 'pending' | 'authorized' | 'revoked' | 'none';

// Esta interface combina dados do supabase.auth.user com dados da sua tabela 'profiles'
export interface User {
  id: string; // from supabase.auth.user.id (UUID)
  email?: string; // from supabase.auth.user.email
  name: string;
  username?: string;
  role: UserRole;
  isPremium: boolean;
  hasBilling: boolean;
  avatarUrl?: string;
  photoURL?: string;
  // FIX: Added optional password property to satisfy type-checking for admin user update/create operations.
  password?: string;
  // FIX: Add pdvAccessStatus property to User interface
  pdvAccessStatus?: PdvAccessStatus;
  status?: 'active' | 'inactive';
  file?: File;
}

// --- Order System ---
export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image: string;
  customization?: {
    text?: string;
    image?: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  address: Address;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  createdAt: string;
}

// --- Notification System ---
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// --- Shared Interfaces ---
export interface Address {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    referencePoint?: string;
}

// --- Customer Interface ---
export interface Customer {
  id: string;
  userId: string; // ID do usuário que possui este cliente (agora uma string/UUID)
  fullName: string;
  cpf?: string;
  email?: string;
  phone: string;
  address?: Address;
  dob?: string; // Date of birth as string 'YYYY-MM-DD'
  avatarUrl?: string;
  photoURL?: string;
  status: 'Ativo' | 'Inativo';
  signupDate: string;
  file?: File;
}


// --- PDV System ---
export interface DashboardItem {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  hasMore?: boolean;
  isSpecial?: boolean;
  action?: string;
  to?: string;
}

export interface ServiceItem {
  icon: React.ElementType;
  title: string;
  description: string;
  link?: string;
}

// Interfaces para Categorias
export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

// Interfaces para Temas
export type ThemeCategory = 'MENINO' | 'MENINA' | 'UNISSEX' | string;

export interface Theme {
  id: string;
  name: string;
  category: ThemeCategory;
  imageUrl: string;
  type?: 'caderneta' | 'escolar' | 'caneca';
}


// Interfaces para o Portfólio
export interface PortfolioImage {
  id: string;
  url: string; // base64 or object URL for preview
  file?: File;
}

export interface PortfolioProduct {
  id: string;
  name: string;
  images: PortfolioImage[];
  description: string;
  originalPrice: number;
  promoPrice?: number;
  type: 'kit' | 'unique';
  categoryId?: string;
  subcategoryId?: string;
}

// Interface para o Carrinho
export interface CartItem {
  id: string; // product id + timestamp to be unique
  productId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: {
    text?: string;
    image?: string; // a preview or a flag
  }
}

// Interface para as Configurações da Home
export interface HomeSettings {
  hero: {
    imageUrl: string;
    title: string;
    subtitle: string;
  };
  categories: {
    id: string;
    name: string;
    icon: string;
    link: string;
  }[];
  differentials: {
    id: string;
    icon: string;
    title: string;
    description: string;
  }[];
  footer: {
    aboutText: string;
    siteLinks: { id: string; text: string; link: string; }[];
    serviceLinks: { id: string; text: string; link: string; }[];
    contact: {
      email: string;
      phone: string;
      whatsapp: string;
    };
  };
  mugThemesBanner?: {
    enabled: boolean;
    title: string;
    subtitle: string;
    buttonText: string;
    link: string;
    fullClickable: boolean;
  };
}

// Interface para as Configurações de Serviços
export interface ServiceSetting {
  id: string;
  icon: string;
  title: string;
  description: string;
  link: string;
}

// Interfaces para o Construtor de Currículo
export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  period: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface Course {
  id: string;
  name: string;
  institution: string;
  workload: string;
  conclusionYear: string;
}

export interface InformaticsData {
    hasInformatics: boolean;
    skills: {
        word: 'Nenhum' | 'Básico' | 'Avançado';
        excel: 'Nenhum' | 'Básico' | 'Avançado';
        powerpoint: 'Nenhum' | 'Básico' | 'Avançado';
        access: 'Nenhum' | 'Básico' | 'Avançado';
    };
    typing: 'Nenhum' | 'Básico' | 'Avançado';
    maintenance: boolean;
    isRecent: boolean;
    institution: string;
    conclusionYear: string;
}

export interface ResumeData {
  title: string;
  profile: {
    photo: string;
    name: string;
    dob: string;
    address: Address;
    birthPlace: string;
    email: string;
    phone: string;
    cnh: {
        category: 'Não possui' | 'A' | 'B' | 'AB' | 'C' | 'D' | 'E' | 'AC' | 'AD' | 'AE';
        ear: boolean;
    };
  };
  summary: string;
  experiences: Experience[];
  education: Education[];
  courses: Course[];
  informatics: InformaticsData;
  languages: Language[];
  template: 'modern' | 'classic' | 'creative' | 'creative-right' | 'modern-single' | 'classic-modern' | 'elegant' | 'sidebar';
  templateColor: string;
  fontSize: number;
  lineHeight: 'snug' | 'relaxed' | 'loose';
  alignment: 'left' | 'center' | 'right' | 'justify';
  fontTitle: string;
  fontBody: string;
  sectionSpacing: number;
}

export interface Suggestion {
  id: string;
  type: 'role' | 'school' | 'course' | 'company';
  text: string;
  state?: string;
  city?: string;
  count: number;
}

// --- Novas Interfaces para Configuração do Currículo ---

export interface Objective {
  id: string;
  category: string;
  text: string;
}

export interface TemplateOption {
    id: ResumeData['template'];
    name: string;
}

export interface LineHeightOption {
    id: ResumeData['lineHeight'];
    name: string;
}

export interface FontSizeOption {
    id: number;
    name: string;
}

export interface ResumeConfig {
    templates: TemplateOption[];
    colors: string[];
    lineHeights: LineHeightOption[];
    objectives: Objective[];
    fontSizes: FontSizeOption[];
    sectionSpacings: { id: number; name: string }[];
}

export interface ResumeRequest {
  id: string;
  userId?: string; // ID do usuário que solicitou (UUID) - opcional para convidados
  userName: string;
  userWhatsapp: string;
  status: 'pending' | 'authorized';
  requestedAt: string; // ISO string
  resumeData: ResumeData;
}

// --- Configuração de Impressora ---
export interface Printer {
  id: string;
  name: string;
  connectionType: 'usb' | 'network' | 'serial' | 'bluetooth';
  address: string; // Ex: COM3, 192.168.1.100, \\PC\EPSON
  isDefault: boolean;
}

export interface ThemeOrder {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  themeId: string;
  themeName: string;
  themeImageUrl: string;
  productType: 'caneca' | 'caderneta' | 'escolar';
  customizationDetails?: string;
  status: 'pending' | 'completed';
  createdAt: string;
}
