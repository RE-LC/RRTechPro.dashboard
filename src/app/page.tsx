import { DataTable } from "@/components/data-table/data-table";
import { samplePosts, columns } from "@/columns/post.column";

export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4">
      <DataTable searchKey="title" columns={columns} data={samplePosts} />
    </div>
  );
}