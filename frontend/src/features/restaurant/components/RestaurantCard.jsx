import { Link } from 'react-router';
import { FiStar, FiClock, FiMapPin } from 'react-icons/fi';

const RestaurantCard = ({ restaurant }) => {
  if (!restaurant) return null;

  const {
    _id,
    name,
    slugName,
    coverImage,
    logo,
    cuisineTypes = [],
    avgRating = 4.5,
    totalReviews = 0,
    isOpen = true,
    distance,
    address,
  } = restaurant;

  const targetUrl = `/restaurants/${slugName || _id}`;

  const defaultImage =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';

  return (
    <Link
      to={targetUrl}
      className="bento-card overflow-hidden group flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
    >
      {/* Cover Image & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-elevated">
        <img
          src={coverImage || defaultImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = defaultImage;
          }}
        />

        {/* Closed Overlay */}
        {!isOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-black tracking-wider uppercase">
              Closed Now
            </span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 shadow-md">
          <FiStar className="text-amber-400 fill-amber-400 w-3 h-3" />
          <span>{Number(avgRating).toFixed(1)}</span>
          {totalReviews > 0 && <span className="text-neutral-400">({totalReviews})</span>}
        </div>

        {/* Logo if available */}
        {logo && (
          <div className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-surface border border-border-subtle p-0.5 shadow-md overflow-hidden">
            <img src={logo} alt={name} className="w-full h-full object-cover rounded-lg" />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-text-primary group-hover:text-brand transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="text-xs text-text-muted truncate mt-0.5">
            {cuisineTypes.length > 0 ? cuisineTypes.join(', ') : 'North Indian, Fast Food, Desi'}
          </p>
        </div>

        <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <FiClock className="w-3.5 h-3.5 text-brand" />
            <span>30-45 min</span>
          </div>
          <div className="flex items-center gap-1 text-text-muted">
            <FiMapPin className="w-3.5 h-3.5" />
            <span>{distance ? `${(distance / 1000).toFixed(1)} km` : address?.city || 'Near you'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
