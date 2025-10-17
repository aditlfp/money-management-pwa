import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Wallet, RefreshCw } from "lucide-react";
import { overviewApi } from "../api";
import { OverviewData } from "../state/types";

const Overview = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 sm:p-8 mb-6 text-white shadow-lg">
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
    </div>
  );
};

export default Overview;
