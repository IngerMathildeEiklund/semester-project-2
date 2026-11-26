import { getErrorMessage } from "./error/apiError";
import { toastNotification } from "./messages/toastnotifications";
import { getLoggedInUser } from "./utils/helpers";
import { getNameByParams } from "./utils/helpers";
import { get } from "./api/apiClient";
import type {OneProfile, OneProfileResponse } from "./utils/types";

const ALL_PROFILES_URL = '/auction/profiles';

export async function fetchProfileByName(name: string): Promise<OneProfileResponse> {
    const response = await get<OneProfileResponse>(`${ALL_PROFILES_URL}/${name}`);
    if (!response) {
        throw new Error('Could not find profile');
    }
    return response;
}
export async function getOneProfileByName(): Promise<void> {
let profile: OneProfile;
const name = getNameByParams();
if (!name) return;
try {
    const response = await fetchProfileByName(name);
    profile = response.data;
    console.log(profile);
}catch{
    console.log('error');
}
}
const profileContainer = document.getElementById('profile-container');

export async function renderOneProfile(profile: OneProfile | null, container: HTMLElement | null = profileContainer) {
    if (!container) return;
    container.innerHTML = '';

    if (!profile) {
        const errorMSG = document.createElement('p');
        errorMSG.textContent = 'Could not find profile.'
        container.append(errorMSG);
    }

}
getOneProfileByName();



