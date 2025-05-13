
import { Brand, Product } from "@/types";
import { 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./ProductForm";

interface ProductDialogProps {
  isEditing: boolean;
  productCode: string;
  setProductCode: (code: string) => void;
  productModel: string;
  setProductModel: (model: string) => void;
  selectedBrandId: string;
  setSelectedBrandId: (brandId: string) => void;
  brands: Brand[];
  onCancel: () => void;
  onSubmit: () => void;
}

export function ProductDialog({
  isEditing,
  productCode,
  setProductCode,
  productModel,
  setProductModel,
  selectedBrandId,
  setSelectedBrandId,
  brands,
  onCancel,
  onSubmit,
}: ProductDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Atualize os detalhes do produto."
            : "Preencha os detalhes para criar um novo produto."}
        </DialogDescription>
      </DialogHeader>
      <ProductForm
        productCode={productCode}
        setProductCode={setProductCode}
        productModel={productModel}
        setProductModel={setProductModel}
        selectedBrandId={selectedBrandId}
        setSelectedBrandId={setSelectedBrandId}
        brands={brands}
      />
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  );
}
