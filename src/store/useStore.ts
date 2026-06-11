import { create } from 'zustand';
import { Merchant, License, Price, Inspection, Review, Rectification, DashboardStats } from '../types';
import { merchants as initialMerchants, licenses as initialLicenses, prices as initialPrices, inspections as initialInspections, reviews as initialReviews, rectifications as initialRectifications, dashboardStats as initialStats } from '../data/mockData';

interface Store {
  merchants: Merchant[];
  licenses: License[];
  prices: Price[];
  inspections: Inspection[];
  reviews: Review[];
  rectifications: Rectification[];
  stats: DashboardStats;
  
  addMerchant: (merchant: Omit<Merchant, 'id'>) => void;
  updateMerchant: (id: string, data: Partial<Merchant>) => void;
  deleteMerchant: (id: string) => void;
  
  addLicense: (license: Omit<License, 'id'>) => void;
  updateLicense: (id: string, data: Partial<License>) => void;
  deleteLicense: (id: string) => void;
  
  addPrice: (price: Omit<Price, 'id'>) => void;
  updatePrice: (id: string, data: Partial<Price>) => void;
  
  addInspection: (inspection: Omit<Inspection, 'id'>) => void;
  
  updateReview: (id: string, data: Partial<Review>) => void;
  
  addRectification: (rectification: Omit<Rectification, 'id'>) => void;
  updateRectification: (id: string, data: Partial<Rectification>) => void;
}

const generateId = () => {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
};

export const useStore = create<Store>((set) => ({
  merchants: initialMerchants,
  licenses: initialLicenses,
  prices: initialPrices,
  inspections: initialInspections,
  reviews: initialReviews,
  rectifications: initialRectifications,
  stats: initialStats,
  
  addMerchant: (merchant) => set((state) => ({
    merchants: [...state.merchants, { ...merchant, id: generateId() }]
  })),
  
  updateMerchant: (id, data) => set((state) => ({
    merchants: state.merchants.map(m => m.id === id ? { ...m, ...data } : m)
  })),
  
  deleteMerchant: (id) => set((state) => ({
    merchants: state.merchants.filter(m => m.id !== id)
  })),
  
  addLicense: (license) => set((state) => ({
    licenses: [...state.licenses, { ...license, id: generateId() }]
  })),
  
  updateLicense: (id, data) => set((state) => ({
    licenses: state.licenses.map(l => l.id === id ? { ...l, ...data } : l)
  })),
  
  deleteLicense: (id) => set((state) => ({
    licenses: state.licenses.filter(l => l.id !== id)
  })),
  
  addPrice: (price) => set((state) => ({
    prices: [...state.prices, { ...price, id: generateId() }]
  })),
  
  updatePrice: (id, data) => set((state) => ({
    prices: state.prices.map(p => p.id === id ? { ...p, ...data } : p)
  })),
  
  addInspection: (inspection) => set((state) => ({
    inspections: [...state.inspections, { ...inspection, id: generateId() }]
  })),
  
  updateReview: (id, data) => set((state) => ({
    reviews: state.reviews.map(r => r.id === id ? { ...r, ...data } : r)
  })),
  
  addRectification: (rectification) => set((state) => ({
    rectifications: [...state.rectifications, { ...rectification, id: generateId() }]
  })),
  
  updateRectification: (id, data) => set((state) => ({
    rectifications: state.rectifications.map(r => r.id === id ? { ...r, ...data } : r)
  })),
}));