// Advanced options trading strategies based on various indicators
import { runMonteCarloSimulation } from './optionsIndicators';

export function getTurtleTrading(data, period = 20) {
  // Last 'period' candles of data
  const recentData = data.slice(-period);
  
  // Calculate highest high and lowest low of the period
  const highest = Math.max(...recentData.map(candle => candle.high || candle.price));
  const lowest = Math.min(...recentData.map(candle => candle.low || candle.price));
  
  // Get latest price and calculate distance to breakouts
  const latestPrice = data[data.length - 1].price;
  const percentToHighest = ((highest - latestPrice) / latestPrice) * 100;
  const percentToLowest = ((latestPrice - lowest) / latestPrice) * 100;
  
  // Generate signals based on price relation to highest/lowest
  const distanceThreshold = 0.25; // Within 0.25% of breakout level
  let signal = null;
  
  if (percentToHighest <= distanceThreshold) {
    signal = {
      strategy: 'turtle-trading',
      direction: 'BUY_CALL',
      confidence: 80,
      description: `Price near ${period}-period high (${percentToHighest.toFixed(2)}% away). Potential upside breakout.`,
      targetPrice: highest * 1.01, // 1% above breakout
      stopLoss: highest * 0.985 // 1.5% below breakout
    };
  } else if (percentToLowest <= distanceThreshold) {
    signal = {
      strategy: 'turtle-trading',
      direction: 'BUY_PUT',
      confidence: 80,
      description: `Price near ${period}-period low (${percentToLowest.toFixed(2)}% away). Potential downside breakout.`,
      targetPrice: lowest * 0.99, // 1% below breakout
      stopLoss: lowest * 1.015 // 1.5% above breakout
    };
  }
  
  return {
    highest,
    lowest,
    percentToHighest,
    percentToLowest,
    signal
  };
}

export function getVixStrategy(vixData) {
  if (!vixData || !vixData.value) return { signal: null };
  
  const vixValue = vixData.value;
  const vixStatus = vixData.status;
  
  let signal = null;
  
  // VIX-based strategies
  if (vixStatus === 'high' && vixValue > 30) {
    signal = {
      strategy: 'vix-extreme',
      direction: 'BUY_CALL',
      confidence: 75,
      description: `VIX at extreme high (${vixValue.toFixed(1)}). Consider contrarian bullish position or selling puts for premium.`,
      bestStrategy: 'SELL_PUT'
    };
  } else if (vixStatus === 'low' && vixValue < 15) {
    signal = {
      strategy: 'vix-extreme',
      direction: 'BUY_PUT',
      confidence: 70,
      description: `VIX at extreme low (${vixValue.toFixed(1)}). Consider purchasing protection or bearish position.`,
      bestStrategy: 'BUY_PUT'
    };
  }
  
  return {
    vixValue,
    vixStatus,
    signal
  };
}

export function getPcrStrategy(pcrData) {
  if (!pcrData || !pcrData.value) return { signal: null };
  
  const pcrValue = pcrData.value;
  const pcrStatus = pcrData.status;
  
  let signal = null;
  
  // Put/Call Ratio strategies
  if (pcrStatus === 'high' && pcrValue > 1.2) {
    signal = {
      strategy: 'pcr-extreme',
      direction: 'BUY_CALL',
      confidence: 80,
      description: `Put/Call Ratio at extreme high (${pcrValue.toFixed(2)}). Excessive puts suggest contrarian bullish opportunity.`,
      bestStrategy: 'BUY_CALL'
    };
  } else if (pcrStatus === 'low' && pcrValue < 0.7) {
    signal = {
      strategy: 'pcr-extreme',
      direction: 'BUY_PUT',
      confidence: 80,
      description: `Put/Call Ratio at extreme low (${pcrValue.toFixed(2)}). Excessive calls suggest contrarian bearish opportunity.`,
      bestStrategy: 'BUY_PUT'
    };
  }
  
  return {
    pcrValue,
    pcrStatus,
    signal
  };
}

export function getTrinStrategy(trinData) {
  if (!trinData || !trinData.value) return { signal: null };
  
  const trinValue = trinData.value;
  const trinStatus = trinData.status;
  
  let signal = null;
  
  // TRIN (Arms Index) strategies
  if (trinStatus === 'high' && trinValue > 1.5) {
    signal = {
      strategy: 'trin-extreme',
      direction: 'BUY_CALL',
      confidence: 75,
      description: `TRIN at extreme high (${trinValue.toFixed(2)}). Market breadth indicates oversold conditions.`,
      bestStrategy: 'BUY_CALL'
    };
  } else if (trinStatus === 'low' && trinValue < 0.5) {
    signal = {
      strategy: 'trin-extreme',
      direction: 'BUY_PUT',
      confidence: 75,
      description: `TRIN at extreme low (${trinValue.toFixed(2)}). Market breadth indicates overbought conditions.`,
      bestStrategy: 'BUY_PUT'
    };
  }
  
  return {
    trinValue,
    trinStatus,
    signal
  };
}

export function getMonteCarloStrategy(currentPrice, ivData, minutesToExpiry = 15) {
  if (!ivData || !ivData.value) return { signal: null };
  
  const ivValue = ivData.value;
  
  // Run Monte Carlo simulation
  const msToExpiry = minutesToExpiry * 60 * 1000;
  const simulation = runMonteCarloSimulation(currentPrice, ivValue, msToExpiry, 1000, Date.now());
  
  let signal = null;
  const strongBias = 0.65; // 65% probability threshold for strong bias
  
  if (simulation.probabilityAbove > strongBias) {
    signal = {
      strategy: 'monte-carlo',
      direction: 'BUY_CALL',
      confidence: Math.round(simulation.probabilityAbove * 100),
      description: `Monte Carlo simulation shows ${(simulation.probabilityAbove * 100).toFixed(1)}% probability of price increase within ${minutesToExpiry} minutes.`,
      targetPrice: simulation.percentiles.p75,
      stopLoss: simulation.percentiles.p25,
      bestStrategy: 'BUY_CALL'
    };
  } else if (simulation.probabilityBelow > strongBias) {
    signal = {
      strategy: 'monte-carlo',
      direction: 'BUY_PUT',
      confidence: Math.round(simulation.probabilityBelow * 100),
      description: `Monte Carlo simulation shows ${(simulation.probabilityBelow * 100).toFixed(1)}% probability of price decrease within ${minutesToExpiry} minutes.`,
      targetPrice: simulation.percentiles.p25,
      stopLoss: simulation.percentiles.p75,
      bestStrategy: 'BUY_PUT'
    };
  }
  
  return {
    probabilityAbove: simulation.probabilityAbove,
    probabilityBelow: simulation.probabilityBelow,
    percentiles: simulation.percentiles,
    signal
  };
}