import { getErrorMessage } from "./error/apiError";
import { toastNotification } from "./messages/toastnotifications";
import { getNameByParams } from "./utils/helpers";
import { get } from "./api/apiClient";
import {
  type ListingResponse,
  type OneProfile,
  type OneProfileResponse,
  type ListSection,
  type ListingMeta,

  type BidOnResponse,

  type OneListingResponse,
} from "./utils/types";
import { createCard } from "./components/card";
import { formatCurrency } from "./components/card";
import { getLoggedInUser } from "./utils/helpers";
import type { ListingQueryOneUser } from "./utils/types";
import { ALL_LISTINGS_URL } from ".";
import { updateProfileFormModal } from "./components/editProfile";
export const ALL_PROFILES_URL = "/auction/profiles";

export async function fetchProfileByName(
  name: string,
): Promise<OneProfileResponse> {
  const response = await get<OneProfileResponse>(`${ALL_PROFILES_URL}/${name}`);
  if (!response) {
    throw new Error("Could not find profile");
  }
  return response;
}
export async function fetchAllListingsByName({
  name,
  page = 1,
  limit = 6,
  includeSeller = false,
  includeBids = false,
}: ListingQueryOneUser & { name: string }): Promise<ListingResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (includeSeller) params.set("_seller", "true");
  if (includeBids) params.set("_bids", "true");

  const response = await get<ListingResponse>(
    `${ALL_PROFILES_URL}/${encodeURIComponent(name)}/listings?${params.toString()}`,
  );
  if (!response?.data) {
    throw new Error("Failed to get listings");
  }
  return response;
}

export async function fetchAllListingsUserHasBidOn({
  name,
  page = 1,
  limit = 6,
}: ListingQueryOneUser & { name: string }): Promise<ListingResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    _listings: "true",
  });

  const response = await get<BidOnResponse>(
    `${ALL_PROFILES_URL}/${encodeURIComponent(name)}/bids?${params.toString()}`,
  );
  console.log(response?.data);
  if (!response?.data) {
    throw new Error("Failed to get listings");
  }
  const listings = await Promise.all(
    response.data
      .filter((bid) => bid.listing)
      .map(async (bid) => {
        try {
          const single = await get<OneListingResponse>(
            `${ALL_LISTINGS_URL}/${bid.listing!.id}?bids=true`,
          );
          return single?.data ?? bid.listing!;
        } catch {
          return bid.listing!;
        }
      }),
  );
  return { data: listings, meta: response.meta };
}

export async function fetchAllListingsUserHasWon({
  name,
  page = 1,
  limit = 6,
}: ListingQueryOneUser & { name: string }): Promise<ListingResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await get<ListingResponse>(
    `${ALL_PROFILES_URL}/${encodeURIComponent(name)}/wins?${params.toString()}`,
  );
  if (!response?.data) {
    throw new Error("Could not get listings");
  }
  return response;
}

function createPaginatedList({
  container,
  prev,
  next,
  fetchPage,
}: ListSection) {
  let meta: ListingMeta | null = null;

  async function load(page: number): Promise<void> {
    prev.disabled = true;
    next.disabled = true;
    try {
      const response = await fetchPage(page);
      meta = response.meta;

      container.replaceChildren();

      if (response.data.length === 0) {
        const errorMSG = document.createElement("li");
        errorMSG.textContent = "No listings found";
        container.append(errorMSG);
      }
      for (const listing of response.data) {
        const item = document.createElement("li");
        item.append(createCard(listing));
        container.append(item);
      }
    } catch (error) {
      toastNotification(getErrorMessage(error), "error");
    } finally {
      prev.disabled = meta?.isFirstPage ?? true;
      next.disabled = meta?.isLastPage ?? true;
    }
  }
  prev.addEventListener("click", () => {
    if (meta?.previousPage) load(meta.previousPage);
  });
  next.addEventListener("click", () => {
    if (meta?.nextPage) load(meta.nextPage);
  });
  return load;
}

const profileName = getNameByParams() ?? getLoggedInUser()?.name;

const loadOwnListings = profileName
  ? createPaginatedList({
      container: document.getElementById(
        "own-listings-container",
      ) as HTMLUListElement,
      prev: document.getElementById(
        "own-listings-prev-btn",
      ) as HTMLButtonElement,
      next: document.getElementById(
        "own-listings-next-btn",
      ) as HTMLButtonElement,
      fetchPage: (page) => fetchAllListingsByName({ name: profileName, page }),
    })
  : null;

const loadBidOnListings = profileName
  ? createPaginatedList({
      container: document.getElementById(
        "bid-on-listings-container",
      ) as HTMLUListElement,
      prev: document.getElementById(
        "bid-on-listings-prev-btn",
      ) as HTMLButtonElement,
      next: document.getElementById(
        "bid-on-listings-next-btn",
      ) as HTMLButtonElement,
      fetchPage: (page) =>
        fetchAllListingsUserHasBidOn({ name: profileName, page }),
    })
  : null;

