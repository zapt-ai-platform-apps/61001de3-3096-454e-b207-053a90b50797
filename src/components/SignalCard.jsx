import React, { useState, useEffect } from 'react';

function SignalCard({ signal }) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  
  // Check if signal is expired
  const isExpired = new Date() > new Date(signal.expiryTime);
  
  // Update time remaining every second
  useEffect(() => {
    if (isExpired) {
      setTimeRemaining('Expired');
      return;
    }
    
    const timer = setInterval(() => {
      const now = new Date();
      const expiry = new Date(signal.expiryTime);
      
      if (now > expiry) {
        setTimeRemaining('Expired');
        clearInterval(timer);
        return;
      }
      
      const diffMs = expiry - now;
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      
      setTimeRemaining(`${diffMins}m ${diffSecs.toString().padStart(2, '0')}s`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isExpired, signal.expiryTime]);
  
  // Format price based on asset
  const formatPrice = (price) => {
    if (typeof price !== 'number') return price;
    
    if (signal.asset === 'BTC/USD') {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (signal.asset === 'EUR/USD') {
      return price.toFixed(4);
    } else if (signal.asset === 'XAU/USD') {
      return `$${price.toFixed(2)}`;
    }
    return price.toString();
  };
  
  // Determine card style based on direction
  const getBgColor = () => {
    if (isExpired) return 'bg-gray-800';
    
    if (signal.direction.includes('CALL') || signal.direction === 'BUY_OPTIONS' || signal.direction === 'BULLISH') {
      return 'bg-gradient-to-r from-green-900 to-green-800';
    } else if (signal.direction.includes('PUT') || signal.direction === 'SELL_OPTIONS' || signal.direction === 'BEARISH') {
      return 'bg-gradient-to-r from-red-900 to-red-800';
    } else {
      return 'bg-gradient-to-r from-indigo-900 to-indigo-800';
    }
  };
  
  // Generate action recommendation based on signal
  const getActionText = () => {
    if (signal.direction.includes('CALL') || signal.direction === 'BUY_OPTIONS' || signal.direction === 'BULLISH') {
      return 'BUY CALL';
    } else if (signal.direction.includes('PUT') || signal.direction === 'BEARISH') {
      return 'BUY PUT';
    } else if (signal.direction === 'SELL_OPTIONS') {
      return 'SELL PREMIUM';
    } else {
      return signal.direction;
    }
  };

  // Alert user with trading directions
  const showDirections = () => {
    const action = getActionText();
    const formattedEntry = formatPrice(signal.entryPrice);
    const formattedTarget = typeof signal.targetPrice === 'string' ? 
      signal.targetPrice : formatPrice(signal.targetPrice);
    
    // Get the most appropriate strategy based on signal
    let strategy = '';
    if (action === 'BUY CALL') {
      strategy = 'Buy a 15-minute At-The-Money Call option';
    } else if (action === 'BUY PUT') {
      strategy = 'Buy a 15-minute At-The-Money Put option';
    } else if (action === 'SELL PREMIUM') {
      strategy = 'Sell a 15-minute Iron Condor or Credit Spread';
    }
    
    const message = `
${action} @ ${formattedEntry}
Target: ${formattedTarget}
Confidence: ${signal.confidence}%
Strategy: ${strategy}
Expires in: ${timeRemaining}
    `;
    
    alert(message);
  };
  
  return (
    <div className={`${getBgColor()} rounded-lg p-4 shadow-lg relative mb-4 transition-all duration-300`}>
      {isExpired && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-10">
          <span className="text-white font-bold text-xl bg-red-900 px-4 py-1 rounded">EXPIRED</span>
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <span className="text-xs font-medium bg-gray-700 px-2 py-0.5 rounded mr-2">
              {signal.asset}
            </span>
            <h3 className="text-white font-bold text-lg">{signal.strategy}</h3>
          </div>
          <p className="text-gray-300 text-sm">
            {signal.timestamp.toLocaleTimeString()}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-white font-bold px-3 py-1 rounded ${
            signal.direction.includes('CALL') || signal.direction === 'BUY_OPTIONS' || signal.direction === 'BULLISH' ? 'bg-green-700' : 
            signal.direction.includes('PUT') || signal.direction === 'BEARISH' ? 'bg-red-700' : 'bg-blue-700'
          }`}>
            {getActionText()}
          </div>
          <div className="text-gray-300 text-sm mt-1">
            <span className={`font-medium ${signal.confidence >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
              {signal.confidence}% Confidence
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 border-t border-gray-700 pt-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="text-gray-400">Entry</p>
            <p className="text-white font-medium">{formatPrice(signal.entryPrice)}</p>
          </div>
          <div>
            <p className="text-gray-400">Target</p>
            <p className="text-white font-medium">{typeof signal.targetPrice === 'string' ? signal.targetPrice : formatPrice(signal.targetPrice)}</p>
          </div>
          <div>
            <p className="text-gray-400">Stop Loss</p>
            <p className="text-white font-medium">{typeof signal.stopLoss === 'string' ? signal.stopLoss : formatPrice(signal.stopLoss)}</p>
          </div>
          <div>
            <p className="text-gray-400">Expires In</p>
            <p className={`font-medium ${isExpired ? 'text-red-500' : 'text-white'}`}>{timeRemaining}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <p className="text-gray-400 text-xs font-medium">Key Drivers:</p>
        <ul className="text-white text-xs list-disc pl-4 mt-1">
          {signal.keyDrivers.map((driver, index) => (
            <li key={index}>{driver}</li>
          ))}
        </ul>
      </div>
      
      <div className="mt-3 flex justify-between">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-indigo-300 hover:text-indigo-200"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        
        <button 
          onClick={showDirections}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded text-white cursor-pointer"
          disabled={isExpired}
        >
          View Trading Directions
        </button>
      </div>
      
      {showDetails && (
        <div className="mt-3 border-t border-gray-700 pt-3 text-xs">
          <h4 className="text-gray-300 font-medium">Options Context:</h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
            <div>
              <span className="text-gray-400">IV:</span> <span className="text-white">{signal.optionsContext.iv.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">IV Percentile:</span> <span className="text-white">{signal.optionsContext.ivPercentile}%</span>
            </div>
            <div>
              <span className="text-gray-400">Put/Call Ratio:</span> <span className="text-white">{signal.optionsContext.pcr.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">VIX:</span> <span className="text-white">{signal.optionsContext.vix.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignalCard;