import { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'react-router';
import { FiSearch, FiMapPin, FiFrown, FiRotateCw } from 'react-icons/fi';
import { useRestaurant } from '../hooks/useRestaurant.js';
import RestaurantCard from '../components/RestaurantCard.jsx';
import RestaurantCardSkeleton from '../components/RestaurantCardSkeleton.jsx';

const CUISINES = [
  'All',
  'Biryani',
  'North Indian',
  'Pizzas',
  'Burgers',
  'Chinese',
  'South Indian',
  'Desserts',
  'Mughlai',
  'Fast Food',
  'Rolls',
];

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(initialCategory);
  const [userLocation, setUserLocation] = useState(null);
  const [isPending, startTransition] = useTransition();

  const { restaurants, isLoading, error, fetchRestaurants } = useRestaurant();

  // Try to acquire GPS position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Fallback or permission denied
        },
        { timeout: 8000 },
      );
    }
  }, []);

  // Fetch when search, cuisine, or location updates
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCuisine && selectedCuisine !== 'All') params.cuisineType = selectedCuisine;
      if (userLocation?.latitude && userLocation?.longitude) {
        params.latitude = userLocation.latitude;
        params.longitude = userLocation.longitude;
      }
      fetchRestaurants(params);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCuisine, userLocation, fetchRestaurants]);

  const handleCuisineSelect = (cuisine) => {
    startTransition(() => {
      setSelectedCuisine(cuisine);
      if (cuisine === 'All') {
        searchParams.delete('category');
      } else {
        searchParams.set('category', cuisine);
      }
      setSearchParams(searchParams);
    });
  };

  return (
    <div className="space-y-8">
      {/* Search & Location Bar */}
      <div className="p-6 rounded-3xl bg-surface border border-border-strong shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-3.5 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by restaurant name, food, or cuisine..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-elevated border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
            />
          </div>

          {/* Location indicator */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-surface-elevated border border-border-subtle text-xs text-text-secondary whitespace-nowrap">
            <FiMapPin className="text-brand w-4 h-4 shrink-0" />
            <span>
              {userLocation ? 'Location: Detected GPS 📍' : 'Location: Default (All)'}
            </span>
          </div>
        </div>

        {/* Cuisine Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CUISINES.map((cuisine) => {
            const isActive = selectedCuisine.toLowerCase() === cuisine.toLowerCase();
            return (
              <button
                key={cuisine}
                onClick={() => handleCuisineSelect(cuisine)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-brand text-white shadow-md shadow-orange-500/20'
                    : 'bg-surface-elevated border border-border-subtle text-text-secondary hover:text-text-primary hover:border-brand/40'
                }`}
              >
                {cuisine}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text-primary">
            {selectedCuisine !== 'All' ? `${selectedCuisine} Restaurants` : 'All Restaurants'}
          </h1>
          <p className="text-xs text-text-muted">
            {restaurants.length} {restaurants.length === 1 ? 'place' : 'places'} ready to deliver
          </p>
        </div>
      </div>

      {/* Content State: Loading, Empty, Error, or Grid */}
      {isLoading || isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <RestaurantCardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-4">
          <FiFrown className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-text-primary">{error}</h2>
          <button
            onClick={() => fetchRestaurants()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover shadow-md"
          >
            <FiRotateCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-3">
          <div className="text-4xl">🍽️</div>
          <h2 className="text-base font-bold text-text-primary">No Restaurants Found</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            We couldn&apos;t find any restaurants matching your search or filters. Try selecting a different cuisine or clearing your search.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCuisine('All');
            }}
            className="px-4 py-2 rounded-xl bg-surface-elevated border border-border-subtle hover:border-brand text-xs font-bold text-brand"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {restaurants.map((res) => (
            <RestaurantCard key={res._id} restaurant={res} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
