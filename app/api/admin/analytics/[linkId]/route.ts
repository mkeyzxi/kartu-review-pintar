import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/session";
import { adminGetLinkAnalytics } from "@/lib/firestore/admin-analytics";
import { ApiResponse } from "@/types/api";
import { LinkAnalyticsData } from "@/types/scan-log";
import { generateLinkExcelExport } from "@/lib/utils/excel";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const session = await verifyAdminSession(request);
    if ("error" in session) {
      return session.error;
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year") && !isNaN(parseInt(searchParams.get("year")!)) ? parseInt(searchParams.get("year")!) : undefined;
    const month = searchParams.get("month") && !isNaN(parseInt(searchParams.get("month")!)) ? parseInt(searchParams.get("month")!) : undefined;
    const day = searchParams.get("day") && !isNaN(parseInt(searchParams.get("day")!)) ? parseInt(searchParams.get("day")!) : undefined;
    const exportFormat = searchParams.get("export");

    if (exportFormat === 'excel') {
      const analyticsData = await adminGetLinkAnalytics(params.linkId, { year, month, day });
      const excelFile = generateLinkExcelExport(analyticsData);
      return new NextResponse(excelFile, {
        headers: {
          'Content-Disposition': `attachment; filename="scan-analytics-${analyticsData.linkSlug}-${year || "all"}-${month || "all"}-${day || "all"}.xlsx"`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
    }

    const analyticsData = await adminGetLinkAnalytics(params.linkId, { year, month, day });

    return NextResponse.json<ApiResponse<LinkAnalyticsData>>({
      success: true,
      data: analyticsData,
    });
  } catch (error: any) {
    console.error("Error getting link analytics:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Terjadi kesalahan server",
        details: error?.message || String(error),
      },
      { status: 500 },
    );
  }
}
