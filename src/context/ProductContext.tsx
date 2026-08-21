import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { ProductDTO, CategorySummary, CitySummary } from '../types/product';
import { getActiveProducts } from '../services/productService';
import {
  applyCityPriceToProduct,
  extractCategories,
  extractCities,
  getLatestUpdatedTimestamp,
} from '../lib/excelParser';
import { BRAND } from '../lib/constants';

interface ProductContextType {
  products: ProductDTO[];
  categories: CategorySummary[];
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
  isFromSnapshot: boolean;
  cities: CitySummary[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  refreshPrices: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sourceProducts, setSourceProducts] = useState<ProductDTO[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (typeof window === 'undefined') return BRAND.city;
    return window.sessionStorage.getItem('al-binaa-selected-city') || BRAND.city;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromSnapshot, setIsFromSnapshot] = useState<boolean>(false);

  const fetchPrices = useCallback(async (bypassCache = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getActiveProducts(bypassCache);
      setSourceProducts(result.products);
      setIsFromSnapshot(result.isFromSnapshot);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر تحميل الأسعار. تحقق من الاتصال وحاول مرة أخرى.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices(false);
  }, [fetchPrices]);

  const cities = useMemo(() => extractCities(sourceProducts), [sourceProducts]);

  useEffect(() => {
    if (cities.length === 0) return;

    const currentCity = cities.find((city) => city.name === selectedCity);
    if (!currentCity || currentCity.availableCount === 0) {
      setSelectedCity(cities.find((city) => city.availableCount > 0)?.name || cities[0].name);
    }
  }, [cities, selectedCity]);

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedCity) {
      window.sessionStorage.setItem('al-binaa-selected-city', selectedCity);
    }
  }, [selectedCity]);

  const products = useMemo(
    () => sourceProducts
      .map((product) => applyCityPriceToProduct(product, selectedCity))
      .filter((product) => product.available && product.price !== null && product.price > 0),
    [sourceProducts, selectedCity],
  );

  const categories = useMemo<CategorySummary[]>(
    () => extractCategories(products),
    [products],
  );

  const lastUpdated = useMemo(
    () => getLatestUpdatedTimestamp(products),
    [products],
  );

  const refreshPrices = useCallback(async () => {
    await fetchPrices(true);
  }, [fetchPrices]);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        lastUpdated,
        isLoading,
        error,
        isFromSnapshot,
        cities,
        selectedCity,
        setSelectedCity,
        refreshPrices,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

export function useOptionalProducts() {
  return useContext(ProductContext);
}
