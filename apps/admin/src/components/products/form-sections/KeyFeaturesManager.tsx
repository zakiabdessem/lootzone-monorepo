
"use client";

import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormHelperText,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useState } from "react";

interface KeyFeaturesManagerProps {
  keyFeatures: string[];
  setFieldValue: (field: string, value: any) => void;
  error?: string;
  touched?: boolean;
}

export default function KeyFeaturesManager({
  keyFeatures,
  setFieldValue,
  error,
  touched,
}: KeyFeaturesManagerProps) {
  const [newFeature, setNewFeature] = useState("");

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const updatedFeatures = [...keyFeatures, newFeature.trim()];
      setFieldValue("keyFeatures", updatedFeatures);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = keyFeatures.filter((_, i) => i !== index);
    setFieldValue("keyFeatures", updatedFeatures);
  };

  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Key Features
      </Typography>
      <TextField
        fullWidth
        label="Add new feature"
        value={newFeature}
        onChange={(e) => setNewFeature(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddFeature();
          }
        }}
        InputProps={{
          endAdornment: (
            <IconButton onClick={handleAddFeature} disabled={!newFeature.trim()}>
              <Add />
            </IconButton>
          ),
        }}
      />
      {keyFeatures.length > 0 && (
        <Paper sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
          <List>
            {keyFeatures.map((feature, index) => (
              <ListItem key={index} divider>
                <ListItemText primary={feature} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFeature(index)}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      {touched && error && (
        <FormHelperText error={true}>{error}</FormHelperText>
      )}
    </Box>
  );
}
