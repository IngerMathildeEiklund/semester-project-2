
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
const errorMSG = document.getElementById('error-msg') as HTMLParagraphElement;

let tagTimer: number | undefined;
let searchTimer: number | undefined;

const state = {
    q: "",
    tag: "",
    active: undefined as boolean | undefined,
    page: 1,
}

const knownTags = new Set<string>();



export async function fetchAllListings({q, tag, active, page = 1, limit = 30, includeSeller = true, includeBids = true,}: ListingQuery = {}): Promise<ListingResponse> {

    
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

async function getAllListings(): Promise<boolean> {

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
    errorMSG.textContent = '';
    return true;

}catch {
    errorMSG.textContent = `Could not get listings, please try again later`;
    return false;
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
    item.textContent = 'Could not find any listings';
    container.appendChild(item);
}
listings.forEach((listing) => {
    const item = document.createElement('li');
    item.append(createCard(listing, { detailed: false, bids: listing.bids}));
    container.append(item);
})
}

function resetSearch(): void {
    clearTimeout(searchTimer);
    searchBar.value = '';
    state.q = '';
    searchBar.disabled = true;
}

function resetTagsAndFilter(): void {
    clearTimeout(tagTimer);
    tagInput.value = '';
    statusSelect.value = '';
    state.tag = '';
    state.active = undefined;
    tagInput.disabled = false;
    statusSelect.disabled = false;
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

async function changePage(newPage: number): Promise<void> {
    state.page = newPage;
    const ok = await getAllListings();
    if (ok) {
        document.getElementById('listings-header')?.scrollIntoView( { block: 'start' });
    }
}
 
const size = 3;

function updatePagination(meta: ListingMeta): void {
    prevBTN.setAttribute('aria-disabled', String(meta.isFirstPage));
    nextBTN.setAttribute('aria-disabled', String(meta.isLastPage));
    const count = meta.totalCount != null ? `, ${meta.totalCount} results` : '';
    pageInfo.textContent = `Page ${meta.currentPage} of ${meta.pageCount || 1}${count}`;

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

        const isCurrent = pageNumber === meta.currentPage;
        button.classList.toggle('font-bold', isCurrent);
        if (isCurrent) {
            button.setAttribute('aria-current', 'page');

        }else{
            button.removeAttribute('aria-current');
        }
        button.setAttribute('aria-label', `Page ${pageNumber}`);
        
    })
}
if (searchBar) {
searchBar?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
        const q = searchBar.value.trim();
        if (q) {
            resetTagsAndFilter();
            tagInput.disabled = true;
            statusSelect.disabled = true;
        }else {
            tagInput.disabled = false;
            statusSelect.disabled = false;
        }
        state.q = q;
        applyFilter();
    }, 300);
});
}

if (tagInput) {
    tagInput.addEventListener('input', () => {
    clearTimeout(tagTimer);
    tagTimer = window.setTimeout(() => {
        const tag = tagInput.value.trim();
       if (tag) {
        resetSearch();
        searchBar.disabled = true;
       }else{
        searchBar.disabled = false;
       }
       state.tag = tag;
        applyFilter();
    }, 300);
})
}

if (statusSelect) {
    statusSelect.addEventListener('change', () => {
        const value = statusSelect.value;
        if (value !== '') {
            resetSearch();
            searchBar.disabled = true;
        }else if (!tagInput.value.trim()){
            searchBar.disabled = false;
        }
    state.active = value === '' ? undefined : value === 'true';
    applyFilter();
})

}

if (prevBTN) {
prevBTN.addEventListener('click', () => {
    if (prevBTN.getAttribute('aria-disabled') === 'true') return;
    if (state.page > 1) {
        changePage(state.page - 1);
    }
});
}

if (nextBTN) {
    nextBTN.addEventListener('click', () => {
    if (nextBTN.getAttribute('aria-disabled') === 'true') return;
    changePage(state.page + 1);
})
}
if (pageBTNs) {
    pageBTNs.forEach((button) => {
    button?.addEventListener('click', () => {
       changePage(Number(button.dataset.page)) ;
    })
})
}

getAllListings()
