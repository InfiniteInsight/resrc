import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { FeedQuerySchema, FeedPostSchema } from "@/lib/validators";
import type { FeedResponse, FeedPost } from "@/types/index";
import type { PostCategory } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const parsed = FeedQuerySchema.safeParse({
      zip: url.searchParams.get("zip"),
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
    });

    if (!parsed.success) {
      return Response.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { zip, page, limit } = parsed.data;

    const where = { zipCode: zip, status: "visible" };

    const total = await prisma.communityPost.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const posts = await prisma.communityPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        body: true,
        category: true,
        upvotes: true,
        flags: true,
        createdAt: true,
      },
    });

    const response: FeedResponse = {
      posts: posts.map((p): FeedPost => ({
        ...p,
        category: p.category as PostCategory,
        createdAt: p.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages,
    };

    return Response.json(response);
  } catch (error) {
    console.error("GET /api/feed error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = FeedPostSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { zip, body: postBody, category } = parsed.data;

    // Verify the zip code exists
    const zipRecord = await prisma.zipCode.findUnique({ where: { zip } });
    if (!zipRecord) {
      return Response.json(
        { error: "Zip code not found" },
        { status: 404 }
      );
    }

    const post = await prisma.communityPost.create({
      data: {
        zipCode: zip,
        body: postBody,
        category,
        status: "visible",
      },
      select: {
        id: true,
        body: true,
        category: true,
        upvotes: true,
        flags: true,
        createdAt: true,
      },
    });

    return Response.json(
      { ...post, createdAt: post.createdAt.toISOString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/feed error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
