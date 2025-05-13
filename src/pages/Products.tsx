
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { FileUp, FileDown } from "lucide-react";
import { toast } from "sonner";

// Importar os componentes refatorados
import { ProductTable } from "@/components/products/ProductTable";
import { ProductDialog } from "@/components/products/ProductDialog";
import { DeleteDialog } from "@/components/products/DeleteDialog";
import { ImportForm } from "@/components/products/ImportForm";
import { useProducts } from "@/hooks/useProducts";
import { exportProductTemplate } from "@/utils/exportUtils";

export default function Products() {
  const {
    products,
    brands,
    loading,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    currentProduct,
    isEditing,
    productCode,
    setProductCode,
    productModel,
    setProductModel,
    selectedBrandId,
    setSelectedBrandId,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    handleSubmit,
    handleDelete
  } = useProducts();
  
  const handleExportTemplate = () => {
    if (exportProductTemplate(products)) {
      toast.success("Modelo exportado com sucesso");
    }
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
        <ProductTable
          products={products}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      )}
      
      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <ProductDialog
          isEditing={isEditing}
          productCode={productCode}
          setProductCode={setProductCode}
          productModel={productModel}
          setProductModel={setProductModel}
          selectedBrandId={selectedBrandId}
          setSelectedBrandId={setSelectedBrandId}
          brands={brands}
          onCancel={() => setIsDialogOpen(false)}
          onSubmit={handleSubmit}
        />
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DeleteDialog
          product={currentProduct}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        />
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <ImportForm onClose={() => setIsImportDialogOpen(false)} />
      </Dialog>
    </div>
  );
}
