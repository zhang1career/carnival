import Constants from "expo-constants";

type Extra = {
  apiBaseUrl?: string;
  features?: {
    commerce?: boolean;
    feed?: boolean;
    media?: boolean;
  };
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const apiBaseUrl = (extra.apiBaseUrl ?? "").trim();

export const features = {
  commerce: extra.features?.commerce !== false,
  feed: extra.features?.feed !== false,
  media: extra.features?.media !== false,
};
