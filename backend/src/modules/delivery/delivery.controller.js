import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  registerDeliveryPartner,
  getMyDeliveryProfile,
  getDeliveryPartnerById,
  updateDeliveryPartnerProfile,
  toggleOnlineStatus,
  updateLiveLocation,
  findNearbyAvailableRiders,
  acceptDeliveryTask,
  completeDeliveryTask,
  reviewDeliveryPartnerApplication,
  listDeliveryPartners,
} from './delivery.service.js';

// ─────────────────────────────────────────────
// POST /api/v1/delivery/register (Protected)
// ─────────────────────────────────────────────
export const registerDeliveryPartnerController = asyncHandler(async (req, res) => {
  const deliveryPartner = await registerDeliveryPartner({
    user: req.user,
    partnerData: req.body,
    profileImageFile: req.profileImageFile,
    aadhaarFile: req.aadhaarFile,
    licenseFile: req.licenseFile,
    rcFile: req.rcFile,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { deliveryPartner },
        'Delivery partner onboarding application submitted successfully. Awaiting verification.',
      ),
    );
});

// ─────────────────────────────────────────────
// GET /api/v1/delivery/profile/me (Protected - Rider)
// ─────────────────────────────────────────────
export const getMyProfileController = asyncHandler(async (req, res) => {
  const deliveryPartner = await getMyDeliveryProfile(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, { deliveryPartner }, 'Rider profile fetched successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/delivery/profile/:id (Protected)
// ─────────────────────────────────────────────
export const getPartnerByIdController = asyncHandler(async (req, res) => {
  const deliveryPartner = await getDeliveryPartnerById(req.params.id, req.user);
  return res
    .status(200)
    .json(
      new ApiResponse(200, { deliveryPartner }, 'Delivery partner profile fetched successfully'),
    );
});

// ─────────────────────────────────────────────
// PATCH /api/v1/delivery/profile (Protected - Rider)
// ─────────────────────────────────────────────
export const updateProfileController = asyncHandler(async (req, res) => {
  const deliveryPartner = await updateDeliveryPartnerProfile({
    userId: req.user._id,
    updateData: req.body,
    profileImageFile: req.profileImageFile,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { deliveryPartner }, 'Delivery partner profile updated successfully'),
    );
});

// ─────────────────────────────────────────────
// PATCH /api/v1/delivery/status/online (Protected - Rider)
// ─────────────────────────────────────────────
export const toggleOnlineStatusController = asyncHandler(async (req, res) => {
  const deliveryPartner = await toggleOnlineStatus({
    userId: req.user._id,
    isOnline: req.body.isOnline,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deliveryPartner },
        `Rider is now ${deliveryPartner.isOnline ? 'ONLINE' : 'OFFLINE'}`,
      ),
    );
});

// ─────────────────────────────────────────────
// POST /api/v1/delivery/location (Protected - Live GPS Ping)
// ─────────────────────────────────────────────
export const updateLiveLocationController = asyncHandler(async (req, res) => {
  const result = await updateLiveLocation({
    userId: req.user._id,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Live location ping updated successfully'));
});

// ─────────────────────────────────────────────
// GET /api/v1/delivery/nearby (Protected - Restaurant or Admin)
// ─────────────────────────────────────────────
export const findNearbyRidersController = asyncHandler(async (req, res) => {
  const riders = await findNearbyAvailableRiders(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, { riders }, 'Nearby available riders fetched successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/delivery/tasks/:orderId/accept (Protected - Rider)
// ─────────────────────────────────────────────
export const acceptDeliveryTaskController = asyncHandler(async (req, res) => {
  const result = await acceptDeliveryTask({
    user: req.user,
    orderId: req.params.orderId,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Delivery task accepted successfully'));
});

// ─────────────────────────────────────────────
// POST /api/v1/delivery/tasks/:orderId/complete (Protected - Rider)
// ─────────────────────────────────────────────
export const completeDeliveryTaskController = asyncHandler(async (req, res) => {
  const result = await completeDeliveryTask({
    user: req.user,
    orderId: req.params.orderId,
    paymentReceived: req.body.paymentReceived,
  });

  return res.status(200).json(new ApiResponse(200, result, 'Order delivery marked as completed'));
});

// ─────────────────────────────────────────────
// PATCH /api/v1/delivery/partners/:id/verify (Protected - Admin Only)
// ─────────────────────────────────────────────
export const reviewApplicationController = asyncHandler(async (req, res) => {
  const deliveryPartner = await reviewDeliveryPartnerApplication({
    partnerId: req.params.id,
    adminUser: req.user,
    verificationStatus: req.body.verificationStatus,
    rejectionReason: req.body.rejectionReason,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deliveryPartner },
        `Delivery partner application ${deliveryPartner.verificationStatus}`,
      ),
    );
});

// ─────────────────────────────────────────────
// GET /api/v1/delivery/partners (Protected - Admin Only)
// ─────────────────────────────────────────────
export const listPartnersController = asyncHandler(async (req, res) => {
  const result = await listDeliveryPartners(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Delivery partners fetched successfully'));
});
