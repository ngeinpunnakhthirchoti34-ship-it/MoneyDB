import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Home,
  HeartPulse,
  Film,
  GraduationCap,
  MoreHorizontal,
  Briefcase,
  Store,
  Laptop,
  TrendingUp,
  Award,
  Gift,
  PlusCircle,
  MinusCircle,
  HelpCircle,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-5 h-5' }) => {
  switch (iconName) {
    case 'Utensils':
      return <Utensils className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Receipt':
      return <Receipt className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Film':
      return <Film className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Store':
      return <Store className={className} />;
    case 'Laptop':
      return <Laptop className={className} />;
    case 'TrendingUp':
      return <TrendingUp className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Gift':
      return <Gift className={className} />;
    case 'PlusCircle':
      return <PlusCircle className={className} />;
    case 'MinusCircle':
      return <MinusCircle className={className} />;
    case 'MoreHorizontal':
    default:
      return <MoreHorizontal className={className} />;
  }
};
