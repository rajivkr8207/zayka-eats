import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="w-full bg-surface border-t border-border-subtle mt-16 pb-20 sm:pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-black text-base shadow-sm">
                Z
              </div>
              <span className="font-extrabold text-lg text-text-primary">
                Zayka<span className="text-brand">Eats</span>
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Delicious meals from the finest local kitchens, delivered straight to your doorstep in minutes.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Discover</h4>
            <ul className="space-y-1.5 text-xs text-text-muted">
              <li><Link to="/explore" className="hover:text-brand transition-colors">Explore Restaurants</Link></li>
              <li><Link to="/explore?popular=true" className="hover:text-brand transition-colors">Popular Cuisines</Link></li>
              <li><Link to="/explore?offers=true" className="hover:text-brand transition-colors">Special Offers</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Partnerships</h4>
            <ul className="space-y-1.5 text-xs text-text-muted">
              <li><Link to="/register?role=restaurant_owner" className="hover:text-brand transition-colors">Partner with Us (Restaurants)</Link></li>
              <li><Link to="/register?role=delivery_partner" className="hover:text-brand transition-colors">Ride with Us (Delivery Heroes)</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Company</h4>
            <ul className="space-y-1.5 text-xs text-text-muted">
              <li><Link to="/about" className="hover:text-brand transition-colors">About Zayka</Link></li>
              <li><Link to="/help" className="hover:text-brand transition-colors">Help & Support</Link></li>
              <li><Link to="/terms" className="hover:text-brand transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Zayka Eats Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-brand">♥</span> for food lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
