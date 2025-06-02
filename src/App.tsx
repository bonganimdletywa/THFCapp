import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const router = createBrowserRouter(routes);
  
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;