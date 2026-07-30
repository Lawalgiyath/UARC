export const QR_CODE_DIRECTORY =
  "qrcodes";

export const QR_CODE_EXPIRY_HOURS =
  72;
export const QR_TOKEN_PREFIX = "QRC";

export const QR_IMAGE_FORMAT = "png";

export const QR_ERROR_CORRECTION_LEVEL = "H" as const;

export const QR_MARGIN = 2;

export const QR_SCALE = 8;

export const QR_WIDTH = 400;

export const QR_MIN_TOKEN_LENGTH = 32;

export const QR_MAX_TOKEN_LENGTH = 512;

export const QR_MIN_REGISTRATION_CODE_LENGTH = 3;

export const QR_MAX_REGISTRATION_CODE_LENGTH = 100;

export const QR_TOKEN_EXPIRY_HOURS = 24;

export const QR_TOKEN_EXPIRY_MS =
  QR_TOKEN_EXPIRY_HOURS *
  60 *
  60 *
  1000;

export const QR_HASH_ALGORITHM = "sha256";

export const QR_RANDOM_BYTES = 32;

export const QR_PAYLOAD_VERSION = "v1";

export const QR_ALLOW_REUSE = false;

export const QR_VERIFY_SIGNATURE = true;

export const QR_FILENAME_PREFIX = "registration";

export const QR_CACHE_TTL_SECONDS = 300;

export const QR_DEFAULT_CONTENT_TYPE =
  "image/png";