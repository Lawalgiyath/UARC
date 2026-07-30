-- CreateEnum
CREATE TYPE "RegistrationCategory" AS ENUM ('EARLY_BIRD', 'REGULAR', 'STUDENT_EARLY_BIRD', 'STUDENT_REGULAR', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StudentVerificationStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('TRANZGATE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'USSD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('NGN', 'USD');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "PresentationPreference" AS ENUM ('NO_PREFERENCE', 'ORAL', 'POSTER');

-- CreateEnum
CREATE TYPE "ConferenceTrack" AS ENUM ('TRACK_I', 'TRACK_II', 'TRACK_III', 'TRACK_IV', 'TRACK_V', 'TRACK_VI', 'TRACK_VII', 'TRACK_VIII');

-- CreateEnum
CREATE TYPE "ReviewRecommendation" AS ENUM ('ACCEPT', 'ACCEPT_WITH_MINOR_REVISION', 'ACCEPT_WITH_MAJOR_REVISION', 'REJECT');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('CHECKED_IN', 'CHECKED_OUT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'SMS', 'BOTH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'SECRETARIAT', 'REVIEWER', 'FINANCE', 'CHECK_IN_OFFICER');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ManuscriptStatus" AS ENUM ('NOT_UPLOADED', 'UPLOADED', 'REVISED');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PDF', 'DOC', 'DOCX');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('RECEIVED', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'REGISTER', 'VERIFY_STUDENT', 'INITIALIZE_PAYMENT', 'VERIFY_PAYMENT', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SUBMIT_ABSTRACT', 'UPDATE_SUBMISSION', 'DELETE_SUBMISSION', 'UPLOAD_MANUSCRIPT', 'DELETE_MANUSCRIPT', 'ASSIGN_REVIEWER', 'COMPLETE_REVIEW', 'GENERATE_QR', 'CHECK_IN', 'CHECK_OUT', 'SEND_EMAIL', 'SEND_SMS', 'UPDATE_SETTINGS');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "ConferencePhase" AS ENUM ('ABSTRACT_SUBMISSION', 'EARLY_BIRD_REGISTRATION', 'REGULAR_REGISTRATION', 'CONFERENCE', 'CLOSED');

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "registrationCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "category" "RegistrationCategory" NOT NULL,
    "amountDue" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "studentVerificationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentVerification" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "studentIdNumber" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "studentIdFront" TEXT NOT NULL,
    "studentIdBack" TEXT NOT NULL,
    "verificationStatus" "StudentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "transactionRef" TEXT NOT NULL,
    "gatewayReference" TEXT,
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'TRANZGATE',
    "paymentMethod" "PaymentMethod",
    "amountPaid" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "gatewayResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentWebhook" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "checkedInBy" TEXT,
    "checkedOutBy" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "qrImagePath" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "submissionCode" TEXT NOT NULL,
    "registrationId" TEXT,
    "presentingAuthor" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "track" "ConferenceTrack" NOT NULL,
    "presentationPreference" "PresentationPreference" NOT NULL,
    "abstractTitle" TEXT NOT NULL,
    "abstractText" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "reviewStatus" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerComment" TEXT,
    "acceptedPresentation" "PresentationPreference",
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manuscript" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storedFileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileExtension" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manuscript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewerAssignment" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ReviewerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "originalityScore" INTEGER NOT NULL,
    "relevanceScore" INTEGER NOT NULL,
    "methodologyScore" INTEGER NOT NULL,
    "presentationScore" INTEGER NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "recommendation" "ReviewRecommendation" NOT NULL,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "confidentialNote" TEXT,
    "commentToAuthor" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientName" TEXT,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "notificationType" "NotificationType" NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "provider" TEXT,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "response" JSONB,
    "status" "NotificationStatus" NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsLog" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "provider" TEXT,
    "recipient" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" JSONB,
    "status" "NotificationStatus" NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "conferenceName" TEXT NOT NULL,
    "conferenceYear" INTEGER NOT NULL,
    "abstractSubmissionOpen" BOOLEAN NOT NULL DEFAULT true,
    "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "abstractDeadline" TIMESTAMP(3) NOT NULL,
    "earlyBirdDeadline" TIMESTAMP(3) NOT NULL,
    "regularDeadline" TIMESTAMP(3) NOT NULL,
    "conferenceStartDate" TIMESTAMP(3) NOT NULL,
    "conferenceEndDate" TIMESTAMP(3) NOT NULL,
    "earlyBirdFee" DECIMAL(10,2) NOT NULL,
    "regularFee" DECIMAL(10,2) NOT NULL,
    "studentEarlyBirdFee" DECIMAL(10,2) NOT NULL,
    "studentRegularFee" DECIMAL(10,2) NOT NULL,
    "internationalFee" DECIMAL(10,2) NOT NULL,
    "internationalCurrency" TEXT NOT NULL DEFAULT 'USD',
    "maxAbstractWords" INTEGER NOT NULL DEFAULT 500,
    "minAbstractWords" INTEGER NOT NULL DEFAULT 300,
    "maxUploadSizeMB" INTEGER NOT NULL DEFAULT 10,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Registration_registrationCode_key" ON "Registration"("registrationCode");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_email_key" ON "Registration"("email");

-- CreateIndex
CREATE INDEX "Registration_email_idx" ON "Registration"("email");

-- CreateIndex
CREATE INDEX "Registration_registrationCode_idx" ON "Registration"("registrationCode");

-- CreateIndex
CREATE UNIQUE INDEX "StudentVerification_registrationId_key" ON "StudentVerification"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionRef_key" ON "Payment"("transactionRef");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_gatewayReference_key" ON "Payment"("gatewayReference");

-- CreateIndex
CREATE INDEX "Payment_registrationId_idx" ON "Payment"("registrationId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentWebhook_paymentId_key" ON "PaymentWebhook"("paymentId");

-- CreateIndex
CREATE INDEX "Attendance_registrationId_idx" ON "Attendance"("registrationId");

-- CreateIndex
CREATE INDEX "Attendance_qrToken_idx" ON "Attendance"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_registrationId_key" ON "QRCode"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_token_key" ON "QRCode"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_submissionCode_key" ON "Submission"("submissionCode");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_fingerprint_key" ON "Submission"("fingerprint");

-- CreateIndex
CREATE INDEX "Submission_email_idx" ON "Submission"("email");

-- CreateIndex
CREATE INDEX "Submission_submissionCode_idx" ON "Submission"("submissionCode");

-- CreateIndex
CREATE INDEX "Submission_track_idx" ON "Submission"("track");

-- CreateIndex
CREATE UNIQUE INDEX "Manuscript_submissionId_key" ON "Manuscript"("submissionId");

-- CreateIndex
CREATE INDEX "ReviewerAssignment_reviewerId_idx" ON "ReviewerAssignment"("reviewerId");

-- CreateIndex
CREATE INDEX "ReviewerAssignment_submissionId_idx" ON "ReviewerAssignment"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerAssignment_submissionId_reviewerId_key" ON "ReviewerAssignment"("submissionId", "reviewerId");

-- CreateIndex
CREATE INDEX "Review_submissionId_idx" ON "Review"("submissionId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_submissionId_reviewerId_key" ON "Review"("submissionId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_sessionToken_key" ON "AdminSession"("sessionToken");

-- CreateIndex
CREATE INDEX "AdminSession_sessionToken_idx" ON "AdminSession"("sessionToken");

-- CreateIndex
CREATE INDEX "AdminSession_adminId_idx" ON "AdminSession"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailLog_notificationId_key" ON "EmailLog"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "SmsLog_notificationId_key" ON "SmsLog"("notificationId");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- AddForeignKey
ALTER TABLE "StudentVerification" ADD CONSTRAINT "StudentVerification_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentWebhook" ADD CONSTRAINT "PaymentWebhook_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manuscript" ADD CONSTRAINT "Manuscript_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerAssignment" ADD CONSTRAINT "ReviewerAssignment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerAssignment" ADD CONSTRAINT "ReviewerAssignment_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewerAssignment" ADD CONSTRAINT "ReviewerAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsLog" ADD CONSTRAINT "SmsLog_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
