import { ConferenceTrack, PresentationPreference } from "@prisma/client";

export const SUBMISSION_CODE_PREFIX = "UARC-ABS";

export const ABSTRACT_MIN_WORDS = 300;

export const ABSTRACT_MAX_WORDS = 500;

export const ABSTRACT_TITLE_MAX_LENGTH = 250;

export const ABSTRACT_TEXT_MAX_LENGTH = 6000;

export const PRESENTATION_PREFERENCES = [
    PresentationPreference.NO_PREFERENCE,
    PresentationPreference.ORAL,
    PresentationPreference.POSTER,
] as const;

export const CONFERENCE_TRACKS = [
    ConferenceTrack.TRACK_I,
    ConferenceTrack.TRACK_II,
    ConferenceTrack.TRACK_III,
    ConferenceTrack.TRACK_IV,
    ConferenceTrack.TRACK_V,
    ConferenceTrack.TRACK_VI,
    ConferenceTrack.TRACK_VII,
    ConferenceTrack.TRACK_VIII,
] as const;