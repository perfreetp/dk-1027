import { create } from 'zustand';
import { Merchant, License, Price, Inspection, Review, Rectification, DashboardStats, BusinessData } from '../types';
import { merchants as initialMerchants, licenses as initialLicenses, prices as initialPrices, inspections as initialInspections, reviews as initialReviews, rectifications as initialRectifications, businessData as initialBusinessData } from '../data/mockData';

interface Store {
  merchants: Merchant[];
  licenses: License[];
  prices: Price[];
  inspections: Inspection[];
  reviews: Review[];
  rectifications: Rectification[];
  businessData: BusinessData[];
  
  addMerchant: (merchant: Omit<Merchant, 'id'>) => void;
  updateMerchant: (id: string, data: Partial<Merchant>) => void;
  deleteMerchant: (id: string) => void;
  
  addLicense: (license: Omit<License, 'id' | 'status'>) => void;
  updateLicense: (id: string, data: Partial<License>) => void;
  deleteLicense: (id: string) => void;
  updateLicenseStatuses: () => void;
  
  addPrice: (price: Omit<Price, 'id'>) => void;
  updatePrice: (id: string, data: Partial<Price>) => void;
  
  addInspection: (inspection: Omit<Inspection, 'id'>) => void;
  
  updateReview: (id: string, data: Partial<Review>) => void;
  
  addRectification: (rectification: Omit<Rectification, 'id'>) => void;
  updateRectification: (id: string, data: Partial<Rectification>) => void;
  createRectificationFromInspection: (inspectionId: string) => void;
  createRectificationFromComplaint: (reviewId: string) => void;
  
  addBusinessData: (data: Omit<BusinessData, 'id'>) => void;
  updateBusinessData: (id: string, data: Partial<BusinessData>) => void;
  getBusinessDataByMerchant: (merchantId: string) => BusinessData[];
  
  getStats: () => DashboardStats;
}

const generateId = () => {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
};

const calculateLicenseStatus = (expireDate: string): 'valid' | 'expiring' | 'expired' => {
  const today = new Date();
  const expire = new Date(expireDate);
  const diffTime = expire.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 60) return 'expiring';
  return 'valid';
};

export const useStore = create<Store>((set, get) => ({
  merchants: initialMerchants,
  licenses: initialLicenses.map(l => ({ ...l, status: calculateLicenseStatus(l.expireDate) })),
  prices: initialPrices,
  inspections: initialInspections,
  reviews: initialReviews,
  rectifications: initialRectifications,
  businessData: initialBusinessData,
  
  addMerchant: (merchant) => set((state) => ({
    merchants: [...state.merchants, { ...merchant, id: generateId() }]
  })),
  
  updateMerchant: (id, data) => set((state) => ({
    merchants: state.merchants.map(m => m.id === id ? { ...m, ...data } : m)
  })),
  
  deleteMerchant: (id) => set((state) => ({
    merchants: state.merchants.filter(m => m.id !== id),
    licenses: state.licenses.filter(l => l.merchantId !== id),
    prices: state.prices.filter(p => p.merchantId !== id),
    inspections: state.inspections.filter(i => i.merchantId !== id),
    reviews: state.reviews.filter(r => r.merchantId !== id),
    rectifications: state.rectifications.filter(r => r.merchantId !== id),
    businessData: state.businessData.filter(b => b.merchantId !== id),
  })),
  
  addLicense: (license) => {
    const status = calculateLicenseStatus(license.expireDate);
    set((state) => ({
      licenses: [...state.licenses, { ...license, id: generateId(), status }]
    }));
  },
  
  updateLicense: (id, data) => {
    const newData = { ...data };
    if (data.expireDate) {
      newData.status = calculateLicenseStatus(data.expireDate);
    }
    set((state) => ({
      licenses: state.licenses.map(l => l.id === id ? { ...l, ...newData } : l)
    }));
  },
  
  deleteLicense: (id) => set((state) => ({
    licenses: state.licenses.filter(l => l.id !== id)
  })),
  
  updateLicenseStatuses: () => set((state) => ({
    licenses: state.licenses.map(l => ({
      ...l,
      status: calculateLicenseStatus(l.expireDate)
    }))
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
  
  createRectificationFromInspection: (inspectionId) => {
    const state = get();
    const inspection = state.inspections.find(i => i.id === inspectionId);
    if (!inspection || inspection.issues.length === 0) return;
    
    const rectification: Omit<Rectification, 'id'> = {
      merchantId: inspection.merchantId,
      merchantName: inspection.merchantName,
      title: `${inspection.type === 'food' ? '食品' : inspection.type === 'fire' ? '消防' : '日常'}检查整改`,
      description: `检查日期: ${inspection.inspectionDate}\n发现问题:\n${inspection.issues.join('\n')}`,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      assignee: '',
      createdAt: new Date().toISOString().split('T')[0],
      sourceType: 'inspection',
      sourceId: inspectionId,
    };
    
    set((s) => ({
      rectifications: [...s.rectifications, { ...rectification, id: generateId() }]
    }));
  },
  
  createRectificationFromComplaint: (reviewId) => {
    const state = get();
    const review = state.reviews.find(r => r.id === reviewId);
    if (!review || review.type !== 'complaint') return;
    
    const rectification: Omit<Rectification, 'id'> = {
      merchantId: review.merchantId,
      merchantName: review.merchantName,
      title: `投诉处理: ${review.reviewer}`,
      description: `投诉内容: ${review.content}\n评分: ${review.rating}星`,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      assignee: '',
      createdAt: new Date().toISOString().split('T')[0],
      sourceType: 'complaint',
      sourceId: reviewId,
    };
    
    const newRectification = { ...rectification, id: generateId() };
    
    set((s) => ({
      rectifications: [...s.rectifications, newRectification],
      reviews: s.reviews.map(r => r.id === reviewId ? { ...r, rectificationId: newRectification.id } : r)
    }));
  },
  
  addBusinessData: (data) => set((state) => ({
    businessData: [...state.businessData, { ...data, id: generateId() }]
  })),
  
  updateBusinessData: (id, data) => set((state) => ({
    businessData: state.businessData.map(b => b.id === id ? { ...b, ...data } : b)
  })),
  
  getBusinessDataByMerchant: (merchantId) => {
    const state = get();
    return state.businessData.filter(b => b.merchantId === merchantId);
  },
  
  getStats: () => {
    const state = get();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthBusinessData = state.businessData.filter(b => b.month === currentMonth);
    
    return {
      totalMerchants: state.merchants.length,
      operatingMerchants: state.merchants.filter(m => m.status === 'operating').length,
      averageRating: state.reviews.length > 0 
        ? parseFloat((state.reviews.reduce((sum, r) => sum + r.rating, 0) / state.reviews.length).toFixed(1))
        : 0,
      pendingRectifications: state.rectifications.filter(r => r.status !== 'completed').length,
      expiredLicenses: state.licenses.filter(l => l.status === 'expired').length,
      upcomingLicenseExpirations: state.licenses.filter(l => l.status === 'expiring').length,
      pendingComplaints: state.reviews.filter(r => r.type === 'complaint' && r.status === 'pending').length,
      revenueThisMonth: thisMonthBusinessData.reduce((sum, b) => sum + b.revenue, 0),
    };
  },
}));
