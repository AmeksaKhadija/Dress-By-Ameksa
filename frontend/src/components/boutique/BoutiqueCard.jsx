import { Link } from 'react-router-dom';
import { HiLocationMarker, HiCheckCircle, HiArrowRight } from 'react-icons/hi';

const BoutiqueCard = ({ boutique }) => {
  const logoUrl = boutique.logo?.url || 'https://via.placeholder.com/200x200?text=Boutique';

  return (
    <Link to={`/boutique/${boutique._id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-1">
        {/* Top gradient banner */}
        <div className="h-24 bg-gradient-to-br from-primary-500 to-primary-700 relative">
          <div className="absolute inset-0 bg-black/5"></div>
          {/* Logo overlapping banner */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
              <img src={logoUrl} alt={boutique.nom} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="pt-14 pb-6 px-6 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
              {boutique.nom}
            </h3>
            {boutique.statut === 'validee' && (
              <HiCheckCircle className="text-primary-500 text-lg flex-shrink-0" title="Boutique verifiee" />
            )}
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[2.5rem]">
            {boutique.description || 'Decouvrez notre collection de tenues traditionnelles.'}
          </p>

          {boutique.adresse && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-4">
              <HiLocationMarker className="flex-shrink-0" />
              <span className="truncate">{boutique.adresse}</span>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 group-hover:gap-2.5 transition-all">
              Voir la boutique
              <HiArrowRight className="text-xs" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BoutiqueCard;