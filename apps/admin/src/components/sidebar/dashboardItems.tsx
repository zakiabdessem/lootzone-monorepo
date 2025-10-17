import { SidebarItemsType } from "@/types/sidebar";
import { Layout, List, Package, ShoppingCart, Sliders, Settings } from "lucide-react";

const pagesSection = [
  {
    href: "/dashboard",
    icon: Sliders,
    title: "Dashboard",
  },
  {
    href: "/categories",
    icon: List,
    title: "Categories",
  },
  {
    href: "/orders",
    icon: ShoppingCart,
    title: "Orders",
  },
  {
    href: "/products",
    icon: Package,
    title: "Products",
  },
] as SidebarItemsType[];

// Elements section hidden per requirements
const elementsSection: SidebarItemsType[] = [] as SidebarItemsType[];

// Docs section hidden per requirements
const docsSection: SidebarItemsType[] = [] as SidebarItemsType[];

const navItems = [
  { title: "Pages", pages: pagesSection },
  {
    title: "Admin",
    pages: [
      {
        href: "/site-settings",
        icon: Settings,
        title: "Site Settings",
      },
      {
        href: "/hero-slides",
        icon: Layout,
        title: "Hero Slides",
      },
    ] as SidebarItemsType[],
  },
];

export default navItems;