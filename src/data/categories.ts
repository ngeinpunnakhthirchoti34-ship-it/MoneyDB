import { CategoryItem } from '../types';

export const EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'exp_food', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#EF4444', bgLight: '#FEE2E2' },
  { id: 'exp_transport', name: 'การเดินทางและยานพาหนะ', type: 'expense', icon: 'Car', color: '#F97316', bgLight: '#FFEDD5' },
  { id: 'exp_shopping', name: 'ช้อปปิ้งและของใช้', type: 'expense', icon: 'ShoppingBag', color: '#EC4899', bgLight: '#FCE7F3' },
  { id: 'exp_bills', name: 'บิล ค่าน้ำ ค่าไฟ เน็ต', type: 'expense', icon: 'Receipt', color: '#8B5CF6', bgLight: '#EDE9FE' },
  { id: 'exp_housing', name: 'ค่าเช่าและที่อยู่อาศัย', type: 'expense', icon: 'Home', color: '#6366F1', bgLight: '#E0E7FF' },
  { id: 'exp_health', name: 'สุขภาพและการแพทย์', type: 'expense', icon: 'HeartPulse', color: '#10B981', bgLight: '#D1FAE5' },
  { id: 'exp_entertainment', name: 'ความบันเทิงและท่องเที่ยว', type: 'expense', icon: 'Film', color: '#06B6D4', bgLight: '#CFFAFE' },
  { id: 'exp_education', name: 'การศึกษาและพัฒนาตนเอง', type: 'expense', icon: 'GraduationCap', color: '#3B82F6', bgLight: '#DBEAFE' },
  { id: 'exp_other', name: 'รายจ่ายอื่นๆ', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', bgLight: '#F1F5F9' },
];

export const INCOME_CATEGORIES: CategoryItem[] = [
  { id: 'inc_salary', name: 'เงินเดือน / ค่าจ้าง', type: 'income', icon: 'Briefcase', color: '#10B981', bgLight: '#D1FAE5' },
  { id: 'inc_business', name: 'ธุรกิจส่วนตัว / ค้าขาย', type: 'income', icon: 'Store', color: '#059669', bgLight: '#A7F3D0' },
  { id: 'inc_freelance', name: 'งานฟรีแลนซ์ / รับจ้างเสริม', type: 'income', icon: 'Laptop', color: '#3B82F6', bgLight: '#DBEAFE' },
  { id: 'inc_investment', name: 'กำไร / ปันผล / ดอกเบี้ย', type: 'income', icon: 'TrendingUp', color: '#8B5CF6', bgLight: '#EDE9FE' },
  { id: 'inc_bonus', name: 'โบนัส / เงินพิเศษ', type: 'income', icon: 'Award', color: '#F59E0B', bgLight: '#FEF3C7' },
  { id: 'inc_gift', name: 'เงินของขวัญ / ได้รับมา', type: 'income', icon: 'Gift', color: '#EC4899', bgLight: '#FCE7F3' },
  { id: 'inc_other', name: 'รายรับอื่นๆ', type: 'income', icon: 'PlusCircle', color: '#64748B', bgLight: '#F1F5F9' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryMeta(categoryName: string, type: 'income' | 'expense'): CategoryItem {
  const match = ALL_CATEGORIES.find((c) => c.name === categoryName && c.type === type)
    || ALL_CATEGORIES.find((c) => c.name === categoryName);
  if (match) return match;
  return {
    id: 'unknown',
    name: categoryName,
    type,
    icon: type === 'income' ? 'PlusCircle' : 'MinusCircle',
    color: type === 'income' ? '#10B981' : '#EF4444',
    bgLight: type === 'income' ? '#D1FAE5' : '#FEE2E2',
  };
}

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

export const THAI_SHORT_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];
