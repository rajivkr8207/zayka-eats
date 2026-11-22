import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
      minlength: [2, 'Dish name must be at least 2 characters'],
      maxlength: [120, 'Dish name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

const foodCategorySchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant reference is required'],
      index: true,
    },

    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: [true, 'Menu reference is required'],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Food category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [80, 'Category name cannot exceed 80 characters'],
    },

    slug: {
      type: String,
      lowercase: true,
      trim: true,
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

    items: {
      type: [foodItemSchema],
      default: [],
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

// Prevent duplicate category names in the same menu
foodCategorySchema.index({ menu: 1, name: 1 }, { unique: true });

foodCategorySchema.pre('save', async function (next) {
  if (this.isModified('name') || !this.slug) {
    const baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let candidateSlug = baseSlug;
    let count = 1;
    while (
      await mongoose.models.FoodCategory.findOne({
        menu: this.menu,
        slug: candidateSlug,
        _id: { $ne: this._id },
      })
    ) {
      candidateSlug = `${baseSlug}-${count++}`;
    }
    this.slug = candidateSlug;
  }
  if (typeof next === 'function') next();
});

const FoodCategory = mongoose.model('FoodCategory', foodCategorySchema);

export default FoodCategory;
