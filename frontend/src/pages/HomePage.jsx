import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { FiArrowRight, FiTruck, FiMapPin, FiCompass } from 'react-icons/fi';
import { restaurantService } from '../features/restaurant/services/restaurant.service.js';
import RestaurantCard from '../features/restaurant/components/RestaurantCard.jsx';
import RestaurantCardSkeleton from '../features/restaurant/components/RestaurantCardSkeleton.jsx';

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);
  const [locationName, setLocationName] = useState('Detecting location...');

  const categories = [
    { id: '1', name: 'Biryani', icon: '🍚', count: '14 places' },
    { id: '2', name: 'Pizzas', icon: '🍕', count: '28 places' },
    { id: '3', name: 'Burgers', icon: '🍔', count: '19 places' },
    { id: '4', name: 'North Indian', icon: '🍲', count: '32 places' },
    { id: '5', name: 'Chinese', icon: '🥢', count: '22 places' },
    { id: '6', name: 'Desserts', icon: '🍰', count: '16 places' },
  ];

  const fetchFallbackRestaurants = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await restaurantService.getRestaurants({ limit: 6 });
      const data = res.data?.data?.restaurants || res.data?.data || [];
      setRestaurants(Array.isArray(data) ? data : []);
    } catch {
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ latitude, longitude });
          setLocationName('Near your current GPS location 📍');

          try {
            const res = await restaurantService.getRestaurants({
              latitude,
              longitude,
              limit: 6,
            });
            const data = res.data?.data?.restaurants || res.data?.data || [];
            setRestaurants(Array.isArray(data) && data.length > 0 ? data : []);
          } catch {
            fetchFallbackRestaurants();
          } finally {
            setIsLoading(false);
          }
        },
        () => {
          setLocationName('Popular Food Spots');
          fetchFallbackRestaurants();
        },
        { timeout: 7000 },
      );
    } else {
      setLocationName('Popular Food Spots');
      fetchFallbackRestaurants();
    }
  }, [fetchFallbackRestaurants]);

  return (
    <div className="space-y-12">
      {/* ── 1. Hero Bento Banner ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Hero Card */}
        <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-soft via-surface to-surface border border-border-strong p-8 sm:p-10 flex flex-col justify-between min-h-[300px]">
          <div className="space-y-4 max-w-md z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold tracking-wide uppercase">
              <FiTruck className="w-3.5 h-3.5" /> 30 Min Express Delivery
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-tight">
              Flavors of India, Delivered <span className="text-brand">Fresh & Hot.</span>
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              Explore hundreds of verified local restaurants, hand-crafted kitchens, and top-rated cuisines right in your neighborhood.
            </p>
          </div>

          <div className="pt-6 z-10 flex flex-wrap items-center gap-4">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand hover:bg-brand-hover text-white text-sm font-bold shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Order Now <FiArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2 text-xs text-text-muted bg-surface/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-border-subtle">
              <FiMapPin className="text-brand w-3.5 h-3.5" />
              <span>{locationName}</span>
            </div>
          </div>

          {/* Decorative Background Blob */}
          <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
        </div>

        {/* Side Bento Card: Today's Offer */}
        <div className="rounded-3xl bg-surface border border-border-subtle p-6 flex flex-col justify-between hover:border-border-strong transition-all">
          <div className="space-y-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
              Special Coupon
            </span>
            <h3 className="text-xl font-bold text-text-primary">FIRST50</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Get flat 50% discount on your first order from any verified restaurant on Zayka Eats.
            </p>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs">
            <span className="text-text-muted">Min order: ₹199</span>
            <Link to="/explore" className="text-brand font-semibold hover:underline">
              Use Code
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Category Carousel / Grid ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Inspiration for your order</h2>
            <p className="text-xs text-text-muted">Top categories ordered by foodies near you</p>
          </div>
          <Link to="/explore" className="text-xs text-brand hover:underline font-semibold flex items-center gap-1">
            See all <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/explore?category=${encodeURIComponent(cat.name)}`}
              className="bento-card p-4 flex flex-col items-center text-center gap-2 group cursor-pointer hover:-translate-y-1 transition-transform"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-2xl group-hover:scale-110 group-hover:border-brand/40 transition-transform">
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] text-text-muted">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. Near You Restaurants (Live GPS / Database) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {userCoords ? 'Restaurants Near You' : 'Popular Restaurants'}
            </h2>
            <p className="text-xs text-text-muted">Top rated dining spots with verified food quality</p>
          </div>
          <Link to="/explore" className="text-xs text-brand hover:underline font-semibold flex items-center gap-1">
            View all <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <RestaurantCardSkeleton key={idx} />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="p-8 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
            <FiCompass className="w-8 h-8 text-brand mx-auto" />
            <h3 className="text-sm font-bold text-text-primary">Discover More Restaurants</h3>
            <p className="text-xs text-text-muted">Browse our complete catalogue of delicious places</p>
            <Link
              to="/explore"
              className="inline-block px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold"
            >
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {restaurants.map((res) => (
              <RestaurantCard key={res._id} restaurant={res} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
