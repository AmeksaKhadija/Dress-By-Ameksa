import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';

const TenuCard = ({ tenue }) => {
  const imageUrl = tenue.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=Pas+d%27image';

  return (
    <Link to={`/tenue/${tenue._id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={imageUrl}
            alt={tenue.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <p className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">
            {tenue.type}
          </p>
          <h3 className="font-medium text-gray-900 truncate">{tenue.nom}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-primary-700">
              {formatPrice(tenue.prix)}
            </span>
            {tenue.boutique?.nom && (
              <span className="text-xs text-gray-400">{tenue.boutique.nom}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TenuCard;
