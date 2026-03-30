import { prisma } from "@/lib/db";
import { FLAG_THRESHOLD } from "@/lib/constants";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const newFlags = post.flags + 1;
    const newStatus = newFlags >= FLAG_THRESHOLD ? "flagged" : post.status;

    const updated = await prisma.communityPost.update({
      where: { id },
      data: { flags: newFlags, status: newStatus },
      select: { flags: true, status: true },
    });

    return Response.json({ flags: updated.flags, status: updated.status });
  } catch (error) {
    console.error("POST /api/feed/[id]/flag error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
