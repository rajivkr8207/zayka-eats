import { useState, useCallback, useEffect } from 'react';
import { addressService } from '../services/address.service.js';

export const useAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await addressService.getAddresses();
      const list = res.data?.data?.addresses || res.data?.data || [];
      setAddresses(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch addresses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (data) => {
    const res = await addressService.createAddress(data);
    await fetchAddresses();
    return res.data?.data;
  };

  const editAddress = async (id, data) => {
    const res = await addressService.updateAddress(id, data);
    await fetchAddresses();
    return res.data?.data;
  };

  const removeAddress = async (id) => {
    await addressService.deleteAddress(id);
    await fetchAddresses();
  };

  const setDefault = async (id) => {
    await addressService.setDefaultAddress(id);
    await fetchAddresses();
  };

  return {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    addAddress,
    editAddress,
    removeAddress,
    setDefault,
  };
};

export default useAddress;
