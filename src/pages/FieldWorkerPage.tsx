import React from 'react';
import Header from '../components/layout/Header';
import BarcodeScanner from '../components/field-worker/BarcodeScanner';
import { OrderBatchProvider } from '../contexts/OrderBatchContext';
import OrderBatchPanel from '../components/OrderBatchPanel';
import { useAuth } from '../contexts/AuthContext';

const FieldWorkerPage: React.FC = () => {
  const { state } = useAuth();

  return (
    <OrderBatchProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <main className="flex-1 p-4 max-w-md mx-auto w-full">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Crate Scanner</h1>
          <OrderBatchPanel />
          <BarcodeScanner />
        </main>
      </div>
    </OrderBatchProvider>
  );
};

export default FieldWorkerPage;