import * as LRUCache from "lru-cache"

export type Cache<V> = LRUCache<string, V>

export function createCache<V>(): Cache<V> {
  return new LRUCache({
    maxAge: 60 * 60 * 24,
  })
}
