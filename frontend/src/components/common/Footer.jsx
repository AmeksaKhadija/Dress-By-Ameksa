import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl font-bold text-white mb-4">Dress by Ameksa</h3>
            <p className="text-sm">
              Plateforme de location de caftans, takchitas et robes de soiree au Maroc.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">Accueil</Link></li>
              <li><Link to="/catalogue" className="hover:text-white transition">Catalogue</Link></li>
              <li><Link to="/boutiques" className="hover:text-white transition">Boutiques</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>contact@dressbyameksa.ma</li>
              <li>Casablanca, Maroc</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          &copy; {new Date().getFullYear()} Dress by Ameksa. Tous droits reserves.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
