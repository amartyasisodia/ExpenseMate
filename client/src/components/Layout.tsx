import { Link } from "wouter";
import MobileNavigation from "./MobileNavigation";
import { Clock, Battery, Wifi } from "lucide-react";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onAddTransaction: () => void;
}

export default function Layout({ children, currentPath, onAddTransaction }: LayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <h1 className="ml-2 text-xl font-bold text-gray-900">ExpenseMate</h1>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span>{formattedTime}</span>
            <Wifi className="h-5 w-5 ml-2" />
            <Battery className="h-5 w-5 ml-2" />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex justify-between px-4 overflow-x-auto">
          <Link to="/" className={`px-3 py-4 text-sm font-medium ${currentPath === '/' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
            Dashboard
          </Link>
          <Link to="/transactions" className={`px-3 py-4 text-sm font-medium ${currentPath === '/transactions' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
            Transactions
          </Link>
          <Link to="/budget" className={`px-3 py-4 text-sm font-medium ${currentPath === '/budget' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
            Budget
          </Link>
          <Link to="/analysis" className={`px-3 py-4 text-sm font-medium ${currentPath === '/analysis' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
            Analysis
          </Link>
          <Link to="/accounts" className={`px-3 py-4 text-sm font-medium ${currentPath === '/accounts' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
            Accounts
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {children}
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation currentPath={currentPath} onAddTransaction={onAddTransaction} />
    </div>
  );
}
