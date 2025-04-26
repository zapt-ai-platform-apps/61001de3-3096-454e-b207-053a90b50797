import React from 'react';
import useMarketStore from '../store/marketStore';

function TechnicalOverview() {
  const { getTechnicalIndicators } = useMarketStore();
  const indicators = getTechnicalIndicators();
  
  if (!indicators.rsi) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4">Technical Analysis</h2>
        <p className="text-gray-400 text-sm">
          Loading technical indicators...
        </p>
      </div>
    );
  }
  
  // Helper function to get RSI status
  const getRsiStatus = () => {
    if (indicators.rsi > 70) return { status: 'Overbought', color: 'text-red-400' };
    if (indicators.rsi < 30) return { status: 'Oversold', color: 'text-green-400' };
    return { status: 'Neutral', color: 'text-gray-300' };
  };
  
  // Helper function to get MACD status
  const getMacdStatus = () => {
    if (!indicators.macd || !indicators.signal) return { status: 'Unknown', color: 'text-gray-300' };
    
    if (indicators.macd > indicators.signal) {
      return { status: 'Bullish', color: 'text-green-400' };
    }
    return { status: 'Bearish', color: 'text-red-400' };
  };
  
  // Helper function to get Bollinger Band status
  const getBollingerStatus = () => {
    if (!indicators.upperBB || !indicators.lowerBB || !indicators.sma20) {
      return { status: 'Unknown', color: 'text-gray-300' };
    }
    
    const latestPrice = useMarketStore.getState().currentPrice;
    
    if (latestPrice > indicators.upperBB) {
      return { status: 'Above Upper Band', color: 'text-red-400' };
    }
    if (latestPrice < indicators.lowerBB) {
      return { status: 'Below Lower Band', color: 'text-green-400' };
    }
    if (latestPrice > indicators.sma20) {
      return { status: 'Above Middle Band', color: 'text-green-400' };
    }
    return { status: 'Below Middle Band', color: 'text-red-400' };
  };
  
  const rsiStatus = getRsiStatus();
  const macdStatus = getMacdStatus();
  const bbandsStatus = getBollingerStatus();
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4">Technical Analysis</h2>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">RSI (14)</span>
            <span className={`text-sm font-medium ${rsiStatus.color}`}>
              {rsiStatus.status}
            </span>
          </div>
          <div className="mt-1 h-2 bg-gray-700 rounded overflow-hidden">
            <div 
              className={`h-full ${
                indicators.rsi > 70 ? 'bg-red-500' : 
                indicators.rsi < 30 ? 'bg-green-500' : 
                'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, indicators.rsi)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>30</span>
            <span>70</span>
            <span>100</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">MACD</span>
            <span className={`text-sm font-medium ${macdStatus.color}`}>
              {macdStatus.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <span className="text-xs text-gray-400">Line: </span>
              <span className="text-xs text-white">{indicators.macd?.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400">Signal: </span>
              <span className="text-xs text-white">{indicators.signal?.toFixed(4)}</span>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Bollinger Bands</span>
            <span className={`text-sm font-medium ${bbandsStatus.color}`}>
              {bbandsStatus.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <span className="text-xs text-gray-400">Upper: </span>
              <span className="text-xs text-white">{indicators.upperBB?.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400">Lower: </span>
              <span className="text-xs text-white">{indicators.lowerBB?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        <p>15-Min Strategy Types:</p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li>
            <span className="text-green-400">RSI Oversold ({"<"}30)</span>: Buy call options
          </li>
          <li>
            <span className="text-red-400">RSI Overbought ({">"}70)</span>: Buy put options
          </li>
          <li>
            <span className="text-blue-400">MACD Crossover</span>: Buy in crossover direction
          </li>
          <li>
            <span className="text-purple-400">Bollinger Band Bounce</span>: Buy against extreme moves
          </li>
        </ul>
      </div>
    </div>
  );
}

export default TechnicalOverview;