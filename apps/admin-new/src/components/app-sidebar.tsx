"use client";
import {
  Package,
  Image,
  Shield,
  Settings,
  User2,
  UsersRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Products",
    url: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Hero Slides",
    url: "/dashboard/hero-slides",
    icon: Image,
  },
  {
    title: "Sessions",
    url: "/dashboard/sessions",
    icon: Shield,
  },
  {
    title: "Site Settings",
    url: "/dashboard/site-settings",
    icon: Settings,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: UsersRound,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="h-5 w-full">
              {items.map((item) => (
                <SidebarMenuItem className="h-12 w-full" key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex flex-row items-center justify-start space-x-2 border-t">
        <User2 />
        <div>User</div>
      </SidebarFooter>
    </Sidebar>
  );
}
