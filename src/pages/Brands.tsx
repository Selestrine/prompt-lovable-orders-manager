
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash, Plus } from "lucide-react";
import { mockDataService } from "@/services/mockData";
import { Brand } from "@/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Brands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    fetchBrands();
  }, []);
  
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await mockDataService.getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Erro ao carregar as marcas");
    } finally {
      setLoading(false);
    }
  };
  
  const openCreateDialog = () => {
    setIsEditing(false);
    setCurrentBrand(null);
    setBrandName("");
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (brand: Brand) => {
    setIsEditing(true);
    setCurrentBrand(brand);
    setBrandName(brand.name);
    setIsDialogOpen(true);
  };
  
  const openDeleteDialog = (brand: Brand) => {
    setCurrentBrand(brand);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSubmit = async () => {
    if (!brandName.trim()) {
      toast.error("O nome da marca é obrigatório");
      return;
    }
    
    try {
      if (isEditing && currentBrand) {
        await mockDataService.updateBrand(currentBrand.id, brandName);
        toast.success("Marca atualizada com sucesso");
      } else {
        await mockDataService.createBrand(brandName);
        toast.success("Marca criada com sucesso");
      }
      setIsDialogOpen(false);
      fetchBrands();
    } catch (error) {
      console.error("Error saving brand:", error);
      toast.error("Erro ao salvar a marca");
    }
  };
  
  const handleDelete = async () => {
    if (!currentBrand) return;
    
    try {
      await mockDataService.deleteBrand(currentBrand.id);
      toast.success("Marca excluída com sucesso");
      setIsDeleteDialogOpen(false);
      fetchBrands();
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("Erro ao excluir a marca");
    }
  };
  
  return (
    <div>
      <PageHeader 
        title="Marcas" 
        description="Gerencie as marcas dos produtos"
        actionLabel="Nova Marca"
        onAction={openCreateDialog}
      />
      
      {loading ? (
        <div className="flex justify-center p-8">Carregando...</div>
      ) : brands.length === 0 ? (
        <EmptyState
          title="Nenhuma marca cadastrada"
          description="Cadastre marcas para começar a gerenciar seus produtos."
          actionLabel="Nova Marca"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex flex-col justify-between p-6 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="mb-4">
                <h3 className="text-xl font-medium text-gray-900">{brand.name}</h3>
                <p className="text-sm text-gray-500">Criado em {brand.createdAt.toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="flex items-center justify-between">
                <Link to={`/brands/${brand.id}`}>
                  <Button variant="outline">Ver Produtos</Button>
                </Link>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(brand)}
                  >
                    <Edit size={18} className="text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(brand)}
                  >
                    <Trash size={18} className="text-gray-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Marca" : "Nova Marca"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize os detalhes da marca."
                : "Preencha os detalhes para criar uma nova marca."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="col-span-3"
                placeholder="Nome da marca"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a marca "{currentBrand?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
