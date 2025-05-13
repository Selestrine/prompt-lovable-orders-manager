import { useState, useEffect } from "react";
import { mockDataService } from "@/services/mockData";
import { PurchaseRequest, RequestStatus, Brand } from "@/types";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FileText, Download, Pencil } from "lucide-react";
import { toast } from "sonner";
// Import jsPDF with the correct type
import jsPDF from "jspdf";
// Add a declaration for jsPDF-autotable
import "jspdf-autotable";
// Add a module declaration for jspdf-autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function Requests() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RequestStatus | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<PurchaseRequest | null>(null);
  
  // Form state
  const [status, setStatus] = useState<RequestStatus>('pending');
  const [supplier, setSupplier] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [alternativeProduct, setAlternativeProduct] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  
  useEffect(() => {
    fetchRequests();
    fetchBrands();
  }, []);
  
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await mockDataService.getPurchaseRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Erro ao carregar as solicitações");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBrands = async () => {
    try {
      const data = await mockDataService.getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };
  
  const openEditDialog = (request: PurchaseRequest) => {
    setCurrentRequest(request);
    setStatus(request.status);
    setSupplier(request.supplier || "");
    setQuantity(request.quantity?.toString() || "");
    setExpectedDeliveryDate(request.expectedDeliveryDate ? 
      formatDateForInput(request.expectedDeliveryDate) : "");
    setAlternativeProduct(request.alternativeProduct || "");
    setCancellationReason(request.cancellationReason || "");
    setIsDialogOpen(true);
  };
  
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  const handleSubmit = async () => {
    if (!currentRequest) return;
    
    // Validation based on selected status
    if (status === 'purchased') {
      if (!supplier.trim() || !quantity.trim() || !expectedDeliveryDate) {
        toast.error("Para o status Comprado, preencha o fornecedor, quantidade e previsão de entrega");
        return;
      }
    } else if (status === 'canceled' && !cancellationReason.trim()) {
      toast.error("Para o status Cancelado, informe o motivo");
      return;
    }
    
    const updateData: Partial<PurchaseRequest> = {
      status,
    };
    
    // Add fields based on status
    if (status === 'purchased') {
      updateData.supplier = supplier;
      updateData.quantity = parseInt(quantity);
      updateData.expectedDeliveryDate = new Date(expectedDeliveryDate);
      updateData.alternativeProduct = alternativeProduct || undefined;
    } else if (status === 'canceled') {
      updateData.cancellationReason = cancellationReason;
    }
    
    try {
      await mockDataService.updatePurchaseRequest(currentRequest.id, updateData);
      toast.success("Solicitação atualizada com sucesso");
      setIsDialogOpen(false);
      fetchRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Erro ao atualizar a solicitação");
    }
  };
  
  // Filter requests based on active tab and selected brand
  const filteredRequests = requests
    .filter(req => activeTab === 'all' || req.status === activeTab)
    .filter(req => selectedBrand === "all" || req.product?.brandId === selectedBrand);
  
  // Function to generate PDF of filtered requests
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Relatório de Solicitações", 14, 22);
    
    // Add filters info
    doc.setFontSize(12);
    const statusText = activeTab === 'all' ? 'Todos' : getStatusLabel(activeTab as RequestStatus);
    const brandText = selectedBrand === 'all' ? 'Todas' : 
      brands.find(b => b.id === selectedBrand)?.name || 'Desconhecida';
    
    doc.text(`Status: ${statusText}`, 14, 32);
    doc.text(`Marca: ${brandText}`, 14, 38);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 44);
    
    // Create the table data
    const tableColumn = ["Produto", "Marca", "Status", "Data Solicitação", "Fornecedor", "Previsão"];
    const tableRows: string[][] = [];
    
    filteredRequests.forEach(request => {
      const rowData = [
        request.product?.model || '',
        request.product?.brand?.name || '',
        getStatusLabel(request.status),
        request.requestDate.toLocaleDateString('pt-BR'),
        request.supplier || '-',
        request.expectedDeliveryDate ? 
          request.expectedDeliveryDate.toLocaleDateString('pt-BR') : '-'
      ];
      tableRows.push(rowData);
    });
    
    // @ts-ignore - jspdf-autotable adds this method to jsPDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [100, 100, 100],
        textColor: [255, 255, 255]
      }
    });
    
    const fileName = `solicitacoes_${statusText.toLowerCase()}_${brandText.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success("Relatório PDF gerado com sucesso!");
  };
  
  return (
    <div>
      <PageHeader 
        title="Solicitações de Compra" 
        description="Gerencie as solicitações de compra de produtos"
        actionLabel="Exportar PDF" 
        onAction={generatePDF}
      />
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            {brands.map(brand => (
              <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" className="w-full sm:w-auto" onClick={generatePDF}>
          <Download size={16} className="mr-2" /> Exportar Solicitações (PDF)
        </Button>
      </div>
      
      <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as RequestStatus | 'all')}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="purchased">Comprados</TabsTrigger>
          <TabsTrigger value="received">Recebidos</TabsTrigger>
          <TabsTrigger value="canceled">Cancelados</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center p-8">Carregando...</div>
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              title={`Nenhuma solicitação ${activeTab !== 'all' ? getStatusLabel(activeTab as RequestStatus).toLowerCase() : ''}`}
              description="Não há solicitações para exibir."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRequests.map((request) => (
                <RequestCard 
                  key={request.id} 
                  request={request} 
                  onEdit={() => openEditDialog(request)} 
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Solicitação</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da solicitação de compra.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as RequestStatus)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="purchased">Comprado</SelectItem>
                    <SelectItem value="received">Recebido</SelectItem>
                    <SelectItem value="canceled">Cancelado</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Conditional fields based on status */}
            {status === 'purchased' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier" className="text-right">
                    Fornecedor
                  </Label>
                  <Input
                    id="supplier"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="col-span-3"
                    placeholder="Nome do fornecedor"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantidade
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="col-span-3"
                    placeholder="Quantidade comprada"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deliveryDate" className="text-right">
                    Previsão
                  </Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alternative" className="text-right">
                    Alternativo
                  </Label>
                  <Input
                    id="alternative"
                    value={alternativeProduct}
                    onChange={(e) => setAlternativeProduct(e.target.value)}
                    className="col-span-3"
                    placeholder="Produto alternativo (opcional)"
                  />
                </div>
              </>
            )}
            
            {status === 'canceled' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Motivo
                </Label>
                <Textarea
                  id="reason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="col-span-3"
                  placeholder="Motivo do cancelamento"
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface RequestCardProps {
  request: PurchaseRequest;
  onEdit: () => void;
}

function RequestCard({ request, onEdit }: RequestCardProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {request.product?.model}
          </h3>
          <p className="text-sm text-gray-500">
            {request.product?.code} - {request.product?.brand?.name}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      
      <div className="mt-2 space-y-2 text-sm text-gray-600">
        <div>
          <span className="font-medium">Data da solicitação:</span>{" "}
          {request.requestDate.toLocaleDateString('pt-BR')}
        </div>
        
        {request.supplier && (
          <div>
            <span className="font-medium">Fornecedor:</span> {request.supplier}
          </div>
        )}
        
        {request.quantity && (
          <div>
            <span className="font-medium">Quantidade:</span> {request.quantity}
          </div>
        )}
        
        {request.expectedDeliveryDate && (
          <div>
            <span className="font-medium">Previsão de entrega:</span>{" "}
            {request.expectedDeliveryDate.toLocaleDateString('pt-BR')}
          </div>
        )}
        
        {request.alternativeProduct && (
          <div>
            <span className="font-medium">Produto alternativo:</span>{" "}
            {request.alternativeProduct}
          </div>
        )}
        
        {request.cancellationReason && (
          <div>
            <span className="font-medium">Motivo do cancelamento:</span>{" "}
            {request.cancellationReason}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
          <Pencil size={16} className="mr-2" /> Editar
        </Button>
      </div>
    </div>
  );
}

function getStatusLabel(status: RequestStatus): string {
  const labels = {
    pending: "Pendente",
    purchased: "Comprado",
    received: "Recebido",
    canceled: "Cancelado",
  };
  return labels[status];
}
