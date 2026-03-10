import { useState } from 'react';
import { generateTryOn as generateTryOnApi } from '../services/tryonService';
import toast from 'react-hot-toast';

const useTryOn = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generateTryOn = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateTryOnApi(formData);
      if (data.success) {
        setResult(data.tryOn);
        toast.success('Image generee avec succes !');
      }
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la generation de l\'image';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { loading, result, error, generateTryOn, reset };
};

export default useTryOn;
