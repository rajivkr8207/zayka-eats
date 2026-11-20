import { useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../features/auth/auth.slice.js';
import AppRoutes from '../routes/AppRoutes.jsx';

const App = () => {
  const dispatch = useDispatch();

  // On initial app load / browser refresh, fetch user profile via httpOnly cookie
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
