import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ZipQuerySchema } from "@/lib/validators";
import type { ResourcesResponse, CategoryCount, ResourceResult } from "@/types/index";
import type { ResourceScope } from "@/lib/constants";

const SCOPE_ORDER: Record<string, number> = {
  zip_specific: 0,
  city: 1,
  county: 2,
  state: 3,
  national: 4,
};

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const parsed = ZipQuerySchema.safeParse({
      zip: url.searchParams.get("zip"),
      category: url.searchParams.get("category") || undefined,
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

    const { zip, category, page, limit } = parsed.data;

    // Look up zip code
    const zipRecord = await prisma.zipCode.findUnique({ where: { zip } });
    if (!zipRecord) {
      return Response.json(
        { error: "Zip code not found" },
        { status: 404 }
      );
    }

    const { city, county, stateCode } = zipRecord;

    // Build the scope filter: resources matching this location
    const scopeFilter = [
      { scope: "national" },
      { scope: "state", stateCode },
      { scope: "county", county },
      { scope: "city", stateCode }, // city-level resources are state-associated for now
      {
        scope: "zip_specific",
        zipCodes: { some: { zipCode: zip } },
      },
    ];

    const baseWhere = {
      OR: scopeFilter,
    };

    // Get category counts (ignoring category filter) for all matching resources
    const allMatching = await prisma.resource.findMany({
      where: baseWhere,
      select: {
        category: { select: { slug: true, name: true, icon: true } },
      },
    });

    const countMap = new Map<string, CategoryCount>();
    for (const r of allMatching) {
      const key = r.category.slug;
      const existing = countMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        countMap.set(key, {
          slug: r.category.slug,
          name: r.category.name,
          icon: r.category.icon,
          count: 1,
        });
      }
    }
    const categories = Array.from(countMap.values()).sort((a, b) =>
      a.slug.localeCompare(b.slug)
    );

    // Build the filtered where clause (with optional category)
    const filteredWhere = category
      ? { ...baseWhere, category: { slug: category } }
      : baseWhere;

    // Get total count for pagination
    const total = await prisma.resource.count({ where: filteredWhere });
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // Fetch paginated results
    const resources = await prisma.resource.findMany({
      where: filteredWhere,
      include: { category: { select: { slug: true, name: true, icon: true } } },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Sort: local first (zip_specific, city, county, state, national), then alphabetically
    resources.sort((a, b) => {
      const scopeDiff =
        (SCOPE_ORDER[a.scope] ?? 99) - (SCOPE_ORDER[b.scope] ?? 99);
      if (scopeDiff !== 0) return scopeDiff;
      return a.name.localeCompare(b.name);
    });

    const results: ResourceResult[] = resources.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      category: r.category,
      subcategory: r.subcategory,
      scope: r.scope as ResourceScope,
      url: r.url,
      phone: r.phone,
      address: r.address,
      eligibilitySummary: r.eligibilitySummary,
      incomeLimitNotes: r.incomeLimitNotes,
      hours: r.hours,
      languages: r.languages,
      verifiedAt: r.verifiedAt?.toISOString() ?? null,
    }));

    const response: ResourcesResponse = {
      location: { zip, city, county, state: stateCode },
      results,
      total,
      page,
      totalPages,
      categories,
    };

    return Response.json(response);
  } catch (error) {
    console.error("GET /api/resources error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
