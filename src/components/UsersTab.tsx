import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const UsersTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      // Assuming you might want to order by balance or joined date later, ignoring for now as fields may not exist
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(allUsers);
      setPermissionError(false);
    }, (error: any) => {
      console.error(error);
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        setPermissionError(true);
      } else {
        toast.error('Failed to load users');
      }
    });
    return unsubscribe;
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Coins in Circulation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-emerald-500">
              {users.reduce((acc, user) => acc + (user.balance || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/10">
          <h3 className="font-semibold text-lg">Registered Users</h3>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="text-right">Balance (Coins)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.photoUrl || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(user.firstName || user.username || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold">{user.firstName || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground font-mono">{user.uid || user.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.username ? (
                        <span className="text-sm">@{user.username}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-medium">{user.balance?.toLocaleString() || 0}</span>
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