const loadWonListings = profileName
  ? createPaginatedList({
      container: document.getElementById(
        "listings-won-container",
      ) as HTMLUListElement,
      prev: document.getElementById(
        "won-listings-prev-btn",
      ) as HTMLButtonElement,
      next: document.getElementById(
        "won-listings-next-btn",
      ) as HTMLButtonElement,
      fetchPage: (page) =>
        fetchAllListingsUserHasWon({ name: profileName, page }),
    })
  : null;

const profileContainer = document.getElementById(
  "profile-container",
) as HTMLElement;

export async function getOneProfile(
  container: HTMLElement | null = profileContainer,
): Promise<void> {
  if (!container) return;
  container.innerHTML = "";

  const name = getNameByParams();
  if (!name) return;
  try {
    const response = await fetchProfileByName(name);
    container.append(renderOneProfile(response.data));
    loadOwnListings?.(1);
    loadBidOnListings?.(1);
    loadWonListings?.(1);
    changeHeaderText(response.data);
  } catch (error) {
    toastNotification(getErrorMessage(error), "error");
  }
}

export function renderOneProfile(profile: OneProfile): HTMLElement {
  const profileWrapper = document.createElement("div");
  const banner = document.createElement("img");
  const avatar = document.createElement("img");
  const bannerAvatarWrapper = document.createElement("div");
  const detailsWrapper = document.createElement("div");
  const username = document.createElement("p");
  const bio = document.createElement("p");
  const credits = document.createElement("p");
  const currentUser = getLoggedInUser();
  if (currentUser && currentUser.name === profile.name) {
    const editProfileBTN = document.createElement("button");
    editProfileBTN.addEventListener('click', () => {
        updateProfileFormModal();
    })
    const logOutBTN = document.createElement("button");
    editProfileBTN.id = "edit-profile-btn";
    logOutBTN.id = "logout-btn";
    editProfileBTN.textContent = "Edit profile";
    logOutBTN.textContent = "Logout";
    editProfileBTN.classList.add("btn");
    logOutBTN.classList.add("btn");
    detailsWrapper.append(username, bio, credits, editProfileBTN, logOutBTN);
  } else {
    detailsWrapper.append(username, bio);
  }
  banner.src = profile.banner.url ?? "";
  banner.alt = profile.banner.alt ?? "";
  avatar.src = profile.avatar.url ?? "";
  avatar.alt = profile.avatar.alt ?? "";
  bannerAvatarWrapper.append(banner, avatar);

  banner.id = "banner";
  avatar.id = "avatar";
  username.id = "username";
  bio.id = "bio";
  credits.id = "credits";

  username.textContent = profile.name;
  if (profile.bio === null) {
    bio.textContent = "";
  } else {
    bio.textContent = profile.bio ?? "";
  }
  credits.textContent = `Current balance: ${formatCurrency(String(profile.credits))}`;
  credits.classList.add("font-bold");
  bio.classList.add("items-center", "justify-center", "text-center");

  profileWrapper.classList.add(
    "flex",
    "flex-col",
    "gap-4",
    "items-center",
    "justify-center",
  );
  bannerAvatarWrapper.classList.add("relative", "w-full", "h-64");
  banner.classList.add("w-full", "object-fit", "h-64", "rounded-2xl");
  avatar.classList.add(
    "absolute",
    "left-1/2",
    "top-1/2",
    "-translate-x-1/2",
    "translate-y-1/4",
    "w-40",
    "h-40",
    "rounded-full",
    "object-cover",
    "border-4",
    "border-white",
  );

  detailsWrapper.classList.add(
    "flex",
    "flex-col",
    "gap-4",
    "mt-20",
    "justify-center",
    "items-center",
    "mb-15",
  );

  profileWrapper.append(bannerAvatarWrapper, detailsWrapper);
  return profileWrapper;
}

function changeHeaderText(profile: OneProfile): void {
  const profileHeader = document.getElementById(
    "profile-header",
  ) as HTMLHeadingElement;
  const ownListingsHeader = document.getElementById(
    "own-listings-header",
  ) as HTMLHeadingElement;
  const bidOnListingsHeader = document.getElementById(
    "bid-on-listings-header",
  ) as HTMLHeadingElement;
  const listingsWonHeader = document.getElementById(
    "listings-won-header",
  ) as HTMLHeadingElement;

  profileHeader.textContent = `${profile.name}'s profile`;
  ownListingsHeader.textContent = `${profile.name}'s listings`;
  bidOnListingsHeader.textContent = `Listings ${profile.name} has bid on`;
  listingsWonHeader.textContent = `Listings ${profile.name} has won`;
}

getOneProfile();
