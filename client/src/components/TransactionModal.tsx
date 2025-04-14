import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Paperclip } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const { toast } = useToast();
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense');
  
  // Form state
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [invoiceName, setInvoiceName] = useState<string>('');
  
  // Get categories and accounts for form selects
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: accounts, isLoading: isAccountsLoading } = useQuery({
    queryKey: ['/api/accounts'],
  });
  
  // Create transaction mutation
  const createTransaction = useMutation({
    mutationFn: async (transaction: any) => {
      await apiRequest("POST", "/api/transactions", transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses-by-category'] });
      queryClient.invalidateQueries({ queryKey: ['/api/monthly-overview'] });
      
      toast({
        title: "Transaction saved",
        description: "Your transaction has been recorded successfully."
      });
      
      // Reset form if continue is clicked, otherwise close
      if (!shouldKeepOpen) {
        onClose();
      }
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save transaction: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // State to track if we should keep the modal open after submit (for "Continue" button)
  const [shouldKeepOpen, setShouldKeepOpen] = useState(false);
  
  const resetForm = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime(format(new Date(), 'HH:mm'));
    setCategoryId('');
    setAccountId('');
    setToAccountId('');
    setAmount('');
    setDescription('');
    setInvoiceName('');
  };
  
  const handleSave = (keepOpen: boolean = false) => {
    setShouldKeepOpen(keepOpen);
    
    // Validate form
    if (!date) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" });
      return;
    }
    
    if (!accountId) {
      toast({ title: "Error", description: "Please select an account", variant: "destructive" });
      return;
    }
    
    if (transactionType === 'transfer' && (!toAccountId || accountId === toAccountId)) {
      toast({ 
        title: "Error", 
        description: "Please select different source and destination accounts", 
        variant: "destructive" 
      });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    
    if (transactionType !== 'transfer' && !categoryId) {
      toast({ title: "Error", description: "Please select a category", variant: "destructive" });
      return;
    }
    
    // Create the transaction date by combining date and time
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const transactionDate = new Date(year, month - 1, day, hours, minutes);
    
    // Create transaction object
    const transaction = {
      type: transactionType,
      date: transactionDate.toISOString(),
      amount: parseFloat(amount),
      description: description || undefined,
      categoryId: transactionType !== 'transfer' ? parseInt(categoryId) : undefined,
      accountId: parseInt(accountId),
      toAccountId: transactionType === 'transfer' ? parseInt(toAccountId) : undefined,
      invoiceName: invoiceName || undefined
    };
    
    // Submit
    createTransaction.mutate(transaction);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        {/* Transaction Type Tabs */}
        <Tabs 
          value={transactionType} 
          onValueChange={(value) => setTransactionType(value as 'expense' | 'income' | 'transfer')}
          className="mb-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input 
                id="time" 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          
          {/* Category - only show for expense and income */}
          {transactionType !== 'transfer' && (
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {isCategoriesLoading ? (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  ) : categories?.length ? (
                    categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No categories available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Account */}
          <div>
            <Label htmlFor="account">{transactionType === 'transfer' ? 'From Account' : 'Account'}</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                {isAccountsLoading ? (
                  <SelectItem value="loading" disabled>Loading accounts...</SelectItem>
                ) : accounts?.length ? (
                  accounts.map((account: any) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No accounts available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* To Account - only for transfers */}
          {transactionType === 'transfer' && (
            <div>
              <Label htmlFor="toAccount">To Account</Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger id="toAccount">
                  <SelectValue placeholder="Select Destination Account" />
                </SelectTrigger>
                <SelectContent>
                  {isAccountsLoading ? (
                    <SelectItem value="loading" disabled>Loading accounts...</SelectItem>
                  ) : accounts?.length ? (
                    accounts.map((account: any) => (
                      <SelectItem 
                        key={account.id} 
                        value={account.id.toString()}
                        disabled={account.id.toString() === accountId}
                      >
                        {account.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No accounts available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Amount */}
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                $
              </span>
              <Input 
                id="amount" 
                type="number" 
                placeholder="0.00" 
                className="pl-7"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          
          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input 
              id="description" 
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          {/* Invoice Attachment */}
          <div>
            <Label htmlFor="invoice">Attach Invoice (Optional)</Label>
            <div className="flex gap-2">
              <Input 
                id="invoice" 
                placeholder="Select Invoice Name"
                value={invoiceName}
                onChange={(e) => setInvoiceName(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-4 sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button 
              onClick={() => handleSave(false)} 
              disabled={createTransaction.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createTransaction.isPending ? "Saving..." : "Save"}
            </Button>
            <Button 
              onClick={() => handleSave(true)} 
              disabled={createTransaction.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              Continue
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
