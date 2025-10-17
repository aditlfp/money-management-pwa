import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./state/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { balanceApi, txnApi } from "./api";
import { db } from "./db";
import Overview from "./pages/Overview";
import {
  Menu,
  X,
  Wallet,
  LogOut,
  User,
  LayoutDashboard,
  Receipt,
  DollarSign,
} from "lucide-react";
import Transactions from "./pages/Transactions";
import { Transaction } from "./state/types";
import Balances from "./pages/Balance";

function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/transactions", label: "Transactions", icon: Receipt },
    { path: "/balance", label: "Balance", icon: DollarSign },
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block">Finance App</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isActive(path)
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}

              {/* User Menu */}
              <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    User
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {"User"}
                    </p>
                    <p className="text-xs text-gray-500">User</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {navLinks.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        isActive(path)
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition text-center font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

interface RequireAuthProps {
  children: React.ReactNode;
}

function RequireAuth({ children }: RequireAuthProps) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  React.useEffect(() => {
    const syncHandler = async () => {
      const unsynced = await db.transactions
        .where("synced")
        .equals(0)
        .toArray();

      for (const txn of unsynced) {
        // map local Dexie record to API schema
        const payload: Omit<Transaction, "_id"> = {
          userId: String(txn.userId),
          type:
            txn.type === "income" || txn.type === "expense"
              ? txn.type
              : "expense",
          amount: txn.amount,
          note: txn.note ?? "",
          createdAt: new Date().toISOString(),
        };

        const res = await txnApi.create(payload);

        if (res.success && txn._id !== undefined) {
          await db.transactions.update(txn._id, { synced: 1 });
        }
      }

      const unsyncedBalances = await db.balances
        .where("synced")
        .equals(0)
        .toArray();
      for (const bln of unsyncedBalances) {
        const res = await balanceApi.create(bln);
        if ((res.success == true, bln._id !== undefined)) {
          await db.balances.update(bln._id, { synced: 1 });
        }
      }
      console.log("✅ Synced local transactions & balances");
    };

    window.addEventListener("online", syncHandler);
    return () => window.removeEventListener("online", syncHandler);
  }, []);

  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Overview />
                </RequireAuth>
              }
            />
            <Route
              path="/transactions"
              element={
                <RequireAuth>
                  <Transactions />
                </RequireAuth>
              }
            />
            <Route
              path="/balance"
              element={
                <RequireAuth>
                  <Balances />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
