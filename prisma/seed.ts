import { PrismaClient, AdminRole, AdminStatus } from "@prisma/client";
import { hashPassword } from "@/lib/auth/hash";
import { env } from "@/lib/env";

const prisma = new PrismaClient();
const SETTINGS_ID = "conference-settings";
const superAdminEmail = env.SUPER_ADMIN_EMAIL;
const superAdminPassword = env.SUPER_ADMIN_PASSWORD;

async function main() {
    console.log("Seeding database...");

    await prisma.setting.upsert({
        where: { id: SETTINGS_ID },
        update: {},
        create: {
            id: SETTINGS_ID,
            conferenceName: "19TH UNILAG ANNUAL RESEARCH CONFERENCE 2026",
            conferenceYear: 2026,
            abstractDeadline: new Date("2026-08-24T23:59:59"),
            earlyBirdDeadline: new Date("2026-09-25T23:59:59"),
            regularDeadline: new Date("2026-10-16T23:59:59"),
            conferenceStartDate: new Date("2026-10-20"),
            conferenceEndDate: new Date("2026-10-22"),
            earlyBirdFee: 30000,
            regularFee: 40000,
            studentEarlyBirdFee: 10000,
            studentRegularFee: 20000,
            internationalFee: 50,
        },
    });
    if (!superAdminPassword || !superAdminEmail) {
        throw new Error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env");
    }

    await prisma.admin.upsert({
        where: { email: superAdminEmail },
        update: {},
        create: {
            fullName: "System Administrator",
            email: superAdminEmail,
            passwordHash: hashPassword(superAdminPassword),
            role: AdminRole.SUPER_ADMIN,
            active: AdminStatus.ACTIVE,
        },
    });

    console.log("Database seeding successful")
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });