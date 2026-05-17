const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({

  propertyId: {
    type:     mongoose.Schema.Types.ObjectId,
    required: true,
    index:    true,
  },

  name: {
    type:      String,
    required:  [true, 'Item name is required'],
    trim:      true,
  },

  description: {
    type:      String,
    maxlength: 500,
  },

  category: {
    type:    String,
    enum:    ['breakfast', 'lunch', 'dinner', 'beverages', 'desserts', 'snacks', 'specials'],
    required: true,
    index:   true,
  },

  price: {
    type:     Number,
    required: [true, 'Price is required'],
    min:      0,
  },

  isVegetarian: {
    type:    Boolean,
    default: false,
  },

  isVegan: {
    type:    Boolean,
    default: false,
  },

  allergens: [{
    type: String,
    enum: ['nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy'],
  }],

  preparationTime: {
    type:    Number, // minutes
    default: 15,
  },

  isAvailable: {
    type:    Boolean,
    default: true,
    index:   true,
  },

  image: {
    type: String, // Cloudinary URL
  },

  calories: {
    type: Number,
  },

}, { timestamps: true });

menuItemSchema.index({ propertyId: 1, category: 1, isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);