
export type Brand = {
  id: string;
  name: string;
  createdAt: Date;
};

export type Product = {
  id: string;
  code: string;
  model: string;
  brandId: string;
  brand?: Brand;
  createdAt: Date;
};

export type RequestStatus = 'pending' | 'purchased' | 'received' | 'canceled';

export type PurchaseRequest = {
  id: string;
  productId: string;
  product?: Product;
  requestDate: Date;
  status: RequestStatus;
  
  // Fields for purchased status
  expectedDeliveryDate?: Date;
  supplier?: string;
  quantity?: number;
  alternativeProduct?: string;
  
  // Field for canceled status
  cancellationReason?: string;
  
  // History
  statusHistory?: StatusHistoryItem[];
  
  createdAt: Date;
  updatedAt: Date;
};

export type StatusHistoryItem = {
  status: RequestStatus;
  timestamp: Date;
  notes?: string;
};

export type StatusCounts = {
  pending: number;
  purchased: number;
  received: number;
  canceled: number;
  total: number;
};

export type BrandWithRequests = Brand & {
  pendingRequests: number;
};
