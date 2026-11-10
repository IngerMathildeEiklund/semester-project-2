export type UserProfile = {
  name: string;
  email: string;
  bio?: string;
  avatar?: Media;
  banner?: Media;
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
  wins: string[];
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
  description: string;
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