
import { Box, Button, Chip, FormControl, FormHelperText, InputLabel, TextField, Typography } from "@mui/material";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface ImportantNotesManagerProps {
  importantNotes: string[];
  setFieldValue: (field: string, value: any) => void;
  error?: string | string[];
  touched?: boolean;
}

export default function ImportantNotesManager({ 
  importantNotes, 
  setFieldValue, 
  error, 
  touched 
}: ImportantNotesManagerProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddNote = () => {
    if (inputValue.trim()) {
      setFieldValue("importantNotes", [...importantNotes, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveNote = (index: number) => {
    const updatedNotes = importantNotes.filter((_, i) => i !== index);
    setFieldValue("importantNotes", updatedNotes);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <FormControl fullWidth error={touched && Boolean(error)}>
      <InputLabel shrink>Important Notes</InputLabel>
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          placeholder="Enter an important note"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <Button
                size="small"
                onClick={handleAddNote}
                disabled={!inputValue.trim()}
                startIcon={<Plus size={16} />}
              >
                Add
              </Button>
            ),
          }}
        />
        
        {importantNotes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Important Notes ({importantNotes.length}):
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {importantNotes.map((note, index) => (
                <Chip
                  key={index}
                  label={note}
                  onDelete={() => handleRemoveNote(index)}
                  deleteIcon={<X size={16} />}
                  variant="outlined"
                  sx={{ maxWidth: "100%" }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        {touched && error && (
          <FormHelperText>
            {Array.isArray(error) ? error.join(", ") : error}
          </FormHelperText>
        )}
      </Box>
    </FormControl>
  );
}
