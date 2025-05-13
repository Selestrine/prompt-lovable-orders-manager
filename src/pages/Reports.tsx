
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { mockDataService } from "@/services/mockData";
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

export default function Reports() {
  const [reportType, setReportType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  const generateReportPDF = async () => {
    if (!reportType) {
      toast.error("Selecione um tipo de relatório");
      return;
    }
    
    try {
      setLoading(true);
      
      // Obter os dados para o relatório
      let requests = await mockDataService.getPurchaseRequests();
      let brands = await mockDataService.getBrands();
      let reportTitle = "";
      
      // Filtrar os dados com base no tipo de relatório
      switch(reportType) {
        case "pending":
          requests = requests.filter(req => req.status === "pending");
          reportTitle = "Solicitações Pendentes";
          break;
        case "purchased":
          requests = requests.filter(req => req.status === "purchased");
          reportTitle = "Produtos Comprados";
          break;
        case "received":
          requests = requests.filter(req => req.status === "received");
          reportTitle = "Itens Recebidos";
          break;
        case "canceled":
          requests = requests.filter(req => req.status === "canceled");
          reportTitle = "Solicitações Canceladas";
          break;
        case "by-brand":
          if (brandId) {
            requests = requests.filter(req => req.product?.brandId === brandId);
            const brand = brands.find(b => b.id === brandId);
            reportTitle = `Solicitações por Marca: ${brand?.name || 'Desconhecida'}`;
          } else {
            toast.error("Selecione uma marca");
            setLoading(false);
            return;
          }
          break;
        case "delivery-period":
          if (!startDate || !endDate) {
            toast.error("Informe o período de entrega");
            setLoading(false);
            return;
          }
          reportTitle = `Entregas entre ${new Date(startDate).toLocaleDateString('pt-BR')} e ${new Date(endDate).toLocaleDateString('pt-BR')}`;
          requests = requests.filter(req => {
            if (!req.expectedDeliveryDate) return false;
            const deliveryDate = req.expectedDeliveryDate;
            return deliveryDate >= new Date(startDate) && deliveryDate <= new Date(endDate);
          });
          break;
        case "request-period":
          if (!startDate || !endDate) {
            toast.error("Informe o período de solicitação");
            setLoading(false);
            return;
          }
          reportTitle = `Solicitações entre ${new Date(startDate).toLocaleDateString('pt-BR')} e ${new Date(endDate).toLocaleDateString('pt-BR')}`;
          requests = requests.filter(req => {
            const requestDate = req.requestDate;
            return requestDate >= new Date(startDate) && requestDate <= new Date(endDate);
          });
          break;
      }
      
      // Criar o PDF
      const doc = new jsPDF();
      
      // Adicionar cabeçalho
      doc.setFontSize(18);
      doc.text(reportTitle, 14, 22);
      
      // Adicionar data do relatório
      doc.setFontSize(12);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
      doc.text(`Total de itens: ${requests.length}`, 14, 38);
      
      // Criar a estrutura da tabela
      const tableColumn = ["Produto", "Marca", "Status", "Data Solicitação", "Fornecedor", "Previsão"];
      const tableRows: string[][] = [];
      
      // Adicionar dados à tabela
      requests.forEach(request => {
        const status = {
          pending: "Pendente",
          purchased: "Comprado",
          received: "Recebido",
          canceled: "Cancelado"
        }[request.status];
        
        const rowData = [
          request.product?.model || '-',
          request.product?.brand?.name || '-',
          status,
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
        startY: 45,
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
      
      // Se o relatório estiver vazio, mostrar mensagem
      if (requests.length === 0) {
        doc.text("Nenhum item encontrado para os filtros selecionados.", 14, 50);
      }
      
      // Salvar o PDF
      const fileName = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success("Relatório gerado com sucesso!");
      
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateReport = () => {
    generateReportPDF();
  };
  
  return (
    <div>
      <PageHeader 
        title="Relatórios" 
        description="Gere relatórios com base em diferentes filtros e critérios"
      />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Gerar Relatório</CardTitle>
            <CardDescription>
              Selecione os filtros e parâmetros para o relatório
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="pending">Solicitações Pendentes</SelectItem>
                    <SelectItem value="purchased">Produtos Comprados</SelectItem>
                    <SelectItem value="received">Itens Recebidos</SelectItem>
                    <SelectItem value="canceled">Cancelados</SelectItem>
                    <SelectItem value="by-brand">Por Marca</SelectItem>
                    <SelectItem value="delivery-period">Por Período de Entrega</SelectItem>
                    <SelectItem value="request-period">Por Período de Solicitação</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Conditional filters based on report type */}
            {(reportType === "by-brand") && (
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Select value={brandId} onValueChange={setBrandId}>
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Selecione uma marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">Dell</SelectItem>
                      <SelectItem value="2">HP</SelectItem>
                      <SelectItem value="3">Lenovo</SelectItem>
                      <SelectItem value="4">Apple</SelectItem>
                      <SelectItem value="5">Samsung</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {(reportType === "delivery-period" || reportType === "request-period") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Data Inicial</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Data Final</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleGenerateReport} 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Gerando..." : "Gerar Relatório"}
              {!loading && <Download size={16} className="ml-2" />}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
            <CardDescription>
              Selecione um dos relatórios predefinidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ReportCard 
                title="Solicitações Pendentes" 
                description="Lista todas as solicitações pendentes de compra"
                onClick={() => {
                  setReportType("pending");
                  generateReportPDF();
                }}
              />
              
              <ReportCard 
                title="Compras Recentes" 
                description="Lista de produtos comprados nos últimos 30 dias"
                onClick={() => {
                  setReportType("purchased");
                  generateReportPDF();
                }}
              />
              
              <ReportCard 
                title="Entregas Previstas" 
                description="Lista de produtos com entrega prevista para os próximos 15 dias"
                onClick={() => {
                  setReportType("delivery-period");
                  // Configurar datas para os próximos 15 dias
                  const today = new Date();
                  const futureDate = new Date();
                  futureDate.setDate(today.getDate() + 15);
                  setStartDate(today.toISOString().split('T')[0]);
                  setEndDate(futureDate.toISOString().split('T')[0]);
                  generateReportPDF();
                }}
              />
              
              <ReportCard 
                title="Análise por Marca" 
                description="Resumo estatístico das solicitações agrupadas por marca"
                onClick={() => {
                  setReportType("by-brand");
                  // Usamos a primeira marca como padrão
                  setBrandId("1");
                  generateReportPDF();
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ReportCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

function ReportCard({ title, description, onClick }: ReportCardProps) {
  return (
    <div 
      className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
      onClick={onClick}
    >
      <div className="mr-4 mt-1 text-blue-600">
        <FileText size={20} />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div>
        <Button variant="ghost" size="icon">
          <Download size={18} className="text-gray-500" />
        </Button>
      </div>
    </div>
  );
}
