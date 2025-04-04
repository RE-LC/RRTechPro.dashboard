import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "@/columns/post.column";

export default async function Posts() {
    const posts = await prisma?.post.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          published: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      });
      
    return (
        <div className="w-full px-5">
            <DataTable columns={columns} searchKey="title" data={posts} newButton newButtonUrl="/posts/new" />
        </div>
    );
}
