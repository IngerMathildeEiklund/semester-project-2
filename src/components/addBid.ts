import { post } from "../api/apiClient";
import { getErrorMessage } from "../error/apiError.ts";
import { ALL_LISTINGS_URL } from "../index.ts";
import { toastNotification } from "../messages/toastnotifications.ts";
import type { BidAmount, BidResponse } from "../utils/types.ts";
import { reRenderOneListing } from "../listing.ts";
import { getIdByParams} from "../utils/helpers.ts";

export async function addBid(amount: number, id: string): Promise<BidResponse> {
const bidBody: BidAmount = { amount };
const response = await post<BidResponse>(`${ALL_LISTINGS_URL}/${id}/bids`, bidBody);

if (!response) {
    throw new Error(`Error placing bid. Please try again later.`);
}
return response;
}

const addBidForm = document.getElementById('add-bid-form') as HTMLFormElement;
const addBidInput = document.getElementById('add-bid-input') as HTMLInputElement;
const addBidBTN = document.getElementById('add-bid-btn') as HTMLButtonElement;
const addBidInputError = document.getElementById('add-bid-error') as HTMLParagraphElement;

addBidForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const amount = addBidInput.valueAsNumber;

    if (Number.isNaN(amount) || amount <= 0) {
        addBidInput.setAttribute('aria-invalid', 'true');
        addBidInputError.textContent = 'Bid must be greater than 0';
        toastNotification('Bid must be greater than 0', 'warning');
        addBidInput.focus();
        return;
    }
    addBidInputError.textContent = '';
    addBidInput.removeAttribute('aria-invalid');

    if (addBidBTN.getAttribute('aria-disabled') === 'true') return;
    addBidBTN.setAttribute('aria-disabled', 'true');

    try {
        const id = getIdByParams();
        if (!id) {
            toastNotification('Could not find listing.', 'error');
            return;
        }
        await addBid(amount, id);
        reRenderOneListing();
        addBidForm.reset();
        toastNotification('Bid successfully placed.', 'success');
    }catch(error){
        toastNotification(getErrorMessage(error), 'error');
    }finally {
        addBidBTN.removeAttribute('aria-disabled');
        addBidInputError.textContent = '';
    }


})





