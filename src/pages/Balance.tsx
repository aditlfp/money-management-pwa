import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Wallet,
  DollarSign,
  X,
  RefreshCw,
  Calendar,
  FileText,
} from "lucide-react";
import { balanceApi } from "../api";
import { ApiResponse, Balance } from "../state/types";

type BalanceFormData = {
  amount: number;
  note: string;
};

function Balances() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState<BalanceFormData>({
    amount: 0,
    note: "",
  });

  const fetchBalances = async () => {
    try {
      setLoading(true);
      setError(null);
      const result: ApiResponse<Balance[]> = await balanceApi.list();

      if (result.success && Array.isArray(result.data)) {
        setBalances(result.data);
      } else {
        console.error("Unexpected data format:", result.data);
        setBalances([]);
        setError(result.message || "Failed to fetch balances");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    try {
      setSubmitLoading(true);
      const result: ApiResponse<Balance> = await balanceApi.create(formData);

      if (result.success) {
        setShowModal(false);
        resetForm();
        fetchBalances();
      } else {
        alert(result.message || "Failed to create balance");
      }
    } catch (err) {
      console.error("Create error:", err);
      alert("Failed to create balance");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this balance record?"))
      return;

    try {
      setDeleteLoading(id);
      const result: ApiResponse<null> = await balanceApi.del(id);

      if (result.success) {
        fetchBalances();
      } else {
        alert(result.message || "Failed to delete balance");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete balance");
    } finally {
      setDeleteLoading(null);
    }
  };

  const resetForm = () => {
    setFormData({ amount: 0, note: "" });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const totalBalance = Array.isArray(balances)
    ? balances.reduce((sum, b) => sum + b.amount, 0)
    : 0;

  const averageBalance =
    Array.isArray(balances) && balances.length > 0
      ? totalBalance / balances.length
      : 0;

  const latestBalance =
    Array.isArray(balances) && balances.length > 0 ? balances[0] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading balance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Balance Management
            </h1>
            <p className="text-gray-600 mt-1">
              Track and manage your base balances
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchBalances}
              className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-md border border-gray-200"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Add Balance</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Balance */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Total Balance</p>
              <div className="bg-white/20 p-2 rounded-lg">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
            <p className="text-xs opacity-75 mt-2">
              {balances.length} record(s)
            </p>
          </div>

          {/* Average Balance */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Average Balance</p>
              <div className="bg-white/20 p-2 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(averageBalance)}
            </p>
            <p className="text-xs opacity-75 mt-2">Per record</p>
          </div>

          {/* Latest Balance */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Latest Balance</p>
              <div className="bg-white/20 p-2 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold">
              {latestBalance ? formatCurrency(latestBalance.amount) : "N/A"}
            </p>
            <p className="text-xs opacity-75 mt-2">
              {latestBalance
                ? formatDate(latestBalance.createdAt)
                : "No records"}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Balance List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              Balance Records
            </h2>
          </div>

          {balances.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No balance records found</p>
              <p className="text-gray-400 text-sm mt-2">
                Click "Add Balance" to create your first balance record
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {balances.map((balance) => (
                <div
                  key={balance._id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Wallet className="w-6 h-6 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-2xl font-bold text-gray-800">
                            {formatCurrency(balance.amount)}
                          </h3>
                        </div>

                        {balance.note && (
                          <div className="flex items-start gap-2 mb-2">
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-600 text-sm">
                              {balance.note}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Created: {formatDate(balance.createdAt)}
                            </span>
                          </div>
                          {balance.updatedAt &&
                            balance.updatedAt !== balance.createdAt && (
                              <div className="flex items-center gap-1">
                                <RefreshCw className="w-4 h-4" />
                                <span>
                                  Updated: {formatDate(balance.updatedAt)}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(balance._id)}
                      disabled={deleteLoading === balance._id}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 flex-shrink-0"
                      title="Delete balance"
                    >
                      {deleteLoading === balance._id ? (
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Balance Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Add Balance</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute required left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      Rp
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the base balance amount
                  </p>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a note about this balance (optional)"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Describe the source or purpose of this balance
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    disabled={submitLoading}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Add Balance</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Balances;
