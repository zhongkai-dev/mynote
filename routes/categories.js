const express = require('express');
const { Category } = require('../db');
const isAuthenticated = require('../middleware/auth');
const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    
    // Transform to match expected format
    const formattedCategories = categories.map(category => ({
      id: category._id,
      name: category.name,
      order: category.order
    }));
    
    res.json({ status: 'success', categories: formattedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ status: 'error', message: 'Error fetching categories' });
  }
});

// Add a new category (requires authentication)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ status: 'error', message: 'Category name is required' });
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ status: 'error', message: 'Category with this name already exists' });
    }
    
    const category = await Category.create({ name });
    
    res.json({ 
      status: 'success', 
      category_id: category._id,
      name
    });
  } catch (error) {
    console.error('Error adding category:', error);
    
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ status: 'error', message: 'Category with this name already exists' });
    }
    
    res.status(500).json({ status: 'error', message: 'Error adding category' });
  }
});

// Update category order (requires authentication)
router.put('/reorder', isAuthenticated, async (req, res) => {
  try {
    const { orderedCategories } = req.body;
    
    if (!orderedCategories || !Array.isArray(orderedCategories)) {
      return res.status(400).json({ status: 'error', message: 'Ordered categories array is required' });
    }
    
    // Update each category with its new order
    const updatePromises = orderedCategories.map((item, index) => {
      return Category.findByIdAndUpdate(item.id, { order: index });
    });
    
    await Promise.all(updatePromises);
    
    res.json({ status: 'success', message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('Error reordering categories:', error);
    res.status(500).json({ status: 'error', message: 'Error reordering categories' });
  }
});

// Delete a category (requires authentication)
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    if (!categoryId) {
      return res.status(400).json({ status: 'error', message: 'Invalid category ID' });
    }
    
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    
    if (!deletedCategory) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    
    res.json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ status: 'error', message: 'Error deleting category' });
  }
});

// Update a category (requires authentication)
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({ status: 'error', message: 'Invalid category ID' });
    }
    
    if (!name) {
      return res.status(400).json({ status: 'error', message: 'Category name is required' });
    }
    
    // Check if category with this name already exists (except current one)
    const existingCategory = await Category.findOne({ name, _id: { $ne: categoryId } });
    if (existingCategory) {
      return res.status(400).json({ status: 'error', message: 'Category with this name already exists' });
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name },
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    
    res.json({ 
      status: 'success', 
      message: 'Category updated successfully',
      category: {
        id: updatedCategory._id,
        name: updatedCategory.name,
        order: updatedCategory.order
      }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ status: 'error', message: 'Category with this name already exists' });
    }
    
    res.status(500).json({ status: 'error', message: 'Error updating category' });
  }
});

module.exports = router; 