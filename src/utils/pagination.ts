import type { ListingMeta } from "./types";
import { fetchAllListings } from "..";

const prevBTN = document.getElementById('prev-btn') as HTMLButtonElement;
const nextBTN = document.getElementById('next-btn') as HTMLButtonElement;
const pageBTNs = [1, 2, 3].map((n) => document.getElementById(`page-btn-${n}`));

let currentPage = 1;
const POST_PER_PAGE = 30;
const TOTAL_PAGES = 33;

let activeQuery: string | null = null;

export function getCurrentPage(): number {
    return currentPage;
}

export function setActiveQuery(query: string | null): void {
    activeQuery = query;
}

function updatePaginationControls(meta: ListingMeta) {
    if (!nextBTN || !prevBTN) return;
    prevBTN.disabled = !meta.previousPage;
    nextBTN.disabled = !meta.nextPage;
}

/* export async function loadPage(page: number): Promise<void> {
    try {
        const response = activeQuery ? await searchForPosts(activeQuery, page, POST_PER_PAGE) :
        await get
    }
} */


prevBTN?.addEventListener('click', () => {
    if (!prevBTN) return;
    if (!prevBTN.disabled) {

    }
})

nextBTN?.addEventListener('click', () => {
    if (!nextBTN) return;
    if (!nextBTN.disabled) {

    }
})
