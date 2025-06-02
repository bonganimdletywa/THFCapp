import React, { useState } from 'react';
import { useOrderBatch, OrderType } from '../contexts/OrderBatchContext';
import { useAuth } from '../contexts/AuthContext';

const OrderBatchPanel: React.FC = () => {
  const {
    activeOrderBatch,
    setActiveOrderBatch,
    orderBatches,
    createOrderBatch,
    closeOrderBatch
  } = useOrderBatch();
  const { state: authState } = useAuth();
  const userRole = authState.user?.role;
  const [refInput, setRefInput] = useState('');
  const [typeInput, setTypeInput] = useState<OrderType>('dispatch');

  // Permission helpers
  const canCreateDispatch = userRole === 'dispatch_coordinator';
  const canCreateDonation = userRole === 'zoho_admin';
  const canCreate = (typeInput === 'dispatch' && canCreateDispatch) || (typeInput === 'donation' && canCreateDonation);
  const canClose = (batch: any) => (
    (batch.type === 'dispatch' && canCreateDispatch) ||
    (batch.type === 'donation' && canCreateDonation)
  );

  return (
    <div style={{border:'1px solid #ddd', borderRadius:8, padding:16, marginBottom:24, background:'#fafbfc'}}>
      <h3 style={{marginTop:0}}>Order/Batch Management</h3>
      <div style={{marginBottom:12}}>
        <select value={typeInput} onChange={e => setTypeInput(e.target.value as OrderType)}>
          <option value="dispatch">Dispatch Order</option>
          <option value="donation">Donation Batch</option>
        </select>
        <input
          style={{marginLeft:8, marginRight:8}}
          type="text"
          placeholder="Reference"
          value={refInput}
          onChange={e => setRefInput(e.target.value)}
          disabled={!canCreate}
        />
        <button
          onClick={() => {
            if (!refInput.trim()) return;
            try {
              createOrderBatch(typeInput, refInput.trim());
              setRefInput('');
            } catch (err: any) {
              alert(err.message || 'Permission denied');
            }
          }}
          disabled={!canCreate || !refInput.trim()}
          title={!canCreate ? 'You do not have permission to create this batch/order.' : ''}
        >Create</button>
        {!canCreate && (
          <span style={{color:'#b91c1c', fontSize:12, marginLeft:8}}>
            You do not have permission to create this type.
          </span>
        )}
      </div>

      <div style={{marginBottom:12}}>
        <b>Active:</b> {activeOrderBatch ? `${activeOrderBatch.type.toUpperCase()} - ${activeOrderBatch.reference}` : 'None'}
        {activeOrderBatch && activeOrderBatch.status === 'open' && canClose(activeOrderBatch) && (
          <button style={{marginLeft:12}} onClick={() => {
            try {
              closeOrderBatch(activeOrderBatch.id);
            } catch (err: any) {
              alert(err.message || 'Permission denied');
            }
          }}>Close</button>
        )}
        {activeOrderBatch && activeOrderBatch.status === 'open' && !canClose(activeOrderBatch) && (
          <span style={{color:'#b91c1c', fontSize:12, marginLeft:8}}>
            You do not have permission to close this batch/order.
          </span>
        )}
      </div>

      <div>
        <b>All Batches:</b>
        <ul style={{listStyle:'none', padding:0}}>
          {orderBatches.map(batch => (
            <li key={batch.id} style={{marginBottom:4, color: batch.status==='closed' ? '#888' : '#222'}}>
              <span
                style={{cursor:'pointer', fontWeight: activeOrderBatch?.id === batch.id ? 'bold' : undefined}}
                onClick={() => setActiveOrderBatch(batch)}
              >
                {batch.type.toUpperCase()} - {batch.reference} ({batch.status})
              </span>
              {batch.status === 'closed' && batch.closedAt && (
                <span style={{fontSize:12, marginLeft:8}}>
                  Closed: {new Date(batch.closedAt).toLocaleString()}
                </span>
              )}
              <span style={{fontSize:12, marginLeft:8}}>Crates: {batch.crateIds.length}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderBatchPanel;
