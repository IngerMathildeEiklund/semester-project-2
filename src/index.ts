
import { get } from "./api/apiClient";
import { createCard } from "./components/card";
import type { ListingQuery, ListingMeta } from "./utils/types";

import type{ Listing, ListingResponse } from "./utils/types";

export const ALL_LISTINGS_URL = "/auction/listings";

const prevBTN = document.getElementById('prev-btn') as HTMLButtonElement;
const nextBTN = document.getElementById('next-btn') as HTMLButtonElement;
const pageBTNs = [1, 2, 3].map((n) => document.getElementById(`page-btn-${n}`)as HTMLButtonElement);
const searchBar = document.getElementById('searchbar') as HTMLInputElement;
const pageInfo = document.getElementById('page-info') as HTMLParagraphElement;
const tagOptions = document.getElementById('tag-options') as HTMLDataListElement;
const tagInput = document.getElementById('tag-filter') as HTMLInputElement;
const statusSelect = document.getElementById('status-filter') as HTMLSelectElement;

let tagTimer: number | undefined;

const state = {
    q: "",
    tag: "",
    active: undefined as boolean | undefined,
    page: 1,
}

const knownTags = new Set<string>();

export async function fetchAllListings({q, tag, active, page = 1, limit = 100, includeSeller = true, includeBids = true,}: ListingQuery = {}): Promise<ListingResponse> {

    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    if (q) params.set('q', q);
    if (tag) params.set('_tag', tag);
    if (active !== undefined) params.set('_active', String(active));
    if (includeSeller) params.set('_seller', 'true');
    if (includeBids) params.set('_bids', 'true');

    const base = q ? `${ALL_LISTINGS_URL}/search` : ALL_LISTINGS_URL;
    const response = await get<ListingResponse>(`${base}?${params.toString()}`);

    if (!response?.data) {
        throw new Error(`Failed to get listings. Response: ${JSON.stringify(response)}`)
    }
    return response;
}

const listingsContainer = document.getElementById('listings');  

async function getAllListings(): Promise <void> {
try {
    const response = await fetchAllListings({
        q: state.q || undefined,
        tag: state.tag || undefined,
        active: state.active,
        page: state.page 
        
    });

    renderListings(response.data, listingsContainer);
    updateTags(response.data);
    updatePagination(response.meta);
}catch {
    const errorMSG = document.createElement('p');
    errorMSG.textContent = 'Could not get listings. Please try again later.';
    listingsContainer?.appendChild(errorMSG);
}
}
function applyFilter(): void {
    state.page = 1;
    getAllListings();
}


function renderListings(listings: Listing[], container: HTMLElement | null = listingsContainer): void   {

if (!container) return;
container.replaceChildren();

if (listings.length === 0) {
    const item = document.createElement('li');
    item.textContent = ' Could not find any listings';
    container.appendChild(item)
}
listings.forEach((listing) => {
    const item = document.createElement('li');
    item.classList.add('cursor-pointer');
    item.append(createCard(listing, { detailed: false, bids: listing.bids}));
    item.addEventListener('click', () => {
        window.location.href = `/pages/listing.html?id=${listing.id}`;
    })
    container.append(item);
})
}

function updateTags(listings: Listing[]): void {
    listings.forEach((listing) => listing.tags.forEach((tag) => knownTags.add(tag)));

    tagOptions.replaceChildren(...[...knownTags].sort().map((tag) => {
        const option = document.createElement('option');
        option.value = tag;
        return option;
    })
);
}

const size = 3;

function updatePagination(meta: ListingMeta): void {
    prevBTN.disabled = meta.isFirstPage;
    nextBTN.disabled = meta.isLastPage;
    pageInfo.textContent = `Page ${meta.currentPage} of ${meta.pageCount || 1}`;

    const paginationSize = Math.min(size, meta.pageCount);
    let start = meta.currentPage -  Math.floor(paginationSize / 2);
    start = Math.max(1, Math.min(start, meta.pageCount - paginationSize + 1));

    pageBTNs.forEach((button, index) => {
        const pageNumber = start + index;
        const isVisible = index < paginationSize;

        button.hidden = !isVisible;
        if (!isVisible) return;

        button.textContent = String(pageNumber);
        button.dataset.page = String(pageNumber);
        button.classList.toggle('font-bold', pageNumber === meta.currentPage);
    })
}
if (searchBar) {
searchBar?.addEventListener('input', () => {
    clearTimeout(tagTimer);
    tagTimer = window.setTimeout(() => {
        state.q = searchBar.value.trim();
        applyFilter();
    }, 300);
});
}

if (tagInput) {
    tagInput.addEventListener('input', () => {
    clearTimeout(tagTimer);
    tagTimer = window.setTimeout(() => {
        state.tag = tagInput.value.trim();
        applyFilter();
    }, 300);
})
}

if (statusSelect) {
    statusSelect.addEventListener('change', () => {
    state.active = statusSelect.value === '' ? undefined : statusSelect.value === 'true';
    applyFilter();
})

}

if (prevBTN) {
prevBTN.addEventListener('click', () => {
    if (state.page > 1) {
        state.page--;
        getAllListings();
    }
});
}

if (nextBTN) {
    nextBTN.addEventListener('click', () => {
    if (!nextBTN) return;
    state.page++;
    getAllListings();
})
}
if (pageBTNs) {
    pageBTNs.forEach((button) => {
    button?.addEventListener('click', () => {
        state.page = Number(button.dataset.page);
        getAllListings();
    })
})
}


getAllListings()
