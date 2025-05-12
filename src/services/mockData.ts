
import { Brand, Product, PurchaseRequest, RequestStatus, BrandWithRequests, StatusCounts } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Sample brands
const brands: Brand[] = [
  {
    id: "1",
    name: "Dell",
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "2",
    name: "HP",
    createdAt: new Date("2023-01-20"),
  },
  {
    id: "3",
    name: "Lenovo",
    createdAt: new Date("2023-02-05"),
  },
  {
    id: "4",
    name: "Apple",
    createdAt: new Date("2023-02-15"),
  },
  {
    id: "5",
    name: "Samsung",
    createdAt: new Date("2023-03-10"),
  },
];

// Sample products
const products: Product[] = [
  {
    id: "1",
    code: "DL001",
    model: "Inspiron 15",
    brandId: "1", // Dell
    createdAt: new Date("2023-03-15"),
  },
  {
    id: "2",
    code: "DL002",
    model: "XPS 13",
    brandId: "1", // Dell
    createdAt: new Date("2023-03-17"),
  },
  {
    id: "3",
    code: "HP001",
    model: "Pavilion 14",
    brandId: "2", // HP
    createdAt: new Date("2023-03-20"),
  },
  {
    id: "4",
    code: "HP002",
    model: "Elitebook 840",
    brandId: "2", // HP
    createdAt: new Date("2023-03-22"),
  },
  {
    id: "5",
    code: "LN001",
    model: "ThinkPad X1",
    brandId: "3", // Lenovo
    createdAt: new Date("2023-04-05"),
  },
  {
    id: "6",
    code: "AP001",
    model: "MacBook Pro 14",
    brandId: "4", // Apple
    createdAt: new Date("2023-04-10"),
  },
  {
    id: "7",
    code: "SM001",
    model: "Galaxy Book Pro",
    brandId: "5", // Samsung
    createdAt: new Date("2023-04-15"),
  },
];

// Sample purchase requests
const purchaseRequests: PurchaseRequest[] = [
  {
    id: "1",
    productId: "1", // Dell Inspiron
    requestDate: new Date("2023-05-10"),
    status: "pending",
    createdAt: new Date("2023-05-10"),
    updatedAt: new Date("2023-05-10"),
  },
  {
    id: "2",
    productId: "3", // HP Pavilion
    requestDate: new Date("2023-05-12"),
    status: "purchased",
    expectedDeliveryDate: new Date("2023-05-25"),
    supplier: "TechStore",
    quantity: 3,
    createdAt: new Date("2023-05-12"),
    updatedAt: new Date("2023-05-15"),
  },
  {
    id: "3",
    productId: "5", // Lenovo ThinkPad
    requestDate: new Date("2023-05-14"),
    status: "received",
    expectedDeliveryDate: new Date("2023-05-20"),
    supplier: "ComputerWorld",
    quantity: 2,
    createdAt: new Date("2023-05-14"),
    updatedAt: new Date("2023-05-22"),
  },
  {
    id: "4",
    productId: "6", // Apple MacBook
    requestDate: new Date("2023-05-16"),
    status: "canceled",
    cancellationReason: "Mudança nos requisitos do projeto",
    createdAt: new Date("2023-05-16"),
    updatedAt: new Date("2023-05-18"),
  },
  {
    id: "5",
    productId: "2", // Dell XPS
    requestDate: new Date("2023-05-17"),
    status: "pending",
    createdAt: new Date("2023-05-17"),
    updatedAt: new Date("2023-05-17"),
  },
  {
    id: "6",
    productId: "4", // HP Elitebook
    requestDate: new Date("2023-05-18"),
    status: "purchased",
    expectedDeliveryDate: new Date("2023-06-01"),
    supplier: "BusinessTech",
    quantity: 5,
    createdAt: new Date("2023-05-18"),
    updatedAt: new Date("2023-05-20"),
  },
  {
    id: "7",
    productId: "7", // Samsung Galaxy Book
    requestDate: new Date("2023-05-19"),
    status: "pending",
    createdAt: new Date("2023-05-19"),
    updatedAt: new Date("2023-05-19"),
  },
];

