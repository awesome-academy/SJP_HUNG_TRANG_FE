export type EmailSubscription = {
  id: string;
  email: string;
};

export type SuggestionPhoto = {
  id?: string | number;
  url: string;
};

export type ProductSuggestion = {
  id: string;
  productName: string;
  description: string;
  photos: SuggestionPhoto[];
};
