const express = require('express');
const { Note, Category } = require('../db');
const isAuthenticated = require('../middleware/auth');
const router = express.Router();

// Get notes by category ID or category name
router.get('/', async (req, res) => {
  try {
    const { category_id, category_name } = req.query;
    let notes = [];
    
    if (category_id) {
      notes = await Note.find({ category: category_id }).sort({ order: 1, title: 1 });
    } else if (category_name) {
      // First find the category by name
      const category = await Category.findOne({ name: category_name });
      
      if (!category) {
        return res.status(404).json({ status: 'error', message: 'Category not found' });
      }
      
      notes = await Note.find({ category: category._id }).sort({ order: 1, title: 1 });
    } else {
      return res.status(400).json({ status: 'error', message: 'Category ID or name required' });
    }
    
    // Transform to match expected format
    const formattedNotes = notes.map(note => ({
      id: note._id,
      title: note.title,
      content: note.content,
      order: note.order
    }));
    
    res.json({ status: 'success', notes: formattedNotes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ status: 'error', message: 'Error fetching notes' });
  }
});

// Add a new note (requires authentication)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { category_id, title, content } = req.body;
    
    if (!category_id || !title || !content) {
      return res.status(400).json({ status: 'error', message: 'Category ID, title and content are required' });
    }
    
    // Check if category exists
    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    
    const note = await Note.create({
      category: category_id,
      title,
      content
    });
    
    res.json({ 
      status: 'success', 
      note_id: note._id,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ status: 'error', message: 'Error adding note' });
  }
});

// Update notes order (requires authentication)
router.put('/reorder', isAuthenticated, async (req, res) => {
  try {
    const { orderedNotes, categoryId } = req.body;
    
    if (!orderedNotes || !Array.isArray(orderedNotes) || !categoryId) {
      return res.status(400).json({ status: 'error', message: 'Ordered notes array and category ID are required' });
    }
    
    // Update each note with its new order
    const updatePromises = orderedNotes.map((item, index) => {
      return Note.findByIdAndUpdate(item.id, { order: index });
    });
    
    await Promise.all(updatePromises);
    
    res.json({ status: 'success', message: 'Notes reordered successfully' });
  } catch (error) {
    console.error('Error reordering notes:', error);
    res.status(500).json({ status: 'error', message: 'Error reordering notes' });
  }
});

// Update a note (requires authentication)
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, content } = req.body;
    
    if (!noteId) {
      return res.status(400).json({ status: 'error', message: 'Invalid note ID' });
    }
    
    if (!title || !content) {
      return res.status(400).json({ status: 'error', message: 'Title and content are required' });
    }
    
    // Check if note exists and update it
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { 
        title, 
        content,
        updated_at: Date.now()
      },
      { new: true }
    );
    
    if (!updatedNote) {
      return res.status(404).json({ status: 'error', message: 'Note not found' });
    }
    
    // Verify the note was updated correctly
    const verifiedNote = await Note.findById(noteId);
    console.log('Note after update:', verifiedNote);
    
    res.json({ 
      status: 'success', 
      message: 'Note updated successfully',
      note: {
        id: verifiedNote._id,
        title: verifiedNote.title,
        content: verifiedNote.content
      }
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ status: 'error', message: 'Error updating note' });
  }
});

// Delete a note (requires authentication)
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const noteId = req.params.id;
    
    if (!noteId) {
      return res.status(400).json({ status: 'error', message: 'Invalid note ID' });
    }
    
    const deletedNote = await Note.findByIdAndDelete(noteId);
    
    if (!deletedNote) {
      return res.status(404).json({ status: 'error', message: 'Note not found' });
    }
    
    res.json({ 
      status: 'success', 
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ status: 'error', message: 'Error deleting note' });
  }
});

module.exports = router; 