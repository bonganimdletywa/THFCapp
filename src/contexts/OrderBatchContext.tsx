import { createContext, useContext, useState, ReactNode } from 'react';

export type OrderType = 'dispatch' | 'donation';

export interface OrderBatch {
  id: string;
  remoteId?: string; // Zoho/Lambda id
  type: OrderType;
  reference: string;
  status: 'open' | 'closed';
  createdAt: string;
  closedAt?: string;
  crateIds: string[];
  error?: string;
}

interface OrderBatchContextType {
  activeOrderBatch: OrderBatch | null;
  setActiveOrderBatch: (batch: OrderBatch | null) => void;
  orderBatches: OrderBatch[];
  createOrderBatch: (type: OrderType, reference: string) => OrderBatch;
  closeOrderBatch: (id: string) => void;
  assignCrateToBatch: (crateId: string) => void;
}

const OrderBatchContext = createContext<OrderBatchContextType | undefined>(undefined);

import {
  createDispatchOrder,
  createDonationBatch,
  finalizeDispatchOrder,
  finalizeDonationBatch
} from '../services/api';
import { useAuth } from './AuthContext';

export const OrderBatchProvider = ({ children }: { children: ReactNode }) => {
  const [orderBatches, setOrderBatches] = useState<OrderBatch[]>([]);
  const [activeOrderBatch, setActiveOrderBatch] = useState<OrderBatch | null>(null);
  const { state: authState } = useAuth();
  const userRole = authState.user?.role;

  // Async create order/batch and sync to backend
  const createOrderBatch = (type: OrderType, reference: string): OrderBatch => {
    const newBatch: OrderBatch = {
      id: `${type}-${Date.now()}`,
      type,
      reference,
      status: 'open',
      createdAt: new Date().toISOString(),
      crateIds: [],
    };
    setOrderBatches(prev => [newBatch, ...prev]);
    setActiveOrderBatch(newBatch);

    // Backend sync
    (async () => {
      try {
        if (type === 'dispatch') {
          const response = await createDispatchOrder({
            dispatch_order_ref: reference,
            crate_items: []
          });
          if (response.success && response.data) {
            setOrderBatches(prev => prev.map(b => b.id === newBatch.id ? { ...b, remoteId: response.data?.dispatch_order_id } : b));
          } else {
            setOrderBatches(prev => prev.map(b => b.id === newBatch.id ? { ...b, error: response.error || 'Failed to sync dispatch order' } : b));
          }
        } else if (type === 'donation') {
          const response = await createDonationBatch({
            donation_batch_ref: reference,
            crate_items: [],
            source_breakdown: { uplifted: 0, thfc_baked: 0 }
          });
          if (response.success && response.data) {
            setOrderBatches(prev => prev.map(b => b.id === newBatch.id ? { ...b, remoteId: response.data?.package_id } : b));
          } else {
            setOrderBatches(prev => prev.map(b => b.id === newBatch.id ? { ...b, error: response.error || 'Failed to sync donation batch' } : b));
          }
        }
      } catch (err: any) {
        setOrderBatches(prev => prev.map(b => b.id === newBatch.id ? { ...b, error: err.message || 'Failed to sync batch' } : b));
      }
    })();
    return newBatch;
  };

  // Async close order/batch and sync to backend
  const closeOrderBatch = (id: string) => {
    const batch = orderBatches.find(b => b.id === id);
    if (!batch) return;
    // Role-based permission check
    if (
      (batch.type === 'dispatch' && userRole !== 'dispatch_coordinator') ||
      (batch.type === 'donation' && userRole !== 'zoho_admin')
    ) {
      throw new Error('Permission denied: You do not have access to close this type of batch/order.');
    }
    setOrderBatches(prev => prev.map(batch =>
      batch.id === id ? { ...batch, status: 'closed', closedAt: new Date().toISOString() } : batch
    ));
    if (activeOrderBatch?.id === id) {
      setActiveOrderBatch(null);
    }
    // Backend sync
    if (batch.type === 'dispatch' && batch.remoteId) {
      (async () => {
        try {
          await finalizeDispatchOrder(batch.remoteId!);
        } catch (err: any) {
          setOrderBatches(prev => prev.map(b => b.id === id ? { ...b, error: err.message || 'Failed to close dispatch order' } : b));
        }
      })();
    } else if (batch.type === 'donation' && batch.remoteId) {
      (async () => {
        try {
          await finalizeDonationBatch(batch.remoteId!);
        } catch (err: any) {
          setOrderBatches(prev => prev.map(b => b.id === id ? { ...b, error: err.message || 'Failed to close donation batch' } : b));
        }
      })();
    }
  };

  const assignCrateToBatch = (crateId: string) => {
    if (!activeOrderBatch || activeOrderBatch.status !== 'open') return;
    setOrderBatches(prev =>
      prev.map(batch =>
        batch.id === activeOrderBatch.id
          ? { ...batch, crateIds: [...batch.crateIds, crateId] }
          : batch
      )
    );
    setActiveOrderBatch(batch =>
      batch ? { ...batch, crateIds: [...batch.crateIds, crateId] } : batch
    );
  };

  return (
    <OrderBatchContext.Provider value={{
      activeOrderBatch,
      setActiveOrderBatch,
      orderBatches,
      createOrderBatch,
      closeOrderBatch,
      assignCrateToBatch
    }}>
      {children}
    </OrderBatchContext.Provider>
  );
};

export const useOrderBatch = () => {
  const ctx = useContext(OrderBatchContext);
  if (!ctx) throw new Error('useOrderBatch must be used within an OrderBatchProvider');
  return ctx;
};
