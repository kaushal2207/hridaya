import {
  Boxes, Briefcase, Building2, Code2, Cpu, Gem, Globe, GraduationCap, Layers, LayoutTemplate, LifeBuoy, ListChecks, MapPin,
  Megaphone, MessageSquare, MousePointerClick, Package, Palette, PenTool, Rocket, Search, Share2, Shirt, ShoppingBag,
  ShoppingCart, Sparkles, Stethoscope, Store, Target, TrendingUp, Truck, Users, Wallet, type LucideProps,
} from "lucide-react";

const MAP = {
  Boxes, Briefcase, Building2, Code2, Cpu, Gem, Globe, GraduationCap, Layers, LayoutTemplate, LifeBuoy, ListChecks, MapPin,
  Megaphone, MessageSquare, MousePointerClick, Package, Palette, PenTool, Rocket, Search, Share2, Shirt, ShoppingBag,
  ShoppingCart, Sparkles, Stethoscope, Store, Target, TrendingUp, Truck, Users, Wallet,
};
export type IconName = keyof typeof MAP;
export const ICON_NAMES = Object.keys(MAP) as IconName[];

export function Icon({ name, ...p }: { name: string | null | undefined } & Omit<LucideProps, "name">) {
  const C = MAP[(name ?? "") as IconName] ?? Sparkles;
  return <C aria-hidden="true" {...p} />;
}
