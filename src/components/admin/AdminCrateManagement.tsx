import React, { useState } from 'react';
import CrateQrCode from './CrateQrCode';
import { createCrateInZoho, fetchCrateDetails } from '../../services/api';

const AdminCrateManagement: React.FC = () => {
  const [newlyCreatedCrateId, setNewlyCreatedCrateId] = useState<string | null>(null);
  const [crateDetails, setCrateDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new crate via backend/Zoho
  const handleCreateCrate = async (crateData: any) => {
    setLoading(true);
    setError(null);
    setNewlyCreatedCrateId(null);
    try {
      const result = await createCrateInZoho(crateData);
      setNewlyCreatedCrateId(result.data?.crate_id);
    } catch (e: any) {
      setError(e.message || 'Error creating crate');
    } finally {
      setLoading(false);
    }
  };

  // Fetch details for an existing crate
  const handleFetchCrate = async (idToFetch: string) => {
    setLoading(true);
    setError(null);
    setCrateDetails(null);
    try {
      const result = await fetchCrateDetails(idToFetch);
      setCrateDetails(result);
    } catch (e: any) {
      setError(e.message || 'Error fetching crate details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto', padding: 24 }}>
      <h2>Admin Crate Management</h2>
      {/* Simulated form: Replace with real form fields as needed */}
      <button onClick={() => handleCreateCrate({ name: 'New Crate XYZ' })} style={{ marginBottom: 16 }} disabled={loading}>
        {loading ? 'Creating...' : 'Create Test Crate'}
      </button>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      {newlyCreatedCrateId && (
        <div>
          <h3>Newly Created Crate QR Code:</h3>
          <CrateQrCode crateId={newlyCreatedCrateId} size={256} />
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />

      {crateDetails && (
        <div>
          <h3>Existing Crate Details:</h3>
          {crateDetails.name && <p>Name: {crateDetails.name}</p>}
          <CrateQrCode crateId={crateDetails.id || crateDetails.crate_id} size={128} />
        </div>
      )}
      <button onClick={() => handleFetchCrate('EXISTING_CRATE_123')} disabled={loading}>
        {loading ? 'Loading...' : 'Load Existing Crate for QR'}
      </button>
    </div>
  );
};

export default AdminCrateManagement;
