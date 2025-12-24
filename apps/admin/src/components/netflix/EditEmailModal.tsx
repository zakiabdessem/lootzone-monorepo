"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
    CircularProgress,
} from "@mui/material";
import { api } from "@lootzone/trpc-shared";

interface EditEmailModalProps {
    open: boolean;
    onClose: () => void;
    account: {
        id: string;
        email: string;
    } | null;
}

const EditEmailModal: React.FC<EditEmailModalProps> = ({ open, onClose, account }) => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Reset email when account changes or modal opens
    useEffect(() => {
        if (open && account) {
            setEmail(account.email);
            setError(null);
        }
    }, [open, account]);

    const updateAccount = api.netflix.update.useMutation({
        onSuccess: () => {
            setEmail("");
            setError(null);
            onClose();
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!account || !email) {
            setError("Email is required");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Invalid email format");
            return;
        }

        // Don't update if email hasn't changed
        if (email === account.email) {
            onClose();
            return;
        }

        updateAccount.mutate({
            id: account.id,
            email,
        });
    };

    const handleClose = () => {
        if (!updateAccount.isPending) {
            setEmail("");
            setError(null);
            onClose();
        }
    };

    if (!account) {
        return null;
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Change Email for Account</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Current Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={account.email}
                        disabled
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        margin="dense"
                        label="New Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={updateAccount.isPending}
                        required
                        placeholder="new@email.com"
                        InputProps={{
                            inputProps: {
                                pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
                            },
                        }}
                    />

                    <Alert severity="info" sx={{ mt: 2 }}>
                        Make sure the new email is valid and not already in use by another account.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={updateAccount.isPending}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={updateAccount.isPending || !email || email === account.email}
                    >
                        {updateAccount.isPending ? <CircularProgress size={24} /> : "Update Email"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditEmailModal;

