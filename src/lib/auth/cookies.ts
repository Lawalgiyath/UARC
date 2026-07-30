import {cookies} from "next/headers";


const SESSION_COOKIE_NAME = "uarc-admin-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const SESSION_OPTIONS = {
    httpOnly : true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE
};

async function  cookiesStore(){
    return cookies();
}
export function getSessionCookie(){
    return SESSION_COOKIE_NAME;
}

export async function  getSessionToken(): Promise<string |null>{
    const store = await cookiesStore();
return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function  setSessionCookie(sessionToken: string): Promise<void>{
    const store = await cookiesStore();

    store.set({
        name: SESSION_COOKIE_NAME,
        value: sessionToken,
        ...SESSION_OPTIONS,
    });
}

export async function  clearSessionCookie(): Promise<void>{
    const store = await cookiesStore();
    store.delete(SESSION_COOKIE_NAME);
}

export async function  hasSessionCookie(): Promise<boolean>{
    const token = await getSessionToken();
    return token !==null;
}