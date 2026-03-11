const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const validate = require("../../core/middleware/validateMiddleware");
const productValidation = require("../../core/validations/productValidation");

router.get(
  "/",
  validate(productValidation.branchQuery),
  productController.getAllProducts,
);
router.post(
  "/",
  validate(productValidation.createProduct),
  productController.createProduct,
);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.get("/:id/batches", productController.getProductBatches);
router.get(
  "/categories",
  validate(productValidation.branchQuery),
  productController.getAllCategories,
);
router.post("/categories", productController.createCategory);
router.get(
  "/notifications",
  validate(productValidation.branchQuery),
  productController.getDashboardNotifications,
);
router.get(
  "/movements",
  validate(productValidation.branchQuery),
  productController.getStockMovements,
);
router.post("/removal", productController.recordStockRemoval);

module.exports = router;
