
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import {
  FiTruck,
  FiCheckCircle,
  FiUpload,
  FiX,
} from 'react-icons/fi';
import { deliveryService } from '../services/delivery.service.js';
import { toast } from 'react-toastify';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileValidation = (file, required = false) => {
  if (!file || file.length === 0) {
    return required ? 'This document is required' : true;
  }

  const selectedFile = file[0];

  if (!IMAGE_TYPES.includes(selectedFile.type)) {
    return 'Only JPG, PNG and WEBP images are allowed';
  }

  if (selectedFile.size > MAX_FILE_SIZE) {
    return 'Image size must not exceed 5MB';
  }

  return true;
};

const DocumentUpload = ({
  label,
  name,
  register,
  errors,
  required = false,
  file,
  onRemove,
}) => {
  const registration = register(name, {
    validate: (files) => fileValidation(files, required),
  });

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-text-secondary">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>

      <div className="relative border-2 border-dashed border-border-strong rounded-xl p-4 bg-surface-elevated">
        {file ? (
          <div className="flex items-center gap-3">
            <img
              src={URL.createObjectURL(file)}
              alt={label}
              className="w-16 h-16 rounded-lg object-cover"
            />

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">
                {file.name}
              </p>
              <p className="text-[10px] text-text-muted">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"
            >
              <FiX />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2 cursor-pointer py-3">
            <FiUpload className="w-6 h-6 text-brand" />

            <span className="text-xs font-semibold text-text-primary">
              Upload {label}
            </span>

            <span className="text-[10px] text-text-muted">
              JPG, PNG, WEBP (Maximum 5MB)
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              {...registration}
            />
          </label>
        )}
      </div>

      {errors[name] && (
        <p className="text-[11px] text-rose-500">
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

const OnboardingPage = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      phone: '',
      vehicleType: 'bike',
      vehicleNumber: '',
      licenseNumber: '',
      profileImage: null,
      aadhaarDocument: null,
      drivingLicenseImage: null,
      vehicleRcImage: null,
    },
  });

  const vehicleType = watch('vehicleType');

  const isCycle = vehicleType === 'cycle';

  const profileImage = watch('profileImage')?.[0];
  const aadhaarDocument = watch('aadhaarDocument')?.[0];
  const drivingLicenseImage = watch('drivingLicenseImage')?.[0];
  const vehicleRcImage = watch('vehicleRcImage')?.[0];

  const removeFile = (fieldName) => {
    setValue(fieldName, null, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append('fullName', data.fullName.trim());
      formData.append('phone', data.phone.trim());
      formData.append('vehicleType', data.vehicleType);
      formData.append('vehicleNumber', data.vehicleNumber.trim());

      if (data.licenseNumber) {
        formData.append('licenseNumber', data.licenseNumber.trim());
      }

      // Profile image is optional
      if (data.profileImage?.[0]) {
        formData.append('profileImage', data.profileImage[0]);
      }

      // Required Aadhaar document
      formData.append('aadhaarDocument', data.aadhaarDocument[0]);

      // Driving documents are not required for cycles
      if (!isCycle) {
        formData.append(
          'drivingLicenseImage',
          data.drivingLicenseImage[0],
        );

        formData.append(
          'vehicleRcImage',
          data.vehicleRcImage[0],
        );
      }

      await deliveryService.onboard(formData);

      setIsSubmitted(true);
      toast.success('KYC documents submitted successfully!');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Onboarding submission failed',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-surface border border-border-strong shadow-xl text-center space-y-4">
        <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />

        <h2 className="text-xl font-black text-text-primary">
          Verification In Progress
        </h2>

        <p className="text-xs text-text-secondary leading-relaxed">
          Your delivery partner registration and KYC documents
          have been submitted successfully. Our compliance team
          will review your documents and notify you after verification.
        </p>

        <button
          type="button"
          onClick={() => navigate('/rider/dashboard')}
          className="px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
          <FiTruck className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-black text-text-primary">
          Delivery Partner Onboarding
        </h1>

        <p className="text-xs text-text-muted">
          Complete your profile and upload KYC documents
          to start delivering.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-strong shadow-xl">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary">
              Personal Information
            </h3>

            {/* Profile Image */}
            <DocumentUpload
              label="Profile Photo"
              name="profileImage"
              register={register}
              errors={errors}
              file={profileImage}
              onRemove={() => removeFile('profileImage')}
            />

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                Full Name *
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                {...register('fullName', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must contain at least 2 characters',
                  },
                  maxLength: {
                    value: 120,
                    message: 'Name cannot exceed 120 characters',
                  },
                })}
                className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
              />

              {errors.fullName && (
                <p className="text-[11px] text-rose-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                Mobile Number *
              </label>

              <input
                type="tel"
                maxLength={10}
                placeholder="Enter 10 digit mobile number"
                {...register('phone', {
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Enter a valid 10-digit mobile number',
                  },
                })}
                className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
              />

              {errors.phone && (
                <p className="text-[11px] text-rose-500">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-border-subtle" />

          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary">
              Vehicle Information
            </h3>

            {/* Vehicle Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                Vehicle Type *
              </label>

              <select
                {...register('vehicleType', {
                  required: 'Vehicle type is required',
                  validate: (value) =>
                    ['bike', 'scooter', 'cycle', 'electric_bike', 'other'].includes(value) ||
                    'Invalid vehicle type',
                })}
                className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
              >
                <option value="bike">Motorcycle / Bike</option>
                <option value="scooter">Petrol / Electric Scooter</option>
                <option value="cycle">Bicycle</option>
                <option value="electric_bike">Electric Bike</option>
                <option value="other">Other</option>
              </select>

              {errors.vehicleType && (
                <p className="text-[11px] text-rose-500">
                  {errors.vehicleType.message}
                </p>
              )}
            </div>

            {/* Vehicle Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                Vehicle Registration Number *
              </label>

              <input
                type="text"
                placeholder="e.g. BR 01 AB 1234"
                {...register('vehicleNumber', {
                  required: 'Vehicle number is required',
                  maxLength: {
                    value: 20,
                    message: 'Vehicle number cannot exceed 20 characters',
                  },
                  validate: (value) =>
                    value.trim().length > 0 ||
                    'Vehicle number is required',
                })}
                className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-xs uppercase text-text-primary focus:outline-none focus:border-brand"
              />

              {errors.vehicleNumber && (
                <p className="text-[11px] text-rose-500">
                  {errors.vehicleNumber.message}
                </p>
              )}
            </div>

            {/* Driving License Number */}
            {!isCycle && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">
                  Driving License Number *
                </label>

                <input
                  type="text"
                  placeholder="Enter driving license number"
                  {...register('licenseNumber', {
                    required: 'Driving license number is required',
                    minLength: {
                      value: 5,
                      message: 'Invalid license number',
                    },
                    maxLength: {
                      value: 30,
                      message: 'License number cannot exceed 30 characters',
                    },
                  })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />

                {errors.licenseNumber && (
                  <p className="text-[11px] text-rose-500">
                    {errors.licenseNumber.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-border-subtle" />

          {/* KYC Documents */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                KYC Documents
              </h3>

              <p className="text-[10px] text-text-muted mt-1">
                Upload clear and readable document images.
                Maximum file size: 5MB.
              </p>
            </div>

            <DocumentUpload
              label="Aadhaar Card"
              name="aadhaarDocument"
              register={register}
              errors={errors}
              required
              file={aadhaarDocument}
              onRemove={() => removeFile('aadhaarDocument')}
            />

            {!isCycle && (
              <>
                <DocumentUpload
                  label="Driving License"
                  name="drivingLicenseImage"
                  register={register}
                  errors={errors}
                  required
                  file={drivingLicenseImage}
                  onRemove={() => removeFile('drivingLicenseImage')}
                />

                <DocumentUpload
                  label="Vehicle RC"
                  name="vehicleRcImage"
                  register={register}
                  errors={errors}
                  required
                  file={vehicleRcImage}
                  onRemove={() => removeFile('vehicleRcImage')}
                />
              </>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'Submitting Documents...'
              : 'Submit for Verification'}
          </button>

          <p className="text-[10px] text-center text-text-muted">
            Your personal information and documents will be
            used for delivery partner verification.
          </p>

        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
