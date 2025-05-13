
import { useState, useEffect } from "react";
import { mockDataService } from "@/services/mockData";
import { Brand, Product } from "@/types";
import { toast } from "sonner";

export function useProducts() {
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

  return {
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
  };
}
