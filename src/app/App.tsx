import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ProductProvider } from '../context/ProductContext';

export const App: React.FC = () => {
  return (
    <ProductProvider>
      <RouterProvider router={router} />
    </ProductProvider>
  );
};
