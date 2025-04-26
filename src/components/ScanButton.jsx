import React, { useState, useEffect } from 'react';
import useSignalStore from '../store/signalStore';
import useMarketStore from '../store/marketStore';

function ScanButton() {
  const { generateSignals, isScanning, scanError, lastScanTime, autoRefresh } = useSignalStore();
  const { loadAllData } = useMarketStore();
  const [countdown, setCountdown] = useState(0);
  
  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // Auto refresh timer
  useEffect(() => {
    let timer;
    if (autoRefresh && countdown === 0 && !isScanning) {
      timer = setTimeout(() => {
        handleScan();
      }, 60000); // Refresh every minute when auto-refresh is on
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoRefresh, countdown, isScanning]);
  
  const handleScan = async () => {
    if (isScanning) return;
    
    try {
      // First load latest market data
      await loadAllData();
      
      // Then generate signals
      await generateSignals();
      
      // Set countdown for 15 minutes (signals expire in 15 min)
      setCountdown(15 * 60);
    } catch (error) {
      console.error("Error during scan:", error);
    }
  };
  
  return (
    <div className="w-full mb-6">
      <button
        onClick={handleScan}
        disabled={isScanning}
        className={`w-full py-3 px-4 rounded-lg font-bold text-white ${
          isScanning 
            ? 'bg-yellow-600 animate-pulse' 
            : countdown > 0 
              ? 'bg-indigo-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
        } cursor-pointer transition-colors duration-200`}
      >
        {isScanning 
          ? 'Scanning...' 
          : countdown > 0 
            ? `Signals Active (${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')})` 
            : 'Scan for Signals'}
      </button>
      
      {scanError && (
        <p className="text-red-500 text-sm mt-2">{scanError}</p>
      )}
      
      {lastScanTime && (
        <p className="text-gray-400 text-xs mt-2 flex justify-between">
          <span>Last scan: {lastScanTime.toLocaleTimeString()}</span>
          {countdown > 0 && (
            <span className="text-indigo-300">
              Signals expire in {Math.floor(countdown / 60)}m {(countdown % 60).toString().padStart(2, '0')}s
            </span>
          )}
        </p>
      )}
      
      <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
        <div>
          • High confidence signals ({">"}75%) are strongest
        </div>
        <label className="flex items-center space-x-1 cursor-pointer">
          <input 
            type="checkbox" 
            checked={autoRefresh} 
            onChange={() => useSignalStore.getState().setAutoRefresh(!autoRefresh)}
            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span>Auto-refresh</span>
        </label>
      </div>
    </div>
  );
}

export default ScanButton;