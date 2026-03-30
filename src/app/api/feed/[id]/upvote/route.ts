import { prisma } from "@/lib/db";

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

    const updated = await prisma.communityPost.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
      select: { upvotes: true },
    });

    return Response.json({ upvotes: updated.upvotes });
  } catch (error) {
    console.error("POST /api/feed/[id]/upvote error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
