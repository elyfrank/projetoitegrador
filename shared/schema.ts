import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  cnpj: varchar("cnpj", { length: 18 }).notNull().unique(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 15 }).notNull(),
  email: text("email").notNull(),
  contactPerson: text("contact_person").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  barcode: varchar("barcode", { length: 50 }).unique(),
  description: text("description").notNull(),
  quantity: integer("quantity").default(0),
  category: text("category").notNull(),
  expirationDate: timestamp("expiration_date"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supplierProductAssociations = pgTable("supplier_product_associations", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  supplierProductAssociations: many(supplierProductAssociations),
}));

export const productsRelations = relations(products, ({ many }) => ({
  supplierProductAssociations: many(supplierProductAssociations),
}));

export const supplierProductAssociationsRelations = relations(supplierProductAssociations, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierProductAssociations.supplierId],
    references: [suppliers.id],
  }),
  product: one(products, {
    fields: [supplierProductAssociations.productId],
    references: [products.id],
  }),
}));

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierProductAssociationSchema = createInsertSchema(supplierProductAssociations).omit({
  id: true,
  createdAt: true,
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertSupplierProductAssociation = z.infer<typeof insertSupplierProductAssociationSchema>;
export type SupplierProductAssociation = typeof supplierProductAssociations.$inferSelect;

// Legacy users table (keeping for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
