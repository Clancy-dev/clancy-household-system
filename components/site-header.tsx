"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"

const pageTitles: Record<string, string> = {
  "/expenses": "Expenses",
  "/categories": "Categories",
  "/maintenance": "Maintenance",
  "/expenses/trash": "Expense Trash",
  "/expenses/create": "Create expense",
  "/categories/create": "Create Category",
  "/categories/trash": "Categories Trash",
  "/maintenance/trash": "Maintenance Trash",
  "/maintenance/create": "Create expense",
}

export function SiteHeader() {
  const pathname = usePathname()

  let title = pageTitles[pathname] || "Dashboard"

  if (pathname.startsWith("/expenses/") && pathname.endsWith("/edit")) {
    title = "Edit Expense"
  } 
  else if (
  pathname.startsWith("/expenses/") &&
  pathname !== "/expenses/trash" &&
  pathname !== "/expenses/create"
 ) {
    title = "View Expense"
  }

  if (pathname.startsWith("/categories/") && pathname.endsWith("/edit")) {
    title = "Edit Category"
  } 
   else if (
    pathname.startsWith("/categories/") &&
    pathname !== "/categories/create" &&
    pathname !== "/categories/trash" 
  ) {
    title = "View Category"
  }

  if (pathname.startsWith("/maintenance/") && pathname.endsWith("/edit")) {
    title = "Edit Maintenance Item"
  } 
   else if (
    pathname.startsWith("/maintenance/") &&
    pathname !== "/maintenance/create" &&
    pathname !== "/maintenance/trash"
  ) {
    title = "View Maintenance Item"
  }

  return (
    <header className="bg-white dark:bg-background rounded-tr-xl rounded-tl-xl flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <h1 className="text-base font-medium">
          {title}
        </h1>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}