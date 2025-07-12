import { 
  suppliers, 
  products, 
  supplierProductAssociations,
  users,
  type Supplier, 
  type Product, 
  type SupplierProductAssociation,
  type User,
  type InsertSupplier, 
  type InsertProduct, 
  type InsertSupplierProductAssociation,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods (legacy)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Supplier methods
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSupplierByCnpj(cnpj: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Association methods
  getSupplierProductAssociations(): Promise<(SupplierProductAssociation & { supplier: Supplier; product: Product })[]>;
  getAssociationsByProduct(productId: number): Promise<(SupplierProductAssociation & { supplier: Supplier })[]>;
  getAssociationsBySupplier(supplierId: number): Promise<(SupplierProductAssociation & { product: Product })[]>;
  createAssociation(association: InsertSupplierProductAssociation): Promise<SupplierProductAssociation>;
  deleteAssociation(supplierId: number, productId: number): Promise<boolean>;
  getAssociation(supplierId: number, productId: number): Promise<SupplierProductAssociation | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods (legacy)
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async getSupplierByCnpj(cnpj: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.cnpj, cnpj));
    return supplier || undefined;
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db
      .insert(suppliers)
      .values(insertSupplier)
      .returning();
    return supplier;
  }

  async updateSupplier(id: number, insertSupplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [supplier] = await db
      .update(suppliers)
      .set(insertSupplier)
      .where(eq(suppliers.id, id))
      .returning();
    return supplier || undefined;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.barcode, barcode));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: number, insertProduct: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(insertProduct)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Association methods
  async getSupplierProductAssociations(): Promise<(SupplierProductAssociation & { supplier: Supplier; product: Product })[]> {
    const results = await db
      .select({
        id: supplierProductAssociations.id,
        supplierId: supplierProductAssociations.supplierId,
        productId: supplierProductAssociations.productId,
        createdAt: supplierProductAssociations.createdAt,
        supplier: suppliers,
        product: products,
      })
      .from(supplierProductAssociations)
      .innerJoin(suppliers, eq(supplierProductAssociations.supplierId, suppliers.id))
      .innerJoin(products, eq(supplierProductAssociations.productId, products.id));
    
    return results as (SupplierProductAssociation & { supplier: Supplier; product: Product })[];
  }

  async getAssociationsByProduct(productId: number): Promise<(SupplierProductAssociation & { supplier: Supplier })[]> {
    const results = await db
      .select({
        id: supplierProductAssociations.id,
        supplierId: supplierProductAssociations.supplierId,
        productId: supplierProductAssociations.productId,
        createdAt: supplierProductAssociations.createdAt,
        supplier: suppliers,
      })
      .from(supplierProductAssociations)
      .innerJoin(suppliers, eq(supplierProductAssociations.supplierId, suppliers.id))
      .where(eq(supplierProductAssociations.productId, productId));
    
    return results as (SupplierProductAssociation & { supplier: Supplier })[];
  }

  async getAssociationsBySupplier(supplierId: number): Promise<(SupplierProductAssociation & { product: Product })[]> {
    const results = await db
      .select({
        id: supplierProductAssociations.id,
        supplierId: supplierProductAssociations.supplierId,
        productId: supplierProductAssociations.productId,
        createdAt: supplierProductAssociations.createdAt,
        product: products,
      })
      .from(supplierProductAssociations)
      .innerJoin(products, eq(supplierProductAssociations.productId, products.id))
      .where(eq(supplierProductAssociations.supplierId, supplierId));
    
    return results as (SupplierProductAssociation & { product: Product })[];
  }

  async createAssociation(insertAssociation: InsertSupplierProductAssociation): Promise<SupplierProductAssociation> {
    const [association] = await db
      .insert(supplierProductAssociations)
      .values(insertAssociation)
      .returning();
    return association;
  }

  async deleteAssociation(supplierId: number, productId: number): Promise<boolean> {
    const result = await db
      .delete(supplierProductAssociations)
      .where(
        and(
          eq(supplierProductAssociations.supplierId, supplierId),
          eq(supplierProductAssociations.productId, productId)
        )
      );
    return (result.rowCount ?? 0) > 0;
  }

  async getAssociation(supplierId: number, productId: number): Promise<SupplierProductAssociation | undefined> {
    const [association] = await db
      .select()
      .from(supplierProductAssociations)
      .where(
        and(
          eq(supplierProductAssociations.supplierId, supplierId),
          eq(supplierProductAssociations.productId, productId)
        )
      );
    return association || undefined;
  }
}

export const storage = new DatabaseStorage();
