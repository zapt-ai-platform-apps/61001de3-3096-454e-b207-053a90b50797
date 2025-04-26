import { create } from 'zustand';
import { optionsStrategies } from '../constants/strategies';
import useMarketStore from './marketStore';
import { getOptionsMarketContext, getOverallOptionsSentiment, runMonteCarloSimulation } from '../utils/optionsIndicators';
import { getTurtleTrading, getVixStrategy, getPcrStrategy, getTrinStrategy, getMonteCarloStrategy } from '../utils/advancedStrategies';
import * as Sentry from '@sentry/browser';

const useSignalStore = create((set, get) => ({
  signals: {},
  generatedSignals: [],
  historicalSignals: [],
  activeStrategies: optionsStrategies.map(s => s.id), // All strategies active by default
  isScanning: false,
  scanError: null,
  scanAttempts: 0,
  lastScanTime: null,
  
  // Settings
  confidenceThreshold: 75, // Show signals with >75% confidence
  expirationMinutes: 15, // Default expiration time in minutes
  autoRefresh: false,
  
  // Actions
  setActiveStrategies: (strategies) => set({ activeStrategies: strategies }),
  setConfidenceThreshold: (threshold) => set({ confidenceThreshold: threshold }),
  setAutoRefresh: (value) => set({ autoRefresh: value }),
  
  generateSignals: async (forceRefresh = false) => {
    const marketStore = useMarketStore.getState();
    const { currentAsset, priceHistory, optionsContext, technicalData, currentPrice } = marketStore;
    const { activeStrategies, confidenceThreshold, expirationMinutes, scanAttempts } = get();
    
    set({ isScanning: true, scanError: null });
    
    try {
      console.log(`Generating signals for ${currentAsset}`);
      
      // Track scan attempts
      set({ scanAttempts: scanAttempts + 1 });
      
      // Get technical data
      const history = technicalData[currentAsset]?.minute;
      
      if (!history || history.length === 0) {
        throw new Error('No technical data available for signal generation');
      }
      
      // Get options market context
      const options = optionsContext[currentAsset];
      
      if (!options) {
        throw new Error('No options market context available for signal generation');
      }
      
      // Get the latest data point
      const latestData = history[history.length - 1];
      
      // Generate signals from active strategies
      const signals = [];
      const signalTimestamp = new Date();
      const expiryTime = new Date(signalTimestamp.getTime() + expirationMinutes * 60 * 1000);
      
      // Filter active strategies
      const strategies = optionsStrategies.filter(strategy => 
        activeStrategies.includes(strategy.id)
      );
      
      // Process each strategy
      strategies.forEach(strategy => {
        let signal = null;
        
        try {
          // Technical indicator based strategies
          switch (strategy.id) {
            case 'breakout': {
              // Need at least 2 data points
              if (history.length < 2) break;
              
              const latest = latestData;
              const prev = history[history.length - 2];
              
              // Bollinger band breakout
              if (latest.upperBB && latest.lowerBB && prev.upperBB && prev.lowerBB) {
                if (latest.price > latest.upperBB && prev.price <= prev.upperBB) {
                  signal = {
                    strategy: strategy.id,
                    direction: 'BUY_CALL',
                    confidence: 85,
                    entryPrice: latest.price,
                    targetPrice: latest.price * 1.01, // 1% target for 15-min timeframe
                    stopLoss: latest.price * 0.995, // 0.5% stop loss
                    keyDrivers: [
                      'Price broke above upper Bollinger Band',
                      'Potential strong upward momentum',
                      `Target: ${(latest.price * 1.01).toFixed(2)}`
                    ]
                  };
                } else if (latest.price < latest.lowerBB && prev.price >= prev.lowerBB) {
                  signal = {
                    strategy: strategy.id,
                    direction: 'BUY_PUT',
                    confidence: 85,
                    entryPrice: latest.price,
                    targetPrice: latest.price * 0.99, // 1% target for 15-min timeframe
                    stopLoss: latest.price * 1.005, // 0.5% stop loss
                    keyDrivers: [
                      'Price broke below lower Bollinger Band',
                      'Potential strong downward momentum',
                      `Target: ${(latest.price * 0.99).toFixed(2)}`
                    ]
                  };
                }
              }
              break;
            }
            
            case 'rsi-extreme': {
              if (latest.rsi !== undefined) {
                // RSI oversold (bullish)
                if (latest.rsi < 30) {
                  signal = {
                    strategy: strategy.id,
                    direction: 'BUY_CALL',
                    confidence: 80,
                    entryPrice: latest.price,
                    targetPrice: latest.price * 1.01, // 1% target for 15-min timeframe
                    stopLoss: latest.price * 0.995, // 0.5% stop loss
                    keyDrivers: [
                      `Oversold RSI: ${latest.rsi.toFixed(2)}`,
                      'Potential bullish reversal',
                      `Target: ${(latest.price * 1.01).toFixed(2)}`
                    ]
                  };
                } 
                // RSI overbought (bearish)
                else if (latest.rsi > 70) {
                  signal = {
                    strategy: strategy.id,
                    direction: 'BUY_PUT',
                    confidence: 80,
                    entryPrice: latest.price,
                    targetPrice: latest.price * 0.99, // 1% target for 15-min timeframe
                    stopLoss: latest.price * 1.005, // 0.5% stop loss
                    keyDrivers: [
                      `Overbought RSI: ${latest.rsi.toFixed(2)}`,
                      'Potential bearish reversal',
                      `Target: ${(latest.price * 0.99).toFixed(2)}`
                    ]
                  };
                }
              }
              break;
            }
            
            case 'macd-cross': {
              // Need at least 2 data points
              if (history.length < 2) break;
              
              const latest = latestData;
              const prev = history[history.length - 2];
              
              if (latest.macd !== undefined && latest.macdSignal !== undefined && 
                  prev.macd !== undefined && prev.macdSignal !== undefined) {
                
                // Bullish crossover
                if (latest.macd > latest.macdSignal && prev.macd <= prev.macdSignal) {
                  signal = {
                    strategy: strategy.id,
                    direction: 'BUY_CALL',
                    confidence: 75,
                    entryPrice: latest.price,
                    targetPrice: latest.price * 1.01, // 1% target for 15-min timeframe
                    stopLoss: latest.price * 0.995, // 0.5% stop loss
                    keyDrivers: [
                      'MACD crossed above signal line',
                      'Potential bullish momentum shift',
                      `MACD: ${latest.macd.toFixed(4)}, Signal: ${latest.macdSignal.toFixed(4)}`
                    ]
                  };
                } 
                // Bearish crossover
                else if (latest.macd < latest.macdSignal && prev.macd >= prev.macdSignal) {
                  signal = {
                    strategy: strategy.id,
                    direction: 'BUY_PUT',
                    confidence: 75,
                    entryPrice: latest.price,
                    targetPrice: latest.price * 0.99, // 1% target for 15-min timeframe
                    stopLoss: latest.price * 1.005, // 0.5% stop loss
                    keyDrivers: [
                      'MACD crossed below signal line',
                      'Potential bearish momentum shift',
                      `MACD: ${latest.macd.toFixed(4)}, Signal: ${latest.macdSignal.toFixed(4)}`
                    ]
                  };
                }
              }
              break;
            }
            
            // Volatility-based strategies
            case 'iv-rank-high': {
              if (options.iv && options.iv.percentile > 80) {
                signal = {
                  strategy: strategy.id,
                  direction: 'SELL_OPTIONS',
                  confidence: 85,
                  entryPrice: latest.price,
                  targetPrice: 'Time decay profit',
                  stopLoss: 'Define risk with spreads',
                  keyDrivers: [
                    `High IV Percentile: ${options.iv.percentile}%`,
                    'Options premiums are expensive',
                    'Recommend: Iron Condor or Credit Spread'
                  ]
                };
              }
              break;
            }
            
            case 'iv-rank-low': {
              if (options.iv && options.iv.percentile < 20) {
                signal = {
                  strategy: strategy.id,
                  direction: 'BUY_OPTIONS',
                  confidence: 80,
                  entryPrice: latest.price,
                  targetPrice: 'Volatility expansion profit',
                  stopLoss: 'Limited to premium paid',
                  keyDrivers: [
                    `Low IV Percentile: ${options.iv.percentile}%`,
                    'Options premiums are cheap',
                    'Recommend: Straddle or Strangle'
                  ]
                };
              }
              break;
            }
            
            // Requested specific strategies
            case 'turtle-trading': {
              const turtleResult = getTurtleTrading(history, 20);
              if (turtleResult && turtleResult.signal) {
                signal = {
                  ...turtleResult.signal,
                  entryPrice: latest.price,
                };
              }
              break;
            }
            
            case 'vix-strategy': {
              const vixResult = getVixStrategy(options.vix);
              if (vixResult && vixResult.signal) {
                signal = {
                  ...vixResult.signal,
                  entryPrice: latest.price,
                };
              }
              break;
            }
            
            case 'pcr-strategy': {
              const pcrResult = getPcrStrategy(options.pcr);
              if (pcrResult && pcrResult.signal) {
                signal = {
                  ...pcrResult.signal,
                  entryPrice: latest.price,
                };
              }
              break;
            }
            
            case 'trin-strategy': {
              const trinResult = getTrinStrategy(options.trin);
              if (trinResult && trinResult.signal) {
                signal = {
                  ...trinResult.signal,
                  entryPrice: latest.price,
                };
              }
              break;
            }
            
            case 'monte-carlo': {
              if (options.iv && options.iv.value) {
                const mcResult = getMonteCarloStrategy(latest.price, options.iv, expirationMinutes);
                if (mcResult && mcResult.signal) {
                  signal = {
                    ...mcResult.signal,
                    entryPrice: latest.price,
                  };
                }
              }
              break;
            }
            
            // Add more strategy implementations as needed
          }
        } catch (strategyError) {
          console.error(`Error in strategy ${strategy.id}:`, strategyError);
          Sentry.captureException(strategyError);
          // Continue with other strategies
        }
        
        // Add signal to list if it passed confidence threshold
        if (signal && signal.confidence >= confidenceThreshold) {
          signals.push({
            id: `${strategy.id}-${signalTimestamp.getTime()}`,
            asset: currentAsset,
            timestamp: signalTimestamp,
            expiryTime,
            ...signal,
            
            // Add options context
            optionsContext: {
              iv: options.iv.value,
              ivPercentile: options.iv.percentile,
              pcr: options.pcr.value,
              vix: options.vix.value,
              trin: options.trin?.value
            }
          });
        }
      });
      
      // Run Monte Carlo simulation for probability info
      let probabilityInfo = null;
      try {
        if (options.iv && options.iv.value) {
          const expiryMs = expirationMinutes * 60 * 1000;
          const simulation = runMonteCarloSimulation(latestData.price, options.iv.value, expiryMs, 1000);
          probabilityInfo = {
            probabilityUp: simulation.probabilityAbove,
            probabilityDown: simulation.probabilityBelow,
            potentialHigh: simulation.percentiles.p90,
            potentialLow: simulation.percentiles.p10,
            expectedPrice: simulation.percentiles.p50
          };
        }
      } catch (mcError) {
        console.error('Error running Monte Carlo simulation:', mcError);
        Sentry.captureException(mcError);
      }
      
      // Update store
      const generatedSignals = [...signals];
      
      // Move old signals to history when generating new ones
      const oldSignals = get().generatedSignals;
      const historicalSignals = [...get().historicalSignals];
      
      if (oldSignals.length > 0) {
        // Only add to history if we're generating new signals
        // Don't add signals twice
        const oldIds = new Set(historicalSignals.map(s => s.id));
        const newHistorical = oldSignals.filter(s => !oldIds.has(s.id));
        
        if (newHistorical.length > 0) {
          historicalSignals.push(...newHistorical);
          // Keep history to a reasonable size
          while (historicalSignals.length > 50) {
            historicalSignals.shift();
          }
        }
      }
      
      set({ 
        generatedSignals,
        historicalSignals,
        isScanning: false,
        lastScanTime: new Date(),
        signals: {
          ...get().signals,
          [currentAsset]: {
            signals: generatedSignals,
            timestamp: signalTimestamp,
            probabilityInfo
          }
        }
      });
      
      return generatedSignals;
    } catch (err) {
      console.error('Error generating signals:', err);
      Sentry.captureException(err);
      
      let errorMessage = `Failed to generate signals: ${err.message}`;
      if (scanAttempts > 3) {
        errorMessage += " - Please try again later or check your connection.";
      }
      
      set({ 
        scanError: errorMessage, 
        isScanning: false,
        lastScanTime: new Date()
      });
      
      return [];
    }
  }
}));

export default useSignalStore;