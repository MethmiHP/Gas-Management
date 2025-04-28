const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');

// Base routes
router
  .route('/')
  .get(productController.getAllProducts)
  .post(productController.createProduct);

// ID based routes
router
  .route('/:id')
  .get(productController.getProductById)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

// Specialized routes
router.patch('/:id/quantity', productController.updateQuantity);
router.patch('/:id/price', productController.updatePrice);
router.patch('/:id/image', productController.updateImageUrl);
router.get('/stats/inventory', productController.getInventoryStats);
router.get('/stats/low-inventory', productController.getLowInventory);

module.exports = router;