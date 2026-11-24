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
const successDiv = document.getElementById('successful-listing') as HTMLDivElement;
const successLink = successDiv.querySelector('a') as HTMLAnchorElement;
const titleErrorP = document.getElementById('title-error') as HTMLParagraphElement;
const endsAtErrorP = document.getElementById('endtime-error') as HTMLParagraphElement;
const submitFormBTN = document.getElementById('create-listing-btn') as HTMLButtonElement;


let nextImageId = 0;

addImageBTN?.addEventListener('click', () => {

const id = `image-${--nextImageId}`;
const position = imagesContainer.querySelectorAll('fieldset').length + 1;

const wrapper = document.createElement('fieldset');
wrapper.className = 'flex flex-col gap-2 mb-4';
wrapper.dataset.imageIndex = String(position);



wrapper.innerHTML = `

        <legend>Image ${position}</legend>
        <label for="${id}-url">Image url</label>
        <p id="${id}-url-hint" class="text-sm">Get correct image format by right clicking an image and selecting "Copy image address"</p>
        <input class="input" id="${id}-url" type="url" aria-describedby="image-url-hint" name="imageUrl">
        

        <label for="${id}-alt">Image description</label>
          <p id="${id}-alt-hint" class="text-sm">Describe your image</p>
        <input class="input" id="${id}-alt" aria-describedby="image-alt-hint" type="text" name="imageAlt">
      
        <button type="button" class="btn-secondary delete-image-btn">Remove image ${position} </button>
        `
        imagesContainer.append(wrapper);
        wrapper.querySelector<HTMLInputElement>('input')?.focus();
});

imagesContainer.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.classList.contains('delete-image-btn')) return;
    target.closest('fieldset')?.remove();

    addImageBTN.focus();
})
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
        tags: elements.tags.value.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0),
        media: collectListingMedia(),
        endsAt: elements.endsAt.value ? new Date(elements.endsAt.value).toISOString() : '',
    }

    if (!formData.title) {
        titleErrorP.textContent = 'Title is required';
        elements.title.setAttribute('aria-invalid', 'true');
        elements.title.focus();
        return;
    }
    if (!formData.endsAt) {
        endsAtErrorP.textContent = 'Must select expiration date for the listing';
        elements.endsAt.setAttribute('aria-invalid', 'true');
        elements.endsAt.focus();
        return;
    }
    elements.title.removeAttribute('aria-invalid');
    elements.endsAt.removeAttribute('aria-invalid');
    titleErrorP.textContent = '';
    endsAtErrorP.textContent = '';
   
    submitFormBTN.disabled = true;
    createListingForm.setAttribute('aria-busy', 'true');
    try {
        const response = await createNewListing(formData.title,formData.endsAt, formData.description, formData.tags, formData.media);
        submitFormBTN.textContent = 'Creating listing...'
        successDiv.classList.remove('hidden');
        createListingForm.reset();
        imagesContainer.replaceChildren();
        successLink.href = `/pages/listing.html?id=${response.data.id}`;
        successDiv.focus();
    }catch(error){
        toastNotification(getErrorMessage(error), 'error');
    }finally{
        submitFormBTN.disabled = false;
        submitFormBTN.textContent = 'Create listing';
        createListingForm.removeAttribute('aria-busy');
    }
});