import { DataTable } from "@/components/data-table/data-table";
import { columns } from "@/columns/category.column";
import { prisma } from "@/lib/prisma";

export default async function Posts() {
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            _count: {
                select: {
                    posts: true
                }
            }
        },
    });

    const formattedCategories = categories.map(category => ({
        ...category,
        posts: category._count.posts
    }));

    return (
        <div className="w-full px-5">
            <DataTable columns={columns} searchKey="name" data={formattedCategories} newButton newButtonUrl="/categories/new" />
        </div>
    );
}