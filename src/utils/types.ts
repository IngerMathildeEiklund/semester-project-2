export type UserProfile = {
  name: string;
  email: string;
  bio?: string | null;
  avatar?: Media;
  banner?: Media;
}

export const GUEST_PROFILE: UserProfile = {
  name: 'Guest',
  email: "",
  avatar: {
    url: "https://www.citypng.com/public/uploads/preview/download-profile-user-round-orange-icon-symbol-png-701751695033488zipyc2pvo5.png"
  ,alt: "Guest user avatar image"}
  ,banner: {
    url: "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
  ,alt: "Blue banner image"}
}
export type Media = {
  url: string;
  alt: string;
}

export type Credentials = {
  email: string;
  password: string;
}

export type RegisterData = UserProfile &{
password: string;
}

export type AuthResponse = {
  data: {
    accessToken: string;
    name: string;
    email: string;
  };
}

export type RegisterResponse = {
  data: {
    name: string;
    email: string;
    [key: string]: unknown;
  };
}

export type SellerProfile = UserProfile & {
  wins?: string[];
}

export type Bid = {
  id: string;
  amount: string;
  bidder: UserProfile;
  created: string;
}

export type ListingCount = {
  bids: number;
}
export type Listing = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  media: Media[];
  created: string;
  updated: string;
  endsAt: string;
  _count: ListingCount;
  seller?: SellerProfile;
  bids?: Bid[];
}

export type ListingMeta = {
  isFirstpage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
}

export type ListingResponse = {
  data: Listing[];
  meta: ListingMeta;
}

export type OneListingResponse = {
  data: Listing;
  meta: Record<string, never>;
}