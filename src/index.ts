
import { get } from "./api/apiClient";

import type { ListingResponse } from "./utils/types";

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

