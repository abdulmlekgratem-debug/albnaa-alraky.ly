import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProductProvider } from '../src/context/ProductContext';
import { HomePage } from '../src/pages/HomePage';
import { CategoriesPage } from '../src/pages/CategoriesPage';
import { CategoryPage } from '../src/pages/CategoryPage';
import { ProductPage } from '../src/pages/ProductPage';
import { SearchPage } from '../src/pages/SearchPage';
import { AllPricesPage } from '../src/pages/AllPricesPage';

function renderWithProviders(ui: React.ReactElement, { initialEntries = ['/'] } = {}) {
  return render(
    <ProductProvider>
      <MemoryRouter initialEntries={initialEntries}>
        {ui}
      </MemoryRouter>
    </ProductProvider>
  );
}

describe('Full Application Navigation & Page Rendering', () => {
  it('renders HomePage with the unified city, category, search, and price browser', async () => {
    renderWithProviders(<HomePage />);

    const titles = await screen.findAllByText('أسعار مواد البناء اليوم');
    expect(titles.length).toBeGreaterThan(0);
    expect((await screen.findAllByText('الحديد')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('الأسمنت')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('الياجور والبلوك')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('الرمل والركام')).length).toBeGreaterThan(0);

    const allMaterialsButton = await screen.findByRole('button', { name: /عرض كل المواد/ });
    expect(allMaterialsButton).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByRole('searchbox', { name: 'ابحث في جميع مواد البناء' })).toBeInTheDocument();
    expect(await screen.findByRole('radio', { name: /طرابلس/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByRole('link', { name: 'المواد والتصنيفات' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'تحديث الأسعار' })).not.toBeInTheDocument();
    const dateTimeDisplays = screen.getAllByLabelText(/التاريخ والوقت:/);
    expect(dateTimeDisplays).toHaveLength(2);
    expect(dateTimeDisplays.some((display) => display.className.includes('sm:hidden'))).toBe(true);
    const searchLink = screen.getByRole('link', { name: 'البحث عن الأسعار' });
    expect(searchLink.className).toContain('h-12');
    expect(searchLink.className).toContain('w-12');

    const transparentCategoryIcons = document.querySelectorAll('[data-transparent-category-icon="true"]');
    expect(transparentCategoryIcons.length).toBeGreaterThan(0);
    const cementIcon = await screen.findByRole('img', { name: 'أيقونة الأسمنت' });
    expect(cementIcon).toHaveAttribute('src', '/images/categories/cement.svg');
    const productImage = (await screen.findAllByRole('img', { name: 'اسمنت اتحاد' }))[0];
    expect(productImage).not.toHaveClass('grayscale');
    expect(document.querySelector('.product-scrollbar')).not.toBeInTheDocument();
    const cityGroup = screen.getByRole('radiogroup', { name: 'اختر مدينة الأسعار' });
    expect(cityGroup.className).toContain('grid-cols-2');
    expect(cityGroup.className).not.toContain('overflow-x-auto');
  });

  it('filters from the homepage and resets to all materials when the customer searches', async () => {
    renderWithProviders(<HomePage />);

    const cementButton = await screen.findByRole('button', { name: /عرض الأسمنت/ });
    fireEvent.click(cementButton);
    expect(cementButton).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByRole('list', { name: /الأسمنت في طرابلس/ })).toBeInTheDocument();

    const searchInput = screen.getByRole('searchbox', { name: 'ابحث في جميع مواد البناء' });
    fireEvent.change(searchInput, { target: { value: 'اتحاد' } });

    expect(screen.getByRole('button', { name: /عرض كل المواد/ })).toHaveAttribute('aria-pressed', 'true');
    expect((await screen.findAllByText('اسمنت اتحاد')).length).toBeGreaterThan(0);
  });

  it('builds useful filters dynamically from the selected category data', async () => {
    renderWithProviders(<HomePage />);

    fireEvent.click(await screen.findByRole('button', { name: /عرض الحديد/ }));
    const filtersButton = await screen.findByRole('button', { name: /تصفية نتائج الحديد/ });
    expect(filtersButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('group', { name: 'فلترة الحديد حسب المقاس' })).not.toBeInTheDocument();
    fireEvent.click(filtersButton);
    expect(filtersButton).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('group', { name: 'فلترة الحديد حسب المقاس' })).toBeInTheDocument();

    const eightMillimetres = await screen.findByRole('button', { name: /8 مم/ });
    fireEvent.click(eightMillimetres);
    expect(eightMillimetres).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByRole('list', { name: /الحديد.*8 مم.*طرابلس/ })).toBeInTheDocument();

  });

  it('renders only categories that contain available products', async () => {
    renderWithProviders(<CategoriesPage />, { initialEntries: ['/materials'] });

    expect(await screen.findByRole('heading', { name: 'اختر مادة البناء' })).toBeInTheDocument();
    expect(await screen.findByText('الحديد')).toBeInTheDocument();
    expect(await screen.findByText('الأسمنت')).toBeInTheDocument();
    expect(screen.queryByText(/0 صنفًا/)).not.toBeInTheDocument();
  });

  it('renders Iron Flow with sizes buttons and manufacturer rows', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/materials/:category" element={<CategoryPage />} />
      </Routes>,
      { initialEntries: ['/materials/الحديد'] }
    );

    // Verify Iron category title and size selectors
    expect(await screen.findByText('اختر مقاس حديد التسليح')).toBeInTheDocument();
    expect(await screen.findByText('12 مم')).toBeInTheDocument();
    expect(await screen.findByText('8 مم')).toBeInTheDocument();
    expect(await screen.findByText('10 مم')).toBeInTheDocument();
    expect(await screen.findByText(/أساس التصنيف:/)).toBeInTheDocument();
  });

  it('shows direct price actions for the selected iron size without a details detour', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/materials/:category" element={<CategoryPage />} />
      </Routes>,
      { initialEntries: ['/materials/الحديد'] }
    );

    fireEvent.click(await screen.findByRole('button', { name: /^8 مم/ }));
    expect((await screen.findAllByRole('button', { name: /نسخ سعر حديد تسليح 8/ })).length).toBeGreaterThan(0);
    expect((await screen.findAllByRole('button', { name: /مشاركة سعر حديد تسليح 8/ })).length).toBeGreaterThan(0);
    expect(screen.queryByText('عرض التفاصيل والبدائل')).not.toBeInTheDocument();
  });

  it('renders Cement Flow with cement listings', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/materials/:category" element={<CategoryPage />} />
      </Routes>,
      { initialEntries: ['/materials/الأسمنت'] }
    );

    expect(await screen.findByText('اختر صنف الأسمنت')).toBeInTheDocument();
    expect((await screen.findAllByText('اسمنت اتحاد')).length).toBeGreaterThan(0);
  });

  it('renders ProductPage with prominent price and last updated timestamp', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>,
      { initialEntries: ['/product/P020'] }
    );

    // P020: حديد تسليح 12 ملي مصراتة (Price: 3,950 د.ل)
    const productNames = await screen.findAllByText('حديد تسليح 12 ملي مصراتة');
    expect(productNames.length).toBeGreaterThan(0);
    expect(await screen.findByText('3,950')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'مشاركة السعر والرابط' }));
    expect(await screen.findByRole('dialog', { name: 'مشاركة السعر' })).toBeInTheDocument();
    const whatsappLink = screen.getByRole('link', { name: 'مشاركة عبر واتساب' });
    expect(whatsappLink.getAttribute('href')).toContain('https://wa.me/?text=');
    expect(screen.getByRole('button', { name: 'نسخ السعر والرابط' })).toBeInTheDocument();
  });

  it('renders SearchPage and dynamically filters products', async () => {
    renderWithProviders(<SearchPage />, { initialEntries: ['/search'] });

    const input = await screen.findByPlaceholderText(/ابحث عن مادة/);
    expect(input).toBeInTheDocument();

    // Type "اتحاد"
    fireEvent.change(input, { target: { value: 'اتحاد' } });
    expect(await screen.findByText(/نتائج البحث/)).toBeInTheDocument();
    expect((await screen.findAllByText('اسمنت اتحاد')).length).toBeGreaterThan(0);
  });

  it('renders AllPricesPage with categorized filter pills', async () => {
    renderWithProviders(<AllPricesPage />, { initialEntries: ['/prices'] });

    expect(await screen.findByRole('heading', { name: 'الأسعار حسب المدينة' })).toBeInTheDocument();
    expect(await screen.findByText('كل المواد')).toBeInTheDocument();
    expect(await screen.findByRole('columnheader', { name: 'التصنيف' })).toBeInTheDocument();
    expect(await screen.findByRole('columnheader', { name: 'المادة' })).toBeInTheDocument();
    expect(await screen.findByRole('columnheader', { name: 'النوع' })).toBeInTheDocument();
    expect(await screen.findByRole('columnheader', { name: 'المقاس' })).toBeInTheDocument();
    expect(await screen.findByRole('columnheader', { name: 'المصنع' })).toBeInTheDocument();
    expect(await screen.findByRole('columnheader', { name: 'الوحدة' })).toBeInTheDocument();
  });
});
