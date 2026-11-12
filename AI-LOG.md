12.11.2026 12:26: 

Prompt: There are several broken images from the API, how can I replace them with my placeholder image? 

Changes made: Used the oneerror:
```ts
    cardImage.onerror = () => {
        cardImage.onerror = null;
        cardImage.src = NO_IMAGE;
    }
```    

12.11.2026 13:48:

Prompt: How can I make my card component reusable for both the homepage and the "view one listing page"? I want to display additional information that can only be seen on the one listing page. 

Changes made: Added a type called CardOptions that can be passed in the parameter as a flag thats a part of the options object, depending if I want to use the detailed card component or not.

```ts
type CardOptions = { 
detailed?: boolean;
bids?: Bid[];

};

export function createCard( listing  : Listing, { detailed = false, bids: bidList }: CardOptions = {})
```

12.11.2026 14:04: 

Prompt: How do I sort the bids by descending order? 

Changes made: Made a copy of the array using spread to not mutate the original array:
```ts
const sortedBids = [...bidList].sort((a, b) => Number(b.amount) - Number(a.amount));
```

12.11.2026 14:28: 

Prompt: I want to display the highest bid as the price, how can I achieve this? 

Changes made: 
```ts
const highestBid = bidList && bidList.length > 0 ? Math.max(...bidList.map((bid) => Number(bid.amount))) : null;
price.textContent = highestBid !== null ? `Current price: ${highestBid}` : "No bids yet";
```

