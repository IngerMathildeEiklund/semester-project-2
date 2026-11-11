
import { get } from "./api/apiClient";
import { createCard } from "./components/card";

import type{ Listing, ListingResponse, OneListingResponse } from "./utils/types";

const ALL_LISTINGS_URL = "/auction/listings";


export async function fetchAllListings(): Promise<ListingResponse> {
    const response = await get<ListingResponse>(`${ALL_LISTINGS_URL}?_seller=true&bids=true`);
    if (!response?.data) {
        throw new Error(`Failed to fetch listings, Response: ${JSON.stringify(response)}`,
    );
    }
    return response;
}

export async function fetchOneListing(listingId: string): Promise<Listing | null> {
    const response = await get<OneListingResponse>(`${ALL_LISTINGS_URL}/${listingId}?_seller=true&_bids=true`);
    if (!response?.data) {
        throw new Error("Could not fetch one listing")
    }
    return response.data;
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
    container.appendChild(listingElement)
})
}

getAllListings()




/* 
const allPostsResponse = await getAllListings();
console.log(allPostsResponse);
 */