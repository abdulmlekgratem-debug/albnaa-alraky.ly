/**
 * Category and Product Visual Assets Mapping
 * Provides real commercial product photography assets for all building material categories.
 */

export interface CategoryAsset {
  name: string;
  slug: string;
  image: string;
  icon: string;
  alt: string;
  colorTheme: string;
}

export const HERO_IMAGE = '/images/hero/hero_yard.jpg';
export const ABOUT_IMAGE = '/images/about/company_about.jpg';

export const CATEGORY_ASSETS: Record<string, CategoryAsset> = {
  'الحديد': {
    name: 'الحديد',
    slug: 'iron',
    image: '/images/categories/iron.jpg',
    icon: '/images/categories/iron.svg',
    alt: 'حديد تسليح للبناء',
    colorTheme: '#153D7A',
  },
  'الأسمنت': {
    name: 'الأسمنت',
    slug: 'cement',
    image: '/images/categories/cement.jpg',
    icon: '/images/categories/cement.svg',
    alt: 'أسمنت مكيس وبورتلاندي',
    colorTheme: '#3B4B61',
  },
  'الياجور والبلوك': {
    name: 'الياجور والبلوك',
    slug: 'bricks',
    image: '/images/categories/bricks.jpg',
    icon: '/images/categories/bricks.svg',
    alt: 'ياجور بناء أحمر وبلوك إسمنتي',
    colorTheme: '#B85028',
  },
  'الرمل والركام': {
    name: 'الرمل والركام',
    slug: 'sand',
    image: '/images/categories/sand.jpg',
    icon: '/images/categories/sand.svg',
    alt: 'رمل بناء مغسول وشرشور وركام',
    colorTheme: '#A87834',
  },
  'الجبس والمواد اللاصقة': {
    name: 'الجبس والمواد اللاصقة',
    slug: 'gypsum-glue',
    image: '/images/categories/gypsum.jpg',
    icon: '/images/categories/gypsum.svg',
    alt: 'جبس ومواد لاصقة للسيراميك',
    colorTheme: '#2C7A8B',
  },
  'المسامير والتربيط': {
    name: 'المسامير والتربيط',
    slug: 'nails-binding',
    image: '/images/categories/nails.jpg',
    icon: '/images/categories/nails.svg',
    alt: 'مسامير وسلك تربيط حديد التسليح',
    colorTheme: '#4B5563',
  },
  'العتبات': {
    name: 'العتبات',
    slug: 'lintels',
    image: '/images/categories/lintels.jpg',
    icon: '/images/categories/lintels.svg',
    alt: 'عتبات خرسانية جاهزة مسبقة الصب',
    colorTheme: '#0D7253',
  },
  'البومشي': {
    name: 'البومشي',
    slug: 'pomshi',
    image: '/images/categories/pumice.jpg',
    icon: '/images/categories/pumice.svg',
    alt: 'بومشي عازل ومواد خفيفة',
    colorTheme: '#C05621',
  },
  'مواد أخرى': {
    name: 'مواد أخرى',
    slug: 'other',
    image: '/images/categories/other.jpg',
    icon: '/images/categories/other.svg',
    alt: 'مستلزمات ومواد بناء متنوعة',
    colorTheme: '#4A5568',
  },
};

/**
 * Get category asset metadata with guaranteed fallback
 */
export function getCategoryAsset(categoryName: string): CategoryAsset {
  if (CATEGORY_ASSETS[categoryName]) {
    return CATEGORY_ASSETS[categoryName];
  }

  // Find by partial match if exact match fails
  const matchedKey = Object.keys(CATEGORY_ASSETS).find((key) =>
    categoryName.includes(key) || key.includes(categoryName)
  );

  if (matchedKey && CATEGORY_ASSETS[matchedKey]) {
    return CATEGORY_ASSETS[matchedKey];
  }

  // Neutral fallback
  return {
    name: categoryName,
    slug: encodeURIComponent(categoryName),
    image: '/images/categories/other.jpg',
    icon: '/images/categories/other.svg',
    alt: categoryName,
    colorTheme: '#153D7A',
  };
}

/**
 * Get product visual image URL
 */
export function getProductImage(categoryName: string, subcategory?: string | null): string {
  if (subcategory) {
    if (subcategory.includes('حديد') || subcategory.includes('تسليح')) {
      return '/images/categories/iron.jpg';
    }
    if (subcategory.includes('أسمنت') || subcategory.includes('اسمنت')) {
      return '/images/categories/cement.jpg';
    }
    if (subcategory.includes('ياجور') || subcategory.includes('بلوك') || subcategory.includes('هوردي')) {
      return '/images/categories/bricks.jpg';
    }
    if (subcategory.includes('رمل') || subcategory.includes('شرشور') || subcategory.includes('قرينيليه') || subcategory.includes('تربة')) {
      return '/images/categories/sand.jpg';
    }
    if (subcategory.includes('جبس') || subcategory.includes('كولا') || subcategory.includes('لاصق')) {
      return '/images/categories/gypsum.jpg';
    }
    if (subcategory.includes('مسمار') || subcategory.includes('مسامير') || subcategory.includes('سلك') || subcategory.includes('تربيط')) {
      return '/images/categories/nails.jpg';
    }
    if (subcategory.includes('عتب') || subcategory.includes('عتبة')) {
      return '/images/categories/lintels.jpg';
    }
  }

  return getCategoryAsset(categoryName).image;
}
