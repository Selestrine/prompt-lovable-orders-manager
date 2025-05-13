
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ImportFormProps {
  onClose: () => void;
}

export function ImportForm({ onClose }: ImportFormProps) {
  const [importFile, setImportFile] = useState<File | null>(null);
  
  const handleImport = async () => {
    if (!importFile) {
      toast.error("Selecione um arquivo para importar");
      return;
    }
    
    // In a real application, we would process the file here
    // For this demo, we'll just show a success message
    toast.success("Arquivo de importação recebido");
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Importar Produtos</DialogTitle>
        <DialogDescription>
          Selecione um arquivo CSV para importar produtos em massa.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="import-file">Arquivo CSV</Label>
          <Input
            id="import-file"
            type="file"
            accept=".csv"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-gray-500">
            O arquivo deve seguir o modelo fornecido na opção "Exportar Modelo".
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleImport}>Importar</Button>
      </DialogFooter>
    </>
  );
}
