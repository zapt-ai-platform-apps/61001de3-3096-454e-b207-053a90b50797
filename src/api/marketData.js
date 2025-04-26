import { getCurrentPrice, getHistoricalData } from './cryptoCompareApi';
import { getCurrentGoldPrice, getHistoricalGoldData } from './goldApi';
import * as Sentry from '@sentry/browser';

// Asset mapping
const ASSETS = {
  'BTC/USD': { symbol: 'BTC', currency: 'USD', type: 'crypto' },
  'EUR/USD': { symbol: 'EUR', currency: 'USD', type: 'forex' },
  'XAU/USD': { symbol: 'XAU', currency: 'USD', type: 'commodity' }
};

export async function getAssetPrice(assetPair) {
  const asset = ASSETS[assetPair];
  
  if (!asset) {
    throw new Error(`Unsupported asset pair: ${assetPair}`);
  }
  
  try {
    if (asset.type === 'commodity' && asset.symbol === 'XAU') {
      return await getCurrentGoldPrice();
    }
    
    return await getCurrentPrice(asset.symbol, asset.currency);
  } catch (error) {
    console.error(`Error fetching price for ${assetPair}:`, error);
    Sentry.captureException(error);
    throw error;
  }
}

export async function getAssetHistory(assetPair, limit = 100, interval = 'minute') {
  const asset = ASSETS[assetPair];
  
  if (!asset) {
    throw new Error(`Unsupported asset pair: ${assetPair}`);
  }
  
  try {
    if (asset.type === 'commodity' && asset.symbol === 'XAU') {
      return await getHistoricalGoldData(limit, interval);
    }
    
    return await getHistoricalData(asset.symbol, asset.currency, limit, interval);
  } catch (error) {
    console.error(`Error fetching history for ${assetPair}:`, error);
    Sentry.captureException(error);
    throw error;
  }
}

// Mock functions for options data (as these are harder to get from free APIs)
export function getOptionsMarketData(assetPair) {
  // Get current timestamp and use it to seed the random number generator
  // This ensures we get consistent values within the same 15-minute period
  const now = new Date();
  const timeKey = Math.floor(now.getTime() / (15 * 60 * 1000));
  const seed = assetPair + timeKey;
  
  // Helper function to get deterministic random numbers
  const seededRandom = (offset = 0) => {
    const x = Math.sin(hashString(seed + offset)) * 10000;
    return x - Math.floor(x);
  };
  
  // Generate a number from a string for seeding
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // Options market data ranges vary by asset
  const baseVolatility = {
    'BTC/USD': 0.7, // 70% for BTC
    'EUR/USD': 0.08, // 8% for EUR
    'XAU/USD': 0.15, // 15% for Gold
  };
  
  // Implied Volatility (IV) data
  const baseIV = baseVolatility[assetPair] || 0.3;
  const iv = baseIV + (seededRandom(1) - 0.5) * 0.2 * baseIV;
  
  // Historical IV for percentile calculation
  const historicalIVs = Array(100).fill(0).map((_, i) => {
    return baseIV * (0.7 + seededRandom(i + 100) * 0.6);
  });
  
  // Sort to get percentile
  const sortedIVs = [...historicalIVs].sort((a, b) => a - b);
  const ivPercentile = Math.round((sortedIVs.findIndex(val => val >= iv) / sortedIVs.length) * 100);
  
  // Put/Call Ratio (PCR)
  // Typically ranges from 0.5 to 1.5, higher is more bearish
  const pcr = 0.7 + seededRandom(2) * 0.8;
  
  // VIX volatility index data
  // Typically ranges from 10 to 35
  const vix = 15 + seededRandom(3) * 20;
  
  // TRIN (Arms Index) data
  // Typically ranges from 0.5 to 1.5, higher is more bearish
  const trin = 0.7 + seededRandom(4) * 0.8;
  
  // IV Skew (difference between put and call implied volatilities)
  // Negative values indicate puts more expensive than calls (bearish sentiment)
  const skew = (seededRandom(5) - 0.5) * 0.2;
  
  // Gamma exposure
  // Positive values indicate dealer long gamma, negative values indicate short gamma
  const gamma = (seededRandom(6) - 0.5) * 100000;
  
  // Open Interest Put/Call ratio
  const oiPutCallRatio = 0.8 + seededRandom(7) * 0.6;
  
  // IV Term Structure (difference between short and long-term IV)
  // Positive values indicate upward sloping term structure (contango)
  // Negative values indicate inverted term structure (backwardation)
  const ivTermStructure = (seededRandom(8) - 0.4) * 0.1;

  return {
    iv: {
      value: iv,
      percentile: ivPercentile,
      status: ivPercentile > 80 ? 'high' : ivPercentile < 20 ? 'low' : 'normal',
      term_structure: ivTermStructure
    },
    pcr: {
      value: pcr,
      status: pcr > 1.2 ? 'high' : pcr < 0.7 ? 'low' : 'normal'
    },
    vix: {
      value: vix,
      status: vix > 30 ? 'high' : vix < 15 ? 'low' : 'normal'
    },
    trin: {
      value: trin,
      status: trin > 1.2 ? 'high' : trin < 0.8 ? 'low' : 'normal'
    },
    skew: {
      value: skew,
      status: skew < -0.1 ? 'high' : skew > 0.1 ? 'low' : 'normal'
    },
    gamma_exposure: gamma,
    oi_put_call_ratio: oiPutCallRatio
  };
}