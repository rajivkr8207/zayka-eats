const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000',
  appName: 'Zayka Eats',
  currencySymbol: '₹',
  defaultDeliveryFee: 40,
  freeDeliveryThreshold: 500,
  taxRatePercent: 5,
};

export default config;
