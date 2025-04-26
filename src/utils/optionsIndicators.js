import { getOptionsMarketData } from '../api/marketData';

// Calculate and interpret options-specific indicators
export function getOptionsMarketContext(assetPair) {
  // Get options market data (implied volatility, put/call ratio, etc.)
  const optionsData = getOptionsMarketData(assetPair);
  
  // Add interpretations and signals
  return {
    ...optionsData,
    signals: generateOptionsSignals(optionsData, assetPair)
  };
}

// Generate trading signals based on options data
function generateOptionsSignals(data, assetPair) {
  const signals = [];
  
  // 1. IV Percentile based signals
  if (data.iv.percentile > 80) {
    signals.push({
      type: 'volatility',
      direction: 'SELL_PREMIUM',
      strength: 'strong',
      description: 'IV is in the top 20% of its range - options are expensive. Consider selling premium (credit spreads or iron condors).',
      confidence: 85
    });
  } else if (data.iv.percentile < 20) {
    signals.push({
      type: 'volatility',
      direction: 'BUY_PREMIUM',
      strength: 'strong',
      description: 'IV is in the bottom 20% of its range - options are cheap. Consider buying premium (straddles or strangles).',
      confidence: 85
    });
  }
  
  // 2. Put/Call Ratio signals (contrarian indicator)
  if (data.pcr.value > 1.2) {
    signals.push({
      type: 'sentiment',
      direction: 'BULLISH',
      strength: 'moderate',
      description: 'High put/call ratio indicates excessive bearish positioning. Consider a contrarian bullish position.',
      confidence: 75
    });
  } else if (data.pcr.value < 0.7) {
    signals.push({
      type: 'sentiment',
      direction: 'BEARISH',
      strength: 'moderate',
      description: 'Low put/call ratio indicates excessive bullish positioning. Consider a contrarian bearish position.',
      confidence: 75
    });
  }
  
  // 3. VIX signals
  if (data.vix.value > 30) {
    signals.push({
      type: 'volatility',
      direction: 'BULLISH',
      strength: 'moderate',
      description: 'Elevated VIX indicates high fear levels. Consider contrarian bullish strategies or selling volatility.',
      confidence: 70
    });
  } else if (data.vix.value < 15) {
    signals.push({
      type: 'volatility',
      direction: 'BEARISH',
      strength: 'weak',
      description: 'Low VIX indicates complacency. Consider purchasing protection or bearish strategies.',
      confidence: 65
    });
  }
  
  // 4. TRIN (Arms Index) signals
  if (data.trin.value > 1.2) {
    signals.push({
      type: 'breadth',
      direction: 'BULLISH',
      strength: 'moderate',
      description: 'Elevated TRIN indicates oversold conditions. Consider bullish strategies.',
      confidence: 70
    });
  } else if (data.trin.value < 0.8) {
    signals.push({
      type: 'breadth',
      direction: 'BEARISH',
      strength: 'moderate',
      description: 'Low TRIN indicates overbought conditions. Consider bearish strategies.',
      confidence: 70
    });
  }
  
  // 5. IV Skew signals
  if (data.skew.value < -0.1) {
    signals.push({
      type: 'volatility',
      direction: 'BEARISH',
      strength: 'moderate',
      description: 'Negative volatility skew indicates put demand exceeding calls. Market is hedging downside.',
      confidence: 70
    });
  } else if (data.skew.value > 0.1) {
    signals.push({
      type: 'volatility',
      direction: 'BULLISH',
      strength: 'moderate',
      description: 'Positive volatility skew is unusual and indicates call demand exceeding puts.',
      confidence: 70
    });
  }
  
  // 6. IV Term Structure signals
  if (data.iv.term_structure < -0.05) {
    signals.push({
      type: 'volatility',
      direction: 'BEARISH',
      strength: 'strong',
      description: 'Inverted IV term structure (short-term IV > long-term IV) indicates significant near-term uncertainty.',
      confidence: 80
    });
  } else if (data.iv.term_structure > 0.05) {
    signals.push({
      type: 'volatility',
      direction: 'BULLISH',
      strength: 'moderate',
      description: 'Steep IV term structure indicates normal market conditions with higher longer-term uncertainty.',
      confidence: 70
    });
  }
  
  // 7. Asset-specific strategies
  if (assetPair === 'BTC/USD') {
    // Bitcoin-specific signals
    if (data.iv.percentile > 85) {
      signals.push({
        type: 'crypto',
        direction: 'IRON_CONDOR',
        strength: 'strong',
        description: 'Extremely high IV in Bitcoin options. Iron condors can be very profitable.',
        confidence: 85
      });
    }
  } else if (assetPair === 'EUR/USD') {
    // Forex-specific signals
    if (data.iv.percentile < 15) {
      signals.push({
        type: 'forex',
        direction: 'STRADDLE',
        strength: 'strong',
        description: 'Unusually low forex volatility. Straddles positioned before economic announcements can be profitable.',
        confidence: 80
      });
    }
  } else if (assetPair === 'XAU/USD') {
    // Gold-specific signals
    if (data.vix.value > 25 && data.iv.percentile < 50) {
      signals.push({
        type: 'commodity',
        direction: 'BULLISH',
        strength: 'strong',
        description: 'High VIX but moderate gold IV suggests gold may function as a safe haven. Consider calls.',
        confidence: 80
      });
    }
  }
  
  return signals;
}

