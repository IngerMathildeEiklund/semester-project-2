import type { Listing, Bid } from "../utils/types";
import { transformDate } from "../utils/helpers";

export const NO_IMAGE = "../src/assets/io-images-photo-1103595_640.png";

type CardOptions = { 
detailed?: boolean;
bids?: Bid[];

};

export function createCard( listing  : Listing, { detailed = false, bids: bidList }: CardOptions = {}): HTMLElement {
    console.log(listing);
    const card = document.createElement('a');
    card.className = 'listing-card';
    card.dataset.id = listing.id;
    card.classList.add('flex', 'flex-col', 'gap-4', 'p-2')

    const image = listing.media[0];
    const cardImage = document.createElement('img');

    cardImage.classList.add('w-full', 'h-50', 'object-cover', 'rounded-t-xl');
    cardImage.src = image?.url ?? NO_IMAGE;
    cardImage.alt = image?.alt ?? "";
    cardImage.onerror = () => {
        cardImage.onerror = null;
        cardImage.src = NO_IMAGE;
    }

    card.appendChild(cardImage)
    const sellerWrapper = document.createElement('div');
    const sellerAvatar = document.createElement('img');
    const seller = document.createElement('p');

    if (listing.seller) {
    sellerAvatar.src = listing.seller.avatar?.url ?? NO_IMAGE;
    sellerAvatar.alt = '';
    seller.textContent = listing.seller.name;
    }


    sellerWrapper.append(sellerAvatar, seller);
    const title = document.createElement('h3');
    const price = document.createElement('p');
    const bids = document.createElement('p');
    const endsAt = document.createElement('p');
    endsAt.classList.add('text-green-800');

    const bidEndsAtWrapper = document.createElement('div');
    bidEndsAtWrapper.classList.add('justify-between', "mt-auto");

    title.classList.add('line-clamp-2', 'break-words');

    price.textContent = "Highest bid wins";
    title.textContent = listing.title;
    
    bids.textContent = `${listing._count.bids} bids`
    

    const now = new Date()
    const ends = new Date(listing.endsAt);
    if (now > ends) {
        endsAt.innerHTML = `<div class="flex flex-row gap-2 text-red-800 items-center"> <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-clock-x">
	<path stroke="none" d="M0 0h24v24H0z" fill="none" />
	<path d="M20.926 13.15a9 9 0 1 0 -7.835 7.784" />
	<path d="M12 7v5l2 2" />
	<path d="M22 22l-5 -5" />
	<path d="M17 22l5 -5" />
</svg> Ended </div>`
    }else {
            endsAt.innerHTML = `<div class="flex flex-row gap-2 items-center"> <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-clock">
	<path stroke="none" d="M0 0h24v24H0z" fill="none" />
	<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
	<path d="M12 7v5l3 3" />
</svg> ${transformDate(listing.endsAt)} </div>`
    }
    card.append(sellerWrapper);
    bidEndsAtWrapper.append(bids, endsAt);
    bidEndsAtWrapper.classList.add('flex', 'flex-row', 'gap-2');
    card.append(title, price)
    card.appendChild(bidEndsAtWrapper)

    if (detailed) {
    const desc = document.createElement('p');
    const created = document.createElement('p');
    const updated = document.createElement('p');

    created.textContent = `${transformDate(listing.created)}`
    desc.textContent = listing.description ?? '';
    updated.textContent = `${transformDate(listing.updated)}`

    card.append(desc, created);

    listing.media.slice(1).forEach((media) => {
        const img = document.createElement('img');
        img.src = media.url ?? NO_IMAGE;
        img.alt = media.alt ?? "Listing image";
        img.classList.add('w-full', "object-cover", "rounded-xl");
        card.appendChild(img);
    })
        if (bidList) {  
        const highestBid = bidList && bidList.length > 0 ? Math.max(...bidList.map((bid) => Number(bid.amount))) : null;
        price.textContent = highestBid !== null ? `Current price: ${highestBid}` : "No bids yet";
        if (now > ends){
            price.textContent = `Sold for ${highestBid}`;
        }
        const list = document.createElement('ul');
        

        const sortedBids = [...bidList].sort((a, b) => Number(b.amount) - Number(a.amount));
        
        sortedBids.forEach((bid) => {
            const item = document.createElement('li');
            item.textContent = `${bid.amount} by ${bid.bidder.name}`
            list.append(item);

        })
        card.append(list);
    }
}

    return card;
}