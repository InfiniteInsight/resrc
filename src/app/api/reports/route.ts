import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ReportSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ReportSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { zip, category, body: reportBody, severity, locationDetails, contactInfo } = parsed.data;

    // Verify the zip code exists
    const zipRecord = await prisma.zipCode.findUnique({ where: { zip } });
    if (!zipRecord) {
      return Response.json(
        { error: "Zip code not found" },
        { status: 404 }
      );
    }

    const report = await prisma.report.create({
      data: {
        zipCode: zip,
        category,
        body: reportBody,
        severity,
        locationDetails: locationDetails ?? null,
        contactEncrypted: contactInfo ?? null, // plain text for now, Phase 2 adds encryption
        status: "new",
      },
      select: { id: true },
    });

    return Response.json(
      { id: report.id, message: "Report submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
