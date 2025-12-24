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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
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

interface EditPinModalProps {
    open: boolean;
    onClose: () => void;
    account: NetflixAccount | null;
    roomCode: string;
}

const EditPinModal: React.FC<EditPinModalProps> = ({ open, onClose, account, roomCode: initialRoomCode }) => {
    const [selectedRoomCode, setSelectedRoomCode] = useState(initialRoomCode);
    const [pinCode, setPinCode] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Get current PIN for selected room
    useEffect(() => {
        if (account && selectedRoomCode) {
            const room = account.rooms?.find((r: any) => r.roomCode === selectedRoomCode);
            setPinCode(room?.pinCode || "");
        }
    }, [account, selectedRoomCode]);

    const updatePin = api.netflix.updateRoomPin.useMutation({
        onSuccess: () => {
            setPinCode("");
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

        if (!account || !selectedRoomCode || !pinCode) {
            setError("All fields are required");
            return;
        }

        updatePin.mutate({
            accountId: account.id,
            roomCode: selectedRoomCode as "A" | "B" | "C" | "D" | "E",
            pinCode,
        });
    };

    const handleClose = () => {
        if (!updatePin.isPending) {
            setPinCode("");
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
                <DialogTitle>Edit Room PIN</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Room</InputLabel>
                        <Select
                            value={selectedRoomCode}
                            label="Room"
                            onChange={(e) => setSelectedRoomCode(e.target.value as "A" | "B" | "C" | "D" | "E")}
                            disabled={updatePin.isPending}
                        >
                            {["A", "B", "C", "D", "E"].map((code) => (
                                <MenuItem key={code} value={code}>
                                    Room {code}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        autoFocus
                        margin="dense"
                        label="PIN Code"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        disabled={updatePin.isPending}
                        required
                        inputProps={{ maxLength: 10 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={updatePin.isPending}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={updatePin.isPending}
                    >
                        {updatePin.isPending ? <CircularProgress size={24} /> : "Update PIN"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditPinModal;

