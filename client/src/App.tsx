import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Budget from "@/pages/Budget";
import Analysis from "@/pages/Analysis";
import Accounts from "@/pages/Accounts";
import { useState } from "react";
import TransactionModal from "@/components/TransactionModal";

function Router() {
  const [location] = useLocation();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const openTransactionModal = () => setIsTransactionModalOpen(true);
  const closeTransactionModal = () => setIsTransactionModalOpen(false);

  return (
    <Layout currentPath={location} onAddTransaction={openTransactionModal}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/transactions">
          {() => <Transactions onAddTransaction={openTransactionModal} />}
        </Route>
        <Route path="/budget" component={Budget} />
        <Route path="/analysis" component={Analysis} />
        <Route path="/accounts" component={Accounts} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>

      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={closeTransactionModal}
      />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
