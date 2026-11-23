import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Config from '../../config/config.js';
import { ROLE_VALUES, ROLES } from '../../constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [120, 'Full name cannot exceed 120 characters'],
    },

    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9]+$/, 'Username can only contain lowercase letters and numbers'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },

    password: {
      type: String,
      required: function requiredPassword() {
        return this.provider === 'local';
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
      default: null,
    },

    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: undefined,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'],
    },

    avatar: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.CUSTOMER,
      index: true,
    },

    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
      index: true,
    },

    googleId: {
      type: String,
      trim: true,
      default: null,
    },

    otp: {
      type: String,
      select: false,
      default: null,
    },

    otpExpire: {
      type: Date,
      select: false,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, result) => {
        delete result.password;
        delete result.otp;
        delete result.otpExpire;
        delete result.passwordResetToken;
        delete result.passwordResetExpires;
        return result;
      },
    },
  },
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (typeof next === 'function') next();
});

userSchema.methods.comparePassword = async function comparePassword(password) {
  if (!password || !this.password) {
    return false;
  }
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function generateAccessToken() {
  return jwt.sign(
    {
      _id: this._id.toString(),
      id: this._id.toString(),
      role: this.role,
      email: this.email,
    },
    Config.jwt_access_secret,
    {
      expiresIn: Config.jwt_access_expires_in || '15m',
    },
  );
};

userSchema.methods.generateRefreshToken = function generateRefreshToken() {
  return jwt.sign(
    {
      _id: this._id.toString(),
      id: this._id.toString(),
      role: this.role,
    },
    Config.jwt_refresh_secret,
    {
      expiresIn: Config.jwt_refresh_expires_in || '7d',
    },
  );
};

const User = mongoose.model('User', userSchema);

export default User;
