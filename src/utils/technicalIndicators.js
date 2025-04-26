// Process data to add technical indicators
export function processTechnicalData(data) {
  if (!data || data.length === 0) return [];

  // Create a copy of the data to avoid modifying the original
  const result = JSON.parse(JSON.stringify(data));

  // Calculate SMA values
  calculateSMA(result, 5, 'price');
  calculateSMA(result, 20, 'price');
  calculateSMA(result, 50, 'price');

  // Calculate EMA values
  calculateEMA(result, 12, 'price');
  calculateEMA(result, 26, 'price');

  // Calculate RSI
  calculateRSI(result, 14, 'price');

  // Calculate MACD
  calculateMACD(result);

  // Calculate Bollinger Bands
  calculateBollingerBands(result);

  // Calculate ATR
  calculateATR(result);

  return result;
}

// Simple Moving Average
export function calculateSMA(data, period = 14, field = 'close') {
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      data[i][`sma${period}`] = null;
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      const value = data[i - j][field];
      if (value !== undefined && value !== null) {
        sum += value;
      }
    }

    data[i][`sma${period}`] = sum / period;
  }

  return data;
}

// Exponential Moving Average
export function calculateEMA(data, period = 14, field = 'close') {
  const k = 2 / (period + 1);

  // Initialize EMA with SMA for the first period
  let sum = 0;
  for (let i = 0; i < period; i++) {
    if (i >= data.length) break;
    const value = data[i][field];
    if (value !== undefined && value !== null) {
      sum += value;
    }
  }

  let ema = sum / period;
  data[period - 1][`ema${period}`] = ema;

  // Calculate EMA for remaining periods
  for (let i = period; i < data.length; i++) {
    const value = data[i][field];
    if (value !== undefined && value !== null) {
      ema = (value - ema) * k + ema;
      data[i][`ema${period}`] = ema;
    } else {
      data[i][`ema${period}`] = null;
    }
  }

  return data;
}

// Relative Strength Index
export function calculateRSI(data, period = 14, field = 'close') {
  if (data.length <= period) {
    // Not enough data for RSI calculation
    for (let i = 0; i < data.length; i++) {
      data[i].rsi = null;
    }
    return data;
  }

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const currentValue = data[i][field];
    const prevValue = data[i - 1][field];
    
    if (currentValue !== undefined && currentValue !== null && 
        prevValue !== undefined && prevValue !== null) {
      data[i].change = currentValue - prevValue;
    } else {
      data[i].change = 0;
    }
  }

  // Calculate gains and losses
  for (let i = 1; i < data.length; i++) {
    data[i].gain = data[i].change > 0 ? data[i].change : 0;
    data[i].loss = data[i].change < 0 ? -data[i].change : 0;
  }

  // Calculate average gains and losses
  let avgGain = 0;
  let avgLoss = 0;

  // First average is a simple average
  for (let i = 1; i <= period; i++) {
    avgGain += data[i].gain;
    avgLoss += data[i].loss;
  }
  avgGain /= period;
  avgLoss /= period;

  // Set RSI for the first data point with enough history
  data[period].avgGain = avgGain;
  data[period].avgLoss = avgLoss;
  data[period].rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
  data[period].rsi = 100 - (100 / (1 + data[period].rs));

  // Calculate smoothed averages for remaining periods
  for (let i = period + 1; i < data.length; i++) {
    avgGain = ((data[i - 1].avgGain * (period - 1)) + data[i].gain) / period;
    avgLoss = ((data[i - 1].avgLoss * (period - 1)) + data[i].loss) / period;

    data[i].avgGain = avgGain;
    data[i].avgLoss = avgLoss;
    data[i].rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
    data[i].rsi = 100 - (100 / (1 + data[i].rs));
  }

  return data;
}

// Moving Average Convergence Divergence
export function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  // Calculate EMAs
  calculateEMA(data, fastPeriod, 'price');
  calculateEMA(data, slowPeriod, 'price');

  // Calculate MACD line (fast EMA - slow EMA)
  for (let i = 0; i < data.length; i++) {
    if (data[i][`ema${fastPeriod}`] !== null && data[i][`ema${slowPeriod}`] !== null) {
      data[i].macd = data[i][`ema${fastPeriod}`] - data[i][`ema${slowPeriod}`];
    } else {
      data[i].macd = null;
    }
  }

  // Calculate signal line (EMA of MACD)
  const macdLine = data.map(d => ({ price: d.macd }));
  calculateEMA(macdLine, signalPeriod, 'price');

  // Copy signal line values back to original data
  for (let i = 0; i < data.length; i++) {
    data[i].macdSignal = macdLine[i][`ema${signalPeriod}`];
    
    // Calculate histogram
    if (data[i].macd !== null && data[i].macdSignal !== null) {
      data[i].macdHist = data[i].macd - data[i].macdSignal;
    } else {
      data[i].macdHist = null;
    }
  }

  return data;
}

// Bollinger Bands
export function calculateBollingerBands(data, period = 20, stdDevMultiplier = 2) {
  // Calculate middle band (SMA)
  calculateSMA(data, period, 'price');

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      data[i].upperBB = null;
      data[i].lowerBB = null;
      continue;
    }

    const ma20 = data[i][`sma${period}`];
    
    if (ma20 !== null && ma20 !== undefined) {
      // Calculate standard deviation
      let sumSquaredDeviations = 0;
      for (let j = 0; j < period; j++) {
        if (i - j >= 0 && data[i - j].price !== null && data[i - j].price !== undefined) {
          sumSquaredDeviations += Math.pow(data[i - j].price - ma20, 2);
        }
      }
      const stdDev = Math.sqrt(sumSquaredDeviations / period);

      data[i].upperBB = ma20 + (stdDevMultiplier * stdDev);
      data[i].lowerBB = ma20 - (stdDevMultiplier * stdDev);
      data[i].bbWidth = (data[i].upperBB - data[i].lowerBB) / ma20; // Normalized width
    } else {
      data[i].upperBB = null;
      data[i].lowerBB = null;
      data[i].bbWidth = null;
    }
  }

  return data;
}

// Average True Range
export function calculateATR(data, period = 14) {
  if (data.length < 2) return data;

  // Calculate True Range
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      data[i].tr = data[i].high - data[i].low;
    } else {
      const high = data[i].high || 0;
      const low = data[i].low || 0;
      const prevClose = data[i-1].price || 0;
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      
      data[i].tr = Math.max(tr1, tr2, tr3);
    }
  }

  // Calculate ATR
  let atrSum = 0;
  for (let i = 0; i < period && i < data.length; i++) {
    atrSum += data[i].tr || 0;
  }
  
  data[period - 1].atr = atrSum / period;

  // Calculate subsequent ATR values using smoothing
  for (let i = period; i < data.length; i++) {
    const prevAtr = data[i-1].atr || 0;
    data[i].atr = ((prevAtr * (period - 1)) + data[i].tr) / period;
  }

  return data;
}