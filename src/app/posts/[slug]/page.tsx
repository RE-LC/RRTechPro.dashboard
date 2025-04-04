import PostForm from "@/components/forms/post-form";
import { prisma } from "@/lib/prisma"

export default async function NewPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const tags = await prisma.tag.findMany();
    const categories = await prisma.category.findMany();

    if (slug == "new") {
        return (
            <PostForm tags={tags} categories={categories} />
        )
    }

    const post = await prisma.post.findUnique({
        where: {
            slug
        }
    })

    if (post) {
        <PostForm tags={tags} categories={categories} initialData={post} />
    }
}