import { storage } from "../storage/storage";
import { post } from "../api/apiClient";
import type { Credentials, UserProfile, AuthResponse, RegisterResponse, RegisterData } from "../utils/types";

const apiKey = import.meta.env.VITE_API_KEY;

const LOGIN_ENDPOINT = "/auth/login";
const REGISTER_ENDPOINT = "/auth/register";

export function logOut(): void {
  storage.remove("accessToken");
  storage.remove("profile");
  window.location.href = "./login.html";
}


export async function loginUser(
  credentials: Credentials,
): Promise<UserProfile> {
  const response = await post<AuthResponse>(LOGIN_ENDPOINT, credentials);

  if (!response?.data?.accessToken) {
    throw new Error("Login successful, but no access token received.");
  }
  const { accessToken, ...profile } = response.data;

  storage.save("accessToken", accessToken);
  storage.save("apiKey", apiKey);
  storage.save<UserProfile>("profile", profile);

  return profile as UserProfile;
}

export async function registerUser(
  data: RegisterData,
): Promise<UserProfile> {
  const response = await post<RegisterResponse>(
    REGISTER_ENDPOINT,
    data,
  );

  if (!response) {
    throw new Error("Registration failed, no response from server");
  }

  const profile = response.data;

  if (!profile?.name || !profile?.email) {
    throw new Error(
      "Registration succeeded, but no profile data was returned.",
    );
  }
  storage.save<UserProfile>("profile", profile);
  return profile;
}


