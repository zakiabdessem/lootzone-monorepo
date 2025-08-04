
import { Box, Button, Chip, FormControl, FormHelperText, InputLabel, TextField, Typography } from "@mui/material";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface DeliveryStepsManagerProps {
  deliverySteps: string[];
  setFieldValue: (field: string, value: any) => void;
  error?: string | string[];
  touched?: boolean;
}

export default function DeliveryStepsManager({ 
  deliverySteps, 
  setFieldValue, 
  error, 
  touched 
}: DeliveryStepsManagerProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddStep = () => {
    if (inputValue.trim()) {
      setFieldValue("deliverySteps", [...deliverySteps, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = deliverySteps.filter((_, i) => i !== index);
    setFieldValue("deliverySteps", updatedSteps);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddStep();
    }
  };

  return (
    <FormControl fullWidth error={touched && Boolean(error)}>
      <InputLabel shrink>Delivery Steps</InputLabel>
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          placeholder="Enter a delivery step"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <Button
                size="small"
                onClick={handleAddStep}
                disabled={!inputValue.trim()}
                startIcon={<Plus size={16} />}
              >
                Add
              </Button>
            ),
          }}
        />
        
        {deliverySteps.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Delivery Steps ({deliverySteps.length}):
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {deliverySteps.map((step, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ 
                    minWidth: 20, 
                    height: 20, 
                    borderRadius: "50%", 
                    backgroundColor: "#4618AC", 
                    color: "white", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: "0.75rem"
                  }}>
                    {index + 1}
                  </Typography>
                  <Chip
                    label={step}
                    onDelete={() => handleRemoveStep(index)}
                    deleteIcon={<X size={16} />}
                    variant="outlined"
                    sx={{ flex: 1, justifyContent: "space-between" }}
                  />
                </Box>
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
