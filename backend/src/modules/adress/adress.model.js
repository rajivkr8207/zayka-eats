import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },

    fullName: {
      type: String,
      required: [true, 'Recipient full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [120, 'Full name cannot exceed 120 characters'],
    },

    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'],
    },

    alternatePhone: {
      type: String,
      default: '',
      trim: true,
    },

    addressLine1: {
      type: String,
      required: [true, 'Flat / House / Building details are required'],
      trim: true,
    },

    addressLine2: {
      type: String,
      default: '',
      trim: true,
    },

    landmark: {
      type: String,
      default: '',
      trim: true,
    },

    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },

    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },

    country: {
      type: String,
      default: 'India',
      trim: true,
    },

    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
    },

    formattedAddress: {
      type: String,
      default: '',
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    addressType: {
      type: String,
      enum: ['home', 'office', 'other'],
      default: 'home',
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

addressSchema.index({ location: '2dsphere' });
addressSchema.index({ user: 1, isDefault: 1 });

const Address = mongoose.model('Address', addressSchema);

export default Address;
