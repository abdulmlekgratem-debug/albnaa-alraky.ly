import json
import os

with open('parsed_seed_products.json', 'r', encoding='utf-8') as f:
    raw_products = json.load(f)

market_prices = {
    'P014': 3950, # حديد تسليح 8 ملي مصراتة
    'P015': 3880, # حديد تسليح 8 ملي السائح
    'P017': 3950, # حديد تسليح 10 ملي مصراتة
    'P018': 3880, # حديد تسليح 10 ملي السائح
    'P020': 3950, # حديد تسليح 12 ملي مصراتة
    'P019': 3880, # حديد تسليح 12 ملي السائح
    'P021': 3920, # حديد تسليح 12 ملي الرواد
    'P022': 3940, # حديد تسليح 12 ملي البنيان
    'P023': 3950, # حديد تسليح 14 ملي مصراتة
    'P024': 3880, # حديد تسليح 14 ملي السائح
    'P025': 3950, # حديد تسليح 16 ملي مصراتة
    'P026': 3880, # حديد تسليح 16 ملي السائح
    'P028': 3950, # حديد تسليح 20 ملي مصراتة
    'P029': 3880, # حديد تسليح 20 ملي السائح
    'P001': 28.5, # اسمنت اتحاد
    'P002': 27.0, # اسمنت مكيس
    'P003': 28.0, # اسمنت العربية
    'P005': 38.0, # اسمنت ابيض رويال
    'P057': 305,  # ياجور بناء 20*20*40 صرمان
    'P058': 295,  # ياجور بناء 20*20*40 غريان
    'P059': 310,  # ياجور بناء 20*20*40 زليتن
    'P066': 320,  # ياجور سقف 15*40 صرمان
    'P068': 340,  # ياجور سقف 20*40 صرمان
    'P082': 280,  # بلوك مصمت 20*40
    'P086': 220,  # رمل احمر زليتن
    'P087': 260,  # رمل مغسول
    'P091': 310,  # شرشور 1 زليتن
    'P092': 320,  # شرشور 2 زليتن
    'P096': 350,  # قرينيليه 1
    'P105': 22.0, # جبس العز
    'P106': 24.0, # كناوف
    'P109': 18.5, # كولا سي ون
    'P110': 26.0, # مصمار 10 وزن 2 كيلو
    'P118': 45.0, # سلك رباط
    'P122': 35.0, # عتبة 120*20
    'P123': 42.0, # عتبة 140*20
    'P126': 65.0, # عتبة 200*20
    'P130': 75.0, # بومشي عادي
}

formatted_items = []
for p in raw_products:
    pid = p.get('id')
    price = market_prices.get(pid, None)
    available = price is not None
    updated = 'اليوم 08:30 صباحًا' if available else None
    
    item = {
        'id': pid,
        'source_code': p.get('source_code'),
        'الترتيب': p.get('الترتيب'),
        'التصنيف': p.get('التصنيف'),
        'التصنيف_الفرعي': p.get('التصنيف_الفرعي'),
        'اسم_العرض': p.get('اسم_العرض'),
        'الاسم_الأصلي': p.get('الاسم_الأصلي'),
        'النوع': p.get('النوع'),
        'المقاس': p.get('المقاس'),
        'الطول': p.get('الطول'),
        'المصنع_او_المصدر': p.get('المصنع_او_المصدر'),
        'المنشأ': p.get('المنشأ'),
        'العبوة': p.get('العبوة'),
        'الوحدة': p.get('الوحدة') or 'غير محددة',
        'سعر_اليوم': str(price) if price is not None else None,
        'متوفر': 'نعم' if available else 'لا',
        'فعال': p.get('فعال') or 'نعم',
        'آخر_تحديث': updated,
        'كلمات_البحث': p.get('كلمات_البحث'),
        'يحتاج_مراجعة': p.get('يحتاج_مراجعة'),
        'ملاحظات': p.get('ملاحظات'),
    }
    formatted_items.append(item)

os.makedirs('src/data', exist_ok=True)
json_str = json.dumps(formatted_items, ensure_ascii=False, indent=2)

file_content = f"""import {{ RawExcelRow, ProductDTO }} from '../types/product';
import {{ parseRawRowsToProducts }} from '../lib/excelParser';

/**
 * 134-item Snapshot taken directly from Excel table ProductsTable
 */
export const LOCAL_RAW_SNAPSHOT: RawExcelRow[] = {json_str};

export const LOCAL_PRODUCTS_SNAPSHOT: ProductDTO[] = parseRawRowsToProducts(LOCAL_RAW_SNAPSHOT);
"""

with open('src/data/localSnapshot.ts', 'w', encoding='utf-8') as f:
    f.write(file_content)

print(f"Generated src/data/localSnapshot.ts with {len(formatted_items)} items.")
