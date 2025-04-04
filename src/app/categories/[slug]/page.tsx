import CategoryForm from "@/components/forms/category-form";
import { prisma } from "@/lib/prisma";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const category = await prisma.category.findUnique({
        where: {
            slug
        }
    });

    if (slug == "new") {
        return <CategoryForm />
    }

    if (category) {
        return <CategoryForm initialData={category} />
    }
}