/**
 * In-memory store for live ship positions.
 * Capped at MAX_SHIPS entries — evicts oldest by timestamp.
 */

const MAX_SHIPS = 2000;

class ShipStore {
  constructor() {
    /** @type {Map<number, ShipData>} keyed by MMSI */
    this.ships = new Map();
  }

  /**
   * Update or insert a ship position.
   * @param {number} mmsi
   * @param {object} data — partial ship fields to merge
   */
  upsert(mmsi, data) {
    const existing = this.ships.get(mmsi) || {};
    this.ships.set(mmsi, {
      ...existing,
      ...data,
      mmsi,
      updatedAt: Date.now(),
    });

    // Evict oldest if over cap
    if (this.ships.size > MAX_SHIPS) {
      this._evictOldest();
    }
  }

  /** Get a single ship by MMSI */
  get(mmsi) {
    return this.ships.get(mmsi) || null;
  }

  /** Get all ships as an array */
  getAll() {
    return Array.from(this.ships.values());
  }

  /** Get count */
  get size() {
    return this.ships.size;
  }

  /** Remove ships not updated in the last N ms */
  pruneStale(maxAgeMs = 10 * 60 * 1000) {
    const cutoff = Date.now() - maxAgeMs;
    for (const [mmsi, ship] of this.ships) {
      if (ship.updatedAt < cutoff) {
        this.ships.delete(mmsi);
      }
    }
  }

  /** Evict the oldest entry */
  _evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;
    for (const [mmsi, ship] of this.ships) {
      if (ship.updatedAt < oldestTime) {
        oldestTime = ship.updatedAt;
        oldestKey = mmsi;
      }
    }
    if (oldestKey !== null) {
      this.ships.delete(oldestKey);
    }
  }
}

const shipStore = new ShipStore();

// Prune stale ships every 5 minutes
setInterval(() => shipStore.pruneStale(), 5 * 60 * 1000);

export default shipStore;
