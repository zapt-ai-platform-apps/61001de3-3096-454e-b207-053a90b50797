import React from 'react';
import { getOverallOptionsSentiment } from '../utils/optionsIndicators';

function OptionsContext({ optionsData }) {
  if (!optionsData) return null;
  
  const { iv, pcr, vix, trin } = optionsData;
  const sentiment = getOverallOptionsSentiment(optionsData);
  
  // Helper function to get status color
  const getStatusColor = (status, type) => {
    if (type === 'iv' || type === 'vix') {
      // For IV and VIX, high is usually bearish (red), low is usually bullish (green)
      return status === 'high' ? 'text-red-400' :
             status === 'low' ? 'text-green-400' : 'text-gray-300';
    } else if (type === 'pcr') {
      // For PCR, high is contrarian bullish (green), low is contrarian bearish (red)
      return status === 'high' ? 'text-green-400' :
             status === 'low' ? 'text-red-400' : 'text-gray-300';
    } else if (type === 'trin') {
      // For TRIN, high is contrarian bullish (green), low is contrarian bearish (red)
      return status === 'high' ? 'text-green-400' :
             status === 'low' ? 'text-red-400' : 'text-gray-300';
    }
    return 'text-gray-300';
  };
  
  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      <div className="flex flex-wrap justify-between">
        <div className="w-full mb-2">
          <p className="text-gray-400 text-sm">Options Market Context</p>
          <div className="flex items-center mt-1">
            <span className={`text-sm font-bold px-2 py-0.5 rounded ${
              sentiment.sentiment === 'bullish' ? 'bg-green-800 text-green-200' :
              sentiment.sentiment === 'bearish' ? 'bg-red-800 text-red-200' :
              'bg-gray-700 text-gray-300'
            }`}>
              {sentiment.sentiment.toUpperCase()} {sentiment.strength.toUpperCase()}
            </span>
            <span className="text-xs text-gray-400 ml-2">
              ({sentiment.bullishFactors} bullish / {sentiment.bearishFactors} bearish factors)
            </span>
          </div>
        </div>
        
        <div className="w-1/2 sm:w-1/4 mb-2">
          <div className="text-xs text-gray-400">IV Percentile</div>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${getStatusColor(iv.status, 'iv')}`}>
              {iv.percentile}%
            </span>
            <span className="ml-1 text-xs text-gray-500">
              ({iv.status})
            </span>
          </div>
        </div>
        
        <div className="w-1/2 sm:w-1/4 mb-2">
          <div className="text-xs text-gray-400">Put/Call Ratio</div>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${getStatusColor(pcr.status, 'pcr')}`}>
              {pcr.value.toFixed(2)}
            </span>
            <span className="ml-1 text-xs text-gray-500">
              ({pcr.status})
            </span>
          </div>
        </div>
        
        <div className="w-1/2 sm:w-1/4 mb-2">
          <div className="text-xs text-gray-400">VIX</div>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${getStatusColor(vix.status, 'vix')}`}>
              {vix.value.toFixed(1)}
            </span>
            <span className="ml-1 text-xs text-gray-500">
              ({vix.status})
            </span>
          </div>
        </div>
        
        <div className="w-1/2 sm:w-1/4 mb-2">
          <div className="text-xs text-gray-400">TRIN</div>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${getStatusColor(trin.status, 'trin')}`}>
              {trin.value.toFixed(2)}
            </span>
            <span className="ml-1 text-xs text-gray-500">
              ({trin.status})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OptionsContext;