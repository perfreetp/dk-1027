export interface Merchant {
  id: string;
  name: string;
  category: string;
  address: string;
  contact: string;
  phone: string;
  status: 'operating' | 'closed' | 'suspended';
  contractStartDate: string;
  contractEndDate: string;
  rentAmount: number;
  rentStatus: 'paid' | 'overdue' | 'pending';
  starLevel: '1' | '2' | '3' | '4' | '5';
  isBlacklisted: boolean;
  businessHours: string;
  holidayStatus: 'open' | 'closed' | 'partial';
  createdAt: string;
}

export interface License {
  id: string;
  merchantId: string;
  merchantName: string;
  type: string;
  number: string;
  issueDate: string;
  expireDate: string;
  status: 'valid' | 'expiring' | 'expired';
  filePath?: string;
}

export interface Price {
  id: string;
  merchantId: string;
  merchantName: string;
  productName: string;
  originalPrice: number;
  currentPrice: number;
  unit: string;
  effectiveDate: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Inspection {
  id: string;
  merchantId: string;
  merchantName: string;
  type: 'food' | 'fire' | 'daily';
  inspectionDate: string;
  inspector: string;
  result: 'pass' | 'fail' | 'partial';
  issues: string[];
  nextInspectionDate?: string;
  photos?: string[];
}

export interface Review {
  id: string;
  merchantId: string;
  merchantName: string;
  type: 'review' | 'complaint';
  content: string;
  rating: number;
  reviewer: string;
  reviewDate: string;
  status: 'pending' | 'processed' | 'resolved';
  reply?: string;
}

export interface Rectification {
  id: string;
  merchantId: string;
  merchantName: string;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected';
  assignee: string;
  createdAt: string;
  completedAt?: string;
  remark?: string;
}

export interface DashboardStats {
  totalMerchants: number;
  operatingMerchants: number;
  averageRating: number;
  pendingRectifications: number;
  expiredLicenses: number;
  upcomingLicenseExpirations: number;
  pendingComplaints: number;
  revenueThisMonth: number;
}

export type MerchantStatus = 'all' | 'operating' | 'closed' | 'suspended';
export type SortOrder = 'asc' | 'desc';