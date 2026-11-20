import { Link } from 'react-router';
import { FiHome } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="py-24 text-center space-y-4 max-w-md mx-auto">
      <div className="text-6xl font-black text-brand">404</div>
      <h2 className="text-2xl font-bold text-text-primary">Page Not Found</h2>
      <p className="text-xs text-text-muted">
        The page you are looking for does not exist, has been removed, or is temporarily unavailable.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md transition-all"
        >
          <FiHome className="w-4 h-4" /> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
