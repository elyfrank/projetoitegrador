import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { supplierFormSchema, productFormSchema, associationFormSchema, type SupplierFormData, type ProductFormData, type AssociationFormData } from "@/lib/validations";
import { formatCNPJ, formatPhone, validateCNPJ } from "@/lib/utils";
import { Truck, Package, Link, CheckCircle, XCircle, Save, Trash2 } from "lucide-react";
import type { Supplier, Product, SupplierProductAssociation } from "@shared/schema";

const categories = [
  { value: "electronics", label: "Eletrônicos" },
  { value: "food", label: "Alimentos" },
  { value: "clothing", label: "Vestuário" },
  { value: "home", label: "Casa e Jardim" },
  { value: "health", label: "Saúde e Beleza" },
  { value: "sports", label: "Esportes" },
  { value: "books", label: "Livros" },
  { value: "toys", label: "Brinquedos" },
  { value: "other", label: "Outro" }
];

function SupplierForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema.extend({
      cnpj: supplierFormSchema.shape.cnpj.refine(validateCNPJ, "CNPJ inválido")
    })),
    defaultValues: {
      companyName: "",
      cnpj: "",
      address: "",
      phone: "",
      email: "",
      contactPerson: "",
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: SupplierFormData) => {
      const response = await apiRequest("POST", "/api/suppliers", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Fornecedor cadastrado com sucesso!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
    },
    onError: (error: any) => {
      let errorMessage = "Erro ao cadastrar fornecedor";
      
      if (error.message) {
        // Remove códigos de status e formatação técnica da mensagem
        errorMessage = error.message
          .replace(/^\d+:\s*/, '') // Remove códigos como "400: "
          .replace(/^\{"message":"/, '') // Remove formatação JSON
          .replace(/"\}$/, '') // Remove fim da formatação JSON
          .replace(/400:\s*\{"message":"/, '') // Remove formato específico
          .replace(/"\}/, ''); // Remove fim do JSON
      }
      
      toast({
        title: "Erro!",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupplierFormData) => {
    createSupplierMutation.mutate(data);
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    form.setValue("cnpj", formatted);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    form.setValue("phone", formatted);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Cadastro de Fornecedor
        </CardTitle>
        <CardDescription>
          Adicione novos fornecedores ao sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Insira o nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="00.000.000/0000-00" 
                        {...field}
                        onChange={(e) => handleCNPJChange(e.target.value)}
                        maxLength={18}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 0000-0000" 
                        {...field}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Insira o endereço completo da empresa" 
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="exemplo@fornecedor.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato Principal *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do contato principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => form.reset()}
              >
                Limpar
              </Button>
              <Button 
                type="submit" 
                disabled={createSupplierMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {createSupplierMutation.isPending ? "Cadastrando..." : "Cadastrar Fornecedor"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ProductForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      barcode: "",
      description: "",
      quantity: 0,
      category: "",
      expirationDate: undefined,
      imageUrl: "",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Produto cadastrado com sucesso!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      let errorMessage = "Erro ao cadastrar produto";
      
      if (error.message) {
        // Remove códigos de status e formatação técnica da mensagem
        errorMessage = error.message
          .replace(/^\d+:\s*/, '') // Remove códigos como "400: "
          .replace(/^\{"message":"/, '') // Remove formatação JSON
          .replace(/"\}$/, '') // Remove fim da formatação JSON
          .replace(/400:\s*\{"message":"/, '') // Remove formato específico
          .replace(/"\}/, ''); // Remove fim do JSON
      }
      
      toast({
        title: "Erro!",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Cadastro de Produto
        </CardTitle>
        <CardDescription>
          Adicione novos produtos ao estoque
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Insira o nome do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Barras</FormLabel>
                    <FormControl>
                      <Input placeholder="Insira o código de barras" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva brevemente o produto" 
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade em Estoque</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Quantidade disponível" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Validade</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <Label>Imagem do Produto</Label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80">
                        <span>Carregar arquivo</span>
                        <input type="file" className="sr-only" accept="image/*" />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => form.reset()}
              >
                Limpar
              </Button>
              <Button 
                type="submit" 
                disabled={createProductMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {createProductMutation.isPending ? "Cadastrando..." : "Cadastrar Produto"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function AssociationForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: selectedProduct } = useQuery<Product>({
    queryKey: ["/api/products", selectedProductId],
    enabled: !!selectedProductId,
  });

  const { data: associations = [] } = useQuery<(SupplierProductAssociation & { supplier: Supplier })[]>({
    queryKey: ["/api/associations", "product", selectedProductId],
    enabled: !!selectedProductId,
  });

  const form = useForm<AssociationFormData>({
    resolver: zodResolver(associationFormSchema),
    defaultValues: {
      supplierId: 0,
      productId: 0,
    },
  });

  const createAssociationMutation = useMutation({
    mutationFn: async (data: AssociationFormData) => {
      const response = await apiRequest("POST", "/api/associations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Fornecedor associado com sucesso ao produto!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      form.setValue("supplierId", 0);
      queryClient.invalidateQueries({ queryKey: ["/api/associations", "product", selectedProductId] });
    },
    onError: (error: any) => {
      let errorMessage = "Erro ao associar fornecedor";
      
      if (error.message) {
        // Remove códigos de status e formatação técnica da mensagem
        errorMessage = error.message
          .replace(/^\d+:\s*/, '') // Remove códigos como "400: "
          .replace(/^\{"message":"/, '') // Remove formatação JSON
          .replace(/"\}$/, '') // Remove fim da formatação JSON
          .replace(/400:\s*\{"message":"/, '') // Remove formato específico
          .replace(/"\}/, ''); // Remove fim do JSON
      }
      
      toast({
        title: "Erro!",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deleteAssociationMutation = useMutation({
    mutationFn: async ({ supplierId, productId }: { supplierId: number; productId: number }) => {
      await apiRequest("DELETE", `/api/associations/${supplierId}/${productId}`);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Fornecedor desassociado com sucesso!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/associations", "product", selectedProductId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro!",
        description: error.message || "Erro ao desassociar fornecedor",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AssociationFormData) => {
    if (selectedProductId) {
      createAssociationMutation.mutate({
        ...data,
        productId: selectedProductId,
      });
    }
  };

  const handleDisassociate = (supplierId: number) => {
    if (selectedProductId) {
      deleteAssociationMutation.mutate({ supplierId, productId: selectedProductId });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Associação de Fornecedor a Produto
        </CardTitle>
        <CardDescription>
          Gerencie as associações entre fornecedores e produtos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Selection */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Selecionar Produto</h3>
          <Select onValueChange={(value) => setSelectedProductId(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Product Details */}
        {selectedProduct && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Detalhes do Produto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome do Produto:</p>
                <p className="font-medium">{selectedProduct.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Código de Barras:</p>
                <p className="font-medium">{selectedProduct.barcode || "N/A"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Descrição:</p>
                <p className="font-medium">{selectedProduct.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Association */}
        {selectedProductId && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Associar Fornecedor</h3>
            <div className="flex space-x-3">
              <div className="flex-1">
                <Select onValueChange={(value) => {
                  const supplierId = parseInt(value);
                  form.setValue("supplierId", supplierId);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.companyName} - {supplier.cnpj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="button" 
                disabled={createAssociationMutation.isPending}
                onClick={() => {
                  const formData = form.getValues();
                  
                  if (formData.supplierId && selectedProductId) {
                    createAssociationMutation.mutate({
                      supplierId: formData.supplierId,
                      productId: selectedProductId,
                    });
                  }
                }}
              >
                <Link className="h-4 w-4 mr-2" />
                Associar
              </Button>
            </div>
          </div>
        )}

        {/* Associated Suppliers */}
        {selectedProductId && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Fornecedores Associados</h3>
            <div className="bg-white border border-gray-200 rounded-md">
              {associations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhum fornecedor associado a este produto.
                </div>
              ) : (
                associations.map((association) => (
                  <div key={association.id} className="p-4 border-b border-gray-200 last:border-b-0 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{association.supplier.companyName}</p>
                      <p className="text-sm text-gray-600">{association.supplier.cnpj}</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDisassociate(association.supplierId)}
                      disabled={deleteAssociationMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Desassociar
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8" />
              <h1 className="text-xl font-semibold">Sistema de Controle de Estoque</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Sistema de Gestão</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="suppliers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Fornecedores
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="associations" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Associações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suppliers">
            <SupplierForm />
          </TabsContent>

          <TabsContent value="products">
            <ProductForm />
          </TabsContent>

          <TabsContent value="associations">
            <AssociationForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
