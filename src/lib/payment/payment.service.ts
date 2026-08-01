import crypto from "node:crypto";
import { Payment, PaymentGateway, PaymentStatus, Prisma, Registration } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mockTranzgateClient } from "./tranzgate.mock";
import { paymentErrors } from "./payment.errors";
import { TranzgateCurrency } from "./tranzgate.types";
import { DEFAULT_CURRENCY, DEFAULT_PAYMENT_GATEWAY, PAYMENT_REFERENCE_PREFIX, PAYMENT_SESSION_PREFIX } from "./payment.constants";
import { CreatePaymentInput } from "./payment.validation";
import { PreRegisterPaymentRequest } from "./tranzgate.types";
import { qrService } from "@/lib/qrcode/qr.service";
import { emailService } from "@/lib/email/email.service";

export class PaymentService {
    constructor(
        private readonly db: Prisma.TransactionClient | typeof prisma = prisma,
        private readonly gateway = mockTranzgateClient
    ) { }

    private generateTransactionReference(): string {
        return [
            PAYMENT_REFERENCE_PREFIX,
            Date.now(),
            crypto
                .randomBytes(4)
                .toString("hex")
                .toUpperCase(),
        ].join("-");
    }

    private generatePaymentSession(): string {
        return [
            PAYMENT_SESSION_PREFIX,
            crypto.randomUUID(),
        ].join("-");
    }

    private generatePaymentDocumentNumber(
        registrationCode: string
    ): string {
        return `${registrationCode}-${Date.now()}`;
    }

    private async getRegistrationOrThrow(
        registrationId: string
    ): Promise<Registration> {
        const registration =
            await this.db.registration.findUnique({
                where: {
                    id: registrationId,
                },
            });

        if (!registration) {
            return paymentErrors.registrationNotFound(
                registrationId
            );
        }

        return registration;
    }

    private async getPaymentOrThrow(
        paymentId: string
    ): Promise<Payment> {
        const payment =
            await this.db.payment.findUnique({
                where: {
                    id: paymentId,
                },
            });

        if (!payment) {
            return paymentErrors.paymentNotFound(
                paymentId
            );
        }

        return payment;
    }

    private ensurePendingPayment(
        payment: Payment
    ): void {
        if (
            payment.status !== PaymentStatus.PENDING
        ) {
            paymentErrors.paymentNotPending(
                payment.status
            );
        }
    }

    private buildPaymentData(
        registration: Registration
    ): Prisma.PaymentCreateInput {
        return {
            registration: {
                connect: {
                    id: registration.id,
                },
            },

            transactionRef:
                this.generateTransactionReference(),

            gateway:
                DEFAULT_PAYMENT_GATEWAY as PaymentGateway,

            amountPaid:
                registration.amountDue,

            currency:
                registration.currency ??
                DEFAULT_CURRENCY,

            status:
                PaymentStatus.PENDING,
        };
    }


    private async createLocalPayment(
        registration: Registration
    ): Promise<Payment> {
        try {
            return await this.db.payment.create({
                data: this.buildPaymentData(
                    registration
                ),
            });

        } catch (error) {
            throw paymentErrors.initializationFailed(
                "Unable to create local payment record.",
                error
            );
        }
    }

    private async updatePayment(
        paymentId: string,
        data: Prisma.PaymentUpdateInput
    ): Promise<Payment> {
        try {
            return await this.db.payment.update({
                where: {
                    id: paymentId,
                },

                data,
            });

        } catch (error) {
            throw paymentErrors.initializationFailed(
                `Unable to update payment '${paymentId}'.`,
                error
            );
        }
    }

    private async attachGatewayReference(
        paymentId: string,
        gatewayReference: string,
        gatewayResponse?: unknown
    ): Promise<Payment> {

        return this.updatePayment(
            paymentId,
            {
                gatewayReference,

                gatewayResponse:
                    gatewayResponse
                        ? gatewayResponse as Prisma.InputJsonValue
                        : undefined,
            }
        );
    }

    private async markPaymentSuccessful(
        paymentId: string,
        gatewayResponse?: unknown
    ): Promise<Payment> {

        return this.updatePayment(
            paymentId,
            {
                status:
                    PaymentStatus.SUCCESSFUL,

                paidAt:
                    new Date(),

                gatewayResponse:
                    gatewayResponse
                        ? gatewayResponse as Prisma.InputJsonValue
                        : undefined,
            }
        );
    }


    private async markPaymentFailed(
        paymentId: string,
        gatewayResponse?: unknown
    ): Promise<Payment> {

        return this.updatePayment(
            paymentId,
            {
                status:
                    PaymentStatus.FAILED,

                gatewayResponse:
                    gatewayResponse
                        ? gatewayResponse as Prisma.InputJsonValue
                        : undefined,
            }
        );
    }


