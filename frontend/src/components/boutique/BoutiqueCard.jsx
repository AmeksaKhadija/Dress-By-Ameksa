import { Link } from 'react-router-dom';
import { HiLocationMarker } from 'react-icons/hi';

const BoutiqueCard = ({ boutique }) => {
  const logoUrl = boutique.logo?.url || 'https://via.placeholder.com/200x200?text=Boutique';

  return (
    <Link to={`/boutique/${boutique._id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow p-6 text-center">
        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary-100">
          <img src={logoUrl} alt={boutique.nom} className="w-full h-full object-cover" />
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
          {boutique.nom}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{boutique.description}</p>
        {boutique.adresse && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-3">
            <HiLocationMarker />
            <span>{boutique.adresse}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default BoutiqueCard;
