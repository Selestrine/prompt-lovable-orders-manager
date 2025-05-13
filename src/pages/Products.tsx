import { useState, useEffect } from "react";
import { mockDataService } from "@/services/mockData";
import { Brand, Product } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash, Plus, FileUp, FileDown } from "lucide-react";
import { toast } from "sonner";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [productCode, setProductCode] = useState("");
  const [productModel, setProductModel] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, brandsData] = await Promise.all([
        mockDataService.getProducts(),
        mockDataService.getBrands(),
      ]);
      setProducts(productsData);
      setBrands(brandsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar os dados");
    } finally {
      setLoading(false);
    }
  };
  
  const openCreateDialog = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setProductCode("");
    setProductModel("");
    setSelectedBrandId("");
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setProductCode(product.code);
    setProductModel(product.model);
    setSelectedBrandId(product.brandId);
    setIsDialogOpen(true);
  };
  
  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSubmit = async () => {
    if (!productCode.trim() || !productModel.trim() || !selectedBrandId) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }
    
    try {
      if (isEditing && currentProduct) {
        await mockDataService.updateProduct(currentProduct.id, {
          code: productCode,
          model: productModel,
          brandId: selectedBrandId,
        });
        toast.success("Produto atualizado com sucesso");
      } else {
        await mockDataService.createProduct(productCode, productModel, selectedBrandId);
        toast.success("Produto criado com sucesso");
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Erro ao salvar o produto");
    }
  };
  
  const handleDelete = async () => {
    if (!currentProduct) return;
    
    try {
      await mockDataService.deleteProduct(currentProduct.id);
      toast.success("Produto excluído com sucesso");
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir o produto");
    }
  };
  
  const handleExportTemplate = () => {
    // Create headers
    const headers = ["Código", "Modelo", "ID Marca"];
    
    // Get all brands for reference
    const brandsLookup: Record<string, string> = {};
    brands.forEach(brand => {
      brandsLookup[brand.id] = brand.name;
    });
    
    // Create rows with existing products data
    const rows = products.map(product => [
      product.code,
      product.model,
      product.brandId
    ]);
    
    // Create CSV content with tab separation for better spreadsheet import
    let csvContent = headers.join("\t") + "\n";
    
    // Add existing products
    rows.forEach(row => {
      csvContent += row.join("\t") + "\n";
    });
    
    // Create a blob and download it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importacao_produtos.csv");
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Modelo exportado com sucesso");
  };
  
  const handleImport = async () => {
    if (!importFile) {
      toast.error("Selecione um arquivo para importar");
      return;
    }
    
    // In a real application, we would process the file here
    // For this demo, we'll just show a success message
    toast.success("Arquivo de importação recebido");
    setIsImportDialogOpen(false);
  };
  
  return (
    <div>
      <PageHeader 
        title="Produtos" 
        description="Gerencie o catálogo de produtos"
        actionLabel="Novo Produto"
        onAction={openCreateDialog}
      />
      
      <div className="flex justify-end space-x-2 mb-4">
        <Button variant="outline" onClick={handleExportTemplate}>
          <FileDown size={18} className="mr-2" />
          Exportar Modelo
        </Button>
        <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
          <FileUp size={18} className="mr-2" />
          Importar
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">Carregando...</div>
      ) : products.length === 0 ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          description="Cadastre produtos para começar a gerenciar suas solicitações de compra."
          actionLabel="Novo Produto"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.code}</TableCell>
                  <TableCell>{product.model}</TableCell>
                  <TableCell>{product.brand?.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit size={18} className="text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(product)}
                      >
                        <Trash size={18} className="text-gray-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize os detalhes do produto."
                : "Preencha os detalhes para criar um novo produto."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Código
              </Label>
              <Input
                id="code"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="col-span-3"
                placeholder="Código do produto"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Modelo
              </Label>
              <Input
                id="model"
                value={productModel}
                onChange={(e) => setProductModel(e.target.value)}
                className="col-span-3"
                placeholder="Modelo do produto"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">
                Marca
              </Label>
              <Select
                value={selectedBrandId}
                onValueChange={setSelectedBrandId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
              Tem certeza que deseja excluir o produto "{currentProduct?.model}"? Esta ação não pode ser desfeita.
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
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
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
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImport}>Importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
