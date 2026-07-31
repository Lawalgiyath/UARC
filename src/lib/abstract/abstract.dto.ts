import type {Manuscript,Submission} from "@prisma/client";

export interface SubmissionDto {
  id: string;

  submissionCode: string;

  presentingAuthor: string;

  email: string;

  phoneNumber: string;

  institution: string;

  track: string;

  presentationPreference: string;

  abstractTitle: string;

  reviewStatus: string;

  submittedAt: Date;

  updatedAt: Date;
}

export interface SubmissionDetailsDto
  extends SubmissionDto {
  abstractText: string;

  reviewerComment: string | null;

  acceptedPresentation: string | null;

  acceptedAt: Date | null;

  rejectedAt: Date | null;

  manuscript: ManuscriptDto | null;
}

export interface SubmissionVerificationDto {
  submissionCode: string;

  presentingAuthor: string;

  email: string;

  abstractTitle: string;

  reviewStatus: string;

  manuscriptUploaded: boolean;

  submittedAt: Date;
}

export interface ManuscriptDto {
  originalFileName: string;

  fileExtension: string;

  mimeType: string;

  fileSize: number;

  uploadedAt: Date;
}

/* -------------------------------------------------------------------------- */
/*                          Prisma Relation Type                              */
/* -------------------------------------------------------------------------- */

export type SubmissionWithRelations =
  Submission & {
    manuscript: Manuscript | null;
  };

/* -------------------------------------------------------------------------- */
/*                               Mappers                                      */
/* -------------------------------------------------------------------------- */

export function toSubmissionDto(
  submission: Submission
): SubmissionDto {
  return {
    id: submission.id,

    submissionCode:
      submission.submissionCode,

    presentingAuthor:
      submission.presentingAuthor,

    email: submission.email,

    phoneNumber:
      submission.phoneNumber,

    institution:
      submission.institution,

    track: submission.track,

    presentationPreference:
      submission.presentationPreference,

    abstractTitle:
      submission.abstractTitle,

    reviewStatus:
      submission.reviewStatus,

    submittedAt:
      submission.submittedAt,

    updatedAt:
      submission.updatedAt,
  };
}

export function toSubmissionDetailsDto(
  submission: SubmissionWithRelations
): SubmissionDetailsDto {
  return {
    ...toSubmissionDto(submission),

    abstractText:
      submission.abstractText,

    reviewerComment:
      submission.reviewerComment,

    acceptedPresentation:
      submission.acceptedPresentation,

    acceptedAt:
      submission.acceptedAt,

    rejectedAt:
      submission.rejectedAt,

    manuscript:
      submission.manuscript
        ? toManuscriptDto(
            submission.manuscript
          )
        : null,
  };
}

export function toSubmissionVerificationDto(
  submission: SubmissionWithRelations
): SubmissionVerificationDto {
  return {
    submissionCode:
      submission.submissionCode,

    presentingAuthor:
      submission.presentingAuthor,

    email: submission.email,

    abstractTitle:
      submission.abstractTitle,

    reviewStatus:
      submission.reviewStatus,

    manuscriptUploaded:
      submission.manuscript !==
      null,

    submittedAt:
      submission.submittedAt,
  };
}

export function toManuscriptDto(
  manuscript: Manuscript
): ManuscriptDto {
  return {
    originalFileName:
      manuscript.originalFileName,

    fileExtension:
      manuscript.fileExtension,

    mimeType:
      manuscript.mimeType,

    fileSize:
      manuscript.fileSize,

    uploadedAt:
      manuscript.uploadedAt,
  };
}