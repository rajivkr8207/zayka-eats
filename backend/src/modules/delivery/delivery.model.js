
import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema(
    {
        // Link to existing User account
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        // Basic Profile
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        profileImage: {
            type: String,
            default: "",
        },

        dateOfBirth: {
            type: Date,
            default: null,
        },

        gender: {
            type: String,
            enum: ["male", "female", "other", "prefer_not_to_say"],
            default: "prefer_not_to_say",
        },

        // Contact Details
        phone: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            lowercase: true,
            trim: true,
            default: "",
        },

        emergencyContactName: {
            type: String,
            default: "",
        },

        emergencyContactPhone: {
            type: String,
            default: "",
        },

        // Vehicle Details
        vehicleType: {
            type: String,
            enum: ["bike", "scooter", "cycle", "electric_bike", "other"],
            required: true,
        },

        vehicleNumber: {
            type: String,
            uppercase: true,
            trim: true,
            default: "",
        },

        vehicleModel: {
            type: String,
            default: "",
        },

        vehicleColor: {
            type: String,
            default: "",
        },

        licenseNumber: {
            type: String,
            default: "",
            select: false,
        },

        // Documents
        documents: {
            aadhaarDocument: {
                type: String,
                default: "",
                select: false,
            },

            drivingLicenseImage: {
                type: String,
                default: "",
                select: false,
            },

            vehicleRcImage: {
                type: String,
                default: "",
                select: false,
            },
        },

        // Verification
        verificationStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        rejectionReason: {
            type: String,
            default: "",
        },

        verifiedAt: {
            type: Date,
            default: null,
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // Availability
        isOnline: {
            type: Boolean,
            default: false,
        },

        isAvailable: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["offline", "online", "on_delivery", "inactive"],
            default: "offline",
        },

        currentOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },

        lastActiveAt: {
            type: Date,
            default: null,
        },

        // Live Location
        currentLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },

            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },

        // Performance
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        totalReviews: {
            type: Number,
            default: 0,
        },

        totalDeliveries: {
            type: Number,
            default: 0,
        },

        // Account Status
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
deliveryPartnerSchema.index({ currentLocation: "2dsphere" });
deliveryPartnerSchema.index({ status: 1, isAvailable: 1 });
deliveryPartnerSchema.index({ verificationStatus: 1 });
deliveryPartnerSchema.index({ vehicleNumber: 1 }, { sparse: true });

const DeliveryPartner = mongoose.model(
    "DeliveryPartner",
    deliveryPartnerSchema
);

export default DeliveryPartner;
