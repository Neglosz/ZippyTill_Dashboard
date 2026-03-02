const { z } = require("zod");

const productSchema = {
  createProduct: z.object({
    body: z.object({
      branchId: z.string().uuid({ message: "Invalid Branch ID" }),
      productData: z.object({
        name: z.string().min(1, { message: "Product name is required" }),
        barcode: z.string().optional(),
        categoryId: z.string().uuid({ message: "Invalid Category ID" }).optional(),
        price: z.number().positive({ message: "Price must be positive" }),
        costPrice: z.number().nonnegative({ message: "Cost price must be non-negative" }).optional(),
        stockQty: z.number().nonnegative().optional(),
        unitType: z.string().optional(),
        isWeightable: z.boolean().optional(),
        lowStockThreshold: z.number().nonnegative().optional(),
      }),
    }),
  }),

  branchQuery: z.object({
    query: z.object({
      branchId: z.string().uuid({ message: "Invalid Branch ID" }),
    }),
  }),
};

module.exports = productSchema;
