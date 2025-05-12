
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
import { Check, FileText } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [reportType, setReportType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  
  const handleGenerateReport = () => {
    if (!reportType) {
      toast.error("Selecione um tipo de relatório");
      return;
    }
    
    // In a real application, we would generate a PDF here
    toast.success("Relatório gerado com sucesso");
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
            <Button onClick={handleGenerateReport} className="w-full">
              Gerar Relatório
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
                  toast.success("Relatório de Solicitações Pendentes gerado com sucesso");
                }}
              />
              
              <ReportCard 
                title="Compras Recentes" 
                description="Lista de produtos comprados nos últimos 30 dias"
                onClick={() => {
                  setReportType("purchased");
                  toast.success("Relatório de Compras Recentes gerado com sucesso");
                }}
              />
              
              <ReportCard 
                title="Entregas Previstas" 
                description="Lista de produtos com entrega prevista para os próximos 15 dias"
                onClick={() => {
                  setReportType("delivery-period");
                  toast.success("Relatório de Entregas Previstas gerado com sucesso");
                }}
              />
              
              <ReportCard 
                title="Análise por Marca" 
                description="Resumo estatístico das solicitações agrupadas por marca"
                onClick={() => {
                  setReportType("by-brand");
                  toast.success("Relatório de Análise por Marca gerado com sucesso");
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
          <Check size={18} className="text-gray-500" />
        </Button>
      </div>
    </div>
  );
}
