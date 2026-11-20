import { NavLink } from 'react-router';
import { FiHome, FiCompass, FiShoppingBag, FiHeart, FiUser } from 'react-icons/fi';
import { useSelector } from 'react-redux';

const BottomNav = () => {
  const totalItems = useSelector((state) => state.cart.totalItems);

  const navItems = [
    { label: 'Home', path: '/', icon: FiHome },
    { label: 'Explore', path: '/explore', icon: FiCompass },
    { label: 'Cart', path: '/cart', icon: FiShoppingBag, badge: totalItems },
    { label: 'Orders', path: '/orders', icon: FiHeart },
    { label: 'Profile', path: '/profile', icon: FiUser },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-border-subtle safe-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-14 h-full transition-colors ${
                  isActive ? 'text-brand font-bold' : 'text-text-muted hover:text-text-secondary'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
