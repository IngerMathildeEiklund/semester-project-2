
import { get } from "./api/apiClient";
import { createCard } from "./components/card";

import type{ Listing, ListingResponse } from "./utils/types";

export const ALL_LISTINGS_URL = "/auction/listings";


export async function fetchAllListings(): Promise<ListingResponse> {
    const response = await get<ListingResponse>(`${ALL_LISTINGS_URL}?_seller=true&bids=true`);
    if (!response?.data) {
        throw new Error(`Failed to fetch listings, Response: ${JSON.stringify(response)}`,
    );
    }
    return response;
}


const listingsContainer = document.getElementById('listings');  

async function getAllListings(): Promise <void> {
    const response = await fetchAllListings();
    renderListings(response.data, listingsContainer);
}

function renderListings(listings: Listing[], container: HTMLElement | null = listingsContainer): void   {

if (!container) return;
container.innerHTML = '';

if (listings.length === 0) {
    const errorMSG = document.createElement('p');
    errorMSG.textContent = ' Could not find any listings';
    container.appendChild(errorMSG)
}
listings.forEach((listing) => {
    const listingElement = createCard(listing);
    listingElement.addEventListener('click', () => {
        window.location.href = `/pages/listing.html?id=${listing.id}`;
    })
    container.appendChild(listingElement)
})
}

getAllListings()

