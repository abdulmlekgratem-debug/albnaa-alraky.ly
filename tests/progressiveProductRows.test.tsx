import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProgressiveProductRows } from '../src/components/ui/ProgressiveProductRows';
import { ProductDTO } from '../src/types/product';

const makeProduct = (index: number): ProductDTO => ({
  id: `PRODUCT-${index}`,
  sourceCode: null,
  sortOrder: index,
  category: 'الحديد',
  subcategory: 'حديد تسليح',
  name: `صنف تجريبي ${index}`,
  type: 'حديد تسليح',
  size: `${index} مم`,
  length: null,
  manufacturer: null,
  origin: null,
  package: null,
  unit: 'طن',
  price: 100 + index,
  available: true,
  updatedAt: null,
  searchText: '',
});

describe('Progressive product lists', () => {
  it('shows a manageable first batch and reveals more products on demand', () => {
    const products = Array.from({ length: 10 }, (_, index) => makeProduct(index + 1));

    render(
      <MemoryRouter>
        <ProgressiveProductRows
          products={products}
          ariaLabel="قائمة اختبار"
          pageSize={4}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('صنف تجريبي 1')).toBeInTheDocument();
    expect(screen.getByText('صنف تجريبي 4')).toBeInTheDocument();
    expect(screen.queryByText('صنف تجريبي 5')).not.toBeInTheDocument();
    expect(screen.getByText('المتبقي 6')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /عرض 4 أصناف إضافية/ }));

    expect(screen.getByText('صنف تجريبي 8')).toBeInTheDocument();
    expect(screen.queryByText('صنف تجريبي 9')).not.toBeInTheDocument();
    expect(screen.getByText('المتبقي 2')).toBeInTheDocument();
  });
});
