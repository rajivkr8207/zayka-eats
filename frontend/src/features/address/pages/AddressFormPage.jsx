import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { FiArrowLeft } from 'react-icons/fi';
import AddressForm from '../components/AddressForm.jsx';
import { addressService } from '../services/address.service.js';
import { toast } from 'react-toastify';

const AddressFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      addressService
        .getAddressById(id)
        .then((res) => {
          setInitialData(res.data?.data?.address || res.data?.data);
        })
        .catch(() => {
          toast.error('Could not load address');
          navigate('/addresses');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (isEdit) {
        await addressService.updateAddress(id, formData);
        toast.success('Address updated successfully!');
      } else {
        await addressService.createAddress(formData);
        toast.success('Address saved successfully!');
      }
      navigate('/addresses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/addresses"
          className="p-2.5 rounded-xl bg-surface border border-border-subtle hover:border-brand text-text-muted hover:text-text-primary transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-text-primary">
            {isEdit ? 'Edit Address' : 'Add New Address'}
          </h1>
          <p className="text-xs text-text-muted">Enter accurate details for fast delivery</p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-surface border border-border-strong shadow-xl">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-surface-elevated rounded-xl" />
            <div className="h-10 bg-surface-elevated rounded-xl" />
            <div className="h-10 bg-surface-elevated rounded-xl" />
          </div>
        ) : (
          <AddressForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default AddressFormPage;