    private async markPaymentCancelled(
        paymentId: string,
        gatewayResponse?: unknown
    ): Promise<Payment> {

        return this.updatePayment(
            paymentId,
            {
                status:
                    PaymentStatus.FAILED,

                gatewayResponse:
                    gatewayResponse
                        ? gatewayResponse as Prisma.InputJsonValue
                        : undefined,
            }
        );
    }

    private async findPaymentByTransactionReference(
        transactionRef: string
    ): Promise<Payment | null> {

        return this.db.payment.findUnique({
            where: {
                transactionRef,
            },
        });
    }

    private async ensurePaymentDoesNotExist(
        transactionRef: string
    ): Promise<void> {

        const existingPayment =
            await this.findPaymentByTransactionReference(
                transactionRef
            );

        if (existingPayment) {
            paymentErrors.paymentAlreadyExists(
                transactionRef
            );
        }
    }

    private mapCurrency(
        currency: string
    ):
        TranzgateCurrency {

        switch (currency) {

            case "NGN":
                return "Naira";

            case "USD":
                return "Dollars";

            case "GBP":
                return "Pounds";

            case "EUR":
                return "Euros";

            default:
                return "Naira";
        }
    }

    async initializePayment(
        input: CreatePaymentInput
    ): Promise<{
        paymentId: string;
        transactionReference: string;
        paymentBatchId?: string;
        status: PaymentStatus;
    }> {

        const registration =
            await this.getRegistrationOrThrow(
                input.registrationId
            );

        const existingPayment =
            await this.db.payment.findFirst({
                where: {
                    registrationId:
                        registration.id,

                    status:
                        PaymentStatus.PENDING,
                },
            });


        if (existingPayment) {
            paymentErrors.paymentAlreadyExists(
                existingPayment.transactionRef
            );
        }

        const payment =
            await this.createLocalPayment(
                registration
            );


        try {

            const session =
                this.generatePaymentSession();


            const paymentDocumentNo =
                this.generatePaymentDocumentNumber(
                    registration.registrationCode
                );

            const request:
                PreRegisterPaymentRequest =
            {
                clientNo:
                    process.env.TRANZGATE_CLIENT_NO!,

                customerNo:
                    registration.id,

                customerName:
                    registration.fullName,

                session,

                paymentPostingInfo: [
                    {
                        paymentCode:
                            registration.registrationCode,

                        paymentText:
                            `Conference registration payment`,

                        currency:
                            this.mapCurrency(
                                registration.currency
                            ),

                        amount:
                            Number(
                                registration.amountDue
                            ),

                        paymentDocumentNo,

                    },
                ],
            };
            const gatewayResponse =
                await this.gateway.preRegisterPayment(
                    request
                );

            await this.attachGatewayReference(
                payment.id,
                gatewayResponse.paymentBatchId,
                gatewayResponse
            );


            return {
                paymentId:
                    payment.id,

                transactionReference:
                    payment.transactionRef,

                paymentBatchId:
                    gatewayResponse.paymentBatchId,

                status:
                    PaymentStatus.PENDING,
            };


        } catch (error) {

            await this.markPaymentFailed(
                payment.id,
                {
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown gateway error",
                }
            );


            throw paymentErrors.initializationFailed(
                error instanceof Error
                    ? error.message
                    : "Unable to initialize payment.",
                error
            );

        }


        paymentErrors.initializationFailed(
            "Unable to initialize payment.",
            Error
        );
    }

    async verifyPayment(
        paymentBatchId: string
    ) {

        const payment =
            await this.db.payment.findFirst({
                where: {
                    gatewayReference:
                        paymentBatchId,
                },
            });

        if (!payment) {
            return paymentErrors.paymentNotFound(
                paymentBatchId
            );
        }
        const gatewayResponse =
            await this.gateway.verifyPayment(
                paymentBatchId,
                Number(payment.amountPaid)
            );

        if (
            gatewayResponse.status ===
            "SUCCESSFUL"
        ) {

            await this.markPaymentSuccessful(
                payment.id,
                gatewayResponse
            );

            await this.db.registration.update({
                where: {
                    id: payment.registrationId,
                },
                data: {
                    paymentStatus:
                        PaymentStatus.SUCCESSFUL,

                    registrationStatus:
                        "CONFIRMED",
                },
            });

            await qrService.generateQr({
                registrationId:
                    payment.registrationId,

                regenerate: false,
            });

            await emailService.sendRegistrationConfirmation(
                payment.registrationId
            );
        }

        return gatewayResponse;
    }
}

export const paymentService =
    new PaymentService();