import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/session";
import { adminGetAnalyticsData } from "@/lib/firestore/admin-analytics";
import { ApiResponse } from "@/types/api";
import { AnalyticsData } from "@/types/scan-log";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const session = await verifyAdminSession(request);
        if ("error" in session) {
            return session.error;
        }

        const { searchParams } = new URL(request.url);
        const year = searchParams.get("year") && !isNaN(parseInt(searchParams.get("year")!)) ? parseInt(searchParams.get("year")!) : undefined;
        const month = searchParams.get("month") && !isNaN(parseInt(searchParams.get("month")!)) ? parseInt(searchParams.get("month")!) : undefined;
        const day = searchParams.get("day") && !isNaN(parseInt(searchParams.get("day")!)) ? parseInt(searchParams.get("day")!) : undefined;

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
