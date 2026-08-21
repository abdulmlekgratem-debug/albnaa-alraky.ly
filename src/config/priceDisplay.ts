export type PriceDisplayMode = 'live' | 'calibration';

const configuredMode = (import.meta.env.VITE_PRICE_DISPLAY_MODE || 'live').trim();

export const PRICE_DISPLAY_CONFIG = {
  mode: (configuredMode === 'calibration' ? 'calibration' : 'live') as PriceDisplayMode,

  isCalibrationMode(): boolean {
    return this.mode === 'calibration';
  },
};

export const PRICE_CALIBRATION_COPY = {
  eyebrow: 'تحديث مستمر',
  title: 'بعض الأسعار قيد المراجعة',
  description:
    'نعرض الأسعار المكتملة والمعتمدة حاليًا، ونواصل مطابقة بقية الأصناف مع مصادرنا ومراجعة وحدات القياس.',
  reassurance:
    'السعر الظاهر هو السعر المتاح للمدينة المختارة. الأسعار الصفرية والأصناف غير المتوفرة لا تظهر للزبائن.',
};
