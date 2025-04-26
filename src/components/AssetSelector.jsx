import React from 'react';
import useMarketStore from '../store/marketStore';

function AssetSelector() {
  const { currentAsset, assets, setCurrentAsset } = useMarketStore();
  
  const handleAssetChange = (event) => {
    const newAsset = event.target.value;
    setCurrentAsset(newAsset);
  };
  
  return (
    <div className="mb-4">
      <select 
        value={currentAsset}
        onChange={handleAssetChange}
        className="bg-gray-700 text-white p-2.5 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full lg:w-auto"
      >
        {assets.map(asset => (
          <option key={asset} value={asset}>{asset}</option>
        ))}
      </select>
      
      <div className="mt-3 flex items-center text-sm text-gray-400">
        <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
        <span>
          {currentAsset === 'BTC/USD' ? 'Bitcoin' : 
           currentAsset === 'EUR/USD' ? 'Euro/US Dollar' : 
           currentAsset === 'XAU/USD' ? 'Gold' : currentAsset}
        </span>
        <span className="ml-2 text-xs opacity-70">
          (15-Minute Expiration Focus)
        </span>
      </div>
    </div>
  );
}

export default AssetSelector;