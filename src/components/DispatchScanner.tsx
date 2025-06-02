import { useState, useEffect } from 'react';
import { zohoService } from '../services/zohoService';

interface DispatchOrder {
  salesorder_id: string;
  reference_number: string;
  status: string;
}

export function DispatchScanner() {
  const [dispatchOrder, setDispatchOrder] = useState<DispatchOrder | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastScan, setLastScan] = useState<{ qrCode: string; quantity: number } | null>(null);

  // Check network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load active dispatch order
  useEffect(() => {
    const loadDispatchOrder = async () => {
      try {
        const order = await zohoService.getActiveDispatchOrder();
        setDispatchOrder(order);
      } catch (error) {
        console.error('Failed to load dispatch order:', error);
      }
    };

    loadDispatchOrder();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!qrCode) {
      alert('Please enter a QR code');
      return;
    }

    if (!dispatchOrder) {
      alert('No active dispatch order found');
      return;
    }

    try {
      await zohoService.saveCrateScan({
        qrCode,
        quantity,
        dispatchOrderId: dispatchOrder.salesorder_id,
      });
      
      setLastScan({ qrCode, quantity });
      setQrCode('');
      setQuantity(1);
      
      // Focus the QR code input for the next scan
      const qrInput = document.getElementById('qrCode');
      if (qrInput) qrInput.focus();
      
    } catch (error) {
      console.error('Error saving scan:', error);
      alert('Failed to save scan. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Dispatch Scanner</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800">Active Dispatch Order</h3>
        {dispatchOrder ? (
          <div className="mt-2">
            <p><span className="font-medium">Order #:</span> {dispatchOrder.reference_number}</p>
            <p><span className="font-medium">Status:</span> {dispatchOrder.status}</p>
          </div>
        ) : (
          <p className="text-yellow-600 mt-2">Loading order details...</p>
        )}
      </div>

      {!isOnline && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
          You are currently offline. Scans will be saved locally and synced when you're back online.
        </div>
      )}

      <form onSubmit={handleScan} className="space-y-4">
        <div>
          <label htmlFor="qrCode" className="block text-sm font-medium text-gray-700">
            QR Code
          </label>
          <input
            type="text"
            id="qrCode"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Scan or enter QR code"
            autoComplete="off"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={!qrCode || !dispatchOrder}
        >
          {isOnline ? 'Save Scan' : 'Save Locally (Offline)'}
        </button>
      </form>

      {lastScan && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800">Last Scan</h3>
          <p className="mt-1">
            QR: {lastScan.qrCode} | Qty: {lastScan.quantity}
          </p>
          <p className="text-sm text-green-600 mt-2">
            {isOnline ? 'Scan saved successfully!' : 'Scan saved locally and will sync when online'}
          </p>
        </div>
      )}
    </div>
  );
}

export default DispatchScanner;
