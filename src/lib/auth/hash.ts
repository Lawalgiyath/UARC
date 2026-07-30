import { error } from "console";
import { randomBytes, scryptSync } from "crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
    if (!password){
        throw new Error("Password is required");
    }

    const salt = randomBytes(SALT_LENGTH).toString("hex");
    const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");

    return `${salt}:${hash}`
}