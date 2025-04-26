// Helper to generate deterministic random numbers based on a seed
// This ensures consistent mock data generation for the same parameters
export function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate a deterministic seed from a string
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function generateMockPriceData(limit, interval, basePrice, volatility, seedString) {
  const data = [];
  const now = new Date();
  const seed = hashString(seedString || 'default-seed');
  
  // Calculate interval in milliseconds
  const intervalMs = interval === 'minute' ? 60 * 1000 : 
                     interval === 'hour' ? 60 * 60 * 1000 : 
                     24 * 60 * 60 * 1000;

  // Generate data starting from the past
  let currentPrice = basePrice;
  let currentTime = new Date(now.getTime() - (limit * intervalMs));
  
  for (let i = 0; i < limit; i++) {
    // Use seeded random to ensure deterministic results for the same input parameters
    const randomSeed = seed + i;
    const dailyChange = (seededRandom(randomSeed) - 0.5) * 2 * volatility * currentPrice;
    currentPrice += dailyChange;
    
    // Generate realistic OHLC values
    const dailyRange = currentPrice * (volatility / 2);
    const open = currentPrice - (dailyRange * (seededRandom(randomSeed + 0.1) - 0.5));
    const high = Math.max(open, currentPrice) + (dailyRange * seededRandom(randomSeed + 0.2));
    const low = Math.min(open, currentPrice) - (dailyRange * seededRandom(randomSeed + 0.3));
    
    // Generate realistic volume
    const volume = 1000 + seededRandom(randomSeed + 0.4) * 5000;
    
    data.push({
      timestamp: new Date(currentTime),
      open,
      high,
      low,
      close: currentPrice,
      volume,
    });
    
    currentTime = new Date(currentTime.getTime() + intervalMs);
  }
  
  return data;
}