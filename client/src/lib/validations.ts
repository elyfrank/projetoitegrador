import { z } from "zod";

export const supplierFormSchema = z.object({
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  cnpj: z.string().min(18, "CNPJ deve ter 18 caracteres").max(18, "CNPJ deve ter 18 caracteres"),
  address: z.string().min(1, "Endereço é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido"),
  contactPerson: z.string().min(1, "Nome do contato é obrigatório"),
});

export const productFormSchema = z.object({
  name: z.string().min(1, "Nome do produto é obrigatório"),
  barcode: z.string().optional(),
  description: z.string().min(1, "Descrição é obrigatória"),
  quantity: z.number().min(0, "Quantidade deve ser maior ou igual a 0").optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  expirationDate: z.date().optional(),
  imageUrl: z.string().optional(),
});

export const associationFormSchema = z.object({
  supplierId: z.number().min(1, "Fornecedor é obrigatório"),
  productId: z.number().min(1, "Produto é obrigatório"),
});

export type SupplierFormData = z.infer<typeof supplierFormSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>;
export type AssociationFormData = z.infer<typeof associationFormSchema>;
