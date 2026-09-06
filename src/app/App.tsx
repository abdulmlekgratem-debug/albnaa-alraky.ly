import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ProductProvider } from '../context/ProductContext';
import { AuthProvider } from '../context/AuthContext';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <RouterProvider router={router} />
      </ProductProvider>
    </AuthProvider>
  );
};
