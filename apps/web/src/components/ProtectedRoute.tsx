import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Spinner } from './ui/Badge';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, fetchMe, accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken && !isLoading) {
      fetchMe();
    }
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// import React, { useEffect } from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuthStore } from '../store/authStore';
// import { Spinner } from './ui/Badge';

// export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { isAuthenticated, isLoading, fetchMe, accessToken, user } = useAuthStore();

//   useEffect(() => {
//     // Only fetch user data if we have a token but haven't loaded the user yet
//     // (e.g., after a page refresh). Skip if user is already loaded to avoid
//     // a loading flash on every route navigation.
//     if (accessToken && !user && !isLoading) {
//       fetchMe();
//     }
//   }, []);

//   if (isLoading) {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <Spinner size={40} />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };