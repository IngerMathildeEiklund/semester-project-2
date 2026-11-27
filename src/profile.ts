import { getErrorMessage } from "./error/apiError";
import { toastNotification } from "./messages/toastnotifications";
import { getNameByParams } from "./utils/helpers";
import { get } from "./api/apiClient";
import type {OneProfile, OneProfileResponse } from "./utils/types";
import { createCard } from "./components/card";
import { formatCurrency } from "./components/card";
import { getLoggedInUser } from "./utils/helpers";

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
const profileContainer = document.getElementById('profile-container') as HTMLElement;
const bidOnlistingsContainer = document.getElementById('bid-on-listings-container') as HTMLElement;
const ownListingsContainer = document.getElementById('own-listings-container') as HTMLElement;
const listingsWonContainer = document.getElementById('listings-won-container') as HTMLElement;

export async function getOneProfile(container: HTMLElement | null = profileContainer): Promise<void> {
    if (!container) return;
    container.innerHTML = '';

    const name = getNameByParams();
    if (!name) return;
    try {
        const response = await fetchProfileByName(name);
        container.append(renderOneProfile(response.data));
        changeHeaderText(response.data);
    }catch(error) {
        toastNotification(getErrorMessage(error), 'error');
    }
}

export function renderOneProfile(profile: OneProfile): HTMLElement {
    const profileWrapper = document.createElement('div');
    const banner = document.createElement('img');
    const avatar = document.createElement('img');
    const bannerAvatarWrapper = document.createElement('div');
    const detailsWrapper = document.createElement('div');
    const username = document.createElement('p');
    const bio = document.createElement('p');
    const credits = document.createElement('p');
    const currentUser = getLoggedInUser();
    if (currentUser && currentUser.name === profile.name) {
    const editProfileBTN = document.createElement('button');
    const logOutBTN = document.createElement('button');   
    editProfileBTN.id = 'edit-profile-btn';
    logOutBTN.id = 'logout-btn';
        editProfileBTN.textContent = 'Edit profile';
    logOutBTN.textContent = 'Logout';    
    editProfileBTN.classList.add('btn');
    logOutBTN.classList.add('btn');
    detailsWrapper.append(username, bio, credits, editProfileBTN, logOutBTN);
}else{
    detailsWrapper.append(username, bio);
}
    banner.src = profile.banner.url ?? '';
    banner.alt = profile.banner.alt ?? '';
    avatar.src = profile.avatar.url ?? '';
    avatar.alt = profile.avatar.alt ?? '';
    bannerAvatarWrapper.append(banner, avatar);

    banner.id = 'banner';
    avatar.id = 'avatar';
    username.id = 'username';
    bio.id = 'bio';
    credits.id = 'credits';


    username.textContent = profile.name;
    if (profile.bio === null) {
        bio.textContent = '';
    }else{
        bio.textContent = profile.bio ?? '';
    }
    credits.textContent =  `Current balance: ${formatCurrency(String(profile.credits))}`;
    credits.classList.add('font-bold');
    bio.classList.add('items-center', 'justify-center', 'text-center')

    profileWrapper.classList.add('flex', 'flex-col', 'gap-4', 'items-center', 'justify-center');
    bannerAvatarWrapper.classList.add('relative', 'w-full', 'h-64');
    banner.classList.add('w-full', 'object-fit', 'h-64', 'rounded-2xl');
    avatar.classList.add('absolute', 'left-1/2', 'top-1/2', '-translate-x-1/2', 'translate-y-1/4', 'w-40', 'h-40', 'rounded-full', 'object-cover', 'border-4', 'border-white');

    detailsWrapper.classList.add('flex', 'flex-col','gap-4', 'mt-20', 'justify-center', 'items-center', 'mb-15')

    profileWrapper.append(bannerAvatarWrapper, detailsWrapper);
    return profileWrapper;
}

function changeHeaderText(profile: OneProfile): void {
const ownListingsHeader = document.getElementById('own-listings-header') as HTMLHeadingElement;
const bidOnListingsHeader = document.getElementById('bid-on-listings-header') as HTMLHeadingElement;;
const listingsWonHeader = document.getElementById('listings-won-header') as HTMLHeadingElement;; 

ownListingsHeader.textContent = `${profile.name}'s listings`;
bidOnListingsHeader.textContent = `Listings ${profile.name} has bid on`;
listingsWonHeader.textContent = `Listings ${profile.name} has won`;
}


getOneProfile();



