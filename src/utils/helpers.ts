import type { UserProfile } from "./types";
import { GUEST_PROFILE } from "./types";
import { storage } from "../storage/storage";

export function getIdByParams(): string | undefined {
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
if (!id) return;
return id;
}

export function transformDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });
}

export function getLoggedInUser(): UserProfile | null {
  return storage.load<UserProfile>("profile") ?? GUEST_PROFILE;
}


export function continueAsGuest(): void {
    storage.save("profile", GUEST_PROFILE);
    storage.remove("accessToken")
}

export function isLoggedIn(): boolean {
    return !!storage.load<string>('accessToken');
}

