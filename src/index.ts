
import { get } from "./api/apiClient";

import type{ Listing, ListingResponse, OneListingResponse } from "./utils/types";

const ALL_LISTINGS_URL = "/auction/listings";


export async function getAllListings(): Promise<ListingResponse> {
    const response = await get<ListingResponse>(`${ALL_LISTINGS_URL}`);
    if (!response?.data) {
        throw new Error(`Failed to fetch listings, Response: ${JSON.stringify(response)}`,
    );
    }
    return response;
}

const allPostsResponse = await getAllListings();
console.log(allPostsResponse);



export async function getOneListing(listingId: string): Promise<Listing | null> {
    const response = await get<OneListingResponse>(`${ALL_LISTINGS_URL}/${listingId}?_seller=true&_bids=true`);
    if (!response?.data) {
        throw new Error("Could not fetch one listing")
    }
    return response.data;
}