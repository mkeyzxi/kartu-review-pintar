import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/session";
import { adminGetAnalyticsData, clearAnalyticsCache } from "@/lib/firestore/admin-analytics";
import { ApiResponse } from "@/types/api";
import { AnalyticsData } from "@/types/scan-log";
import { generateExcelExport } from "@/lib/utils/excel";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const session = await verifyAdminSession(request);
        if ("error" in session) {
            return session.error;
        }

        const { searchParams } = new URL(request.url);
        const yearParam = searchParams.get("year");
        const monthParam = searchParams.get("month");
        const dayParam = searchParams.get("day");
        const year = yearParam && !isNaN(parseInt(yearParam)) ? parseInt(yearParam) : undefined;
        const month = monthParam && !isNaN(parseInt(monthParam)) ? parseInt(monthParam) : undefined;
        const day = dayParam && !isNaN(parseInt(dayParam)) ? parseInt(dayParam) : undefined;
        const exportFormat = searchParams.get("export");

        if (exportFormat === 'excel') {
            const analyticsData = await adminGetAnalyticsData({ year, month, day });
            const excelFile = generateExcelExport(analyticsData);
            return new NextResponse(excelFile, {
                headers: {
                    'Content-Disposition': `attachment; filename="scan-analytics-${year || "all"}-${month || "all"}-${day || "all"}.xlsx"`,
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            });
        }

        const analyticsData = await adminGetAnalyticsData({ year, month, day });

        return NextResponse.json<ApiResponse<AnalyticsData>>({
            success: true,
            data: analyticsData,
        });
    } catch (error: any) {
        console.error("Error getting analytics:", {
            message: error?.message,
            code: error?.code,
            stack: error?.stack,
        });
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: "Terjadi kesalahan server",
                // Sertakan detail agar penyebab 500 terlihat di devtools
                details: error?.message || String(error),
            },
            { status: 500 },
        );
    }
}