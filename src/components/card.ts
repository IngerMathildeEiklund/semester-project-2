import type { Listing } from "../utils/types";
import { transformDate } from "../utils/helpers";

export function createCard(listing: Listing): HTMLElement {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.dataset.id = listing.id;

    const image = listing.media[0];
    if (image) {
        const cardImage = document.createElement('img');
        cardImage.onerror = () => cardImage.classList.add('hidden');
        cardImage.src = image.url;
        cardImage.alt = image.alt;
        card.appendChild(cardImage)
    }
    // add the gallery functionality later
    const title = document.createElement('p');
    const desc = document.createElement('p');
    const price = document.createElement('p');
    const bids = document.createElement('p');
    const endsAt = document.createElement('p');
    const created = document.createElement('p')
    const updated = document.createElement('p');

      if (new Date(listing.updated) > new Date(listing.created)) {
        created.classList.add('hidden');
        updated.textContent = `${transformDate(listing.updated)}`
        card.appendChild(updated)
    }

    const bidEndsAtWrapper = document.createElement('div');

    price.textContent = "Highest bid wins";
    title.textContent = listing.title;
    desc.textContent = listing.description ?? '';
    bids.textContent = `${listing._count.bids} bids`
    created.textContent = `${transformDate(listing.created)}`
    endsAt.textContent = `${transformDate(listing.endsAt)}`

    bidEndsAtWrapper.append(bids, endsAt);
    bidEndsAtWrapper.classList.add('flex', 'flex-row', 'gap-2');
    card.append(title, desc, price, created)
    card.appendChild(bidEndsAtWrapper)
    return card;
}