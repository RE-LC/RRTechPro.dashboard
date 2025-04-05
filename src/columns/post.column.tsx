"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Post {
  id: string
  title: string
  description: string
  category: {
    name: string
  }
  published: boolean
}

export const columns: ColumnDef<Post>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Title" />
    },
    cell: ({ row }) => row.getValue("title"),
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Description" />
    },
    cell: ({ row }) => row.getValue("description"),
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Category" />
    },
    cell: ({ row }) => {
      const category: Post["category"] = row.getValue("category");
      const categoryName = category.name;
      return categoryName;
    }
  },
  {
    accessorKey: "published",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Published" />
    },
    cell: ({ row }) => {
      const value = row.getValue("published");
      return <div>{value ? "Yes" : "No"}</div>;
    },
  },
  {
    id: "actions", // Add an 'actions' column
    cell: ({ row }) => {
      const post = row.original; // The original data for this row (the full Post object)

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => {
              navigator.clipboard.writeText(post.id)
                .then(() => {
                  toast.success('Post ID copied to clipboard!', { richColors: true })
                })
                .catch(() => {
                  toast.error('Failed to copy Post ID!', { richColors: true });
                })
            }}>
              Copy Post ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Post</DropdownMenuItem>
            <DropdownMenuItem>View Post Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const samplePosts: Post[] = [
  {
    id: "1",
    title: "Understanding Next.js",
    description: "A deep dive into Next.js features and capabilities.",
    published: true,
    category: {
      name: "tech"
    },
  },
  {
    id: "2",
    title: "Mastering Prisma with Next.js",
    description: "Learn how to integrate Prisma ORM in your Next.js projects.",
    published: false,
    category: {
      name: "database"
    },
  },
];