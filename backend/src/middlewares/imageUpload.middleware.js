import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/jpg',
  'application/pdf',
]);

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type '${file.mimetype}'. Only images (JPEG, PNG, WEBP, GIF) and PDF are allowed.`,
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

const uploadFields = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

export const receiveOptionalImage = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'Image file size exceeds the 5MB limit'));
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }

    req.file = req.files?.avatar?.[0] || req.files?.image?.[0] || req.file;
    next();
  });
};

export const receiveImage = (req, res, next) => {
  receiveOptionalImage(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) {
      return next(new ApiError(400, 'Profile image file is required (avatar or image)'));
    }
    next();
  });
};

const restaurantUploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

export const receiveRestaurantImages = (req, res, next) => {
  restaurantUploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'Image file size exceeds the 5MB limit'));
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }

    req.logoFile = req.files?.logo?.[0];
    req.coverFile = req.files?.coverImage?.[0];
    next();
  });
};

const deliveryUploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'aadhaarDocument', maxCount: 1 },
  { name: 'drivingLicenseImage', maxCount: 1 },
  { name: 'vehicleRcImage', maxCount: 1 },
]);

export const receiveDeliveryDocuments = (req, res, next) => {
  deliveryUploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'Document/Image file size exceeds the 5MB limit'));
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }

    req.profileImageFile = req.files?.profileImage?.[0];
    req.aadhaarFile = req.files?.aadhaarDocument?.[0];
    req.licenseFile = req.files?.drivingLicenseImage?.[0];
    req.rcFile = req.files?.vehicleRcImage?.[0];
    next();
  });
};

const reviewUploadArray = upload.array('images', 5);

export const receiveReviewImages = (req, res, next) => {
  reviewUploadArray(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'Review image file size exceeds the 5MB limit'));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new ApiError(400, 'Cannot upload more than 5 images per review'));
      }
      return next(new ApiError(400, `Upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }

    req.reviewFiles = req.files || [];
    next();
  });
};
