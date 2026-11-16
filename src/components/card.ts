import type { Listing, Bid, SellerProfile } from "../utils/types";
import { transformDate } from "../utils/helpers";

export const NO_IMAGE = "../src/assets/io-images-photo-1103595_640.png";
const CURRENCY = '$';

function formatCurrency(amount: number | string): string {
  return `${CURRENCY}${amount}`;
}
type CardOptions = {
  detailed?: boolean;
  bids?: Bid[];
  seller?: SellerProfile;
};

type MediaItem = { url?: string | null; alt?: string | null};

function createImageGallery(media: MediaItem[], title: string): HTMLElement {
    const images: MediaItem[] = media.length > 0 ? media : [{ url: NO_IMAGE, alt: ''}];
    let index = 0;

    const galleryContainer = document.createElement('div');
    galleryContainer.classList.add('relative');

    const img = document.createElement('img');
    img.classList.add('w-full', 'h-64', 'object-cover', 'rounded-2xl');
    img.onerror = () => {
        img.onerror = null;
        img.src = NO_IMAGE;
    }

    const current = document.createElement('p');
    current.classList.add('text-center', 'text-sm', 'mt-2');
    current.setAttribute('aria-live', 'polite');
    
    const show = (i: number) => {
        index = (i + images.length) % images.length;
        img.src = images[index].url ?? NO_IMAGE;
        img.alt = images[index].alt ?? `${title}, image ${index + 1} of ${images.length}`;
        current.textContent = `${index + 1} / ${images.length}`;
    }

    const createGalleryButton = (label: string, step: number) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.setAttribute('aria-label', step < 0 ? 'Previous image' : 'Next image');
        button.classList.add('cursor-pointer','absolute', 'top-1/2', '-translate-y-1/2', 'bg-black/50', 'text-white', 'rounded-full', 'px-3', 'py-1', step < 0 ? "left-2" : 'right-2',)
        
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            show(index + step);
        })
        return button;
    }
    galleryContainer.append(img, current);

    if (images.length > 1) {
        galleryContainer.append(createGalleryButton(`<`, -1), createGalleryButton(`>`, 1));

    }
    show(0);
    return galleryContainer;
}

function getPriceText(bidList: Bid[] | undefined, hasEnded: boolean): string {
  
    if (!bidList) return '';
    if (bidList.length === 0) return hasEnded ? "No bids were made" : "No bids yet.";
    
    const highestBid = Math.max(...bidList.map((bid) => Number(bid.amount))); 
    return hasEnded ? `Sold for ${formatCurrency(highestBid)}` : `Current price: ${formatCurrency(highestBid)}`;
}


export function createBidList(bids: Bid[], list: HTMLTableSectionElement): void {
  if (bids.length === 0) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = 2;
  cell.textContent = 'No bids yet';
  row.append(cell);
  list.replaceChildren(row);
  return;
}
  const rows = [...bids]
  .sort((a, b) => Number(b.amount) - Number (a.amount))
  .map((bid) => {
        const row = document.createElement('tr');
        row.classList.add('border-b', 'border-gray-300', 'mb-8');
        const bidder = document.createElement('td');
        bidder.classList.add('py-2');
        
        const time = document.createElement('td');
        time.textContent = `${transformDate(bid.created)}`;
        bidder.textContent = bid.bidder.name;
        const amount = document.createElement('td');
        amount.classList.add('py-2');
        amount.textContent = formatCurrency(bid.amount);

        row.append(bidder, amount, time);
        return row;
  });

  list.replaceChildren(...rows);
}

export function createSellerInfo(seller: SellerProfile): HTMLElement {
  const sellerWrapper = document.createElement('div');
  sellerWrapper.classList.add('flex', 'flex-row', 'items-center');

  const sellerAvatar = document.createElement('img');
  sellerAvatar.classList.add('w-10', 'h-10', 'rounded-full', 'object-cover');
  sellerAvatar.src = seller.avatar?.url ?? NO_IMAGE;
  sellerAvatar.alt = '';

  const sellerName = document.createElement('p');
  sellerName.textContent = seller.name;
  sellerWrapper.append(sellerAvatar, sellerName);
  return sellerWrapper;
}

