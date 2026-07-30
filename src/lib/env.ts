import {z} from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),

  SESSION_SECRET: z.string().min(32),

  TRANZGATE_SECRET_KEY: z.string(),

  TRANZGATE_PUBLIC_KEY: z.string(),

  SMTP_HOST: z.string(),

  SMTP_PORT: z.coerce.number(),

  SMTP_USER: z.string(),

  SMTP_PASS: z.string(),

  SMS_API_KEY: z.string(),

  SMS_USERNAME: z.string(),

  SUPER_ADMIN_EMAIL: z.string().email(),

  SUPER_ADMIN_PASSWORD: z.string().min(8),
})
export const env = envSchema.parse(process.env);