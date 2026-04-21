import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Withdrawal } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const WithdrawalsTab = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'withdrawals'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allWithdrawals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Withdrawal));
      setWithdrawals(allWithdrawals);
      setPermissionError(false);
    }, (error: any) => {
      console.error(error);
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        setPermissionError(true);
      } else {
        toast.error('Failed to load withdrawals');
      }
    });
    return unsubscribe;
  }, []);

  const handleAction = async (withdrawal: Withdrawal, action: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to mark this request as ${action}?`)) return;
    
    setProcessingId(withdrawal.id);
    try {
      // 1. Update withdrawal status
      await updateDoc(doc(db, 'withdrawals', withdrawal.id), {
        status: action
      });

      // 2. If rejected, refund the coins back to the user
      if (action === 'rejected') {
        const userRef = doc(db, 'users', withdrawal.userId);
        await updateDoc(userRef, {
          balance: increment(withdrawal.amount) // refund
        });
        toast.success(`Request REJECTED. Refunded ${withdrawal.amount} coins to user.`);
      } else {
        toast.success('Request APPROVED successfully.');
      }
      setPermissionError(false);
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        setPermissionError(true);
      } else {
        toast.error('Failed to process withdrawal: ' + error.message);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'pending') return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
    if (status === 'approved') return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Approved</Badge>;
    if (status === 'rejected') return <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20">Rejected</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  if (permissionError) {
    return (
      <Card className="bg-destructive/10 border-destructive shadow-none max-w-2xl text-destructive-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Database Permission Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Your Firebase database is currently locked. The AI Assistant cannot update your database security rules automatically because Firebase blocks external systems from altering security configurations.
          </p>
          <p className="font-bold">To fix this, please follow these steps:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-bold">Firebase Console</a> and open your project.</li>
            <li>Click on <b>Firestore Database</b> in the left menu.</li>
            <li>Go to the <b>Rules</b> tab.</li>
            <li>Replace all the code there with the following:</li>
          </ol>
          <pre className="bg-background/50 p-4 rounded-md font-mono text-sm border border-destructive/20 select-all overflow-x-auto text-foreground">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
          </pre>
          <p>Click <b>Publish</b>, then reload this page.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
            I have updated the rules, Reload Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10">
          <h3 className="font-semibold text-lg">Withdrawal Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Method & Number</TableHead>
                <TableHead className="text-right">Amount (Coins)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No withdrawal requests found
                  </TableCell>
                </TableRow>
              ) : (
                withdrawals.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-mono text-xs text-muted-foreground">{item.userId}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : 'Just now'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold uppercase text-xs tracking-wider text-primary">{item.method}</span>
                        <span className="font-mono mt-1">{item.number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-bold text-lg">{item.amount.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleAction(item, 'approved')}
                            disabled={processingId === item.id}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleAction(item, 'rejected')}
                            disabled={processingId === item.id}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic mr-2">Processed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
