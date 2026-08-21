import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductRow } from '../src/components/ui/ProductRow';
import { ProductImage } from '../src/components/ui/ProductImage';
import { getProductSubtitle } from '../src/lib/productPresentation';
import { ProductDTO } from '../src/types/product';

const baseProduct: ProductDTO = {
  id: 'TEST-PRODUCT',
  sourceCode: null,
  sortOrder: 1,
  category: 'الرمل والركام',
  subcategory: 'الرمل',
  name: 'رملة مصراتة',
  type: null,
  size: null,
  length: null,
  manufacturer: 'مصراتة',
  origin: null,
  package: null,
  unit: 'غير محددة',
  price: 220,
  available: true,
  updatedAt: null,
  searchText: '',
};

describe('Product price presentation', () => {
  it('removes metadata already present in the product name', () => {
    expect(getProductSubtitle(baseProduct, false)).toBe('الرمل');
  });

  it('keeps category and useful type while removing duplicate subcategory and manufacturer', () => {
    const cement: ProductDTO = {
      ...baseProduct,
      category: 'الأسمنت',
      subcategory: 'أسمنت',
      name: 'اسمنت اتحاد',
      type: 'عادي',
      manufacturer: 'اتحاد',
      unit: 'كيس',
      price: 28.5,
    };

    expect(getProductSubtitle(cement, true)).toBe('الأسمنت • عادي');
  });

  it('shows price as one readable block and does not invent an unknown unit', () => {
    render(
      <MemoryRouter>
        <ProductRow product={baseProduct} />
      </MemoryRouter>
    );

    expect(screen.getByText('220')).toBeInTheDocument();
    expect(screen.getByText('د.ل')).toBeInTheDocument();
    expect(screen.queryByText('غير محددة')).not.toBeInTheDocument();
  });

  it('does not render unavailable products in customer-facing lists', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductRow
          product={{ ...baseProduct, price: null, available: false }}
        />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('falls back to the local category image when an Excel image link fails to load', () => {
    render(
      <ProductImage
        product={{ ...baseProduct, imageUrl: 'https://example.com/broken-image.jpg' }}
      />
    );

    const image = screen.getByRole('img', { name: baseProduct.name });
    expect(image).toHaveAttribute('src', 'https://example.com/broken-image.jpg');
    fireEvent.error(image);
    expect(image).toHaveAttribute('src', '/images/categories/sand.jpg');
    expect(image).not.toHaveClass('grayscale');
  });
});
