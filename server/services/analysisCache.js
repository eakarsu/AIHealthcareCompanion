import NodeCache from 'node-cache';

// TTL: 3600 seconds (1 hour)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

export function getCacheKey(entityType, entityId) {
  return `${entityType}:${entityId}:analyze`;
}

export function getCached(entityType, entityId) {
  return cache.get(getCacheKey(entityType, entityId));
}

export function setCached(entityType, entityId, value) {
  cache.set(getCacheKey(entityType, entityId), { ...value, cachedAt: Date.now() });
}

export function invalidate(entityType, entityId) {
  cache.del(getCacheKey(entityType, entityId));
}

export default cache;
