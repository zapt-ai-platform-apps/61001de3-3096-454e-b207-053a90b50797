import axios from 'axios';
import { generateMockPriceData } from './mockDataGenerator';
import * as Sentry from '@sentry/browser';

// Add your API key here if you have one (you can get a free one from CryptoCompare)
const CRYPTO_COMPARE_API_KEY = '';

const BASE_URL = 'https://min-api.cryptocompare.com/data';

// Cache data to prevent excessive API calls and ensure consistent signals
const dataCache = {
  current: {},  // Cache for current prices
  historical: {} // Cache for historical data
};

// Use a timestamp-based cache key to ensure data stays consistent within the same 15-min period
const getCacheKey = (asset, interval) => {
  const now = new Date();
  // Round down to the nearest 15 minutes to keep data consistent within that period
  const timeKey = Math.floor(now.getTime() / (15 * 60 * 1000));
  return `${asset}-${interval}-${timeKey}`;
};

export async function getCurrentPrice(symbol = 'BTC', currency = 'USD') {
  const cacheKey = `${symbol}-${currency}`;
  
  // Check if we have a recent cache (less than 30 seconds old)
  if (dataCache.current[cacheKey] && 
      (Date.now() - dataCache.current[cacheKey].timestamp) < 30000) {
    console.log(`Using cached price for ${symbol}/${currency}`);
    return dataCache.current[cacheKey].price;
  }
  
  try {
    console.log(`Fetching current price for ${symbol}/${currency} from CryptoCompare`);
    const response = await axios.get(`${BASE_URL}/price`, {
      params: {
        fsym: symbol,
        tsyms: currency,
        api_key: CRYPTO_COMPARE_API_KEY,
      },
      timeout: 5000
    });
    
    if (response.data && response.data[currency]) {
      const price = parseFloat(response.data[currency]);
      
      // Cache the result
      dataCache.current[cacheKey] = {
        price,
        timestamp: Date.now()
      };
      
      console.log(`Current ${symbol}/${currency} price: ${price}`);
      return price;
    } else {
      throw new Error(`Invalid response format from CryptoCompare for ${symbol}/${currency}`);
    }
  } catch (error) {
    console.error(`Error fetching current price for ${symbol}/${currency}:`, error);
    Sentry.captureException(error);
    
    // If we have any cached data, use it as fallback
    if (dataCache.current[cacheKey]) {
      console.log(`Using older cached price for ${symbol}/${currency} as fallback`);
      return dataCache.current[cacheKey].price;
    }
    
    // Generate realistic mock price if we can't get real data
    console.log(`Generating mock price for ${symbol}/${currency}`);
    const mockPrice = symbol === 'BTC' ? 50000 + Math.random() * 5000 :
                      symbol === 'EUR' ? 1.05 + Math.random() * 0.1 :
                      symbol === 'XAU' ? 2000 + Math.random() * 200 : 100;
                      
    // Cache the mock price
    dataCache.current[cacheKey] = {
      price: mockPrice,
      timestamp: Date.now(),
      isMock: true
    };
    
    return mockPrice;
  }
}

export async function getHistoricalData(symbol = 'BTC', currency = 'USD', limit = 100, interval = 'minute') {
  const cacheKey = getCacheKey(`${symbol}-${currency}`, interval);
  
  // Check cache first
  if (dataCache.historical[cacheKey]) {
    console.log(`Using cached historical data for ${symbol}/${currency} (${interval})`);
    return dataCache.historical[cacheKey];
  }
  
  try {
    const endpoint = interval === 'minute' ? 'histominute' : 
                     interval === 'hour' ? 'histohour' : 'histoday';
    
    console.log(`Fetching ${interval} data for ${symbol}/${currency} from CryptoCompare`);
    
    const response = await axios.get(`${BASE_URL}/v2/${endpoint}`, {
      params: {
        fsym: symbol,
        tsym: currency,
        limit,
        api_key: CRYPTO_COMPARE_API_KEY,
      },
      timeout: 10000
    });
    
    if (response.data.Response === 'Error') {
      throw new Error(response.data.Message || 'Unknown error from CryptoCompare API');
    }
    
    if (!response.data.Data || !response.data.Data.Data) {
      throw new Error('Invalid data format from CryptoCompare API');
    }
    
    const data = response.data.Data.Data.map(candle => ({
      timestamp: new Date(candle.time * 1000),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volumefrom,
    }));
    
    // Cache the result with the deterministic key
    dataCache.historical[cacheKey] = data;
    
    console.log(`Received ${data.length} historical data points for ${symbol}/${currency}`);
    return data;
  } catch (error) {
    console.error(`Error fetching ${interval} data for ${symbol}/${currency}:`, error);
    Sentry.captureException(error);
    
    // Generate mock historical data if API fails
    console.log(`Generating mock historical data for ${symbol}/${currency}`);
    
    let basePrice, volatility;
    
    if (symbol === 'BTC') {
      basePrice = 50000;
      volatility = 0.02; // 2% daily volatility
    } else if (symbol === 'EUR') {
      basePrice = 1.08;
      volatility = 0.005; // 0.5% daily volatility
    } else if (symbol === 'XAU') {
      basePrice = 2000;
      volatility = 0.01; // 1% daily volatility
    } else {
      basePrice = 100;
      volatility = 0.015;
    }
    
    // Generate deterministic mock data based on the cache key to ensure consistency
    const mockData = generateMockPriceData(limit, interval, basePrice, volatility, cacheKey);
    
    // Cache the mock data
    dataCache.historical[cacheKey] = mockData;
    
    return mockData;
  }
}