"use client"

import * as React from "react";
import {
  BookOpen,
  Bot,
  Settings2,
  SquarePen,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: SquareTerminal,
    },
    {
      title: "Posts",
      url: "/posts",
      icon: SquarePen,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: Bot,
    },
    {
      title: "Guides",
      url: "/guides",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
