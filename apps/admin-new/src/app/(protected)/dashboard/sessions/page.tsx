"use client";

import { useState } from "react";
import { api } from "@lootzone/trpc-shared";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, UserX, Trash } from "lucide-react";

export default function SessionsPage() {
  const [page, setPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'session' | 'user' | 'cleanup';
    id?: string;
    userEmail?: string;
  }>({ open: false, type: 'session' });

  const { data: sessionsData, refetch } = api.session.getAllSessions.useQuery({
    page,
    limit: 10,
  });

  const revokeSessionMutation = api.session.revokeSession.useMutation({
    onSuccess: () => {
      toast.success('Session revoked successfully!');
      refetch();
      setConfirmDialog({ open: false, type: 'session' });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const revokeUserSessionsMutation = api.session.revokeUserSessions.useMutation({
    onSuccess: () => {
      toast.success('All user sessions revoked successfully!');
      refetch();
      setConfirmDialog({ open: false, type: 'user' });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const cleanupMutation = api.session.cleanupExpiredSessions.useMutation({
    onSuccess: () => {
      toast.success('Expired sessions cleaned up successfully!');
      refetch();
      setConfirmDialog({ open: false, type: 'cleanup' });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleRevokeSession = (sessionId: string) => {
    setConfirmDialog({ open: true, type: 'session', id: sessionId });
  };

  const handleRevokeUserSessions = (userId: string, userEmail: string) => {
    setConfirmDialog({ open: true, type: 'user', id: userId, userEmail });
  };

  const handleCleanup = () => {
    setConfirmDialog({ open: true, type: 'cleanup' });
  };

  const executeAction = () => {
    switch (confirmDialog.type) {
      case 'session':
        if (confirmDialog.id) {
          revokeSessionMutation.mutate({ sessionId: confirmDialog.id });
        }
        break;
      case 'user':
        if (confirmDialog.id) {
          revokeUserSessionsMutation.mutate({ userId: confirmDialog.id });
        }
        break;
      case 'cleanup':
        cleanupMutation.mutate();
        break;
    }
  };

  const isExpired = (expires: Date) => new Date(expires) < new Date();

  const getConfirmMessage = () => {
    switch (confirmDialog.type) {
      case 'session':
        return 'Are you sure you want to revoke this session?';
      case 'user':
        return `Are you sure you want to revoke all sessions for ${confirmDialog.userEmail}?`;
      case 'cleanup':
        return 'Are you sure you want to clean up all expired sessions?';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session Management</h1>
          <p className="text-muted-foreground">
            Manage user sessions and authentication tokens
          </p>
        </div>
        <Button onClick={handleCleanup} variant="outline">
          <Trash className="h-4 w-4 mr-2" />
          Cleanup Expired
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Session ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>User Agent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionsData?.sessions?.map((session: any) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{session.user?.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {session.user?.firstName} {session.user?.lastName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {session.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {new Date(session.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(session.expiresAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isExpired(session.expiresAt) ? "destructive" : "default"}>
                      {isExpired(session.expiresAt) ? "Expired" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {session.ipAddress || 'N/A'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {session.userAgent || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeUserSessions(session.userId, session.user?.email || '')}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{getConfirmMessage()}</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
              >
                Cancel
              </Button>
              <Button
                onClick={executeAction}
                disabled={revokeSessionMutation.isPending || revokeUserSessionsMutation.isPending || cleanupMutation.isPending}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
