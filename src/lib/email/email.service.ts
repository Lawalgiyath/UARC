import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { transporter } from "./email.transporter";

export class EmailService {

    async sendRegistrationConfirmation(
        registrationId: string
    ): Promise<void> {

        const registration =
            await prisma.registration.findUnique({
                where: {
                    id: registrationId,
                },

                include: {
                    qrCode: true,
                },
            });
        if (!registration) {
            throw new Error(
                "Registration not found."
            );
        }
        if (!registration.qrCode) {
            throw new Error(
                "QR Code has not been generated."
            );
        }
        if (!registration.qrCode.qrImagePath) {
            throw new Error(
                "QR image path is missing."
            );
        }

        const qrPath =
            path.join(
                process.cwd(),
                "public",
                registration.qrCode.qrImagePath
            );

        await fs.access(qrPath);

        const qrDownloadUrl =
            `${process.env.APP_URL}/api/qr/download?registrationId=${registration.id}`;

        await transporter.sendMail({

            from:
                process.env.SMTP_FROM,

            to:
                registration.email,

            subject:
                "UARC 2026 Registration Confirmation",

            html: `

            <h2>
                Registration Successful
            </h2>

            <p>
                Hello 
                <strong>
                    ${registration.fullName}
                </strong>
            </p>

            <p>
                Your payment has been confirmed.
                Your conference registration is complete.
            </p>

            <p>
                Registration Code:
                <strong>
                    ${registration.registrationCode}
                </strong>
            </p>

            <p>
                Please present the attached QR Code
                during check-in.
            </p>

            <p>
                <img
                    src="cid:registrationqr"
                    alt="Registration QR Code"
                    width="250"
                />
            </p>

            <p>
                If you need another copy:
            </p>

            <a href="${qrDownloadUrl}">
                Download QR Code
            </a>

            <br/><br/>

            <p>
                Thank you for registering
                for UARC 2026.
            </p>

            `,

            attachments: [

                {
                    filename:
                        "UARC-registration-qrcode.png",

                    path:
                        qrPath,

                    cid:
                        "registrationqr",
                }

            ],

        });

    }

}


export const emailService =
    new EmailService();