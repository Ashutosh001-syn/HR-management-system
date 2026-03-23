import { useState, useEffect } from 'react';
import Topbar from '@/components/common/Topbar';
import { getAllPaySlips, updatePaySlipStatus } from '@/api/adminApi';

const Payslip = () => {
  const [payslips, setPayslips] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllPaySlips();
      if (response.success) {
        setPayslips(response.data || []);
        setCount(response.count || 0);
      } else {
        setError('Failed to fetch payslips');
        setPayslips([]);
        setCount(0);
      }
    } catch (err) {
      setError('Error fetching payslips: ' + (err.message || 'Unknown error'));
      setPayslips([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (!confirm(`Are you sure you want to ${status} payslip request #${id}?`)) return;

    try {
      setLoading(true);
      const response = await updatePaySlipStatus({ id, request_status: status });
      if (response.success) {
        alert(`${status.toUpperCase()} successful!`);
        fetchPayslips(); // Refetch updated list
      } else {
        alert('Update failed: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + (err.message || 'Update failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Payslip Requests</h1>
          <button 
            onClick={fetchPayslips}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Refreshing...
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : payslips.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payslip requests</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by enabling payslip requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payslips.map((payslip) => (
                  <tr key={payslip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payslip.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payslip.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payslip.from_date)} - {formatDate(payslip.to_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payslip.request_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        payslip.request_status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payslip.request_status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payslip.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {payslip.request_status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(payslip.id, 'approved')}
                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md text-xs hover:bg-green-100 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(payslip.id, 'rejected')}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md text-xs hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {count > 0 && (
              <div className="mt-4 text-sm text-gray-500 text-center">
                Showing {payslips.length} of {count} payslip requests
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payslip;