// Data service
export const mockDataService = {
  // Brand methods
  getBrands: (): Promise<Brand[]> => {
    return Promise.resolve([...brands]);
  },
  
  getBrandById: (id: string): Promise<Brand | undefined> => {
    return Promise.resolve(brands.find(brand => brand.id === id));
  },
  
  createBrand: (name: string): Promise<Brand> => {
    const newBrand: Brand = {
      id: uuidv4(),
      name,
      createdAt: new Date(),
    };
    brands.push(newBrand);
    return Promise.resolve(newBrand);
  },
  
  updateBrand: (id: string, name: string): Promise<Brand | undefined> => {
    const index = brands.findIndex(brand => brand.id === id);
    if (index !== -1) {
      brands[index] = { ...brands[index], name };
      return Promise.resolve(brands[index]);
    }
    return Promise.resolve(undefined);
  },
  
  deleteBrand: (id: string): Promise<boolean> => {
    const index = brands.findIndex(brand => brand.id === id);
    if (index !== -1) {
      brands.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },
  
  // Product methods
  getProducts: (): Promise<Product[]> => {
    return Promise.resolve(products.map(product => ({
      ...product,
      brand: brands.find(brand => brand.id === product.brandId)
    })));
  },
  
  getProductById: (id: string): Promise<Product | undefined> => {
    const product = products.find(product => product.id === id);
    if (product) {
      return Promise.resolve({
        ...product,
        brand: brands.find(brand => brand.id === product.brandId)
      });
    }
    return Promise.resolve(undefined);
  },
  
  getProductsByBrand: (brandId: string): Promise<Product[]> => {
    return Promise.resolve(
      products
        .filter(product => product.brandId === brandId)
        .map(product => ({
          ...product,
          brand: brands.find(brand => brand.id === product.brandId)
        }))
    );
  },
  
  createProduct: (code: string, model: string, brandId: string): Promise<Product> => {
    // Check for duplicate code
    const existingProduct = products.find(product => product.code === code);
    if (existingProduct) {
      return Promise.reject(new Error("O código do produto já existe"));
    }
    
    const newProduct: Product = {
      id: uuidv4(),
      code,
      model,
      brandId,
      createdAt: new Date()
    };
    products.push(newProduct);
    return Promise.resolve(newProduct);
  },
  
  updateProduct: (id: string, data: Partial<Product>): Promise<Product | undefined> => {
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
      // Check for duplicate code if code is being updated
      if (data.code && data.code !== products[index].code) {
        const existingProduct = products.find(product => product.code === data.code);
        if (existingProduct) {
          return Promise.reject(new Error("O código do produto já existe"));
        }
      }
      
      products[index] = { ...products[index], ...data };
      return Promise.resolve(products[index]);
    }
    return Promise.resolve(undefined);
  },
  
  deleteProduct: (id: string): Promise<boolean> => {
    const index = products.findIndex(product => product.id === id);
    if (index !== -1) {
      products.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },
  
  // Purchase request methods
  getPurchaseRequests: (): Promise<PurchaseRequest[]> => {
    return Promise.resolve(purchaseRequests.map(request => ({
      ...request,
      product: products.find(product => product.id === request.productId)
    })));
  },
  
  getPurchaseRequestById: (id: string): Promise<PurchaseRequest | undefined> => {
    const request = purchaseRequests.find(request => request.id === id);
    if (request) {
      return Promise.resolve({
        ...request,
        product: products.find(product => product.id === request.productId)
      });
    }
    return Promise.resolve(undefined);
  },
  
  getPurchaseRequestByStatus: (status: RequestStatus): Promise<PurchaseRequest[]> => {
    return Promise.resolve(
      purchaseRequests
        .filter(request => request.status === status)
        .map(request => ({
          ...request,
          product: products.find(product => product.id === request.productId)
        }))
    );
  },
  
  getPurchaseRequestsByBrand: (brandId: string): Promise<PurchaseRequest[]> => {
    return Promise.resolve(
      purchaseRequests
        .filter(request => {
          const product = products.find(p => p.id === request.productId);
          return product?.brandId === brandId;
        })
        .map(request => ({
          ...request,
          product: products.find(product => product.id === request.productId)
        }))
    );
  },
  
  createPurchaseRequest: (productId: string): Promise<PurchaseRequest | undefined> => {
    // Check if product exists
    const product = products.find(p => p.id === productId);
    if (!product) {
      return Promise.reject(new Error("O produto não foi encontrado"));
    }
    
    // Check for pending request for this product
    const pendingRequest = purchaseRequests.find(
      req => req.productId === productId && req.status === "pending"
    );
    if (pendingRequest) {
      return Promise.reject(new Error("Já existe uma solicitação pendente para este produto"));
    }
    
    const newRequest: PurchaseRequest = {
      id: uuidv4(),
      productId,
      requestDate: new Date(),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    purchaseRequests.push(newRequest);
    return Promise.resolve(newRequest);
  },
  
  updatePurchaseRequest: (id: string, data: Partial<PurchaseRequest>): Promise<PurchaseRequest | undefined> => {
    const index = purchaseRequests.findIndex(request => request.id === id);
    if (index !== -1) {
      const updatedRequest = {
        ...purchaseRequests[index],
        ...data,
        updatedAt: new Date()
      };
      purchaseRequests[index] = updatedRequest;
      return Promise.resolve(updatedRequest);
    }
    return Promise.resolve(undefined);
  },
  
  getStatusCounts: (): Promise<StatusCounts> => {
    const counts = {
      pending: 0,
      purchased: 0,
      received: 0,
      canceled: 0,
      total: 0
    };
    
    purchaseRequests.forEach(request => {
      counts[request.status]++;
      counts.total++;
    });
    
    return Promise.resolve(counts);
  },
  
  getBrandsWithPendingRequests: (): Promise<BrandWithRequests[]> => {
    return Promise.resolve(
      brands.map(brand => {
        const pendingRequests = purchaseRequests.filter(request => {
          const product = products.find(p => p.id === request.productId);
          return product?.brandId === brand.id && request.status === "pending";
        }).length;
        
        return {
          ...brand,
          pendingRequests
        };
      }).sort((a, b) => b.pendingRequests - a.pendingRequests)
    );
  },
  
  createRequestFromWhatsApp: (productCodeOrModel: string): Promise<{ success: boolean; message: string; request?: PurchaseRequest }> => {
    // Find product by code or model
    const product = products.find(
      p => p.code.toLowerCase() === productCodeOrModel.toLowerCase() || 
           p.model.toLowerCase() === productCodeOrModel.toLowerCase()
    );
    
    if (!product) {
      return Promise.resolve({
        success: false,
        message: `Produto não encontrado: ${productCodeOrModel}`
      });
    }
    
    // Check for pending request for this product
    const pendingRequest = purchaseRequests.find(
      req => req.productId === product.id && req.status === "pending"
    );
    
    if (pendingRequest) {
      return Promise.resolve({
        success: false,
        message: `Já existe uma solicitação pendente para o produto: ${product.code} - ${product.model}`
      });
    }
    
    // Create new request
    const newRequest: PurchaseRequest = {
      id: uuidv4(),
      productId: product.id,
      requestDate: new Date(),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    purchaseRequests.push(newRequest);
    
    return Promise.resolve({
      success: true,
      message: `Solicitação criada para o produto: ${product.code} - ${product.model}`,
      request: newRequest
    });
  }
};
