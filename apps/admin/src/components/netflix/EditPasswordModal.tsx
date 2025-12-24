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
    IconButton,
    InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { api } from "@lootzone/trpc-shared";

interface EditPasswordModalProps {
    open: boolean;
    onClose: () => void;
    account: {
        id: string;
        email: string;
    } | null;
}

const EditPasswordModal: React.FC<EditPasswordModalProps> = ({ open, onClose, account }) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateAccount = api.netflix.update.useMutation({
        onSuccess: () => {
            setPassword("");
            setConfirmPassword("");
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

        if (!account || !password) {
            setError("Password is required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 1) {
            setError("Password cannot be empty");
            return;
        }

        updateAccount.mutate({
            id: account.id,
            password,
        });
    };

    const handleClose = () => {
        if (!updateAccount.isPending) {
            setPassword("");
            setConfirmPassword("");
            setError(null);
            setShowPassword(false);
            onClose();
        }
    };

    if (!account) {
        return null;
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Change Password for {account.email}</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={updateAccount.isPending}
                        required
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        margin="dense"
                        label="Confirm Password"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={updateAccount.isPending}
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Alert severity="info" sx={{ mt: 2 }}>
                        Password will be saved exactly as entered, preserving uppercase and lowercase letters.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={updateAccount.isPending}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={updateAccount.isPending || !password || password !== confirmPassword}
                    >
                        {updateAccount.isPending ? <CircularProgress size={24} /> : "Update Password"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditPasswordModal;

