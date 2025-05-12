
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { mockDataService } from "@/services/mockData";
import { BrandWithRequests, StatusCounts, PurchaseRequest } from "@/types";
import { PageHeader } from "@/components/PageHeader";

export default function Dashboard() {
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    pending: 0,
    purchased: 0,
    received: 0,
    canceled: 0,
    total: 0,
  });
  
  const [topBrands, setTopBrands] = useState<BrandWithRequests[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const counts = await mockDataService.getStatusCounts();
        const brands = await mockDataService.getBrandsWithPendingRequests();
        
        const requests = await mockDataService.getPurchaseRequests();
        const currentDate = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const upcoming = requests.filter(
          req => 
            req.status === "purchased" && 
            req.expectedDeliveryDate && 
            req.expectedDeliveryDate >= currentDate && 
            req.expectedDeliveryDate <= nextWeek
        );
        
        setStatusCounts(counts);
        setTopBrands(brands.slice(0, 5));
        setUpcomingDeliveries(upcoming);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral do status das solicitações de compra" />
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Pendentes"
          value={statusCounts.pending}
          status="pending"
          path="/requests?status=pending"
        />
        <StatusCard
          title="Comprados"
          value={statusCounts.purchased}
          status="purchased"
          path="/requests?status=purchased"
        />
        <StatusCard
          title="Recebidos"
          value={statusCounts.received}
          status="received"
          path="/requests?status=received"
        />
        <StatusCard
          title="Cancelados"
          value={statusCounts.canceled}
          status="canceled"
          path="/requests?status=canceled"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Brands with Pending Requests */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Principais Marcas</CardTitle>
            <CardDescription>Marcas com mais solicitações pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topBrands.map((brand) => (
                <Link 
                  to={`/brands/${brand.id}`} 
                  key={brand.id}
                  className="flex items-center justify-between p-3 transition-colors rounded-md hover:bg-gray-100"
                >
                  <span className="font-medium">{brand.name}</span>
                  <div className="flex items-center">
                    <span className="px-2 py-1 text-sm font-bold text-blue-600 bg-blue-100 rounded-full">
                      {brand.pendingRequests}
                    </span>
                  </div>
                </Link>
              ))}
              
              {topBrands.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma solicitação pendente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Upcoming Deliveries */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Entregas Previstas</CardTitle>
            <CardDescription>Produtos com entrega prevista para esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeliveries.map((request) => (
                <div key={request.id} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <h4 className="font-medium">{request.product?.model}</h4>
                      <p className="text-sm text-gray-500">{request.product?.code} - {request.product?.brand?.name}</p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1">
                      <StatusBadge status={request.status} />
                      {request.expectedDeliveryDate && (
                        <span className="text-sm text-gray-600">
                          Entrega: {request.expectedDeliveryDate.toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingDeliveries.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma entrega prevista para esta semana
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  value: number;
  status: string;
  path: string;
}

function StatusCard({ title, value, status, path }: StatusCardProps) {
  const statusColors: Record<string, string> = {
    pending: "bg-status-pending",
    purchased: "bg-status-purchased",
    received: "bg-status-received",
    canceled: "bg-status-canceled",
  };
  
  return (
    <Link to={path}>
      <Card className="transition-transform hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
            </div>
            <div className={`w-4 h-4 rounded-full ${statusColors[status]}`} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
