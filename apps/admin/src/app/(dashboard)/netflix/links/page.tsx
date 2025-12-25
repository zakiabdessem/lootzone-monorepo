"use client";

import styled from "@emotion/styled";
import NextLink from "next/link";
import React, { useState } from "react";

import {
    Delete as DeleteIcon,
    ContentCopy as CopyIcon,
    Check as CheckIcon,
    Link as LinkIcon,
    Edit as EditIcon,
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
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { spacing } from "@mui/system";
import { api } from "@lootzone/trpc-shared";

const Divider = styled(MuiDivider)(spacing);
const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Paper = styled(MuiPaper)(spacing);

const Spacer = styled.div`
  flex: 1 1 100%;
`;

function NetflixLinksPage() {
    const [copiedLink, setCopiedLink] = useState<string | null>(null);
    const [statusMenuAnchor, setStatusMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});

    // Fetch active access links
    const { data: linksData, isLoading, error, refetch } = api.netflix.getActiveLinks.useQuery();

    // Mutations
    const revokeLink = api.netflix.revokeLink.useMutation({
        onSuccess: () => {
            refetch();
        },
        onError: (error: { message: string }) => {
            alert(error.message);
        },
    });

    const updateLinkStatus = api.netflix.updateLinkStatus.useMutation({
        onSuccess: () => {
            refetch();
            setStatusMenuAnchor({});
        },
        onError: (error: { message: string }) => {
            alert(error.message);
        },
    });

    const handleRevoke = (id: string) => {
        if (confirm("Are you sure you want to revoke this access link? It will no longer work.")) {
            revokeLink.mutate({ id });
        }
    };

    const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>, linkId: string) => {
        setStatusMenuAnchor({ [linkId]: event.currentTarget });
    };

    const handleStatusMenuClose = (linkId: string) => {
        setStatusMenuAnchor((prev) => {
            const newState = { ...prev };
            delete newState[linkId];
            return newState;
        });
    };

    const handleStatusChange = (linkId: string, newStatus: "PAID" | "UNPAID") => {
        updateLinkStatus.mutate({ id: linkId, status: newStatus });
        handleStatusMenuClose(linkId);
    };

    const handleCopyLink = async (link: { accountId: string; roomCode: string; token: string }) => {
        // Use NEXT_PUBLIC_API_URL (trpc-app) instead of admin dashboard URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin.replace(':3002', ':3000') : '');
        const fullUrl = `${baseUrl}/netflix-access/${link.accountId}/${link.roomCode}/${link.token}`;
        
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopiedLink(link.id);
            setTimeout(() => setCopiedLink(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleString();
    };

    const isExpiringSoon = (expiresAt: Date | string) => {
        const expiry = new Date(expiresAt);
        const now = new Date();
        const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilExpiry <= 24; // Expiring within 24 hours
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
                Error loading access links: {error.message || String(error)}
            </Alert>
        );
    }

    const links = linksData || [];

    return (
        <React.Fragment>
            <Box mb={4}>
                <Breadcrumbs aria-label="Breadcrumb" mb={2}>
                    <Link component={NextLink} href="/">Dashboard</Link>
                    <Link component={NextLink} href="/netflix">Netflix</Link>
                    <Typography>Active Links</Typography>
                </Breadcrumbs>

                <Typography variant="h3" gutterBottom display="inline">
                    Active Access Links
                </Typography>
            </Box>

            <Divider my={6} />

            <Paper>
                <Toolbar>
                    <Typography variant="h6" component="div">
                        Active Links ({links.length})
                    </Typography>
                    <Spacer />
                </Toolbar>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Account Email</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell align="center">Room</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell>Expires At</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {links.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography variant="body2" color="text.secondary" py={4}>
                                            No active access links found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                links.map((link: {
                                    id: string;
                                    accountId: string;
                                    roomCode: string;
                                    token: string;
                                    createdAt: Date | string;
                                    expiresAt: Date | string;
                                    username?: string | null;
                                    notes?: string | null;
                                    status: string;
                                    account: {
                                        id: string;
                                        email: string;
                                    };
                                }) => {
                                    const isExpiring = isExpiringSoon(link.expiresAt);
                                    const isCopied = copiedLink === link.id;
                                    const isPaid = link.status === "PAID";
                                    
                                    return (
                                        <TableRow key={link.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {link.account.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {link.username || "-"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={`Room ${link.roomCode}`}
                                                    size="small"
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(link.createdAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(link.expiresAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Chip
                                                        label={link.status}
                                                        size="small"
                                                        color={isPaid ? "success" : "error"}
                                                        sx={{
                                                            backgroundColor: isPaid ? "#4caf50" : "#f44336",
                                                            color: "white",
                                                            fontWeight: "medium",
                                                        }}
                                                    />
                                                    <Tooltip title="Change Status">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => handleStatusMenuOpen(e, link.id)}
                                                            disabled={updateLinkStatus.isPending}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Menu
                                                        anchorEl={statusMenuAnchor[link.id]}
                                                        open={!!statusMenuAnchor[link.id]}
                                                        onClose={() => handleStatusMenuClose(link.id)}
                                                        anchorOrigin={{
                                                            vertical: "bottom",
                                                            horizontal: "left",
                                                        }}
                                                        transformOrigin={{
                                                            vertical: "top",
                                                            horizontal: "left",
                                                        }}
                                                    >
                                                        <MenuItem
                                                            onClick={() => handleStatusChange(link.id, "PAID")}
                                                            selected={link.status === "PAID"}
                                                            disabled={link.status === "PAID"}
                                                            sx={{
                                                                opacity: link.status === "PAID" ? 0.6 : 1,
                                                            }}
                                                        >
                                                            <Chip
                                                                label="PAID"
                                                                size="small"
                                                                color="success"
                                                                sx={{
                                                                    backgroundColor: "#4caf50",
                                                                    color: "white",
                                                                    mr: 1,
                                                                }}
                                                            />
                                                            <ListItemText primary="Mark as Paid" />
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={() => handleStatusChange(link.id, "UNPAID")}
                                                            selected={link.status === "UNPAID"}
                                                            disabled={link.status === "UNPAID"}
                                                            sx={{
                                                                opacity: link.status === "UNPAID" ? 0.6 : 1,
                                                            }}
                                                        >
                                                            <Chip
                                                                label="UNPAID"
                                                                size="small"
                                                                color="error"
                                                                sx={{
                                                                    backgroundColor: "#f44336",
                                                                    color: "white",
                                                                    mr: 1,
                                                                }}
                                                            />
                                                            <ListItemText primary="Mark as Unpaid" />
                                                        </MenuItem>
                                                    </Menu>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary"
                                                    sx={{
                                                        maxWidth: 200,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                    title={link.notes || undefined}
                                                >
                                                    {link.notes || "-"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Copy Link">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleCopyLink(link)}
                                                        color={isCopied ? "success" : "default"}
                                                    >
                                                        {isCopied ? <CheckIcon /> : <CopyIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Revoke Link">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRevoke(link.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </React.Fragment>
    );
}

export default NetflixLinksPage;

