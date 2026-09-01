/**
 * x402 Protocol Middleware & Resource Server Protection
 * Enforces genuine HTTP 402 Payment Required status and validates Algorand Testnet settlements.
 */

import { Request, Response, NextFunction } from 'express';
import { DEFAULT_SERVICE_PRICING, GOPLAUSIBLE_CONFIG, ALGORAND_TESTNET_CONFIG } from '../../shared/constants.js';
import { X402PaymentRequirement, X402PaymentProof, TransactionRecord } from '../../shared/types.js';
import { algorandService } from './algorand.js';
import { db } from './db.js';

export interface X402Request extends Request {
  x402Payment?: {
    txId: string;
    sender: string;
    receiver: string;
    amountUsdc: number;
    facilitator: string;
    explorerUrl: string;
  };
}

export function requireX402Payment(serviceId: 'crop-analysis' | 'farm-intelligence' | 'weather-intelligence') {
  const serviceInfo = DEFAULT_SERVICE_PRICING[serviceId];

  // Allow price override from env if configured
  let priceUsdc: number = serviceInfo.priceUsdc;
  if (serviceId === 'crop-analysis' && process.env.PRICE_CROP_ANALYSIS_USDC) {
    priceUsdc = parseFloat(process.env.PRICE_CROP_ANALYSIS_USDC) || priceUsdc;
  } else if (serviceId === 'farm-intelligence' && process.env.PRICE_FARM_REPORT_USDC) {
    priceUsdc = parseFloat(process.env.PRICE_FARM_REPORT_USDC) || priceUsdc;
  } else if (serviceId === 'weather-intelligence' && process.env.PRICE_WEATHER_INTEL_USDC) {
    priceUsdc = parseFloat(process.env.PRICE_WEATHER_INTEL_USDC) || priceUsdc;
  }

  const receiverAddress = algorandService.getReceiverAddress();

  return async (req: X402Request, res: Response, next: NextFunction) => {
    // Check for payment headers
    const paymentHeader =
      req.headers['x-payment'] ||
      req.headers['payment-signature'] ||
      req.headers['authorization'];

    if (!paymentHeader) {
      // Respond with real HTTP 402 Payment Required
      const paymentReq: X402PaymentRequirement = {
        status: 402,
        message: 'Payment Required. Please complete x402 payment on Algorand Testnet.',
        x402Version: 1,
        serviceId,
        serviceName: serviceInfo.name,
        priceUsdc,
        priceMicroUsdc: Math.round(priceUsdc * 1e6),
        assetId: ALGORAND_TESTNET_CONFIG.usdcAssetId,
        network: 'algorand:testnet',
        receiverAddress,
        facilitatorUrl: GOPLAUSIBLE_CONFIG.facilitatorUrl,
        facilitatorName: 'GoPlausible',
        currency: 'USDC',
        description: serviceInfo.description,
        expiresAt: Date.now() + 15 * 60 * 1000,
      };

      res.setHeader('PAYMENT-REQUIRED', JSON.stringify(paymentReq));
      res.setHeader('PAYMENT-FACILITATOR', 'GoPlausible (https://testnet.goplausible.xyz)');
      res.setHeader('PAYMENT-NETWORK', 'algorand:testnet');
      res.setHeader('WWW-Authenticate', 'x402 realm="Kishan Bhai AI Protected Agricultural Services"');

      return res.status(402).json({
        error: 'Payment Required',
        x402: paymentReq,
      });
    }

    try {
      // Parse payment proof
      let proof: X402PaymentProof;
      const rawHeaderStr = Array.isArray(paymentHeader) ? paymentHeader[0] : paymentHeader;

      if (rawHeaderStr.startsWith('x402 ') || rawHeaderStr.startsWith('Bearer ')) {
        const token = rawHeaderStr.replace(/^(x402|Bearer)\s+/, '');
        try {
          proof = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        } catch {
          proof = JSON.parse(token);
        }
      } else {
        try {
          proof = JSON.parse(rawHeaderStr);
        } catch {
          proof = {
            txId: rawHeaderStr,
            senderAddress: '',
            receiverAddress,
            amountUsdc: priceUsdc,
            assetId: ALGORAND_TESTNET_CONFIG.usdcAssetId,
            network: 'algorand:testnet',
            timestamp: Date.now(),
          };
        }
      }

      if (!proof.txId) {
        return res.status(400).json({ error: 'Invalid x402 payment proof: txId is missing.' });
      }

      // Check double-spend
      if (db.usedTxHashes.has(proof.txId)) {
        return res.status(409).json({ error: 'x402 Payment Error: Transaction ID has already been redeemed.' });
      }

      // Perform genuine verification on Algorand Testnet with GoPlausible Facilitator
      const startTime = Date.now();
      const verification = await algorandService.verifyPaymentWithFacilitator(
        proof,
        serviceId,
        priceUsdc
      );

      if (!verification.valid) {
        return res.status(402).json({
          error: 'x402 Payment Verification Failed',
          details: verification.errorMessage || 'Unable to confirm transaction on Algorand Testnet',
        });
      }

      // Mark as settled
      db.usedTxHashes.add(proof.txId);

      const record: TransactionRecord = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        serviceId,
        serviceName: serviceInfo.name,
        amountUsdc: priceUsdc,
        asset: 'USDC',
        network: 'Algorand Testnet',
        status: 'SETTLED',
        txId: proof.txId,
        senderAddress: verification.sender,
        receiverAddress: verification.receiver,
        timestamp: new Date().toISOString(),
        facilitator: 'GoPlausible Facilitator',
        explorerUrl: verification.explorerUrl,
        executionTimeMs: Date.now() - startTime,
        isRealBlockchainTx: true,
      };

      db.transactions.set(record.id, record);

      // Set payment response confirmation header
      res.setHeader(
        'X-PAYMENT-RESPONSE',
        `status=settled; txId=${proof.txId}; facilitator=GoPlausible; network=algorand-testnet; explorer=${encodeURIComponent(verification.explorerUrl)}`
      );

      req.x402Payment = {
        txId: proof.txId,
        sender: verification.sender,
        receiver: verification.receiver,
        amountUsdc: priceUsdc,
        facilitator: 'GoPlausible Facilitator',
        explorerUrl: verification.explorerUrl,
      };

      return next();
    } catch (err: any) {
      console.error('[x402 Middleware] Error:', err);
      return res.status(500).json({ error: 'Internal x402 processing error', message: err.message });
    }
  };
}
