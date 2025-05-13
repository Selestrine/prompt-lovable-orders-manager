
import { Brand } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
  productCode: string;
  setProductCode: (code: string) => void;
  productModel: string;
  setProductModel: (model: string) => void;
  selectedBrandId: string;
  setSelectedBrandId: (brandId: string) => void;
  brands: Brand[];
}

export function ProductForm({
  productCode,
  setProductCode,
  productModel,
  setProductModel,
  selectedBrandId,
  setSelectedBrandId,
  brands,
}: ProductFormProps) {
  return (
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
  );
}
