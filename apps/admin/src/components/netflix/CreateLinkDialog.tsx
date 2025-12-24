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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
    Box,
    Typography,
    IconButton,
} from "@mui/material";
import { ContentCopy as CopyIcon, Check as CheckIcon } from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { api } from "@lootzone/trpc-shared";

type NetflixAccount = {
    id: string;
    email: string;
    rooms: Array<{
        id: string;
        roomCode: string;
        pinCode: string;
    }>;
};

interface CreateLinkDialogProps {
    open: boolean;
    onClose: () => void;
    account: NetflixAccount | null;
}

const CreateLinkDialog: React.FC<CreateLinkDialogProps> = ({ open, onClose, account }) => {
    const [selectedRoomCode, setSelectedRoomCode] = useState<"A" | "B" | "C" | "D" | "E">("A");
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const createLink = api.netflix.createAccessLink.useMutation({
        onSuccess: (data) => {
            const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
            const fullUrl = `${baseUrl}${data.url}`;
            setGeneratedLink(fullUrl);
            setError(null);
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setGeneratedLink(null);

        if (!account || !expiresAt) {
            setError("Please select an expiration date and time");
            return;
        }

        if (expiresAt <= new Date()) {
            setError("Expiration date must be in the future");
            return;
        }

        createLink.mutate({
            accountId: account.id,
            roomCode: selectedRoomCode,
            expiresAt,
        });
    };

    const handleCopyLink = async () => {
        if (generatedLink) {
            try {
                await navigator.clipboard.writeText(generatedLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    const handleClose = () => {
        if (!createLink.isPending) {
            setSelectedRoomCode("A");
            setExpiresAt(null);
            setError(null);
            setGeneratedLink(null);
            setCopied(false);
            onClose();
        }
    };

    if (!account) {
        return null;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Create Access Link</DialogTitle>
                    <DialogContent>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {generatedLink ? (
                            <Box>
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Access link generated successfully!
                                </Alert>
                                <Typography variant="subtitle2" gutterBottom>
                                    Share this link with your client:
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        p: 1,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        borderRadius: 1,
                                        bgcolor: "background.paper",
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            flex: 1,
                                            wordBreak: "break-all",
                                            fontFamily: "monospace",
                                        }}
                                    >
                                        {generatedLink}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={handleCopyLink}
                                        color={copied ? "success" : "default"}
                                    >
                                        {copied ? <CheckIcon /> : <CopyIcon />}
                                    </IconButton>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                    This link will expire on {expiresAt?.toLocaleString()}
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Account</InputLabel>
                                    <Select
                                        value={account.id}
                                        label="Account"
                                        disabled
                                    >
                                        <MenuItem value={account.id}>{account.email}</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl component="fieldset" sx={{ mb: 2 }}>
                                    <FormLabel component="legend">Select Room</FormLabel>
                                    <RadioGroup
                                        row
                                        value={selectedRoomCode}
                                        onChange={(e) =>
                                            setSelectedRoomCode(e.target.value as "A" | "B" | "C" | "D" | "E")
                                        }
                                    >
                                        {["A", "B", "C", "D", "E"].map((code) => (
                                            <FormControlLabel
                                                key={code}
                                                value={code}
                                                control={<Radio />}
                                                label={`Room ${code}`}
                                            />
                                        ))}
                                    </RadioGroup>
                                </FormControl>

                                <DateTimePicker
                                    label="Expiration Date & Time"
                                    value={expiresAt}
                                    onChange={(newValue) => setExpiresAt(newValue)}
                                    minDateTime={new Date()}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            margin: "normal",
                                        },
                                    }}
                                />
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} disabled={createLink.isPending}>
                            {generatedLink ? "Close" : "Cancel"}
                        </Button>
                        {!generatedLink && (
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={createLink.isPending || !expiresAt}
                            >
                                {createLink.isPending ? <CircularProgress size={24} /> : "Generate Link"}
                            </Button>
                        )}
                    </DialogActions>
                </form>
            </Dialog>
        </LocalizationProvider>
    );
};

export default CreateLinkDialog;

