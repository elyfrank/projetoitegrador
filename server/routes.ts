import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSupplierSchema, insertProductSchema, insertSupplierProductAssociationSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Supplier routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.getSupplier(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      
      // Check if CNPJ already exists
      const existingSupplier = await storage.getSupplierByCnpj(validatedData.cnpj);
      if (existingSupplier) {
        return res.status(400).json({ message: "Fornecedor com esse CNPJ já está cadastrado!" });
      }

      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      
      // Check if CNPJ already exists for another supplier
      if (validatedData.cnpj) {
        const existingSupplier = await storage.getSupplierByCnpj(validatedData.cnpj);
        if (existingSupplier && existingSupplier.id !== id) {
          return res.status(400).json({ message: "Fornecedor com esse CNPJ já está cadastrado!" });
        }
      }

      const supplier = await storage.updateSupplier(id, validatedData);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSupplier(id);
      if (!success) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", upload.single('image'), async (req, res) => {
    try {
      const productData = {
        ...req.body,
        quantity: req.body.quantity ? parseInt(req.body.quantity) : 0,
        expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : null,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null
      };

      const validatedData = insertProductSchema.parse(productData);
      
      // Check if barcode already exists
      if (validatedData.barcode) {
        const existingProduct = await storage.getProductByBarcode(validatedData.barcode);
        if (existingProduct) {
          return res.status(400).json({ message: "Produto com este código de barras já está cadastrado!" });
        }
      }

      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = {
        ...req.body,
        quantity: req.body.quantity ? parseInt(req.body.quantity) : undefined,
        expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : undefined,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
      };

      const validatedData = insertProductSchema.partial().parse(productData);
      
      // Check if barcode already exists for another product
      if (validatedData.barcode) {
        const existingProduct = await storage.getProductByBarcode(validatedData.barcode);
        if (existingProduct && existingProduct.id !== id) {
          return res.status(400).json({ message: "Produto com este código de barras já está cadastrado!" });
        }
      }

      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Association routes
  app.get("/api/associations", async (req, res) => {
    try {
      const associations = await storage.getSupplierProductAssociations();
      res.json(associations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch associations" });
    }
  });

  app.get("/api/associations/product/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const associations = await storage.getAssociationsByProduct(productId);
      res.json(associations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product associations" });
    }
  });

  app.get("/api/associations/supplier/:supplierId", async (req, res) => {
    try {
      const supplierId = parseInt(req.params.supplierId);
      const associations = await storage.getAssociationsBySupplier(supplierId);
      res.json(associations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier associations" });
    }
  });

  app.post("/api/associations", async (req, res) => {
    try {
      const validatedData = insertSupplierProductAssociationSchema.parse(req.body);
      
      // Check if association already exists
      const existingAssociation = await storage.getAssociation(validatedData.supplierId, validatedData.productId);
      if (existingAssociation) {
        return res.status(400).json({ message: "Fornecedor já está associado a este produto!" });
      }

      const association = await storage.createAssociation(validatedData);
      res.status(201).json(association);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create association" });
    }
  });

  app.delete("/api/associations/:supplierId/:productId", async (req, res) => {
    try {
      const supplierId = parseInt(req.params.supplierId);
      const productId = parseInt(req.params.productId);
      const success = await storage.deleteAssociation(supplierId, productId);
      if (!success) {
        return res.status(404).json({ message: "Association not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete association" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
