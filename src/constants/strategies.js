// Options trading strategies for the signal engine
export const optionsStrategies = [
  // Directional Strategies
  {
    id: 'breakout',
    name: 'Breakout Strategy',
    description: 'Buy calls/puts when price breaks out of a consolidation pattern with increased volume.',
    type: 'directional',
    strength: 'trending',
    timeframe: 'short',
    indicators: ['bollinger', 'volume', 'atr'],
    signalType: 'directional'
  },
  {
    id: 'ma-crossover',
    name: 'Moving Average Crossover',
    description: 'Buy calls when fast MA crosses above slow MA, buy puts when fast MA crosses below slow MA.',
    type: 'directional',
    strength: 'trending',
    timeframe: 'medium',
    indicators: ['sma', 'ema'],
    signalType: 'directional'
  },
  {
    id: 'rsi-extreme',
    name: 'RSI Extremes',
    description: 'Buy calls when RSI is oversold (<30), buy puts when RSI is overbought (>70).',
    type: 'directional',
    strength: 'reversal',
    timeframe: 'short',
    indicators: ['rsi'],
    signalType: 'directional'
  },
  {
    id: 'macd-cross',
    name: 'MACD Signal Line Cross',
    description: 'Buy calls when MACD line crosses above signal line, buy puts when crossing below.',
    type: 'directional',
    strength: 'trending',
    timeframe: 'medium',
    indicators: ['macd'],
    signalType: 'directional'
  },
  {
    id: 'bollinger-bounce',
    name: 'Bollinger Band Bounce',
    description: 'Buy calls when price touches lower band with positive momentum, buy puts when price touches upper band with negative momentum.',
    type: 'directional',
    strength: 'reversal',
    timeframe: 'short',
    indicators: ['bollinger', 'rsi'],
    signalType: 'directional'
  },
  
  // Volatility-Based Strategies
  {
    id: 'iv-rank-high',
    name: 'High IV Rank Strategy',
    description: 'Sell options premium (iron condors, credit spreads) when IV rank is high (>80%).',
    type: 'volatility',
    strength: 'mean-reversion',
    timeframe: 'medium',
    indicators: ['iv-percentile', 'bollinger-width'],
    signalType: 'volatility'
  },
  {
    id: 'iv-rank-low',
    name: 'Low IV Rank Strategy',
    description: 'Buy options (straddles, strangles) when IV rank is low (<20%).',
    type: 'volatility',
    strength: 'volatility-expansion',
    timeframe: 'medium',
    indicators: ['iv-percentile', 'bollinger-width'],
    signalType: 'volatility'
  },
  {
    id: 'vix-extreme',
    name: 'VIX Extremes Strategy',
    description: 'Buy calls when VIX is extremely high, buy puts when VIX is extremely low (contrarian).',
    type: 'volatility',
    strength: 'mean-reversion',
    timeframe: 'short',
    indicators: ['vix'],
    signalType: 'volatility'
  },
  {
    id: 'vol-divergence',
    name: 'Volatility Divergence',
    description: 'When price makes new highs/lows but IV falls, it suggests potential reversal.',
    type: 'volatility',
    strength: 'reversal',
    timeframe: 'short',
    indicators: ['iv-percentile', 'price'],
    signalType: 'volatility'
  },
  
  // Options-Specific Strategies
  {
    id: 'pcr-extreme',
    name: 'Put/Call Ratio Extreme',
    description: 'Buy calls when PCR is extremely high (>1.5), buy puts when PCR is extremely low (<0.5).',
    type: 'sentiment',
    strength: 'contrarian',
    timeframe: 'short',
    indicators: ['pcr'],
    signalType: 'directional'
  },
  {
    id: 'skew-analysis',
    name: 'Volatility Skew Analysis',
    description: 'Buy calls when put skew is extreme, buy puts when call skew is extreme.',
    type: 'volatility',
    strength: 'contrarian',
    timeframe: 'medium',
    indicators: ['iv-skew'],
    signalType: 'directional'
  },
  
  // Hybrid Strategies
  {
    id: 'vix-term-structure',
    name: 'VIX Term Structure Strategy',
    description: 'Analysis of short-term vs. long-term volatility expectations.',
    type: 'volatility',
    strength: 'term-structure',
    timeframe: 'medium',
    indicators: ['vix', 'iv-curve'],
    signalType: 'volatility'
  },
  {
    id: 'trend-plus-momentum',
    name: 'Trend + Momentum',
    description: 'Combine trend direction (MA) with momentum confirmation (RSI or MACD).',
    type: 'directional',
    strength: 'trending',
    timeframe: 'medium',
    indicators: ['sma', 'rsi', 'macd'],
    signalType: 'directional'
  },
  
  // Requested Strategies
  {
    id: 'turtle-trading',
    name: 'Turtle Trading',
    description: 'Buy calls on breakouts above 20-day high, buy puts on breakouts below 20-day low.',
    type: 'directional',
    strength: 'trending',
    timeframe: 'medium',
    indicators: ['price-channel'],
    signalType: 'directional'
  },
  {
    id: 'monte-carlo',
    name: 'Monte Carlo Option Pricing',
    description: 'Use Monte Carlo price simulations to estimate probability of price hitting targets.',
    type: 'probability',
    strength: 'statistical',
    timeframe: 'short',
    indicators: ['price', 'volatility'],
    signalType: 'hybrid'
  },
  {
    id: 'trin-strategy',
    name: 'Trading Index (TRIN) Strategy',
    description: 'Buy calls when TRIN is extremely high (>1.5), buy puts when TRIN is extremely low (<0.5).',
    type: 'breadth',
    strength: 'contrarian',
    timeframe: 'short',
    indicators: ['trin'],
    signalType: 'directional'
  },
  {
    id: 'vix-strategy',
    name: 'VIX-Based Strategy',
    description: 'Use VIX levels and changes to determine market direction and volatility expectations.',
    type: 'volatility',
    strength: 'contrarian',
    timeframe: 'short',
    indicators: ['vix'],
    signalType: 'directional'
  },
  {
    id: 'pcr-strategy',
    name: 'Put/Call Ratio Strategy',
    description: 'Analyze options market sentiment through put/call volume ratios.',
    type: 'sentiment',
    strength: 'contrarian',
    timeframe: 'short',
    indicators: ['pcr'],
    signalType: 'directional'
  },
  
  // Additional strategies to reach 50+
  {
    id: 'mean-reversion',
    name: 'Mean Reversion',
    description: 'Buy calls/puts when price deviates significantly from moving average, expecting return to mean.',
    type: 'directional',
    strength: 'mean-reversion',
    timeframe: 'short',
    indicators: ['sma', 'bollinger'],
    signalType: 'directional'
  },
  {
    id: 'triple-ma',
    name: 'Triple Moving Average',
    description: 'Use 3 MAs (fast, medium, slow) to confirm trend direction and strength.',
    type: 'directional',
    strength: 'trending',
    timeframe: 'medium',
    indicators: ['sma'],
    signalType: 'directional'
  },
  {
    id: 'volume-breakout',
    name: 'Volume Breakout',
    description: 'Look for price breakouts accompanied by significant increase in volume.',
    type: 'directional',
    strength: 'trending',
    timeframe: 'short',
    indicators: ['volume', 'price'],
    signalType: 'directional'
  },
  {
    id: 'momentum-divergence',
    name: 'Momentum Divergence',
    description: 'Look for divergence between price and momentum indicators (RSI, MACD).',
    type: 'directional',
    strength: 'reversal',
    timeframe: 'medium',
    indicators: ['rsi', 'macd', 'price'],
    signalType: 'directional'
  },
  
  // Adding more strategies to reach 50+
  {
    id: 'fibonacci-retracement',
    name: 'Fibonacci Retracement',
    description: 'Use Fibonacci levels for potential support/resistance targets.',
    type: 'directional',
    strength: 'reversal',
    timeframe: 'medium',
    indicators: ['fibonacci'],
    signalType: 'directional'
  },
  {
    id: 'ichimoku-cloud',
    name: 'Ichimoku Cloud',
    description: 'Multi-faceted indicator providing support/resistance, trend direction, and momentum.',
    type: 'directional',
    strength: 'trending',
    timeframe: 'medium',
    indicators: ['ichimoku'],
    signalType: 'directional'
  },
  {
    id: 'volatility-breakout',
    name: 'Volatility Breakout',
    description: 'Buy straddles/strangles when volatility breaks out of a low-volatility period.',
    type: 'volatility',
    strength: 'volatility-expansion',
    timeframe: 'short',
    indicators: ['bollinger-width', 'atr'],
    signalType: 'volatility'
  },
  {
    id: 'pre-earnings',
    name: 'Pre-Earnings Volatility Play',
    description: 'Buy straddles/strangles before earnings announcements when volatility is expected to increase.',
    type: 'volatility',
    strength: 'volatility-expansion',
    timeframe: 'short',
    indicators: ['iv-percentile', 'calendar'],
    signalType: 'volatility'
  },
  {
    id: 'volatility-crush',
    name: 'Volatility Crush Strategy',
    description: 'Sell options premium before expected volatility decrease (post-news, post-earnings).',
    type: 'volatility',
    strength: 'volatility-contraction',
    timeframe: 'short',
    indicators: ['iv-percentile', 'calendar'],
    signalType: 'volatility'
  },
  {
    id: 'carry-trade',
    name: 'Interest Rate Differential',
    description: 'For forex pairs, exploit interest rate differentials between currencies.',
    type: 'directional',
    strength: 'fundamental',
    timeframe: 'long',
    indicators: ['interest-rates'],
    signalType: 'directional'
  },
  {
    id: 'inflation-hedge',
    name: 'Inflation Hedge',
    description: 'Buy gold calls when inflation expectations rise, puts when they fall.',
    type: 'fundamental',
    strength: 'macro',
    timeframe: 'medium',
    indicators: ['inflation-data', 'price'],
    signalType: 'directional'
  },
  {
    id: 'dollar-correlation',
    name: 'Dollar Correlation',
    description: 'Gold tends to move inversely to the US Dollar. Buy gold calls when USD weakens.',
    type: 'correlation',
    strength: 'macro',
    timeframe: 'medium',
    indicators: ['dollar-index', 'price'],
    signalType: 'directional'
  }
  
  // Additional strategies would be defined here to reach 50+
];