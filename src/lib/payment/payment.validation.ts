import { z } from "zod";

export const currencyField = z.enum([
  "Naira",
  "Dollars",
  "Pounds",
  "Euros",
]);

export const channelField = z.enum([
  "NotSet",
  "Bank",
  "Interswitch2023",
  "UnifiedPayments",
  "RemitaBank",
  "RemitaOnline",
  "UnifiedPaymentsPOS",
  "ALATPay",
  "Zitra",
  "ZitraTranzgate",
  "Nomba",
]);

export const registrationIdField = z
  .string()
  .uuid("Invalid registration ID.");

export const paymentIdField = z
  .string()
  .uuid("Invalid payment ID.");

export const customerNumberField = z
  .string()
  .trim()
  .min(1)
  .max(100);

export const customerNameField = z
  .string()
  .trim()
  .min(2)
  .max(200);

export const emailField = z
  .string()
  .trim()
  .email("Invalid email address.");

export const phoneNumberField = z
  .string()
  .trim()
  .min(7)
  .max(30);

export const callbackUrlField = z
  .string()
  .trim()
  .url("Invalid callback URL.");

export const sessionField = z
  .string()
  .trim()
  .min(1)
  .max(200);

export const paymentBatchIdField = z
  .string()
  .trim()
  .min(1)
  .max(150);

export const paymentDocumentNoField = z
  .string()
  .trim()
  .min(1)
  .max(150);

export const paymentCodeField = z
  .string()
  .trim()
  .min(1)
  .max(100);

export const bankField = z
  .string()
  .trim()
  .max(150)
  .optional();

export const accountNumberField = z
  .string()
  .trim()
  .max(50)
  .optional();

export const amountField = z
  .number({
    invalid_type_error: "Amount must be a number.",
  })
  .positive("Amount must be greater than zero.")
  .max(
    1_000_000_000,
    "Amount exceeds the permitted limit."
  );

export const paymentPostingInfoSchema =
  z
    .object({
      paymentCode: paymentCodeField,

      paymentText: z
        .string()
        .trim()
        .max(250)
        .optional(),

      currency: currencyField,

      amount: amountField,

      paymentDocumentNo:
        paymentDocumentNoField,

      bank: bankField,

      accountNum:
        accountNumberField,
    })
    .strict();

export const createPaymentSchema =
  z
    .object({
      registrationId:
        registrationIdField,
    })
    .strict();

export const preRegisterPaymentSchema =
  z
    .object({
      clientNo: z
        .string()
        .trim()
        .min(1),

      customerNo:
        customerNumberField,

      customerName:
        customerNameField,

      session:
        sessionField,

      paymentPostingInfo: z
        .array(
          paymentPostingInfoSchema
        )
        .min(
          1,
          "At least one payment item is required."
        ),
    })
    .strict();

export const setPaymentChannelSchema =
  z
    .object({
      paymentBatchId:
        paymentBatchIdField,

      channel:
        channelField,
    })
    .strict();

export const sendToRemitaSchema =
  z
    .object({
      customerName:
        customerNameField,

      customerId:
        customerNumberField,

      email:
        emailField,

      phoneNumber:
        phoneNumberField,

      clientId: z
        .string()
        .trim()
        .min(1),

      session:
        sessionField,

      paymentBatchId:
        paymentBatchIdField,

      channel:
        channelField,

      callbackUrl:
        callbackUrlField,
    })
    .strict();

export const searchPaymentSchema =
  z
    .object({
      paymentBatchId:
        paymentBatchIdField.optional(),

      paymentDetailId:
        z
          .number()
          .int()
          .positive()
          .optional(),

      clientId:
        z.string().trim().optional(),

      customerId:
        customerNumberField.optional(),

      paymentCode:
        paymentCodeField.optional(),

      paymentDocumentNo:
        paymentDocumentNoField.optional(),

      channel:
        channelField.optional(),

      startDate:
        z.coerce.date().optional(),

      endDate:
        z.coerce.date().optional(),

      paid:
        z.boolean().optional(),

      cancelled:
        z.boolean().optional(),

      page:
        z.coerce
          .number()
          .int()
          .min(1)
          .default(1),

      numberPerPage:
        z.coerce
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20),

      includeCharges:
        z.boolean().default(false),
    })
    .strict()
    .refine(
      ({ startDate, endDate }) =>
        !startDate ||
        !endDate ||
        startDate <= endDate,
      {
        message:
          "endDate must be after startDate.",
        path: ["endDate"],
      }
    )
    .refine(
      (data) =>
        Boolean(
          data.paymentBatchId ||
            data.paymentDetailId ||
            data.clientId ||
            data.customerId ||
            data.paymentCode ||
            data.paymentDocumentNo ||
            data.channel ||
            data.startDate ||
            data.endDate
        ),
      {
        message:
          "Provide at least one search criterion.",
      }
    );

export const verifyPaymentSchema =
  z
    .object({
      paymentId:
        paymentIdField.optional(),

      paymentBatchId:
        paymentBatchIdField.optional(),

      transactionReference:
        z.string().trim().optional(),
    })
    .strict()
    .refine(
      (data) =>
        Boolean(
          data.paymentId ||
            data.paymentBatchId ||
            data.transactionReference
        ),
      {
        message:
          "Provide at least one payment identifier.",
      }
    );

export const paymentCallbackSchema =
  z
    .object({
      paymentBatchId:
        paymentBatchIdField,

      gatewayReference:
        z.string().trim().optional(),

      status:
        z.string().trim(),

      rrr:
        z.string().trim().optional(),
    })
    .strict();

export const paymentWebhookSchema =
  z
    .object({
      signature: z
        .string()
        .trim()
        .min(1),

      payload: z.unknown(),
    })
    .strict();

export type CreatePaymentInput =
  z.infer<typeof createPaymentSchema>;

export type PreRegisterPaymentInput =
  z.infer<typeof preRegisterPaymentSchema>;

export type SetPaymentChannelInput =
  z.infer<typeof setPaymentChannelSchema>;

export type SendToRemitaInput =
  z.infer<typeof sendToRemitaSchema>;

export type SearchPaymentInput =
  z.infer<typeof searchPaymentSchema>;

export type VerifyPaymentInput =
  z.infer<typeof verifyPaymentSchema>;

export type PaymentCallbackInput =
  z.infer<typeof paymentCallbackSchema>;

export type PaymentWebhookInput =
  z.infer<typeof paymentWebhookSchema>;

export type PaymentPostingInfoInput =
  z.infer<typeof paymentPostingInfoSchema>;