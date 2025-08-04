
"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  PersonOff as PersonOffIcon,
  CleaningServices as CleanupIcon,
} from "@mui/icons-material";
import { api } from "@lootzone/trpc-shared";

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
      refetch();
      setConfirmDialog({ open: false, type: 'session' });
    },
  });

  const revokeUserSessionsMutation = api.session.revokeUserSessions.useMutation({
    onSuccess: () => {
      refetch();
      setConfirmDialog({ open: false, type: 'user' });
    },
  });

  const cleanupMutation = api.session.cleanupExpiredSessions.useMutation({
    onSuccess: () => {
      refetch();
      setConfirmDialog({ open: false, type: 'cleanup' });
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

  return (
    <>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Session Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<CleanupIcon />}
          onClick={handleCleanup}
          disabled={cleanupMutation.isPending}
        >
          Cleanup Expired Sessions
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Active Sessions ({sessionsData?.total || 0})
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Session Token</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessionsData?.sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={session.user.role}
                        color={session.user.role === 'ADMIN' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {session.sessionToken.substring(0, 20)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(session.expires).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isExpired(session.expires) ? 'Expired' : 'Active'}
                        color={isExpired(session.expires) ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revokeSessionMutation.isPending}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRevokeUserSessions(session.user.id, session.user.email)}
                        disabled={revokeUserSessionsMutation.isPending}
                      >
                        <PersonOffIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: 'session' })}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          {confirmDialog.type === 'session' && (
            <Alert severity="warning">
              Are you sure you want to revoke this session? The user will be logged out immediately.
            </Alert>
          )}
          {confirmDialog.type === 'user' && (
            <Alert severity="warning">
              Are you sure you want to revoke all sessions for {confirmDialog.userEmail}? 
              The user will be logged out from all devices.
            </Alert>
          )}
          {confirmDialog.type === 'cleanup' && (
            <Alert severity="info">
              This will remove all expired sessions from the database. This action cannot be undone.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: 'session' })}>
            Cancel
          </Button>
          <Button onClick={executeAction} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
