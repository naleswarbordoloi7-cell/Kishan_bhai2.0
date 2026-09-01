/**
 * Shared Constants for Kishan Bhai
 */

export const ALGORAND_TESTNET_CONFIG = {
  network: 'testnet',
  algodUrl: 'https://testnet-api.algonode.cloud',
  indexerUrl: 'https://testnet-idx.algonode.cloud',
  port: 443,
  // Standard Algorand Testnet USDC Asset ID
  usdcAssetId: 10458941,
  // Platform Merchant / Facilitator Testnet Address
  defaultReceiverAddress: 'KBHAI4O4JYZ4K7V4Z2V3W5QZX3S6N6L2J7R8P9Q1S3T5U7V9W0Y2Z4A6B8',
  faucetUrl: 'https://bank.testnet.algorand.network/',
  explorerBaseUrl: 'https://testnet.explorer.perawallet.app/tx/',
  loraExplorerUrl: 'https://lora.algokit.io/testnet/transaction/',
};

export const GOPLAUSIBLE_CONFIG = {
  facilitatorName: 'GoPlausible Facilitator',
  facilitatorUrl: 'https://testnet.goplausible.xyz',
  verifyEndpoint: '/v1/verify',
  settleEndpoint: '/v1/settle',
  version: '1.0',
};

export const DEFAULT_SERVICE_PRICING = {
  'crop-analysis': {
    serviceId: 'crop-analysis',
    name: 'AI Crop Multispectral & Disease Analysis',
    priceUsdc: 0.002,
    priceMicroUsdc: 2000,
    description: 'High-resolution pathogen detection, disease severity index, and targeted bio-fertilizer recommendations.',
  },
  'farm-intelligence': {
    serviceId: 'farm-intelligence',
    name: 'Virtual Cluster Macro Farm Intelligence Report',
    priceUsdc: 0.005,
    priceMicroUsdc: 5000,
    description: 'Soil nutrient mapping, regional pest surveillance alerts, and predictive yield forecast.',
  },
  'weather-intelligence': {
    serviceId: 'weather-intelligence',
    name: 'Micro-Climate Hyperlocal Weather Advisory',
    priceUsdc: 0.001,
    priceMicroUsdc: 1000,
    description: '14-day precision frost & monsoon precipitation model tailored to your exact cluster acreage.',
  },
} as const;

export const MONTHLY_API_BUDGET_INR = 1500;
