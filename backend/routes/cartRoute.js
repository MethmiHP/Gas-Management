// // cartRoute.js
// const express = require('express');
// const router = express.Router();
// const cartController = require('../controllers/cartController');

// // Cart routes
// router.post('/carts', cartController.createCart);
// router.get('/carts/:cartId', cartController.getCart);
// router.post('/carts/:cartId/items', cartController.addItemToCart);
// router.put('/carts/:cartId/items/:cartItemId', cartController.updateCartItem);
// router.delete('/carts/:cartId/items/:cartItemId', cartController.removeCartItem);
// router.patch('/carts/:cartId/items/:cartItemId/quantity', cartController.updateItemQuantity);
// router.delete('/carts/:cartId', cartController.clearCart);
// router.get('/products', cartController.getAllProducts);
// router.patch('/carts/:cartId/abandon', cartController.markCartAbandoned);
// router.patch('/carts/:cartId/convert', cartController.markCartConverted);

// module.exports = router;


// cartRoute.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Cart routes
router.post('/carts', cartController.createCart);
router.get('/carts/:cartId', cartController.getCart);
router.post('/carts/:cartId/items', cartController.addItemToCart);
router.put('/carts/:cartId/items/:cartItemId', cartController.updateCartItem);
router.delete('/carts/:cartId/items/:cartItemId', cartController.removeCartItem);
router.patch('/carts/:cartId/items/:cartItemId/quantity', cartController.updateItemQuantity);
router.delete('/carts/:cartId', cartController.clearCart);
router.get('/products', cartController.getAllProducts);
router.patch('/carts/:cartId/abandon', cartController.markCartAbandoned);
router.patch('/carts/:cartId/convert', cartController.markCartConverted);

module.exports = router;