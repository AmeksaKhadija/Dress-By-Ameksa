import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import ClientLayout from '../../components/client/ClientLayout';
import Loader from '../../components/common/Loader';
import { verifyPayment } from '../../services/paiementService';

const PaiementSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setError('Session de paiement invalide');
        setLoading(false);
        return;
      }
      try {
        const data = await verifyPayment(sessionId);
        if (data.success) {
          setResult(data);
        } else {
          setError(data.message || 'Paiement non confirme');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la verification');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [sessionId]);

  if (loading) return <ClientLayout><Loader /></ClientLayout>;

  return (
    <ClientLayout>
      <div className="max-w-lg mx-auto text-center py-12">
        {result ? (
          <>
            <HiCheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement reussi</h1>
            <p className="text-gray-500 mb-2">
              Votre paiement de <span className="font-semibold">{result.paiement.montant} MAD</span> a ete confirme.
            </p>
            {result.reservation?.tenue && (
              <p className="text-gray-500 mb-6">
                Reservation pour <span className="font-semibold">{result.reservation.tenue.nom}</span> confirmee.
              </p>
            )}
            <Link
              to="/client/reservations"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              Voir mes reservations
            </Link>
          </>
        ) : (
          <>
            <HiXCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de paiement</h1>
            <p className="text-gray-500 mb-6">{error}</p>
            <Link
              to="/client/reservations"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              Retour aux reservations
            </Link>
          </>
        )}
      </div>
    </ClientLayout>
  );
};

export default PaiementSuccess;
