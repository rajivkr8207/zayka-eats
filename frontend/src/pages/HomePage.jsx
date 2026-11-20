import { Link } from 'react-router';
import { FiArrowRight, FiClock, FiStar, FiTruck } from 'react-icons/fi';

const HomePage = () => {
  const categories = [
    { id: '1', name: 'Biryani', icon: '🍚', count: '14 places' },
    { id: '2', name: 'Pizzas', icon: '🍕', count: '28 places' },
    { id: '3', name: 'Burgers', icon: '🍔', count: '19 places' },
    { id: '4', name: 'North Indian', icon: '🍲', count: '32 places' },
    { id: '5', name: 'Chinese', icon: '🥢', count: '22 places' },
    { id: '6', name: 'Desserts', icon: '🍰', count: '16 places' },
  ];

  const featuredRestaurants = [
    {
      id: '1',
      name: 'Zaika Mughlai Darbar',
      cuisine: 'Biryani, North Indian, Kebabs',
      rating: 4.8,
      reviews: '1.2k',
      deliveryTime: '25-30 min',
      distance: '2.4 km',
      offer: '50% OFF up to ₹100',
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      name: 'Pizza Romana Gourmet',
      cuisine: 'Italian, Wood-fired Pizza, Pasta',
      rating: 4.6,
      reviews: '850',
      deliveryTime: '20-25 min',
      distance: '1.8 km',
      offer: 'Free Delivery on ₹299+',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      name: 'The Burger Studio',
      cuisine: 'American, Smashed Burgers, Shakes',
      rating: 4.7,
      reviews: '2.1k',
      deliveryTime: '30-35 min',
      distance: '3.1 km',
      offer: 'Flat ₹50 OFF',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    },
  ];

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
              Explore hundreds of verified local restaurants, hand-crafted kitchens, and top rated cuisines in your neighborhood.
            </p>
          </div>

          <div className="pt-6 z-10">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand hover:bg-brand-hover text-white text-sm font-bold shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Order Now <FiArrowRight className="w-4 h-4" />
            </Link>
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
            <span className="text-brand font-semibold cursor-pointer hover:underline">Copy Code</span>
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
              className="bento-card p-4 flex flex-col items-center text-center gap-2 group cursor-pointer"
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

      {/* ── 3. Featured Restaurants (Minimalist Cards per Theme) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Popular Restaurants</h2>
            <p className="text-xs text-text-muted">Top rated dining spots with verified food quality</p>
          </div>
          <Link to="/explore" className="text-xs text-brand hover:underline font-semibold flex items-center gap-1">
            View all <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredRestaurants.map((res) => (
            <div
              key={res.id}
              className="bento-card overflow-hidden group flex flex-col justify-between"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-surface-elevated">
                <img
                  src={res.image}
                  alt={res.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
                  <FiStar className="text-amber-400 fill-amber-400 w-3 h-3" />
                  <span>{res.rating}</span>
                  <span className="text-neutral-400">({res.reviews})</span>
                </div>
                {res.offer && (
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-brand text-white text-[11px] font-bold shadow-md">
                    {res.offer}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-text-primary group-hover:text-brand transition-colors">
                    {res.name}
                  </h3>
                  <p className="text-xs text-text-muted truncate mt-0.5">{res.cuisine}</p>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <FiClock className="w-3.5 h-3.5 text-brand" />
                    <span>{res.deliveryTime}</span>
                  </div>
                  <span>•</span>
                  <span>{res.distance}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
