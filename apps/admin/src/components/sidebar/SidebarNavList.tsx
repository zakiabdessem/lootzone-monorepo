import React, { JSX } from "react";

import reduceChildRoutes from "./reduceChildRoutes";

import { SidebarItemsType } from "@/types/sidebar";
import { usePathname } from "next/navigation";

interface SidebarNavListProps {
  depth: number;
  pages: SidebarItemsType[];
}

const SidebarNavList = (props: SidebarNavListProps) => {
  const { pages, depth } = props;
  const pathname = usePathname();

  const childRoutes = pages.reduce(
    (items, page) =>
      reduceChildRoutes({ items, page, currentRoute: pathname, depth }),
    [] as JSX.Element[]
  );

  return <React.Fragment>{childRoutes}</React.Fragment>;
};

export default SidebarNavList;
