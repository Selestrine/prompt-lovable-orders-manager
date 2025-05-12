
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { mockDataService } from "@/services/mockData";
import { toast } from "sonner";

export default function ApiEndpoint() {
  const [codeOrModel, setCodeOrModel] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const webhookUrl = window.location.origin + "/api/webhook";
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("URL copiada para a área de transferência");
  };
  
  const handleTest = async () => {
    if (!codeOrModel.trim()) {
      toast.error("Informe um código ou modelo de produto para testar");
      return;
    }
    
    try {
      const result = await mockDataService.createRequestFromWhatsApp(codeOrModel);
      setIsSuccess(result.success);
      setTestResult(result.message);
      
      if (result.success) {
        toast.success("Solicitação criada com sucesso");
      } else {
        toast.error("Não foi possível criar a solicitação");
      }
    } catch (error) {
      console.error("Error testing endpoint:", error);
      toast.error("Erro ao testar o endpoint");
      setIsSuccess(false);
      setTestResult("Erro interno ao processar a solicitação");
    }
  };
  
  return (
    <div>
      <PageHeader 
        title="API/Webhook" 
        description="Integração com Make (Integromat) para solicitações via WhatsApp"
      />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Endpoint de Integração</CardTitle>
            <CardDescription>
              Use este endpoint para receber solicitações de compra via Make
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  URL do Webhook
                </label>
                <div className="flex">
                  <Input value={webhookUrl} readOnly className="rounded-r-none" />
                  <Button 
                    onClick={handleCopyUrl} 
                    className="rounded-l-none"
                    variant="secondary"
                  >
                    Copiar
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Configure este URL no Make (Integromat) para enviar solicitações do WhatsApp
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Formato da Requisição
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-sm">
                  <pre className="text-gray-700">
{`POST ${webhookUrl}
Content-Type: application/json

{
  "productCodeOrModel": "DL001"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Testar Integração</CardTitle>
            <CardDescription>
              Simule uma solicitação vinda do WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="codeOrModel" className="text-sm font-medium text-gray-700 mb-1 block">
                  Código ou Modelo do Produto
                </label>
                <div className="flex">
                  <Input 
                    id="codeOrModel"
                    value={codeOrModel} 
                    onChange={(e) => setCodeOrModel(e.target.value)}
                    className="rounded-r-none"
                    placeholder="Ex: DL001 ou Inspiron 15"
                  />
                  <Button 
                    onClick={handleTest} 
                    className="rounded-l-none"
                  >
                    Testar
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Digite o código ou modelo do produto e clique em Testar
                </p>
              </div>
              
              {testResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  isSuccess ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}>
                  <h4 className="font-medium mb-1">
                    {isSuccess ? "Sucesso" : "Erro"}
                  </h4>
                  <p>{testResult}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Configurando a Integração com Make</CardTitle>
          <CardDescription>
            Passos para integrar este sistema com o WhatsApp via Make
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 list-decimal list-inside">
            <li className="text-gray-800">
              <span className="font-medium">Crie um novo cenário no Make</span>
              <p className="text-gray-600 pl-6 mt-1">
                Inicie um novo cenário com o gatilho "WhatsApp" para monitorar mensagens recebidas.
              </p>
            </li>
            <li className="text-gray-800">
              <span className="font-medium">Configure o módulo HTTP</span>
              <p className="text-gray-600 pl-6 mt-1">
                Adicione um módulo HTTP após o gatilho do WhatsApp e configure-o para enviar uma requisição POST para o URL do webhook acima.
              </p>
            </li>
            <li className="text-gray-800">
              <span className="font-medium">Mapeie os dados da mensagem</span>
              <p className="text-gray-600 pl-6 mt-1">
                No corpo da requisição, mapeie o texto da mensagem do WhatsApp para o campo "productCodeOrModel".
              </p>
            </li>
            <li className="text-gray-800">
              <span className="font-medium">Configure a resposta (opcional)</span>
              <p className="text-gray-600 pl-6 mt-1">
                Você pode adicionar um módulo de resposta do WhatsApp para informar o status da solicitação.
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
