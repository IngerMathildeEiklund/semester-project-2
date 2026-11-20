import { post } from "../api/apiClient";
import { ALL_LISTINGS_URL } from "../index.ts";
import type { CreateListing, CreateListingResponse, Media } from "../utils/types";

export async function createListing(title: string, endsAt: string, description?: string, tags?: string[], media?: Media[]): Promise<CreateListingResponse> {
    const listingContent: CreateListing = { title, description, tags, media, endsAt };
    const response = await post<CreateListingResponse>(ALL_LISTINGS_URL, listingContent);

    if (!response) {
        throw new Error('Could not post listing at this moment, please try again later');
    }
    return response;
}




