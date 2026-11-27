import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  FiStar,
  FiClock,
  FiMapPin,
  FiPlus,
  FiArrowLeft,
  FiPhone,
} from "react-icons/fi";
import { useRestaurantDetail } from "../hooks/useRestaurant.js";
import { useCart } from "../../cart/hooks/useCart.js";

const RestaurantDetailPage = () => {
  const { idOrSlug } = useParams();
  const { restaurant, menus, categories, isLoading, error } =
    useRestaurantDetail(idOrSlug);
  const { addItem } = useCart();
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-surface-elevated" />
        <div className="h-10 bg-surface-elevated rounded-xl w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-32 bg-surface-elevated rounded-2xl" />
          <div className="h-32 bg-surface-elevated rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-4">
        <h2 className="text-xl font-bold text-text-primary">
          Restaurant Not Found
        </h2>
        <p className="text-xs text-text-muted">
          The restaurant you are looking for might have closed or moved.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold"
        >
          <FiArrowLeft /> Back to Explore
        </Link>
      </div>
    );
  }

  const {
    _id,
    name,
    description,
    cuisineTypes = [],
    avgRating = 4.5,
    totalReviews = 0,
    address,
    contactNumber,
    isOpen = true,
    coverImage,
    logo,
  } = restaurant;

  const defaultCover =
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80";

  // Group food items by category
  // If categories list has foodItems array or items array:
  const activeMenu = activeMenuId
    ? menus.find((m) => m._id === activeMenuId)
    : menus[0];
  const displayedCategories = activeMenu
    ? categories.filter(
        (c) => c.menu === activeMenu._id || c.menuId === activeMenu._id,
      )
    : categories;

  const handleAddToCart = (item) => {
    addItem({
      restaurantId: _id,
      foodId: item._id,
      itemId: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Info */}
      <div className="relative rounded-3xl overflow-hidden bg-surface border border-border-strong shadow-xl">
        <div className="h-64 md:h-80 w-full overflow-hidden relative">
          <img
            src={coverImage || defaultCover}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Back button */}
          <Link
            to="/explore"
            className="absolute top-4 left-4 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md text-white hover:bg-black transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Floating Details Header */}
        <div className="p-6 md:p-8 -mt-20 relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              {logo && (
                <div className="w-20 h-20 rounded-2xl bg-surface border-2 border-border-strong overflow-hidden shadow-xl shrink-0">
                  <img
                    src={logo}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-text-primary">
                    {name}
                  </h1>
                  {isOpen ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 uppercase">
                      Open Now
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-500 uppercase">
                      Closed
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted">
                  {cuisineTypes.join(" • ")}
                </p>
                <div className="flex items-center gap-3 text-xs text-text-secondary pt-1">
                  <span className="flex items-center gap-1 font-bold text-amber-500">
                    <FiStar className="fill-amber-500 w-3.5 h-3.5" />{" "}
                    {Number(avgRating).toFixed(1)} ({totalReviews} reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5 text-brand" /> 30-40 mins
                  </span>
                </div>
              </div>
            </div>

            {/* Address & Contact */}
            <div className="text-xs text-text-muted space-y-1 sm:text-right">
              {address && (
                <p className="flex items-center sm:justify-end gap-1">
                  <FiMapPin className="text-brand w-3.5 h-3.5 shrink-0" />
                  <span>
                    {address.addressLine1 ? `${address.addressLine1}, ` : ""}
                    {address.city}
                  </span>
                </p>
              )}
              {contactNumber && (
                <p className="flex items-center sm:justify-end gap-1">
                  <FiPhone className="w-3.5 h-3.5 text-text-muted" />
                  <span>{contactNumber}</span>
                </p>
              )}
            </div>
          </div>

          {description && (
            <p className="text-xs text-text-secondary leading-relaxed pt-2 border-t border-border-subtle">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Menu Tabs (if multiple menus exist) */}
      {menus.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border-subtle">
          {menus.map((menu) => {
            const isSelected = (activeMenuId || menus[0]._id) === menu._id;
            return (
              <button
                key={menu._id}
                onClick={() => setActiveMenuId(menu._id)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-brand text-white shadow-md"
                    : "bg-surface border border-border-subtle text-text-secondary hover:text-text-primary"
                }`}
              >
                {menu.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Food Categories & Dishes */}
      <div className="space-y-8">
        {displayedCategories.length === 0 ? (
          <div className="p-12 rounded-3xl bg-surface border border-border-strong text-center space-y-2">
            <h3 className="text-base font-bold text-text-primary">
              Menu Coming Soon
            </h3>
            <p className="text-xs text-text-muted">
              This restaurant hasn&apos;t added any items to this menu yet.
            </p>
          </div>
        ) : (
          displayedCategories.map((cat) => {
            const items = cat.items || cat.foodItems || [];
            return (
              <div key={cat._id} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">
                      {cat.name}
                    </h2>
                    {cat.description && (
                      <p className="text-xs text-text-muted">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-text-muted font-medium">
                    {items.length} items
                  </span>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-text-muted italic">
                    No items listed in this category.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="bento-card p-4 flex gap-4 justify-between items-center group"
                      >
                        {/* Food Details */}
                        <div className="space-y-1.5 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            {/* Veg / Non-Veg Indicator */}
                            <span
                              className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm ${
                                item.isVeg
                                  ? "border-emerald-500"
                                  : "border-rose-500"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.isVeg ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                            </span>
                            <h4 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors">
                              {item.name}
                            </h4>
                          </div>

                          <div className="text-xs font-bold text-text-primary">
                            ₹{item.price}
                          </div>

                          {item.description && (
                            <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Image & Add Button */}
                        <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-surface-elevated border border-border-subtle flex flex-col items-center justify-end">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">
                              🍲
                            </div>
                          )}

                          <button
                            onClick={() => handleAddToCart(item)}
                            className="relative z-10 mb-2 px-3 py-1 rounded-xl bg-surface/95 backdrop-blur-md border border-brand text-brand hover:bg-brand hover:text-white text-xs font-black shadow-md transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <FiPlus className="w-3 h-3" /> ADD
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
