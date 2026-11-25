import { put } from "../api/apiClient";
import type {
  UpdateListing,
  ListingResponse,
  Listing,
  UpdateListingFormElements,
} from "../utils/types";
import { ALL_LISTINGS_URL } from "..";
import { getIdByParams } from "../utils/helpers";
import { fetchOneListing } from "../listing";
import { toastNotification } from "../messages/toastnotifications";
import { getErrorMessage } from "../error/apiError";
import { setupImageFields } from "../utils/imageFields";
import { collectListingMedia } from "../utils/imageFields";
import { reRenderOneListing } from "../listing";

export async function editListing(
  listingId: string,
  content: UpdateListing,
): Promise<ListingResponse> {
  const response = await put<ListingResponse>(
    `${ALL_LISTINGS_URL}/${listingId}`,
    content,
  );

  if (!response) {
    throw new Error(`Failed to update listing, please try again later`);
  }
  return response;
}

export async function editListingFormPopUp() {

    const listingId = getIdByParams();
  let listing: Listing;
  try {
    if (!listingId) {
      throw new Error("Could not find listing with such ID");
    }
    const response = await fetchOneListing(listingId);
    if (!response) {
      throw new Error("Could not find listing");
    }
    listing = response;
  } catch (error) {
    toastNotification(getErrorMessage(error), "error");
    return;
  }

  const modal = document.getElementById(
    "update-listing-modal",
  ) as HTMLDialogElement;

  modal.innerHTML = buildEditListingForm(listing);

    const editlistingForm = modal.querySelector(
    "#update-listing-form",
  ) as HTMLFormElement;
const cancelBTN = modal.querySelector('#cancel-btn') as HTMLButtonElement;
const addImageBTN = modal.querySelector('#add-image-btn') as HTMLButtonElement;
const imagesContainer = modal.querySelector('#images-container') as HTMLDivElement;

  setupImageFields(addImageBTN, imagesContainer, listing.media)

  editlistingForm?.addEventListener("submit", async (event) => {
    
    event.preventDefault();
    const elements = editlistingForm.elements as UpdateListingFormElements;

    const updatedFormData: UpdateListing = {
        title: elements.title.value.trim(),
        description: elements.description.value.trim(),
        tags: elements.tags?.value.split(', ').map((tag) => tag.trim()).filter((tag) => tag.length > 0),
        media: collectListingMedia(imagesContainer),
    }
    if (!updatedFormData.title) {
        toastNotification('Listing requires a title', 'error');
        return;
    }
    try {
        await editListing(listing.id, updatedFormData);
        reRenderOneListing();
        toastNotification('Listing successfully updated', 'success');
        modal.close();
    }catch(error) {
        toastNotification(getErrorMessage(error), 'error');
    }
  });

  cancelBTN?.addEventListener("click", () => {
    modal.close();
  });
  
  modal.showModal();
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
        <textarea class="input" id="listing-description" aria-describedby="description-hint" name="description" type="text"> ${listing.description ?? ""} </textarea>

        <label for="listing-tags">Tags</label>
        <p id="tags-hint" class="text-sm">Add tags separated with commas, eg "train, collectible" </p>
        <input class="input" id="listing-tags" aria-describedby="tags-hint" name="tags" type="text" value="${listing.tags?.join(",") ?? ""}" maxlength="24">
        
        <div id="images-container" class="flex flex-col"></div>
        <button class="btn" id="add-image-btn" type="button">Add image</button>

        <div class="flex flex-row gap-4 items-center justify-center mt-8">
            <button id="cancel-btn" class="btn" type="button"> Cancel </button>
        <button id="save-changes-btn" class="btn" type="submit"> Save changes </button>
    </div>
    </form>
    `;
}
