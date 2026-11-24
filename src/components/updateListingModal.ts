import { put } from "../api/apiClient";
import type { UpdateListing, ListingResponse, Listing, UpdateListingFormElements } from "../utils/types";
import { ALL_LISTINGS_URL } from "..";
import { getIdByParams } from "../utils/helpers";
import { fetchOneListing } from "../listing";
import { toastNotification } from "../messages/toastnotifications";
import { getErrorMessage } from "../error/apiError";

export async function editListing(listingId: string, content: UpdateListing): Promise<ListingResponse>{
const response = await put<ListingResponse>(`${ALL_LISTINGS_URL}/${listingId}`, content);

if (!response) {
    throw new Error(`Failed to update listing, please try again later`);
}
return response;
}


export async function editListingFormPopUp() {
const listingId = getIdByParams();

let listing: Listing;

try {
if(!listingId) {
    throw new Error('Could not find listing with such ID')
}
const response = await fetchOneListing(listingId);
if (!response) {
    throw new Error('Could not find listing');
}

listing = response;

console.log(listing);
}catch(error) {
toastNotification(getErrorMessage(error), 'error');
return;
}

const modal = document.getElementById('update-listing-modal') as HTMLDialogElement;
const modalContent = document.createElement('div') as HTMLDivElement;
modalContent.innerHTML = '';


const formContainer = document.createElement('div') as HTMLDivElement;
if (formContainer) {
    formContainer.innerHTML = buildEditListingForm(listing);
}

const cancelBTN = formContainer.querySelector('#cancel-btn');
const confirmChangesBTN = formContainer.querySelector('#save-changes-btn');
modal.showModal();

modal.append(modalContent, formContainer);


const editlistingForm = formContainer.querySelector('#update-listing-form') as HTMLFormElement;

editlistingForm?.addEventListener('submit', async (event) => {
event.preventDefault();
if (!editlistingForm) {
    return;
}


});
cancelBTN?.addEventListener('click', () => {
    modal.close();
})



}


function buildEditListingForm(listing: Listing) {
    return `
    <p class="text-2xl"> Update listing </p>
        <form id="update-listing-form" class="flex flex-col" novalidate>
        
        <label for="listing-title"> Title</label>
        <p id="title-hint" class="text-sm">Add a descriptive title up to 160 characters </p>
        <input class="input" id="listing-title" aria-describedby="title-error title-hint" name="title" type="text" value="${listing.title}" maxlength="160" required>
        <p id="title-error" class="text-red-800 text-sm" aria-live="polite"></p>

        <label for="listing-description"> Description </label>
        <p id="description-hint" class="text-sm"> Add a description about what you're selling </p>
        <textarea class="input" id="listing-description" aria-describedby="description-hint" name="description" type="text" >${listing.description ?? ''} </textarea

        <label for="listing-tags">Tags</label>
        <p id="tags-hint" class="text-sm">Add tags separated with commas, eg "train, collectible" </p>
        <input class="input" id="listing-tags" aria-describedby="tags-hint" name="tags" type="text" value="${listing.tags?.join(',') ?? ''}" maxlength="24">
        
        <div id="images-container" class="flex flex-col"></div>
        <button class="btn" id="add-image-btn" type="button">Add image</button>

        <div class="flex flex-row gap-4 items-center justify-center mt-8">
            <button id="cancel-btn" class="btn" type="button"> Cancel </button>
        <button id="save-changes-btn" class="btn" type="button"> Save changes </button>
    </div>
    </form>
    `
}