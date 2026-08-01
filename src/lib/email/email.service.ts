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

        const qrUrl = `${process.env.APP_URL}/api/qr/download?registrationId=${registration.id}`;

        await transporter.sendMail({
            from:
                process.env.SMTP_FROM,

            to:
                registration.email,

            subject:
                "UARC 2026 Registration Confirmation",

            html: `
        <h2>Registration Successful</h2>

        <p>Hello <strong>${registration.fullName}</strong>,</p>

        <p>
          Your conference registration has been confirmed.
        </p>

        <p>
          Registration Code:
          <strong>${registration.registrationCode}</strong>
        </p>

        <p>
          Please present the QR Code below during check-in.
        </p>

        <p>
          <img
            src="${qrUrl}"
            alt="QR Code"
            width="220"
          />
        </p>

        <p>
          If the image does not display,
          download it here:
        </p>

        <a href="${qrUrl}">
          Download QR Code
        </a>

        <br /><br />

        <p>
          Thank you for registering for UARC 2026.
        </p>
      `,
        });
    }
}

export const emailService =
    new EmailService();