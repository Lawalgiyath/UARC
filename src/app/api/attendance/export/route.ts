import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { attendanceService } from "@/lib/attendance/attendance.service";
import { attendanceQuerySchema } from "@/lib/attendance/attendance.validation";
import { handleApiError } from "@/lib/api/api-errors";

function parseBoolean(
    value: string | null
): boolean | undefined {
    if (value === "true") return true;
    if (value === "false") return false;

    return undefined;
}

export async function GET(
    request: NextRequest
) {
    try {
        const searchParams =
            request.nextUrl.searchParams;

        const input =
            attendanceQuerySchema.parse({
                registrationId:
                    searchParams.get(
                        "registrationId"
                    ) ?? undefined,

                checkedIn:
                    parseBoolean(
                        searchParams.get(
                            "checkedIn"
                        )
                    ),

                checkedOut:
                    parseBoolean(
                        searchParams.get(
                            "checkedOut"
                        )
                    ),
            });

        const data =
            await attendanceService.exportAttendance(
                input
            );

        const csv =
            Papa.unparse(data);

        const filename = `attendance-${new Date()
                .toISOString()
                .split("T")[0]
            }.csv`;

        return new NextResponse(csv, {
            status: 200,

            headers: {
                "Content-Type":
                    "text/csv; charset=utf-8",

                "Content-Disposition":
                    `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}