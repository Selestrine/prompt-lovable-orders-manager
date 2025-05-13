
import { 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";

interface DeleteDialogProps {
  product: Product | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({ product, onCancel, onConfirm }: DeleteDialogProps) {
  if (!product) return null;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogDescription>
          Tem certeza que deseja excluir o produto "{product.model}"? Esta ação não pode ser desfeita.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Excluir
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
