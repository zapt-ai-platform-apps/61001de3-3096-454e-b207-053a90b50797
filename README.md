# Bitcoin Options Trading Signal Engine

A real-time trading signal engine for Bitcoin, EUR/USD, and Gold options with 15-minute expiration focus.

## Features

- Real-time market data from CryptoCompare and other sources
- Technical analysis with 50+ trading strategies
- Options-specific indicators (IV, PCR, VIX, TRIN)
- 15-minute expiration focus
- Multi-asset support (BTC/USD, EUR/USD, XAU/USD)
- Deterministic signal generation to prevent "repainting"
- Monte Carlo probability simulations

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Add your API keys to the .env file
4. Start the development server:
   ```
   npm run dev
   ```

## Trading Strategies

The system implements 50+ trading strategies, including:

- Directional strategies (MA crossovers, RSI, MACD)
- Volatility-based strategies (IV rank, Bollinger Bands)
- Options-specific strategies (PCR, VIX, IV skew)
- Hybrid strategies (combining technical and options data)
- Advanced strategies (Turtle Trading, Monte Carlo)

## Technical Indicators

- Moving Averages (SMA, EMA)
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands
- ATR (Average True Range)

## Options Indicators

- IV (Implied Volatility) and IV Percentile
- Put/Call Ratio (PCR)
- VIX (Volatility Index)
- TRIN (Trading Index / Arms Index)
- IV Skew and Term Structure

## Built With

- React
- Tailwind CSS
- Zustand for state management
- CryptoCompare API and other data sources