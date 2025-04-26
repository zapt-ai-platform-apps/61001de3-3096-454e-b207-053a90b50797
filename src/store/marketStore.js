import { create } from 'zustand';
import { getAssetPrice, getAssetHistory, getOptionsMarketData } from '../api/marketData';
import { processTechnicalData } from '../utils/technicalIndicators';
import { getOptionsMarketContext } from '../utils/optionsIndicators';
import * as Sentry from '@sentry/browser';

const useMarketStore = create((set, get) => ({
  currentAsset: 'BTC/USD',
  assets: ['BTC/USD', 'EUR/USD', 'XAU/USD'],
  
  // Price data
  currentPrice: null,
  priceHistory: {},
  technicalData: {},
  loading: false,
  error: null,
  
  // Options market data
  optionsContext: {},
  
  // Actions
  setCurrentAsset: (asset) => {
    set({ currentAsset: asset });
    get().loadAllData();
  },
  
  fetchCurrentPrice: async () => {
    const { currentAsset } = get();
    
    set({ loading: true, error: null });
    
    try {
      console.log(`Fetching current price for ${currentAsset}`);
      const price = await getAssetPrice(currentAsset);
      set({ currentPrice: price, loading: false });
      return price;
    } catch (err) {
      console.error('Error fetching current price:', err);
      Sentry.captureException(err);
      set({ error: `Failed to fetch current price: ${err.message}`, loading: false });
      return null;
    }
  },
  
  fetchPriceHistory: async (interval = 'minute', limit = 100) => {
    const { currentAsset } = get();
    
    set({ loading: true, error: null });
    
    try {
      console.log(`Fetching price history for ${currentAsset}`);
      const history = await getAssetHistory(currentAsset, limit, interval);
      
      if (!history || history.length === 0) {
        throw new Error('No historical price data received');
      }
      
      // Process data with technical indicators
      const processed = processTechnicalData(history);
      
      set((state) => ({
        priceHistory: {
          ...state.priceHistory,
          [currentAsset]: { 
            ...state.priceHistory[currentAsset], 
            [interval]: history 
          }
        },
        technicalData: {
          ...state.technicalData,
          [currentAsset]: {
            ...state.technicalData[currentAsset],
            [interval]: processed
          }
        },
        loading: false
      }));
      
      return processed;
    } catch (err) {
      console.error('Error fetching price history:', err);
      Sentry.captureException(err);
      set({ error: `Failed to fetch price history: ${err.message}`, loading: false });
      return null;
    }
  },
  
  fetchOptionsContext: async () => {
    const { currentAsset } = get();
    
    set({ loading: true, error: null });
    
    try {
      console.log(`Fetching options context for ${currentAsset}`);
      const marketData = getOptionsMarketData(currentAsset);
      const context = getOptionsMarketContext(currentAsset);
      
      set((state) => ({
        optionsContext: {
          ...state.optionsContext,
          [currentAsset]: context
        },
        loading: false
      }));
      
      return context;
    } catch (err) {
      console.error('Error fetching options context:', err);
      Sentry.captureException(err);
      set({ error: `Failed to fetch options context: ${err.message}`, loading: false });
      return null;
    }
  },
  
  loadAllData: async () => {
    try {
      await get().fetchCurrentPrice();
      await get().fetchPriceHistory('minute', 100);
      await get().fetchOptionsContext();
      return true;
    } catch (error) {
      console.error('Error loading all data:', error);
      Sentry.captureException(error);
      return false;
    }
  },
  
  // Get the latest technical data
  getLatestTechnicalData: () => {
    const { currentAsset, technicalData } = get();
    
    if (!technicalData[currentAsset] || !technicalData[currentAsset].minute) {
      return null;
    }
    
    const data = technicalData[currentAsset].minute;
    return data[data.length - 1];
  },
  
  // Get technical indicators for rendering
  getTechnicalIndicators: () => {
    const latestData = get().getLatestTechnicalData();
    
    if (!latestData) {
      return {
        rsi: null,
        macd: null,
        signal: null,
        histogram: null,
        upperBB: null,
        lowerBB: null,
        sma20: null
      };
    }
    
    return {
      rsi: latestData.rsi,
      macd: latestData.macd,
      signal: latestData.macdSignal,
      histogram: latestData.macdHist,
      upperBB: latestData.upperBB,
      lowerBB: latestData.lowerBB,
      sma20: latestData.sma20
    };
  }
}));

export default useMarketStore;