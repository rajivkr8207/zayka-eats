import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiCamera, FiLock, FiCheck } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth.js';
import { ROLE_LABELS } from '../../../constants/roles.js';

const ProfilePage = () => {
  const { user, updateProfile, fetchProfile, isLoading } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      mobile: '',
    },
  });

  useEffect(() => {
    if (!user) {
      fetchProfile();
    } else {
      reset({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        mobile: user.mobile || '',
      });
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user, reset, fetchProfile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      if (data.mobile) formData.append('mobile', data.mobile);
      if (avatarFile) formData.append('avatar', avatarFile);

      const result = await updateProfile(formData);
      if (result?.type?.endsWith('fulfilled')) {
        toast.success('Profile updated successfully! ✨');
      } else {
        toast.error(result?.payload || 'Failed to update profile');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-surface border border-border-strong shadow-lg flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar Upload */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-3xl bg-surface-elevated border-2 border-brand/30 overflow-hidden flex items-center justify-center text-text-muted text-3xl font-bold shadow-inner">
            {avatarPreview ? (
              <img src={avatarPreview} alt={user?.fullName} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-brand text-white shadow-md hover:bg-brand-hover cursor-pointer transition-transform group-hover:scale-105">
            <FiCamera className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        {/* User Quick Info */}
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-black text-text-primary">{user?.fullName || 'User Profile'}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand/10 border border-brand/20 text-brand uppercase">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
          <p className="text-xs text-text-muted">@{user?.username || 'username'} • Joined Zayka Eats</p>
          <div className="pt-2 flex flex-wrap gap-3 justify-center sm:justify-start">
            <Link
              to="/change-password"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle hover:border-brand/40 text-xs text-text-secondary hover:text-brand font-medium transition-colors"
            >
              <FiLock className="w-3.5 h-3.5" /> Change Password
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="p-8 rounded-3xl bg-surface border border-border-strong shadow-xl space-y-6">
        <h2 className="text-base font-bold text-text-primary">Personal Details</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  {...register('fullName', { required: 'Full name is required' })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>
              {errors.fullName && <p className="text-[11px] text-rose-500">{errors.fullName.message}</p>}
            </div>

            {/* Username (read-only) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Username</label>
              <input
                type="text"
                disabled
                {...register('username')}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated/50 border border-border-subtle text-xs text-text-muted cursor-not-allowed"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  disabled
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated/50 border border-border-subtle text-xs text-text-muted cursor-not-allowed"
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Mobile Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                <input
                  type="tel"
                  placeholder="9876543210"
                  {...register('mobile', {
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Valid 10-digit mobile number required' },
                  })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand"
                />
              </div>
              {errors.mobile && <p className="text-[11px] text-rose-500">{errors.mobile.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || (!isDirty && !avatarFile)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md hover:shadow-orange-500/25 transition-all disabled:opacity-50"
            >
              <FiCheck className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