export function createCard(
  listing: Listing,
  { detailed = false, bids: bidList, seller: showSeller }: CardOptions = {},
): HTMLElement {

const now = new Date();
  const ends = new Date(listing.endsAt);
  const hasEnded = now > ends;

  const card = document.createElement("article");
  card.setAttribute('aria-labelledby', `listing-title-${listing.id}`);
  card.className = "listing-card";
  card.dataset.id = listing.id;
  card.classList.add('relative',"flex", "flex-col", "gap-4", "p-2",);

  const image = listing.media[0];
  const cardImage = document.createElement("img");

  cardImage.classList.add("w-full", "h-50", "object-cover", "rounded-t-xl");
  cardImage.src = image?.url ?? NO_IMAGE;
  cardImage.alt = image?.alt ?? "";
  cardImage.onerror = () => {
    cardImage.onerror = null;
    cardImage.src = NO_IMAGE;
  };

    card.append(detailed ? createImageGallery(listing.media, listing.title): cardImage);


  const title = document.createElement("h3");
  title.classList.add("line-clamp-2", "break-words");

  const titleLink = document.createElement('a');
  titleLink.href = `/pages/listing.html?id=${listing.id}`;
  title.id = `listing-title-${listing.id}`;
  titleLink.textContent = listing.title;
  
  title.append(titleLink);
  const desc = document.createElement("p");
  desc.classList.add('line-clamp-1', 'break-words')
  
  const price = document.createElement("p");
  price.textContent = getPriceText(bidList, hasEnded);
desc.textContent = listing.description ?? "";
  const bids = document.createElement("p");
  bids.textContent = `${listing._count.bids} ${listing._count.bids === 1 ? "bid" : "bids"}`;
  
  const endsAt = document.createElement("div");
  endsAt.classList.add('flex', 'flex-row', 'gap-2', 'items-center');
  endsAt.classList.add(hasEnded ? 'text-red-800': 'text-green-800');

    endsAt.innerHTML = hasEnded ? `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-clock-x">
	<path stroke="none" d="M0 0h24v24H0z" fill="none" />
	<path d="M20.926 13.15a9 9 0 1 0 -7.835 7.784" />
	<path d="M12 7v5l2 2" />
	<path d="M22 22l-5 -5" />
	<path d="M17 22l5 -5" />
</svg> <span> Listing has ended </span>` : ` <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-clock">
	<path stroke="none" d="M0 0h24v24H0z" fill="none" />
	<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
	<path d="M12 7v5l3 3" />
</svg> <span> Ends at <span> <time datetime="${listing.endsAt}">${transformDate(listing.endsAt)} </time>`;

const bidEndsAtWrapper = document.createElement("div");
bidEndsAtWrapper.classList.add("justify-between", "mt-auto","flex", "flex-row", "gap-2" );  
bidEndsAtWrapper.append(bids, endsAt);
card.append(title, desc, price, bidEndsAtWrapper);

  
    if (detailed) {
    const tagContainer = document.createElement("div");
    tagContainer.classList.add("flex", "flex-row", "gap-2");
      
    listing.tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.textContent = `${tag}`;
    tagElement.classList.add(
      "rounded-full",
      "px-3",
      "py-1",
      "w-fit",
      "border-2",
      "border-fuchsia-600",
    );
    tagContainer.appendChild(tagElement);
  });  
  
    const created = document.createElement("time");
    const updated = document.createElement("time");

    created.dateTime = listing.created;
    created.textContent = transformDate(listing.created);

    updated.dateTime = listing.updated;
    updated.textContent = transformDate(listing.updated);

    const createdText = document.createElement('p');
    createdText.append("Created: ", created);

    const updatedText = document.createElement('p');
    updatedText.append('Updated: ', updated);
    
    const dateTexts = [createdText];

    if (listing.created !== listing.updated) {
        dateTexts.push(updatedText);
    }

    card.append(tagContainer);

    const bidsBody = document.getElementById('bids-body') as HTMLTableSectionElement | null;
    
    if (bidList && bidsBody) {
      createBidList(bidList, bidsBody);
    }

    card.prepend(...dateTexts);
    if (showSeller && listing.seller) {
      card.prepend(createSellerInfo(listing.seller));
    }
  }
  return card;
}
