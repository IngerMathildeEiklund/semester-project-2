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

export function escapeHTML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
const submitBTN = modal.querySelector('#save-changes-btn') as HTMLButtonElement;

  setupImageFields(addImageBTN, imagesContainer, listing.media)

  editlistingForm?.addEventListener("submit", async (event) => {
    
    event.preventDefault();
    const elements = editlistingForm.elements as UpdateListingFormElements;

    const updatedFormData: UpdateListing = {
        title: elements.title.value.trim(),
        description: elements.description.value.trim(),
        tags: elements.tags?.value.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0),
        media: collectListingMedia(imagesContainer),
    }
    if (!updatedFormData.title) {
      const titleInput = elements.title;
      const titleError = modal.querySelector<HTMLParagraphElement>('#title-error')!;
      titleError.textContent = `Listing requires a title`;
      titleInput.setAttribute('aria-invalid', 'true');
      titleInput.setAttribute('aria-describedby', 'title-error title-hint');
      titleInput.focus();
        toastNotification('Listing requires a title', 'error');
        return;
    }
    submitBTN.disabled = true;
    submitBTN.setAttribute('aria-busy', 'true');
    try {
        await editListing(listing.id, updatedFormData);
        reRenderOneListing();
        toastNotification('Listing successfully updated', 'success');
        
        modal.close();
    }catch(error) {
        toastNotification(getErrorMessage(error), 'error');
    }finally{
      submitBTN.disabled = false;
      submitBTN.removeAttribute('aria-busy');
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
        <input class="input" id="listing-title" aria-describedby="title-error title-hint" name="title" type="text" value="${escapeHTML(listing.title)}" maxlength="160" required>
        <p id="title-error" class="text-red-800 text-sm" aria-live="polite"></p>

        <label for="listing-description"> Description </label>
        <p id="description-hint" class="text-sm"> Add a description about what you're selling up to 260 characters </p>
        <textarea class="input" id="listing-description" maxlength="260" aria-describedby="description-hint" name="description">${escapeHTML(listing.description ?? "")}</textarea>

        <label for="listing-tags">Tags</label>
        <p id="tags-hint" class="text-sm">Add tags separated with commas, eg "train, collectible" </p>
        <input class="input" id="listing-tags" aria-describedby="tags-hint" name="tags" type="text" value="${escapeHTML(listing.tags?.join(", ") ?? "")}" maxlength="24">
        
        <div id="images-container" class="flex flex-col"></div>
        <p id="image-status" class="sr-only" role="status"></p>
        <button class="btn" id="add-image-btn" type="button">Add image</button>

        <div class="flex flex-row gap-4 items-center justify-center mt-8">
            <button id="cancel-btn" class="btn" type="button"> Cancel </button>
        <button id="save-changes-btn" class="btn" type="submit"> Save changes </button>
    </div>
    </form>
    `;
}
