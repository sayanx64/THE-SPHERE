import WebSocket from 'ws';
import config from '../config.js';
import shipStore from './shipStore.js';
import { createLogger } from '../logger.js';

const logger = createLogger();

const AIS_URL = 'wss://stream.aisstream.io/v0/stream';

/** Map AIS ship type codes to human-readable categories */
function getShipCategory(type) {
  if (!type) return 'Unknown';
  if (type >= 70 && type <= 79) return 'Cargo';
  if (type >= 80 && type <= 89) return 'Tanker';
  if (type >= 60 && type <= 69) return 'Passenger';
  if (type >= 40 && type <= 49) return 'High-Speed';
  if (type >= 30 && type <= 39) return 'Fishing';
  if (type >= 50 && type <= 59) return 'Special';
  if (type >= 20 && type <= 29) return 'WIG';
  return 'Other';
}

/** Navigational status codes */
const NAV_STATUS = {
  0: 'Under way using engine',
  1: 'At anchor',
  2: 'Not under command',
  3: 'Restricted manoeuvrability',
  4: 'Constrained by draught',
  5: 'Moored',
  6: 'Aground',
  7: 'Engaged in fishing',
  8: 'Under way sailing',
  15: 'Undefined',
};

let ws = null;
let reconnectTimer = null;
let reconnectDelay = 2000;
const MAX_RECONNECT_DELAY = 60000;

function connect() {
  const apiKey = config.aisStreamKey;
  if (!apiKey) {
    logger.warn('⚠️  No AISSTREAM_API_KEY set — ship tracking disabled');
    return;
  }

  logger.info('🚢 Connecting to AISStream...');

  ws = new WebSocket(AIS_URL);

  ws.on('open', () => {
    logger.info('🚢 AISStream connected — subscribing to global feed');
    reconnectDelay = 2000; // reset backoff

    const subscription = {
      Apikey: apiKey,
      BoundingBoxes: [[[-90, -180], [90, 180]]],
      FilterMessageTypes: ['PositionReport', 'ShipStaticData'],
    };

    ws.send(JSON.stringify(subscription));
  });

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);

      if (msg.error) {
        logger.error({ error: msg.error }, 'AISStream error');
        return;
      }

      const meta = msg.MetaData || {};
      const mmsi = meta.MMSI;
      if (!mmsi) return;

      if (msg.MessageType === 'PositionReport') {
        const pos = msg.Message?.PositionReport;
        if (!pos) return;

        // Filter out invalid positions
        if (pos.Latitude === 91 || pos.Longitude === 181) return;

        shipStore.upsert(mmsi, {
          lat: pos.Latitude,
          lng: pos.Longitude,
          speed: pos.Sog || 0,
          heading: pos.TrueHeading === 511 ? null : pos.TrueHeading,
          cog: pos.Cog,
          navStatus: NAV_STATUS[pos.NavigationalStatus] || 'Unknown',
          name: meta.ShipName?.trim() || null,
        });
      }

      if (msg.MessageType === 'ShipStaticData') {
        const data = msg.Message?.ShipStaticData;
        if (!data) return;

        shipStore.upsert(mmsi, {
          name: data.Name?.trim() || meta.ShipName?.trim() || null,
          callSign: data.CallSign?.trim() || null,
          imo: data.ImoNumber || null,
          shipType: data.Type || null,
          shipCategory: getShipCategory(data.Type),
          destination: data.Destination?.trim().replace(/@/g, '') || null,
          eta: data.Eta || null,
          draught: data.MaximumStaticDraught || null,
          dimensionA: data.Dimension?.A || 0,
          dimensionB: data.Dimension?.B || 0,
          dimensionC: data.Dimension?.C || 0,
          dimensionD: data.Dimension?.D || 0,
        });
      }
    } catch (err) {
      // Silently ignore parse errors (high throughput stream)
    }
  });

  ws.on('close', (code, reason) => {
    logger.warn(`🚢 AISStream disconnected (code ${code}) — reconnecting in ${reconnectDelay / 1000}s`);
    scheduleReconnect();
  });

  ws.on('error', (err) => {
    logger.error({ err: err.message }, '🚢 AISStream WebSocket error');
  });
}

function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
    connect();
  }, reconnectDelay);
}

export function startAISClient() {
  connect();
}

export function stopAISClient() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (ws) {
    ws.removeAllListeners();
    ws.close();
    ws = null;
  }
}
