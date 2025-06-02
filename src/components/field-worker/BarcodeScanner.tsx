import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, X, Plus, Minus } from 'lucide-react';
import { playBeep } from '../../utils/soundUtils';
import { submitCrateData } from '../../services/api';
import {
  saveCrateScanWithFallback,
  getPendingScansWithFallback,
  syncPendingScans,
  setSyncCallback
} from '../../services/offlineDataService';
import { useAuth } from '../../contexts/AuthContext';
import styles from './BarcodeScanner.module.css';
import { useOrderBatch } from '../../contexts/OrderBatchContext';

// For demo purposes - in production, use actual values from a database
const DEFAULT_BREAD_QUANTITY = 24;

// const LOCAL_QUEUE_KEY = 'thfc_crate_queue';
// const LOCAL_HISTORY_KEY = 'thfc_crate_history';

import type { CrateScan } from '../../services/offlineDataService';

const BarcodeScanner: React.FC = () => {
  const {
    activeOrderBatch,
    assignCrateToBatch
  } = useOrderBatch();
  const { state: authState } = useAuth();
  const userRole = authState.user?.role;
  const [crateId, setCrateId] = useState('');
  const [actualQuantity, setActualQuantity] = useState(DEFAULT_BREAD_QUANTITY);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [scanHistory, setScanHistory] = useState<CrateScan[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Permission helpers
  const canScanDispatch = activeOrderBatch && activeOrderBatch.type === 'dispatch' && activeOrderBatch.status === 'open' && (userRole === 'production_operator' || userRole === 'dispatch_coordinator');
  const canScanDonation = activeOrderBatch && activeOrderBatch.type === 'donation' && activeOrderBatch.status === 'open' && (userRole === 'csi_field_worker' || userRole === 'thfc_production_operator' || userRole === 'zoho_admin');
  const canScan = Boolean(canScanDispatch || canScanDonation);
  let scanSource: string | undefined = undefined;
  if (activeOrderBatch && activeOrderBatch.type === 'donation') {
    if (userRole === 'csi_field_worker') scanSource = 'Uplifted';
    else if (userRole === 'thfc_production_operator') scanSource = 'THFC-Baked';
    else if (userRole === 'zoho_admin') scanSource = 'Zoho-Admin';
  }
  
  // Function to simulate starting the camera
  const startCamera = async () => {
    setIsCameraActive(true);
    
    // In a real implementation, this would access the device camera
    // For this demo, we'll simulate a barcode scan after a short delay
    setTimeout(() => {
      // Simulate scanning a barcode
      const fakeCrateId = `CRATE-${Math.floor(1000 + Math.random() * 9000)}`;
      setCrateId(fakeCrateId);
      setIsCameraActive(false);
      
      // Play beep sound to confirm scan
      playBeep(800, 200, 0.5);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `Successfully scanned crate ${fakeCrateId}`
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }, 2000);
  };
  
  // Function to handle manual input of crate ID
  const handleCrateIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCrateId(newValue);
    
    // Play beep when a barcode is entered (assuming barcodes end with Enter)
    if (newValue.includes('\n') || newValue.includes('\r')) {
      playBeep(800, 200, 0.5);
    }
  };
  
  // Functions to handle quantity changes
  const incrementQuantity = () => {
    setActualQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    setActualQuantity(prev => (prev > 0 ? prev - 1 : 0));
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setActualQuantity(value);
    }
  };
  
  // Offline scan queue/history logic is now handled by offlineDataService

  // Sync pending scans using offlineDataService
  const tryResubmitQueue = async () => {
    await syncPendingScans(async (scan) => {
      // Map scan to API payload
      const response = await submitCrateData(scan.payload);
      if (!response.success) throw new Error(response.error || 'Failed to sync');
    });
    loadPendingScans();
  };


  // On mount: load history and queue, and try to resubmit if online
  useEffect(() => {
    // Load pending scans from offlineDataService
    const fetchScans = async () => {
      const scans = await getPendingScansWithFallback();
      setScanHistory(scans);
    };
    fetchScans();
    if (navigator.onLine) {
      tryResubmitQueue();
    }
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      tryResubmitQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    // Register sync callback for offlineDataService
    setSyncCallback(() => {
      tryResubmitQueue();
    });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to submit crate data
  const handleSubmit = async () => {
    if (!crateId.trim() || isSubmitting) return;
    if (!canScan) {
      setNotification({ type: 'error', message: 'You do not have permission to scan into this batch/order.' });
      return;
    }
    setIsSubmitting(true);

    // Build payload
    const payload: any = {
      crate_id_input: crateId.trim(),
      bread_quantity: actualQuantity
    };
    if (activeOrderBatch) {
      if (activeOrderBatch.type === 'dispatch') {
        payload.dispatch_order_ref = activeOrderBatch.reference;
      } else if (activeOrderBatch.type === 'donation') {
        payload.donation_batch_ref = activeOrderBatch.reference;
        if (scanSource) payload.source = scanSource;
      }
    }

    try {
      await saveCrateScanWithFallback({
        id: `${crateId.trim()}-${Date.now()}`,
        crateId: crateId.trim(),
        breadQuantity: actualQuantity,
        payload,
        createdAt: new Date().toISOString(),
        synced: false,
        isOfflineScan: true
      });
      assignCrateToBatch(crateId.trim());
      setNotification({ type: 'success', message: 'Crate queued for sync!' });
      setCrateId('');
      setActualQuantity(DEFAULT_BREAD_QUANTITY);
      loadPendingScans();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to queue crate.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to load pending scans
  const loadPendingScans = async () => {
    try {
      const pendingScans = await getPendingScansWithFallback();
      setScanHistory(pendingScans);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to load pending scans.' });
    }
  };

  // Function to reset the form
  const resetForm = () => {
    setCrateId('');
    setActualQuantity(DEFAULT_BREAD_QUANTITY);
    setIsCameraActive(false);
  };

  return (
    <div className={styles.scannerContainer}>
      {notification && (
        <div className={styles[notification.type]}>
          {notification.message}
        </div>
      )}
      
      <div className={isCameraActive ? styles.viewfinderActive : styles.viewfinder}>
        {isCameraActive ? (
          <video ref={videoRef} autoPlay playsInline />
        ) : (
          <div className={styles.viewfinderPlaceholder}>
            {crateId ? (
              <div>
                <p>Crate ID: {crateId}</p>
              </div>
            ) : (
              <div>
                <Camera size={48} color="#9CA3AF" />
                <p>Press "Scan Crate" to activate camera</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <button 
        className={styles.scanButton}
        onClick={startCamera}
        disabled={isCameraActive || isSubmitting}
      >
        <Camera size={18} />
        Scan Crate
      </button>
      
      <div className={styles.formGroup}>
        <label htmlFor="crateId" className={styles.label}>Crate ID</label>
        <input
          id="crateId"
          type="text"
          className={styles.input}
          value={crateId}
          onChange={handleCrateIdChange}
          placeholder="Enter crate ID manually"
          disabled={isCameraActive || isSubmitting}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Default Bread Quantity</label>
        <input
          type="text"
          className={styles.input}
          value={DEFAULT_BREAD_QUANTITY}
          disabled
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="actualQuantity" className={styles.label}>Actual Bread Quantity</label>
        <div className={styles.quantityControl}>
          <button 
            type="button" 
            className={styles.quantityButton}
            onClick={decrementQuantity}
            disabled={isSubmitting}
          >
            <Minus size={18} />
          </button>
          <input
            id="actualQuantity"
            type="number"
            className={styles.quantityInput}
            value={actualQuantity}
            onChange={handleQuantityChange}
            min="0"
            disabled={isSubmitting}
          />
          <button 
            type="button" 
            className={styles.quantityButton}
            onClick={incrementQuantity}
            disabled={isSubmitting}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      
      <button 
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={!crateId.trim() || isSubmitting || !canScan}
        title={!canScan ? 'You do not have permission to scan into this batch/order.' : ''}
      >
        {isSubmitting ? (
          <>
            <span className={styles.loading}></span>
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Save size={18} />
            <span>Submit Crate</span>
          </>
        )}
      </button>
      {!canScan && (
        <div style={{color:'#b91c1c', fontSize:12, marginTop:4}}>
          You do not have permission to scan into this batch/order or it is closed.
        </div>
      )}
      
      <button 
        className={styles.clearButton}
        onClick={resetForm}
        disabled={isSubmitting}
      >
        <X size={18} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
        Clear Form
      </button>
    {/* Pending Scans UI */}
    <div className={styles.historySection} style={{marginTop: '2rem'}}>
      <h3 style={{marginBottom: '0.5rem'}}>Pending/Offline Scans</h3>
      <ul style={{listStyle: 'none', padding: 0, maxHeight: 200, overflowY: 'auto'}}>
        {scanHistory.length === 0 && <li style={{color:'#888'}}>No scans yet.</li>}
        {scanHistory.map((item, idx) => (
          <li key={idx} style={{marginBottom: 6, color: item.synced ? 'green' : item.error ? 'red' : 'orange', display: 'flex', alignItems: 'center'}}>
            <div style={{flex:1}}>
              <b>{item.crateId}</b> | Qty: {item.breadQuantity} | <span style={{textTransform:'capitalize'}}>{item.synced ? 'sent' : item.error ? 'error' : 'pending'}</span>
              {item.error && <span style={{color:'#b91c1c'}}> ({item.error})</span>}
              <span style={{fontSize:12, color:'#888', marginLeft:8}}>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : ''}</span>
            </div>
            {item.error && !item.synced && (
              <button
                style={{marginLeft:8, fontSize:12, padding:'2px 8px', borderRadius:4, border:'1px solid #ccc', background:'#f3f4f6', cursor:'pointer'}}
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const response = await submitCrateData(item.payload);
                    if (response.success) {
                      setNotification({ type: 'success', message: 'Scan resubmitted successfully!' });
                      // Mark as synced in offline queue
                      await import('../../services/offlineDataService').then(svc => svc.markScanAsSyncedWithFallback(item.id));
                    } else {
                      setNotification({ type: 'error', message: response.error || 'Failed to resubmit scan.' });
                    }
                  } catch (err: any) {
                    setNotification({ type: 'error', message: err?.message || 'Network error.' });
                  }
                  setIsSubmitting(false);
                  // Refresh scan history
                  const scans = await getPendingScansWithFallback();
                  setScanHistory(scans);
                }}
              >Retry</button>
            )}
          </li>
        ))}
      </ul>
      {!isOnline && <div style={{color:'#f59e42', fontSize:12, marginTop:4}}>Offline: new scans will be queued for later submission.</div>}
    </div>
    </div>
  );
};

export default BarcodeScanner;