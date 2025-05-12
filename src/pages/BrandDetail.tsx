
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { mockDataService } from "@/services/mockData";
import { Brand, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

export default function BrandDetail() {
  const { id } = useParams<{ id: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      fetchBrandDetails(id);
    }
  }, [id]);
  
  const fetchBrandDetails = async (brandId: string) => {
    setLoading(true);
    try {
      const brandData = await mockDataService.getBrandById(brandId);
      if (brandData) {
        setBrand(brandData);
        const productsData = await mockDataService.getProductsByBrand(brandId);
        setProducts(productsData);
      } else {
        toast.error("Marca não encontrada");
      }
    } catch (error) {
      console.error("Error fetching brand details:", error);
      toast.error("Erro ao carregar os detalhes da marca");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateRequest = async (productId: string) => {
    try {
      await mockDataService.createPurchaseRequest(productId);
      toast.success("Solicitação criada com sucesso");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar a solicitação");
    }
  };
  
  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }
  
  if (!brand) {
    return <div className="p-8">Marca não encontrada</div>;
  }
  
  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6">
        <Link to="/brands">
          <Button variant="ghost" className="pl-0 mb-2">
            <ArrowLeft size={18} className="mr-2" /> Voltar para marcas
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
        <p className="text-gray-600">Produtos e solicitações</p>
      </div>
      
      {products.length === 0 ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          description={`Esta marca não possui produtos cadastrados.`}
          actionLabel="Gerenciar Produtos"
          onAction={() => {
            window.location.href = "/products";
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onCreateRequest={handleCreateRequest} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onCreateRequest: (productId: string) => void;
}

function ProductCard({ product, onCreateRequest }: ProductCardProps) {
  const [pendingRequest, setPendingRequest] = useState(false);
  
  useEffect(() => {
    const checkPendingRequests = async () => {
      try {
        const requests = await mockDataService.getPurchaseRequests();
        const hasPending = requests.some(req => 
          req.productId === product.id && req.status === "pending"
        );
        setPendingRequest(hasPending);
      } catch (error) {
        console.error("Error checking pending requests:", error);
      }
    };
    
    checkPendingRequests();
  }, [product.id]);
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">{product.model}</h3>
          <div className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
            {product.code}
          </div>
        </div>
      </div>
      
      {pendingRequest ? (
        <div className="flex justify-between items-center mt-4">
          <StatusBadge status="pending" />
          <span className="text-sm text-gray-500">Solicitação em andamento</span>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onCreateRequest(product.id)}
        >
          Solicitar Compra
        </Button>
      )}
    </div>
  );
}
