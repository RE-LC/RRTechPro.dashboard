import { prisma } from "@/lib/prisma"; 
import DialogClient from "@/components/DialogClient"; 

export default async function CategoryModal({ params }: { params: Promise<{ slug: string }> }) {
    // Fetch category data on the server side using prisma and the slug parameter
    const { slug } = await params;
    const category = await prisma.category.findUnique({
        where: {
            slug,
        },
    });

    return (
        <>
            <DialogClient category={category || undefined} />
        </>
    );
}
