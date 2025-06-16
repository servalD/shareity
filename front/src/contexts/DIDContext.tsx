import { useState, useEffect, useCallback } from 'react';
import { ResolvedFlow } from 'xumm-oauth2-pkce';
import { useAuth } from '../contexts/AuthContext';
import { sendTx } from '../contexts/WalletContext';
// TODO: DEBUG
/**
 * Hook to manage Fractal KYC flows:
 * - start KYC (returns a redirect URL)
 * - poll for status
 */
export function useFractalKYC() {
  const { user } = useAuth();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Kick off a new KYC session
  const startKYC = useCallback(async () => {
    if (!user) throw new Error('User must be authenticated');
    try {
      const resp = await fetch(`/api/fractal/kyc/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, wallet: user.walletAddress })
      });
      const { url } = await resp.json();
      setRedirectUrl(url);
      setStatus('pending');
      return url;
    } catch (err: any) {
      setError(err);
      throw err;
    }
  }, [user]);

  // Poll for KYC status via backend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'pending' && user) {
      interval = setInterval(async () => {
        try {
          const resp = await fetch(`/api/fractal/kyc/status?userId=${user.id}`);
          const { kycStatus } = await resp.json();
          if (kycStatus !== 'pending') {
            setStatus(kycStatus);
            clearInterval(interval);
          }
        } catch {
          // ignore polling errors
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status, user]);

  return { redirectUrl, status, error, startKYC };
}

/**
 * Hook to manage issuing and reading a DID on XRPL via Fractal
 * Assumes backend signs the DIDSet and returns a tx payload via Xumm
 */
export function useFractalDID() {
  const { sdk } = useAuth();
  const [didUri, setDidUri] = useState<string | null>(null);
  const [isSetting, setIsSetting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch current DID URI from backend/ledger
  const fetchDID = useCallback(async () => {
    try {
      const resp = await fetch(`/api/fractal/did`);
      const { uri } = await resp.json();
      setDidUri(uri);
      return uri;
    } catch (err: any) {
      setError(err);
      throw err;
    }
  }, []);

  // Issue or update DIDSet on XRPL via Xumm SDK
  const setDID = useCallback(async (vcUri: string) => {
    if (!sdk) throw new Error('Xumm SDK not ready');
    setIsSetting(true);
    try {
      const txId = await sendTx({
        txjson: {
          TransactionType: 'object_account',
          URI: Buffer.from(vcUri, 'utf8').toString('hex')
        }
      }, sdk);
      const { resolved } = await sdk.payload.createAndSubscribe(
        payload,
        evt => ('signed' in evt.data ? evt.data : undefined)
      );
      const outcome = await resolved;
      if (outcome.signed) {
        setDidUri(vcUri);
        return outcome.txid;
      }
      throw new Error('User rejected DIDSet');
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsSetting(false);
    }
  }, [sdk]);

  return { didUri, isSetting, error, fetchDID, setDID };
}

/**
 * Hook to verify a DID's verifiable credential
 */
export function useFractalVerify() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const verify = useCallback(async (vcUri: string) => {
    setIsVerifying(true);
    try {
      const resp = await fetch(`/api/fractal/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vcUri })
      });
      const { valid: isValid } = await resp.json();
      setValid(isValid);
      return isValid;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { isVerifying, valid, error, verify };
}
