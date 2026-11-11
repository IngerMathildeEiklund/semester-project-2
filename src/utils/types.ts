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
    url: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=500&w=1500"
  ,alt: "Guest user avatar image"}
  ,banner: {
    url: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=500&w=1500"
  ,alt: "Guest user banner image"}
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