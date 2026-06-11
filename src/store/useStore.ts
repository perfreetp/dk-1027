import { create } from 'zustand';
import { Merchant, License, Price, Inspection, Review, Rectification, DashboardStats, BusinessData } from '../types';

const STORAGE_KEY = 'westlake-merchant-platform-data';

interface StoredData {
  merchants: Merchant[];
  licenses: License[];
  prices: Price[];
  inspections: Inspection[];
  reviews: Review[];
  rectifications: Rectification[];
  businessData: BusinessData[];
}

const loadFromStorage = (): StoredData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data from localStorage:', e);
  }
  return null;
};

const saveToStorage = (data: StoredData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data to localStorage:', e);
  }
};

const getInitialData = (): StoredData => {
  const stored = loadFromStorage();
  if (stored) {
    return {
      ...stored,
      licenses: stored.licenses.map(l => ({ ...l, status: calculateLicenseStatus(l.expireDate) })),
    };
  }
  return {
    merchants: [],
    licenses: [],
    prices: [],
    inspections: [],
    reviews: [],
    rectifications: [],
    businessData: [],
  };
};

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
  deletePrice: (id: string) => void;
  
  addInspection: (inspection: Omit<Inspection, 'id'>) => void;
  deleteInspection: (id: string) => void;
  
  addReview: (review: Omit<Review, 'id'>) => void;
  updateReview: (id: string, data: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  
  addRectification: (rectification: Omit<Rectification, 'id'>) => void;
  updateRectification: (id: string, data: Partial<Rectification>) => void;
  deleteRectification: (id: string) => void;
  createRectificationFromInspection: (inspectionId: string) => void;
  createRectificationFromComplaint: (reviewId: string) => void;
  
  addBusinessData: (data: Omit<BusinessData, 'id'>) => void;
  updateBusinessData: (id: string, data: Partial<BusinessData>) => void;
  deleteBusinessData: (id: string) => void;
  getBusinessDataByMerchant: (merchantId: string) => BusinessData[];
  
  getStats: () => DashboardStats;
  clearAllData: () => void;
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

const initialData = getInitialData();

export const useStore = create<Store>((set, get) => ({
  merchants: initialData.merchants,
  licenses: initialData.licenses,
  prices: initialData.prices,
  inspections: initialData.inspections,
  reviews: initialData.reviews,
  rectifications: initialData.rectifications,
  businessData: initialData.businessData,
  
  addMerchant: (merchant) => {
    const newMerchant = { ...merchant, id: generateId() };
    set((state) => {
      const newState = {
        merchants: [...state.merchants, newMerchant],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  updateMerchant: (id, data) => set((state) => {
    const merchant = state.merchants.find(m => m.id === id);
    const oldName = merchant?.name;
    const newName = data.name;
    const nameChanged = newName && oldName !== newName;
    
    const newState = {
      merchants: state.merchants.map(m => m.id === id ? { ...m, ...data } : m),
    };
    
    if (nameChanged) {
      newState.licenses = state.licenses.map(l => 
        l.merchantId === id ? { ...l, merchantName: newName } : l
      );
      newState.prices = state.prices.map(p => 
        p.merchantId === id ? { ...p, merchantName: newName } : p
      );
      newState.inspections = state.inspections.map(i => 
        i.merchantId === id ? { ...i, merchantName: newName } : i
      );
      newState.reviews = state.reviews.map(r => 
        r.merchantId === id ? { ...r, merchantName: newName } : r
      );
      newState.rectifications = state.rectifications.map(r => 
        r.merchantId === id ? { ...r, merchantName: newName } : r
      );
      newState.businessData = state.businessData.map(b => 
        b.merchantId === id ? { ...b, merchantName: newName } : b
      );
    }
    
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
  deleteMerchant: (id) => set((state) => {
    const newState = {
      merchants: state.merchants.filter(m => m.id !== id),
      licenses: state.licenses.filter(l => l.merchantId !== id),
      prices: state.prices.filter(p => p.merchantId !== id),
      inspections: state.inspections.filter(i => i.merchantId !== id),
      reviews: state.reviews.filter(r => r.merchantId !== id),
      rectifications: state.rectifications.filter(r => r.merchantId !== id),
      businessData: state.businessData.filter(b => b.merchantId !== id),
    };
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
  addLicense: (license) => {
    const status = calculateLicenseStatus(license.expireDate);
    const newLicense = { ...license, id: generateId(), status };
    set((state) => {
      const newState = {
        licenses: [...state.licenses, newLicense],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  updateLicense: (id, data) => {
    const newData = { ...data };
    if (data.expireDate) {
      newData.status = calculateLicenseStatus(data.expireDate);
    }
    set((state) => {
      const newState = {
        licenses: state.licenses.map(l => l.id === id ? { ...l, ...newData } : l),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  deleteLicense: (id) => set((state) => {
    const newState = {
      licenses: state.licenses.filter(l => l.id !== id),
    };
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
  updateLicenseStatuses: () => set((state) => {
    const newState = {
      licenses: state.licenses.map(l => ({
        ...l,
        status: calculateLicenseStatus(l.expireDate)
      })),
    };
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
  addPrice: (price) => {
    const newPrice = { ...price, id: generateId() };
    set((state) => {
      const newState = {
        prices: [...state.prices, newPrice],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  updatePrice: (id, data) => set((state) => {
    const newState = {
      prices: state.prices.map(p => p.id === id ? { ...p, ...data } : p),
    };
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
  deletePrice: (id) => set((state) => {
    const newState = {
      prices: state.prices.filter(p => p.id !== id),
    };
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
  addInspection: (inspection) => {
    const newInspection = { ...inspection, id: generateId() };
    set((state) => {
      const newState = {
        inspections: [...state.inspections, newInspection],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  deleteInspection: (id) => set((state) => {
    const newState = {
      inspections: state.inspections.filter(i => i.id !== id),
    };
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
  addReview: (review) => {
    const newReview = { ...review, id: generateId() };
    set((state) => {
      const newState = {
        reviews: [...state.reviews, newReview],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  updateReview: (id, data) => set((state) => {
    const newState = {
      reviews: state.reviews.map(r => r.id === id ? { ...r, ...data } : r),
    };
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
  deleteReview: (id) => set((state) => {
    const newState = {
      reviews: state.reviews.filter(r => r.id !== id),
    };
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
  addRectification: (rectification) => {
    const newRectification = { ...rectification, id: generateId() };
    set((state) => {
      const newState = {
        rectifications: [...state.rectifications, newRectification],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  updateRectification: (id, data) => set((state) => {
    const newState = {
      rectifications: state.rectifications.map(r => r.id === id ? { ...r, ...data } : r),
    };
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
  deleteRectification: (id) => set((state) => {
    const newState = {
      rectifications: state.rectifications.filter(r => r.id !== id),
    };
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
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
    
    const newRectification = { ...rectification, id: generateId() };
    set((s) => {
      const newState = {
        rectifications: [...s.rectifications, newRectification],
      };
      saveToStorage({ ...s, ...newState });
      return newState;
    });
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
    
    set((s) => {
      const newState = {
        rectifications: [...s.rectifications, newRectification],
        reviews: s.reviews.map(r => r.id === reviewId ? { ...r, rectificationId: newRectification.id } : r),
      };
      saveToStorage({ ...s, ...newState });
      return newState;
    });
  },
  
  addBusinessData: (data) => {
    const newData = { ...data, id: generateId() };
    set((state) => {
      const newState = {
        businessData: [...state.businessData, newData],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  updateBusinessData: (id, data) => set((state) => {
    const newState = {
      businessData: state.businessData.map(b => b.id === id ? { ...b, ...data } : b),
    };
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
  deleteBusinessData: (id) => set((state) => {
    const newState = {
      businessData: state.businessData.filter(b => b.id !== id),
    };
    saveToStorage({ ...state, ...newState });
    return newState;
  }),
  
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
  
  clearAllData: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      merchants: [],
      licenses: [],
      prices: [],
      inspections: [],
      reviews: [],
      rectifications: [],
      businessData: [],
    });
  },
}));