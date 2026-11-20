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

addBidForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData: BidAmount = {
        amount: addBidInput.valueAsNumber,
    }
    
    if (!formData.amount) {
        toastNotification('Must place a bid.', 'warning');
    }
    if (Number.isNaN(formData.amount)) return;

    try {
        const id = getIdByParams();
        if (!id) return;
        await addBid(formData.amount, id);
        reRenderOneListing();
        addBidForm.reset();
        toastNotification('Bid successfully placed.', 'success');
    }catch(error){
        toastNotification(getErrorMessage(error), 'error');
    }finally {
        addBidBTN.disabled = false;
    }


})