// Interpret the overall options sentiment
export function getOverallOptionsSentiment(optionsData) {
  if (!optionsData) return { sentiment: 'neutral', strength: 'weak' };
  
  // Count bullish and bearish factors
  let bullishFactors = 0;
  let bearishFactors = 0;
  
  // Analyze IV percentile
  const ivPercentile = optionsData.iv?.percentile || 50;
  const ivStatus = ivPercentile > 80 ? 'high' : ivPercentile < 20 ? 'low' : 'normal';
  
  // Analyze PCR
  const pcr = optionsData.pcr?.value || 1;
  const pcrStatus = pcr > 1.2 ? 'high' : pcr < 0.7 ? 'low' : 'normal';
  
  // Analyze VIX
  const vix = optionsData.vix?.value || 20;
  const vixStatus = vix > 30 ? 'high' : vix < 15 ? 'low' : 'normal';
  
  // Analyze TRIN
  const trin = optionsData.trin?.value || 1;
  const trinStatus = trin > 1.2 ? 'high' : trin < 0.8 ? 'low' : 'normal';
  
  // Analyze skew
  const skew = optionsData.skew?.value || 0;
  const skewStatus = skew < -0.1 ? 'high' : skew > 0.1 ? 'low' : 'normal';
  
  // Count bullish factors
  if (ivStatus === 'low') bullishFactors++;
  if (pcrStatus === 'high') bullishFactors++; // High PCR is contrarian bullish
  if (vixStatus === 'high') bullishFactors++; // High VIX is contrarian bullish
  if (trinStatus === 'high') bullishFactors++; // High TRIN is contrarian bullish
  if (skewStatus === 'low') bullishFactors++;
  
  // Count bearish factors
  if (ivStatus === 'high') bearishFactors++;
  if (pcrStatus === 'low') bearishFactors++; // Low PCR is contrarian bearish
  if (vixStatus === 'low') bearishFactors++; // Low VIX suggests complacency
  if (trinStatus === 'low') bearishFactors++; // Low TRIN suggests overbought
  if (skewStatus === 'high') bearishFactors++;
  
  // Determine overall sentiment
  if (bullishFactors > bearishFactors + 1) {
    const strength = bullishFactors - bearishFactors >= 3 ? 'strong' : 'moderate';
    return { sentiment: 'bullish', strength, bullishFactors, bearishFactors };
  } else if (bearishFactors > bullishFactors + 1) {
    const strength = bearishFactors - bullishFactors >= 3 ? 'strong' : 'moderate';
    return { sentiment: 'bearish', strength, bullishFactors, bearishFactors };
  } else {
    return { sentiment: 'neutral', strength: 'weak', bullishFactors, bearishFactors };
  }
}

// Monte Carlo simulation for price probability analysis
export function runMonteCarloSimulation(currentPrice, iv, timeToExpiry, numSimulations = 10000, seed = null) {
  // Convert IV to daily volatility
  const annualToDaily = 1 / Math.sqrt(365);
  const dailyVol = iv * annualToDaily;
  
  // Convert time to expiry to days
  const daysToExpiry = timeToExpiry / (24 * 60 * 60 * 1000);
  
  // Seeded random function for reproducible simulations
  const getSeededRandom = () => {
    if (!seed) return Math.random();
    
    // Simple seeded random function
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  const endPrices = [];
  
  for (let i = 0; i < numSimulations; i++) {
    let price = currentPrice;
    
    // Simulate price path
    for (let day = 0; day < daysToExpiry; day++) {
      // Generate random return from normal distribution using Box-Muller transform
      const u1 = getSeededRandom();
      const u2 = getSeededRandom();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      
      // Calculate daily return
      const dailyReturn = Math.exp((0 - (dailyVol * dailyVol) / 2) + dailyVol * z);
      
      // Update price
      price *= dailyReturn;
    }
    
    endPrices.push(price);
  }
  
  // Calculate probability of price being above current price at expiry
  const probabilityAbove = endPrices.filter(price => price > currentPrice).length / numSimulations;
  
  // Calculate percentiles
  endPrices.sort((a, b) => a - b);
  const getPercentile = (percentile) => {
    const index = Math.floor(percentile / 100 * numSimulations);
    return endPrices[index];
  };
  
  return {
    probabilityAbove,
    probabilityBelow: 1 - probabilityAbove,
    percentiles: {
      p10: getPercentile(10),
      p25: getPercentile(25),
      p50: getPercentile(50), // median
      p75: getPercentile(75),
      p90: getPercentile(90)
    }
  };
}