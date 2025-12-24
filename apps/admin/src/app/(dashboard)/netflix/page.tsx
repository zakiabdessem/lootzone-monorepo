"use client";

import styled from "@emotion/styled";
import React, { useState } from "react";

import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Link as LinkIcon,
    Lock as LockIcon,
} from "@mui/icons-material";
import {
    Box,
    Button,
    IconButton,
    Link,
    Breadcrumbs as MuiBreadcrumbs,
    Divider as MuiDivider,
    Paper as MuiPaper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Toolbar,
    Tooltip,
    Typography,
    Chip,
    CircularProgress,
    Alert,
} from "@mui/material";
import { spacing } from "@mui/system";
import { api } from "@lootzone/trpc-shared";
import NetflixAccountForm from "@/components/netflix/NetflixAccountForm";
import EditPinModal from "@/components/netflix/EditPinModal";
import CreateLinkDialog from "@/components/netflix/CreateLinkDialog";

const Divider = styled(MuiDivider)(spacing);
const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Paper = styled(MuiPaper)(spacing);

const Spacer = styled.div`
  flex: 1 1 100%;
`;

function NetflixPage() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editPinDialogOpen, setEditPinDialogOpen] = useState(false);
    const [createLinkDialogOpen, setCreateLinkDialogOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<{
        id: string;
        email: string;
        rooms: Array<{
            id: string;
            roomCode: string;
            pinCode: string;
        }>;
    } | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<string>("A");

    // Fetch Netflix accounts
    const { data: accountsData, isLoading, error, refetch } = api.netflix.getAll.useQuery();

    // Mutations
    const deleteAccount = api.netflix.delete.useMutation({
        onSuccess: () => {
            refetch();
        },
        onError: (error: { message: string }) => {
            alert(error.message);
        },
    });

    const handleDelete = (id: string, email: string) => {
        if (confirm(`Are you sure you want to delete the account "${email}"? This will also delete all associated rooms and access links.`)) {
            deleteAccount.mutate({ id });
        }
    };

    const handleEditPin = (account: { id: string; email: string; rooms: Array<{ id: string; roomCode: string; pinCode: string }> }, roomCode: string) => {
        setSelectedAccount(account);
        setSelectedRoom(roomCode);
        setEditPinDialogOpen(true);
    };

    const handleCreateLink = (account: { id: string; email: string; rooms: Array<{ id: string; roomCode: string; pinCode: string }> }) => {
        setSelectedAccount(account);
        setCreateLinkDialogOpen(true);
    };

    const getRoomPin = (account: { rooms?: Array<{ roomCode: string; pinCode: string }> }, roomCode: string) => {
        const room = account.rooms?.find((r) => r.roomCode === roomCode);
        return room?.pinCode || "N/A";
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                Error loading Netflix accounts: {(error as Error).message}
            </Alert>
        );
    }

    const accounts = accountsData || [];

    return (
        <React.Fragment>
            <Box mb={4}>
                <Breadcrumbs aria-label="Breadcrumb" mb={2}>
                    <Link href="/">Dashboard</Link>
                    <Typography>Netflix</Typography>
                </Breadcrumbs>

                <Typography variant="h3" gutterBottom display="inline">
                    Netflix Account Management
                </Typography>
            </Box>

            <Divider my={6} />

            <Paper>
                <Toolbar>
                    <Typography variant="h6" component="div">
                        Netflix Accounts
                    </Typography>
                    <Spacer />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Add Account
                    </Button>
                </Toolbar>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Email</TableCell>
                                <TableCell align="center">Room A</TableCell>
                                <TableCell align="center">Room B</TableCell>
                                <TableCell align="center">Room C</TableCell>
                                <TableCell align="center">Room D</TableCell>
                                <TableCell align="center">Room E</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {accounts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography variant="body2" color="text.secondary" py={4}>
                                            No Netflix accounts found. Click "Add Account" to create one.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                accounts.map((account: {
                                    id: string;
                                    email: string;
                                    rooms: Array<{
                                        id: string;
                                        roomCode: string;
                                        pinCode: string;
                                    }>;
                                }) => (
                                    <TableRow key={account.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {account.email}
                                            </Typography>
                                        </TableCell>
                                        {["A", "B", "C", "D", "E"].map((roomCode) => (
                                            <TableCell key={roomCode} align="center">
                                                <Tooltip title={`Click to edit PIN for Room ${roomCode}`}>
                                                    <Chip
                                                        icon={<LockIcon />}
                                                        label={getRoomPin(account, roomCode)}
                                                        size="small"
                                                        onClick={() => handleEditPin(account, roomCode)}
                                                        sx={{ cursor: "pointer" }}
                                                    />
                                                </Tooltip>
                                            </TableCell>
                                        ))}
                                        <TableCell align="right">
                                            <Tooltip title="Create Access Link">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleCreateLink(account)}
                                                    color="primary"
                                                >
                                                    <LinkIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Account">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(account.id, account.email)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Create Account Dialog */}
            <NetflixAccountForm
                open={createDialogOpen}
                onClose={() => {
                    setCreateDialogOpen(false);
                    refetch();
                }}
            />

            {/* Edit PIN Dialog */}
            <EditPinModal
                open={editPinDialogOpen}
                onClose={() => {
                    setEditPinDialogOpen(false);
                    setSelectedAccount(null);
                    refetch();
                }}
                account={selectedAccount}
                roomCode={selectedRoom}
            />

            {/* Create Link Dialog */}
            <CreateLinkDialog
                open={createLinkDialogOpen}
                onClose={() => {
                    setCreateLinkDialogOpen(false);
                    setSelectedAccount(null);
                }}
                account={selectedAccount}
            />
        </React.Fragment>
    );
}

export default NetflixPage;

