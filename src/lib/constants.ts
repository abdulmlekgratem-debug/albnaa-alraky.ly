/**
 * Core Brand Constants and Category Visual Metadata
 */

export const BRAND = {
  name: 'شركة البناء الراقي الجديد',
  shortName: 'البناء الراقي الجديد',
  tagline: 'لتجارة حديد التسليح ومواد البناء',
  city: 'طرابلس',
  country: 'ليبيا',
  fullLocation: 'المقر الرئيسي: زليتن – ليبيا',
  currency: 'د.ل',
  hours: 'يوميًا: 08:00 ص – 06:00 م (ما عدا الجمعة)',
  priceNote: 'الأسعار شاملة التوصيل أو الاستلام من المخازن حسب الاتفاق',
};

export const CONTACT = {
  isTemporary: false,
  branches: [
    {
      name: 'فرع طرابلس',
      phones: [
        { number: '0912011104' },
        { number: '0913141104' },
        { number: '0922011104', whatsapp: true },
      ],
    },
    {
      name: 'المقر الرئيسي – زليتن',
      phones: [
        { number: '0912172710' },
        { number: '0912141104' },
      ],
    },
    {
      name: 'فرع صرمان',
      phones: [
        { number: '0912171104' },
        { number: '0942171104' },
      ],
    },
    {
      name: 'فرع صبراتة',
      phones: [
        { number: '0919093784' },
        { number: '0922937636' },
      ],
    },
    {
      name: 'فرع الجميل',
      phones: [
        { number: '0913222556' },
        { number: '0913832929' },
      ],
    },
  ],
  socialLinks: [
    { label: 'فيسبوك', url: 'https://www.facebook.com/' },
    { label: 'إنستغرام', url: 'https://www.instagram.com/' },
    { label: 'تيك توك', url: 'https://www.tiktok.com/' },
  ],
};

// 4 Top Priority Categories shown on Home Page
export const TOP_CATEGORIES = [
  'الحديد',
  'الأسمنت',
  'الياجور والبلوك',
  'الرمل والركام',
];

// Visual Metadata for Categories (Gradient colors, SVG icons, description)
export const CATEGORY_METADATA: Record<string, {
  slug: string;
  badgeColor: string;
  themeColor: string;
  description: string;
  bgGradient: string;
}> = {
  'الحديد': {
    slug: 'iron',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    themeColor: '#1e40af',
    description: 'حديد تسليح بمختلف المقاسات من المصانع المعتمدة (مصراتة، السائح، الرواد...)',
    bgGradient: 'from-slate-900 to-blue-900',
  },
  'الأسمنت': {
    slug: 'cement',
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-300',
    themeColor: '#475569',
    description: 'أسمنت مكيس عادي وبورتلاندي وأبيض من مصانع الاتحاد والعربية والمستورد',
    bgGradient: 'from-slate-800 to-stone-700',
  },
  'الياجور والبلوك': {
    slug: 'bricks',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
    themeColor: '#b45309',
    description: 'ياجور بناء وياجور سقف (هوردي) وبلوك مصمت ومفرغ بجميع المقاسات',
    bgGradient: 'from-amber-950 to-stone-900',
  },
  'الرمل والركام': {
    slug: 'sand',
    badgeColor: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    themeColor: '#ca8a04',
    description: 'رمل بناء مغسول، شرشور، قرينيليه، مواد ردم وتربة حمراء بالحمولات',
    bgGradient: 'from-yellow-950 to-stone-900',
  },
  'الجبس والمواد اللاصقة': {
    slug: 'gypsum-glue',
    badgeColor: 'bg-cyan-50 text-cyan-900 border-cyan-200',
    themeColor: '#0891b2',
    description: 'جبس العز، كناوف، شيما جبس، ومواد لاصقة للسيراميك والبلاط (كولا C1/C2)',
    bgGradient: 'from-cyan-950 to-slate-900',
  },
  'المسامير والتربيط': {
    slug: 'nails-binding',
    badgeColor: 'bg-zinc-100 text-zinc-900 border-zinc-300',
    themeColor: '#52525b',
    description: 'مسامير خشب وصلب وسلك تربيط حديد التسليح بمختلف الأوزان',
    bgGradient: 'from-zinc-900 to-slate-900',
  },
  'العتبات': {
    slug: 'lintels',
    badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    themeColor: '#059669',
    description: 'عتبات خرسانية جاهزة ومسبقة الصب بأطوال متعددة من 100سم إلى 200سم',
    bgGradient: 'from-emerald-950 to-slate-900',
  },
  'البومشي': {
    slug: 'pomshi',
    badgeColor: 'bg-orange-50 text-orange-900 border-orange-200',
    themeColor: '#ea580c',
    description: 'بومشي عازل ومواد خفيفة لأعمال الخرسانة والأسطح',
    bgGradient: 'from-orange-950 to-slate-900',
  },
  'مواد أخرى': {
    slug: 'other',
    badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
    themeColor: '#64748b',
    description: 'مواد إنشائية ومستلزمات بناء متنوعة',
    bgGradient: 'from-slate-900 to-slate-800',
  },
};
