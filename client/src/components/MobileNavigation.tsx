import { Link } from "wouter";
import { Home, List, PlusCircle, BarChart3, Settings } from "lucide-react";

interface MobileNavigationProps {
  currentPath: string;
  onAddTransaction: () => void;
}

export default function MobileNavigation({ currentPath, onAddTransaction }: MobileNavigationProps) {
  return (
    <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between">
          <Link to="/" className={`group flex flex-col items-center py-2 px-4 ${currentPath === '/' ? 'text-primary' : 'text-gray-500'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link to="/transactions" className={`group flex flex-col items-center py-2 px-4 ${currentPath === '/transactions' ? 'text-primary' : 'text-gray-500'}`}>
            <List className="h-6 w-6" />
            <span className="text-xs mt-1">Transactions</span>
          </Link>
          
          <button 
            onClick={onAddTransaction}
            className="group flex flex-col items-center py-2 px-4 text-gray-500"
          >
            <div className="rounded-full bg-primary p-1">
              <PlusCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs mt-1">Add</span>
          </button>
          
          <Link to="/budget" className={`group flex flex-col items-center py-2 px-4 ${currentPath === '/budget' ? 'text-primary' : 'text-gray-500'}`}>
            <BarChart3 className="h-6 w-6" />
            <span className="text-xs mt-1">Budget</span>
          </Link>
          
          <Link to="/accounts" className={`group flex flex-col items-center py-2 px-4 ${currentPath === '/accounts' ? 'text-primary' : 'text-gray-500'}`}>
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Accounts</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
