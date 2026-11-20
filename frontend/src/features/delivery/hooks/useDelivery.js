import { useState, useEffect, useCallback } from 'react';
import { deliveryService } from '../services/delivery.service.js';
import { toast } from 'react-toastify';

export const useDelivery = () => {
  const [profile, setProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await deliveryService.getProfile();
      const data = res.data?.data?.partner || res.data?.data;
      setProfile(data);
      setIsOnline(Boolean(data?.isOnline));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load delivery profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Periodic GPS location beacon when online
  useEffect(() => {
    if (!isOnline) return;

    const sendLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await deliveryService.updateLocation(pos.coords.latitude, pos.coords.longitude);
            } catch {
              // Location beacon error
            }
          },
          () => {},
          { timeout: 8000 },
        );
      }
    };

    sendLocation();
    const timer = setInterval(sendLocation, 30000); // 30s beacon
    return () => clearInterval(timer);
  }, [isOnline]);

  const toggleDuty = async () => {
    try {
      const nextStatus = !isOnline;
      await deliveryService.toggleOnline(nextStatus);
      setIsOnline(nextStatus);
      toast.success(nextStatus ? 'You are now ONLINE 🟢 Ready for orders' : 'You are now OFFLINE ⚪');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update duty status');
    }
  };

  return {
    profile,
    isOnline,
    isLoading,
    error,
    toggleDuty,
    refetch: fetchProfile,
  };
};

export default useDelivery;
