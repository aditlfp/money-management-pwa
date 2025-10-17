import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  X,
  RefreshCw,
} from "lucide-react";
import { txnApi } from "../api";
import { ApiResponse, Transaction } from "../state/types";

type TransactionFormData = Omit<Transaction, "id">;

function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const [formData, setFormData] = useState<TransactionFormData>({
    _id: "",
    userId: localStorage.getItem("_id")!,
    type: "expense",
    amount: 0,
    note: "",
    createdAt: "",
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result: ApiResponse = await txnApi.list();

      if (result.success && result.data) {
        setTransactions(result.data);
        setFilteredTransactions(result.data);
      } else {
        setError(result.message || "Failed to fetch transactions");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((txn) => txn.type === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (txn) =>
          txn.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          txn.note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [searchQuery, filterType, transactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result: ApiResponse = await txnApi.create(formData);

      if (result.success) {
        setShowModal(false);
        resetForm();
        fetchTransactions();
      } else {
        alert(result.message || "Failed to create transaction");
      }
    } catch (err) {
      alert("Failed to create transaction");
      console.error("Create error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      setDeleteLoading(id);
      const result: ApiResponse = await txnApi.del(id);

      if (result.success) {
        fetchTransactions();
      } else {
        alert(result.message || "Failed to delete transaction");
      }
    } catch (err) {
      alert("Failed to delete transaction");
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(null);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading transactions...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
            <p className="text-gray-600 mt-1">
              Manage your income and expenses
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Income</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Expense</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingDown className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by category or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg transition ${
                  filterType === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("income")}
                className={`px-4 py-2 rounded-lg transition ${
                  filterType === "income"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setFilterType("expense")}
                className={`px-4 py-2 rounded-lg transition ${
                  filterType === "expense"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Expense
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No transactions found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your filters"
                  : 'Click "Add Transaction" to create your first transaction'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((txn) => (
                <div key={txn._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          txn.type === "income"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {txn.type === "income" ? (
                          <TrendingUp className="w-6 h-6" />
                        ) : (
                          <TrendingDown className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {txn.type}
                        </h3>
                        {txn.note && (
                          <p className="text-sm text-gray-500">{txn.note}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(txn.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            txn.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {txn.type === "income" ? "+" : "-"}
                          {formatCurrency(txn.amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(txn._id)}
                        disabled={deleteLoading === txn._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      >
                        {deleteLoading === txn._id ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
                      onClick={() =>
                        setFormData({ ...formData, type: "income" })
                      }
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
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    required
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
    </div>
  );
}

export default Transactions;
