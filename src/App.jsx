import React, { useEffect, useState } from 'react';
import AssetSelector from './components/AssetSelector';
import SignalCard from './components/SignalCard';
import ScanButton from './components/ScanButton';
import useMarketStore from './store/marketStore';
import useSignalStore from './store/signalStore';
import OptionsContext from './components/OptionsContext';
import TechnicalOverview from './components/TechnicalOverview';

function App() {
  const { currentAsset, currentPrice, loading: marketLoading, loadAllData, optionsContext } = useMarketStore();
  const { generatedSignals, isScanning } = useSignalStore();
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadAllData();
      } catch (error) {
        console.error("Failed to load initial data:", error);
        Sentry.captureException(error);
      } finally {
        setInitialLoadDone(true);
      }
    };
    
    loadInitialData();
  }, [loadAllData]);
  
  // Format price based on asset
  const formatPrice = (price) => {
    if (!price) return '-';
    
    if (currentAsset === 'BTC/USD') {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (currentAsset === 'EUR/USD') {
      return price.toFixed(4);
    } else if (currentAsset === 'XAU/USD') {
      return `$${price.toFixed(2)}`;
    }
    return price.toString();
  };

  const assetOptions = optionsContext[currentAsset];
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Options Trading Signal Engine
          </h1>
          <p className="text-gray-400">
            Real-time signals for 15-minute expiration options
          </p>
          <div className="text-xs text-right text-gray-500">
            <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
              Made on ZAPT
            </a>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-4">Current Asset</h2>
              <AssetSelector />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Current Price</p>
                  <p className="text-3xl font-bold">
                    {marketLoading ? '...' : formatPrice(currentPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Expiration</p>
                  <p className="text-lg text-indigo-400">
                    15-Minute Options
                  </p>
                </div>
              </div>
              
              {assetOptions && <OptionsContext optionsData={assetOptions} />}
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Trading Signals</h2>
              <ScanButton />
              
              {!initialLoadDone || isScanning ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
                  <p className="text-gray-400">
                    {!initialLoadDone ? 'Loading initial data...' : 'Generating signals...'}
                  </p>
                </div>
              ) : generatedSignals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    No signals generated yet. Click the scan button to find trading opportunities.
                  </p>
                </div>
              ) : (
                <div>
                  {generatedSignals.map(signal => (
                    <SignalCard key={signal.id} signal={signal} />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="col-span-1">
            {initialLoadDone && <TechnicalOverview />}
            
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-4">Using This App</h2>
              <div className="text-gray-300 text-sm">
                <p className="mb-2">This app provides trading signals for 15-minute expiration options on BTC/USD, EUR/USD, and XAU/USD.</p>
                <p className="mb-2">Signals are generated using 50+ trading strategies including technical analysis, options-specific indicators, and market sentiment analysis.</p>
                <ul className="list-disc pl-5 mb-2">
                  <li>Select an asset from the dropdown</li>
                  <li>Click "Scan for Signals" to generate trading opportunities</li>
                  <li>Review the signals and their details</li>
                  <li>Signals expire after 15 minutes</li>
                </ul>
                <p>For best results, wait for signals with confidence {">"}80%.</p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Strategy Types</h2>
              <div className="text-gray-300 text-sm space-y-3">
                <div>
                  <p className="font-semibold text-green-400">Directional Strategies</p>
                  <p>Based on price movement prediction (MA Crossovers, RSI, MACD)</p>
                </div>
                
                <div>
                  <p className="font-semibold text-blue-400">Volatility Strategies</p>
                  <p>Based on expected volatility change (IV, VIX, Bollinger Bands)</p>
                </div>
                
                <div>
                  <p className="font-semibold text-purple-400">Sentiment Strategies</p>
                  <p>Based on market sentiment indicators (Put/Call Ratio, VIX)</p>
                </div>
                
                <div>
                  <p className="font-semibold text-yellow-400">Hybrid Strategies</p>
                  <p>Combining multiple analysis methods for stronger signals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;