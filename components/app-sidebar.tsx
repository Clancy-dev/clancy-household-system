"use client";

import * as React from "react";
import {
  IconCategory,
  IconCategory2,
  IconFolders,
  IconLayoutDashboard,
  IconReceipt,
  IconTool,

} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useTheme } from "next-themes";

// Accept role as prop
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: "ADMIN" | "USER";
}

export function AppSidebar({ role, ...props }: AppSidebarProps) {

  const { theme } = useTheme();

  // Filter nav items based on role
  const navMainItems = [
    {
      title: "Expenses",
      url: "/expenses",
      icon: IconReceipt,
    },
    {
      title: "Category",
      url: "/categories",
      icon: IconFolders,
    },
    {
      title: "Maintenance",
      url: "/maintenance",
      icon: IconTool,
    },
    

  
  ];



  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-1.5 hover:bg-transparent focus:bg-transparent active:bg-transparent cursor-default">
              
              <div className="flex items-center gap-3 ">
  <div className="relative w-8 h-8">
    <Image
      src={theme === "dark" ? "/logo.png" : "/logo.png"}
      alt="Benevora Initiative"
      fill
      className="object-contain"
    />
  </div>

  <div className="flex flex-col leading-tight">
    <span className="text-sm font-bold text-primary">
      Clancy's
    </span>
    <span className="text-xs text-muted-foreground">
      Household System
    </span>
  </div>
</div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}