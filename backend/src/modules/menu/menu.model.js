import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant reference is required'],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Menu name is required'],
      trim: true,
      minlength: [2, 'Menu name must be at least 2 characters'],
      maxlength: [80, 'Menu name cannot exceed 80 characters'],
    },

    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    image: {
      type: String,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Prevent duplicate menu names in the same restaurant
menuSchema.index({ restaurant: 1, name: 1 }, { unique: true });

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;
