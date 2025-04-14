import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Accounts() {
  const [accountName, setAccountName] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch accounts
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['/api/accounts'],
  });
  
  // Create account mutation
  const createAccount = useMutation({
    mutationFn: async (name: string) => {
      await apiRequest("POST", "/api/accounts", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setAccountName("");
      setIsAddDialogOpen(false);
      toast({
        title: "Account created",
        description: "Your new account has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create account: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update account mutation
  const updateAccount = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      await apiRequest("PUT", `/api/accounts/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setAccountName("");
      setSelectedAccount(null);
      setIsEditDialogOpen(false);
      toast({
        title: "Account updated",
        description: "Your account has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update account: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete account mutation
  const deleteAccount = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/accounts/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setSelectedAccount(null);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete account: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddAccount = () => {
    if (accountName.trim()) {
      createAccount.mutate(accountName);
    } else {
      toast({
        title: "Error",
        description: "Account name cannot be empty",
        variant: "destructive",
      });
    }
  };

  const handleEditAccount = () => {
    if (selectedAccount && accountName.trim()) {
      updateAccount.mutate({ id: selectedAccount, name: accountName });
    } else {
      toast({
        title: "Error",
        description: "Account name cannot be empty",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    if (selectedAccount) {
      deleteAccount.mutate(selectedAccount);
    }
  };

  const openEditDialog = (account: any) => {
    setSelectedAccount(account.id);
    setAccountName(account.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (account: any) => {
    setSelectedAccount(account.id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Accounts Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="border shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </CardFooter>
            </Card>
          ))
        ) : accounts?.length ? (
          // Render accounts
          accounts.map((account: any) => (
            <Card key={account.id} className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle>{account.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Use this account to track your {account.name.toLowerCase()} transactions.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => openEditDialog(account)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="text-secondary"
                  onClick={() => openDeleteDialog(account)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          // No accounts state
          <Card className="col-span-full border border-dashed p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
              <p className="text-gray-500 mb-4">Create an account to start tracking your expenses.</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add First Account
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Add Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g., Cash, Bank, Credit Card"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAccount} disabled={createAccount.isPending}>
              {createAccount.isPending ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Account Name</Label>
              <Input
                id="edit-name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditAccount} disabled={updateAccount.isPending}>
              {updateAccount.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-500">
              Are you sure you want to delete this account? All transactions associated with this account will remain in the system but will no longer be linked to this account.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount} 
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
