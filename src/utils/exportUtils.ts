
import { Product } from "@/types";

export function exportProductTemplate(products: Product[]) {
  // Create rows with existing products data
  const rows = products.map(product => ({
    code: product.code,
    model: product.model,
    brandId: product.brandId
  }));
  
  // Create CSV content with proper column separation
  let csvContent = "Código\tModelo\tID Marca\n";
  
  // Add existing products
  rows.forEach(row => {
    csvContent += `${row.code}\t${row.model}\t${row.brandId}\n`;
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
  
  return true;
}
