import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";
import { overviewApi, txnApi } from "../api";
import { ApiResponse, OverviewData, Transaction } from "../state/types";

type TransactionFormData = Omit<Transaction, "id">;

const Overview = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState<TransactionFormData>({
    _id: "",
    userId: localStorage.getItem("_id")!,
    type: "expense",
    amount: 0,
    note: "",
    createdAt: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result: ApiResponse = await txnApi.create(formData);

      if (result.success) {
        setShowModal(false);
        resetForm();
        fetchOverview();
      } else {
        alert(result.message || "Failed to create transaction");
      }
    } catch (err) {
      alert("Failed to create transaction");
      console.error("Create error:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      _id: "",
      userId: "",
      type: "expense",
      amount: 0,
      note: "",
      createdAt: "",
    });
  };

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await overviewApi.get();
      if (response.success && response.data) {
        const raw = response.data;

        const normalized: OverviewData = {
          totalIncome: Number(raw.totalIncome) || 0,
          totalExpense: Number(raw.totalExpense) || 0,
          currentBalance: Number(raw.currentBalance) || 0,
          baseBalance: Number(raw.baseBalance) || 0,
          lastUpdated: raw.lastUpdated || new Date().toISOString(),
        };

        setData(normalized);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to fetch overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={fetchOverview}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const netBalance = data.totalIncome - data.totalExpense;
  const isPositive = netBalance >= 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Financial Overview
          </h1>
          <button
            onClick={fetchOverview}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        {/* Main Balance Card */}
        <div
          className={`bg-gradient-to-br rounded-2xl p-6 sm:p-8 mb-6 text-white shadow-lg ${
            data.currentBalance < 0
              ? "from-red-500 to-red-600"
              : "from-blue-500 to-blue-600"
          }`}
        >
          <p className="text-xs sm:text-sm opacity-90 mb-2">Current Balance</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 break-words">
            {formatCurrency(data.currentBalance)}
          </h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90">
            <Wallet className="w-4 h-4 flex-shrink-0" />
            <span className="break-words">
              Base Balance: {formatCurrency(data.baseBalance)}
            </span>
          </div>
        </div>

        {/* Income & Expense Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Income Card */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total Income
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
                    {formatCurrency(data.totalIncome)}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${
                    (data.totalIncome /
                      (data.totalIncome + data.totalExpense)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Expense Card */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-red-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total Expense
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
                    {formatCurrency(data.totalExpense)}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500"
                style={{
                  width: `${
                    (data.totalExpense /
                      (data.totalIncome + data.totalExpense)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Net Balance Summary */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Net Flow</p>
              <p
                className={`text-2xl sm:text-3xl font-bold break-words ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {formatCurrency(netBalance)}
              </p>
            </div>
            <div
              className={`p-3 sm:p-4 rounded-full flex-shrink-0 ml-4 ${
                isPositive ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: {formatDate(data.lastUpdated)}
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Add Transaction
              </h2>
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income" })}
                    className={`p-3 rounded-lg border-2 transition ${
                      formData.type === "income"
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Income</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, type: "expense" })
                    }
                    className={`p-3 rounded-lg border-2 transition ${
                      formData.type === "expense"
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <TrendingDown className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Expense</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute required left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block required text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  required
                  readOnly
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Salary, Food, Transport"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add details about this transaction"
                  rows={3}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
