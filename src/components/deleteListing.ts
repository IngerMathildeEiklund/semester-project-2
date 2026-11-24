import { del } from "../api/apiClient";
import { ALL_LISTINGS_URL } from "..";
import { getErrorMessage } from "../error/apiError";
import { toastNotification } from "../messages/toastnotifications";
import { storage } from "../storage/storage";


export async function deleteListing(listingId: string): Promise<void> {
    await del(`${ALL_LISTINGS_URL}/${listingId}`);
}

export function buildDeleteListingModal(listingId: string): HTMLElement {

    const modal = document.getElementById('delete-listing-modal') as HTMLDialogElement;
    modal.innerHTML = '';

    const title = document.createElement('p');
    const body = document.createElement('p');
    const buttonsWrapper = document.createElement('div');
    const cancelBTN = document.createElement('button');
    const confirmBTN = document.createElement('button');

    modal.showModal();

    cancelBTN.textContent = 'Cancel';
    confirmBTN.textContent = 'Confirm';
    title.textContent = 'Delete listing?';
    title.classList.add('text-3xl');
    body.textContent = 'This is an irreversible action';
    buttonsWrapper.classList.add('flex', 'flex-row', 'gap-4');
    buttonsWrapper.append(cancelBTN, confirmBTN);
    modal.append(title, body, buttonsWrapper);

    confirmBTN.addEventListener('click', async () => {
    try {
    await deleteListing(listingId);
    storage.save('listingDeleted', 'true');
    window.location.href = '/index.html';
  }catch(error) {
    toastNotification(getErrorMessage(error), 'error');
  }
    })

    cancelBTN.addEventListener('click', () => {
        modal.close();
    })
return modal;
}