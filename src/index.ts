
import { get } from "./api/apiClient";
import { createCard } from "./components/card";

import type{ Listing, ListingResponse } from "./utils/types";

export const ALL_LISTINGS_URL = "/auction/listings";


export async function fetchAllListings(): Promise<ListingResponse> {
    const response = await get<ListingResponse>(`${ALL_LISTINGS_URL}?_seller=true&_bids=true`);
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
console.log(listings);
if (!container) return;
container.replaceChildren();

if (listings.length === 0) {
    const item = document.createElement('li');
    item.textContent = ' Could not find any listings';
    container.appendChild(item)
}
listings.forEach((listing) => {
    console.log(listings[0])
    const item = document.createElement('li');
    item.classList.add('cursor-pointer');
    item.append(createCard(listing, { detailed: false, bids: listing.bids}));
    item.addEventListener('click', () => {
        window.location.href = `/pages/listing.html?id=${listing.id}`;
    })
    container.append(item);
})
}

getAllListings()

