"use client";

import React, { useState } from "react";
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

interface NetflixAccountFormProps {
    open: boolean;
    onClose: () => void;
}

const NetflixAccountForm: React.FC<NetflixAccountFormProps> = ({ open, onClose }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const createAccount = api.netflix.create.useMutation({
        onSuccess: () => {
            setEmail("");
            setPassword("");
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

        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        createAccount.mutate({ email, password });
    };

    const handleClose = () => {
        if (!createAccount.isPending) {
            setEmail("");
            setPassword("");
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Create Netflix Account</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={createAccount.isPending}
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={createAccount.isPending}
                        required
                    />

                    <Alert severity="info" sx={{ mt: 2 }}>
                        This will create a Netflix account with 5 rooms (A, B, C, D, E), each with a default PIN of "0000".
                        You can edit the PINs after creation.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={createAccount.isPending}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={createAccount.isPending}
                    >
                        {createAccount.isPending ? <CircularProgress size={24} /> : "Create"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default NetflixAccountForm;

