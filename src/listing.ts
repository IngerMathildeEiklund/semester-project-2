import { get } from "./api/apiClient";
import type { OneListingResponse, Listing } from "./utils/types";
import { ALL_LISTINGS_URL } from "./index";
import { createCard } from "./components/card";
import { getIdByParams } from "./utils/helpers";

export async function fetchOneListing(listingId: string): Promise<Listing | null> {
    const response = await get<OneListingResponse>(`${ALL_LISTINGS_URL}/${listingId}?_seller=true&_bids=true`);
    if (!response?.data) {
        throw new Error("Could not fetch one listing")
    }
    return response.data;
}

const oneListingContainer = document.getElementById('one-listing');


function renderOneListing(listing: Listing | null, container: HTMLElement | null = oneListingContainer) {
    if (!container) return;
    container.innerHTML = '';

    if(!listing) {
    const errorMSG = document.createElement('p');
    errorMSG.textContent = ' Could not find listing';
    container.appendChild(errorMSG)
    return;
    }
    const oneListingElement = createCard(listing, { detailed: true});
    container.appendChild(oneListingElement);
}

async function getOneListing(): Promise <void> {
    const id = getIdByParams();
    if (!id) return;
    
    const response = await fetchOneListing(id);
    renderOneListing(response, oneListingContainer);
}

getOneListing();