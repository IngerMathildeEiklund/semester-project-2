import { post } from "./api/apiClient";
import { toastNotification } from "./messages/toastnotifications";
import type { CreateNewListingFormElements, CreateListing, CreateListingResponse, Media } from "./utils/types";

import { ALL_LISTINGS_URL } from "./index";
import { getErrorMessage } from "./error/apiError";

async function createNewListing(title: string,endsAt: string, description?: string, tags?: string[], media?: Media[]): Promise<CreateListingResponse> {
    const listingBody: CreateListing = { title, description, tags, media, endsAt }; 
    const response = await post<CreateListingResponse>(ALL_LISTINGS_URL, listingBody);

    if (!response) {
        throw new Error(`Failed to create listing, please try again later, response ${JSON.stringify(response)}`);
    }
    return response;
}

const createListingForm = document.getElementById('create-listing-form') as HTMLFormElement;
const addImageBTN = document.getElementById('add-image-btn') as HTMLButtonElement;
const imagesContainer = document.getElementById('images-container') as HTMLDivElement;
const returnBTN = document.getElementById('return-to-homepage-btn') as HTMLButtonElement;
const successDiv = document.getElementById('successful-listing') as HTMLDivElement;
const successLink = successDiv.querySelector('a') as HTMLAnchorElement;
const titleErrorP = document.getElementById('title-error') as HTMLParagraphElement;
const endsAtErrorP = document.getElementById('endtime-error') as HTMLParagraphElement;


let imageCount = 0;

addImageBTN?.addEventListener('click', () => {
imageCount++;
const id = `image-${imageCount}`;
const wrapper = document.createElement('div');
wrapper.className = 'flex flex-col gap-2 mb-4';
wrapper.dataset.imageIndex = String(imageCount);

wrapper.innerHTML = `<label for="${id}-url"> Image URL</label>
        <input class="input" id="${id}-url" type="url" name="imageUrl">

        <label for="${id}-alt"> Image ALT</label>
        <input class="input" id="${id}-alt" type="text" name="imageAlt">`
        imagesContainer.append(wrapper);
});

function collectListingMedia(): Media[] {
    const wrappers = imagesContainer.querySelectorAll<HTMLDivElement>('[data-image-index]');
    return Array.from(wrappers).map((wrapper) => {
        const url = wrapper.querySelector<HTMLInputElement>('input[name="imageUrl"]')!.value.trim();
        const alt = wrapper.querySelector<HTMLInputElement>('input[name="imageAlt"]')!.value.trim();
        return { url, alt } as Media;
    });
}


createListingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const elements = createListingForm.elements as CreateNewListingFormElements;

    const formData: CreateListing = {
        title: elements.title.value.trim(),
        description: elements.description.value.trim(),
        tags: elements.tags.value.split(', ').map((tag) => tag.trim()).filter((tag) => tag.length > 0),
        media: collectListingMedia(),
        endsAt: elements.endsAt.value.trim(),
    }

    if (!formData.title) {
        titleErrorP.textContent = 'Title is required';
        elements.title.focus();
        return;
    }
    if (!formData.endsAt) {
        endsAtErrorP.textContent = 'Must select expiration date for the listing';
        elements.endsAt.focus();
        return;
    }
    titleErrorP.textContent = '';
    endsAtErrorP.textContent = '';
   
    try {
        await createNewListing(formData.title,formData.endsAt, formData.description, formData.tags, formData.media);
        successDiv.classList.remove('hidden');
    }catch(error){
        toastNotification(getErrorMessage(error), 'error');
        console.log(error);
    }

});







