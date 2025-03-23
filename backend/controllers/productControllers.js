const Product = require('../models/productModels');

// Get all products with optional filtering
exports.getAllProducts = async (req, res) => {
  try {
    const { type, gasType, size, capacity } = req.query;
    const filter = {};

    // Apply filters if provided
    if (type) filter.type = type;
    if (gasType) filter.gasType = gasType;
    if (size) filter.size = size;
    if (capacity) filter.capacity = capacity;

    const products = await Product.find(filter);
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true // Run validators on update
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update product quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Quantity is required'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    product.quantity = quantity;
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update cylinder capacity (Filled/Empty)
exports.updateCapacity = async (req, res) => {
  try {
    const { capacity } = req.body;
    
    if (!capacity) {
      return res.status(400).json({
        success: false,
        error: 'Capacity is required'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (product.type !== 'Gas Cylinder') {
      return res.status(400).json({
        success: false,
        error: 'Capacity can only be updated for gas cylinders'
      });
    }

    if (!['Filled', 'Empty'].includes(capacity)) {
      return res.status(400).json({
        success: false,
        error: 'Capacity must be either "Filled" or "Empty" for gas cylinders'
      });
    }

    product.capacity = capacity;
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get inventory statistics
exports.getInventoryStats = async (req, res) => {
  try {
    // Count by product type
    const typeStats = await Product.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }
    ]);

    // Count gas cylinders by gas type
    const gasTypeStats = await Product.aggregate([
      { $match: { type: 'Gas Cylinder' } },
      { $group: { _id: '$gasType', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }
    ]);

    // Count gas cylinders by capacity
    const capacityStats = await Product.aggregate([
      { $match: { type: 'Gas Cylinder' } },
      { $group: { _id: '$capacity', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }
    ]);

    // Count LPG cylinders by size
    const sizeStats = await Product.aggregate([
      { $match: { gasType: 'LPG' } },
      { $group: { _id: '$size', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byType: typeStats,
        byGasType: gasTypeStats,
        byCapacity: capacityStats,
        bySize: sizeStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};