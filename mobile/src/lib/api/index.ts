import type { CommerceRepository } from "./commerceRepo";
import { mockCommerceRepository } from "./mockCommerce";

let repo: CommerceRepository = mockCommerceRepository;

export function getCommerceRepo(): CommerceRepository {
  return repo;
}

/** Swap for a real HTTP adapter without touching UI. */
export function setCommerceRepo(next: CommerceRepository) {
  repo = next;
}

export type { CommerceRepository } from "./commerceRepo";
export type { FeedItem, Product } from "./types";
