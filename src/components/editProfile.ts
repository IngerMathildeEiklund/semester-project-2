import { put } from "../api/apiClient";
import { ALL_PROFILES_URL } from "../profile";
import type { OneProfile, UpdateProfile, UpdateProfileResponse, UserProfile, UpdateProfileFormElements } from "../utils/types";
import { escapeHTML } from "./updateListingModal";
import { toastNotification } from "../messages/toastnotifications";
import { getErrorMessage } from "../error/apiError";
import { getLoggedInUser } from "../utils/helpers";

export async function updateProfile(name: string, content: UpdateProfile): Promise<UpdateProfileResponse> {
const response = await put<UpdateProfileResponse>(`${ALL_PROFILES_URL}/${name}`, content);
if (!response?.data) {
    throw new Error('Could not update profile');
}
return response;
}

export async function updateProfileFormModal() {
let profile: UserProfile;

const name = getLoggedInUser();
if (!name) return;

profile = name;

const modal = document.getElementById('update-profile-modal') as HTMLDialogElement;
modal.innerHTML = buildUpdateProfileModal(profile);
const updateProfileForm = modal.querySelector('#update-profile-form') as HTMLFormElement;
const submitBTN = modal.querySelector('#update-profile-btn') as HTMLButtonElement;
const cancelBTN = modal.querySelector('#cancel-changes-btn') as HTMLButtonElement;

//Fix the form, its not sending correctly 
updateProfileForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const elements = updateProfileForm.elements as UpdateProfileFormElements;
    const avatarUrl = elements.avatarUrl.value.trim();
    const bannerUrl = elements.bannerUrl.value.trim();

    const updatedFormData: UpdateProfile = {
        bio: elements.bio.value.trim(),
        ...(avatarUrl && {
            avatar: { url: avatarUrl, alt: elements.avatarAlt.value.trim() },
        }),
        ...(bannerUrl && {
            banner: { url: bannerUrl, alt: elements.bannerAlt.value.trim() },
        })
    }
    submitBTN.disabled = true;
    submitBTN.setAttribute('aria-disabled', 'true');
    try {
        await updateProfile(profile.name, updatedFormData);
        console.log(profile.bio);
        toastNotification('Profile successfully updated', 'success');
        modal.close();
    }catch(error) {
        toastNotification(getErrorMessage(error), 'error');
    }finally{
        
    }
})
cancelBTN?.addEventListener('click', () => {
    modal.close();
})
modal.showModal();
}


function buildUpdateProfileModal(profile: UserProfile) {
    return `
     <form id="update-profile-form" class="flex flex-col gap-2 p-4">
        <p class="text-2xl mb-4"> Update profile </p>
        <label for="update-bio">Bio</label>
        <p id="update-bio-hint" class="text-sm"> Maximum characters 160</p>
        <textarea class="input" type="text" name="bio" id="update-bio">${escapeHTML(profile.bio ?? '')}</textarea>  
        <p id="update-bio-error" class="text-sm text-red-800"></p>
        <p id="avatar-banner-url-hint" class="text-blue-950 bg-blue-100 border-blue-960 border rounded-2xl p-4 mb-2 mt-2"><b>Hint! </b>Get an accessible image url and banner url by right clicking an image and selecting "copy image address" </p>
        
        <label for="update-avatar">Avatar image</label>
        <p id="update-avatar-hint" class="text-sm">Use an accessible url</p>
        
        <input class="input" type="url" name="avatarUrl" id="update-avatar" value="${escapeHTML(profile.avatar?.url ?? '')}">
        <p id="update-avatar-error" class="text-sm text-red-800"></p>
        
        <label for="update-avatar-alt">Describe your avatar image</label>
        <p id="update-avatar-alt-hint" class="text-sm">Maximum characters 120</p>
        <input class="input" type="text" name="avatarAlt" id="update-avatar-alt" value="${escapeHTML(profile.avatar?.alt ?? '')}">
        
        <p id="update-avatar-alt-error" class="text-sm text-red-800"></p>
        
        <label for="update-banner">Banner image </label>
        <p id="update-banner-hint" class="text-sm">Use an accessible url</p>
        <input class="input" type="url" name="bannerUrl" id="update-banner" value="${escapeHTML(profile.banner?.url ?? '')}">
        <p id="update-banner-error" class="text-sm text-red-800"></p>
        
        <label for="update-banner-alt">Describe your banner image</label>
        <p  id="update-banner-alt-hint" class="text-sm">Maximum characters 120</p>
        <input class="input" type="text" name="bannerAlt" id="update-banner-alt" value="${escapeHTML(profile.banner?.alt ?? '')}">
        
        <p id="update-banner-alt-error" class="text-sm text-red-800"></p>
        
        <div class="flex flex-row items-center justify-center gap-4"> 
        <button id="cancel-changes-btn" type="button" class="btn"> Cancel</button>
        <button id="update-profile-btn" type="submit" class="btn"> Save changes </button>
    </div>
    </form>
    `
}