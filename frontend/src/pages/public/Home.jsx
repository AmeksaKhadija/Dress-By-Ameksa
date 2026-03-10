import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TenuCard from '../../components/tenue/TenuCard';
import Loader from '../../components/common/Loader';
import { getPopularTenues } from '../../services/tenueService';

const Home = () => {
  const [tenues, setTenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenues = async () => {
      try {
        const res = await getPopularTenues();
        setTenues(res.tenues);
      } catch (err) {
        console.error('Erreur chargement tenues:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenues();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-gold-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">
              Louez la tenue de vos <span className="text-primary-600">reves</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Decouvrez notre collection de caftans, takchitas et robes de soiree.
              Essayez virtuellement en 3D et reservez en quelques clics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/catalogue"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition text-center"
              >
                Parcourir le catalogue
              </Link>
              <Link
                to="/boutiques"
                className="border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-primary-50 transition text-center"
              >
                Voir les boutiques
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Comment ca marche ?
            </h2>
            <p className="text-gray-600">
              Une experience simple et moderne pour louer votre tenue traditionnelle.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Explorez',
                desc: 'Parcourez notre catalogue de caftans, takchitas et robes de soiree filtrable par type, couleur et taille.',
              },
              {
                step: '2',
                title: 'Essayez en 3D',
                desc: 'Testez virtuellement la tenue grace a notre module Try-On 3D base sur l\'intelligence artificielle.',
              },
              {
                step: '3',
                title: 'Reservez',
                desc: 'Choisissez vos dates, confirmez la reservation et recevez votre tenue pour le jour J.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center p-6">
                <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tenues Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-900">
              Tenues populaires
            </h2>
            <Link to="/catalogue" className="text-primary-600 font-medium hover:underline">
              Voir tout
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : tenues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {tenues.map((tenue) => (
                <TenuCard key={tenue._id} tenue={tenue} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">
              Aucune tenue disponible pour le moment.
            </p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            Prete a trouver votre tenue ?
          </h2>
          <p className="text-primary-100 mb-8">
            Inscrivez-vous et decouvrez des centaines de tenues traditionnelles marocaines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Creer un compte
            </Link>
            <Link
              to="/catalogue"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-600 transition"
            >
              Explorer le catalogue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
