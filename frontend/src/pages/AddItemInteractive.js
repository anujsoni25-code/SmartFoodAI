
import React, { useState } from "react";
import { predictShelfLife } from "../api/api";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Grid,
  CircularProgress,
} from "@mui/material";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import KitchenOutlinedIcon from "@mui/icons-material/KitchenOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

const API_BASE = "https://smartfoodai-backend.onrender.com";

const steps = ["Food name", "Category", "Storage", "Packaging", "Condition"];

const panelStyle = {
  p: { xs: 2.5, md: 4 },
  borderRadius: "20px",
  border: "1px solid #e5ebe6",
  boxShadow: "0 8px 30px rgba(25,60,40,0.05)",
  bgcolor: "#fff",
};

const primaryButton = {
  bgcolor: "#16845b",
  color: "#fff",
  textTransform: "none",
  borderRadius: "11px",
  px: 2.5,
  py: 1.25,
  fontWeight: 700,
  boxShadow: "none",
  "&:hover": { bgcolor: "#106746", boxShadow: "none" },
};

export default function AddItemInteractive() {
  const [step, setStep] = useState("name");
  const [form, setForm] = useState({
    name: "",
    category: "",
    location: "",
    packaging: "sealed",
    state: "raw",
  });
  const [prediction, setPrediction] = useState(null);
  const [customExpiry, setCustomExpiry] = useState(dayjs().add(7, "day"));
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateForm = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const autoDetectCategory = (foodName) => {
    const lower = foodName.toLowerCase();
    if (/apple|banana|grape|orange|mango|fruit|berry|pear/.test(lower)) return "fruit";
    if (/chicken|beef|meat|pork|fish|lamb|mutton/.test(lower)) return "meat";
    if (/milk|cheese|yogurt|curd|butter|cream/.test(lower)) return "dairy";
    if (/bread|rice|wheat|pasta|oat|cereal/.test(lower)) return "grain";
    if (/carrot|potato|tomato|onion|spinach|broccoli|vegetable/.test(lower)) return "vegetable";
    return "unknown";
  };

  const handleNameSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setError("");
    updateForm("category", autoDetectCategory(form.name.trim()));
    setStep("categoryConfirm");
  };

  const handleCategoryConfirm = (confirm) => {
    if (confirm && form.category !== "unknown") {
      setStep("location");
    } else {
      setStep("categoryManual");
    }
  };

  const handlePredict = async (selectedState) => {
    setLoading(true);
    setError("");
    setSaved(false);

    const nextForm = { ...form, state: selectedState };
    setForm(nextForm);

    const payload = {
      category: nextForm.category,
      location: nextForm.location.toLowerCase(),
      packaging: nextForm.packaging,
      state: nextForm.state,
      temperature:
        nextForm.location === "Fridge"
          ? 4
          : nextForm.location === "Freezer"
          ? -18
          : 20,
    };

    try {
      const result = await predictShelfLife(payload);
      if (result?.status === "error" || result?.error) {
        throw new Error(result.error || "Could not predict shelf life.");
      }
      if (typeof result?.predicted_shelf_life_days !== "number") {
        throw new Error("The API did not return a valid shelf-life estimate.");
      }

      setPrediction(result);
      setCustomExpiry(
        dayjs().add(result.predicted_shelf_life_days, "day")
      );
      setStep("done");
    } catch (err) {
      console.error("Prediction failed:", err);
      setError(
        err.message ||
          "Could not connect to the prediction service. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (useCustom = false) => {
    const chosenDate = useCustom
      ? customExpiry
      : dayjs().add(prediction?.predicted_shelf_life_days || 0, "day");

    if (!chosenDate || !chosenDate.isValid()) {
      setError("Please select a valid expiry date.");
      return;
    }

    setLoading(true);
    setError("");

    const item = {
      name: form.name.trim(),
      category: form.category,
      qty: 1,
      unit: "pcs",
      location: form.location,
      purchased_on: dayjs().format("YYYY-MM-DD"),
      expiry_on: chosenDate.format("YYYY-MM-DD"),
      source: "WebApp",
      notes: useCustom
        ? "Custom expiry date selected by user."
        : `Predicted shelf life: ${prediction?.predicted_shelf_life_days} days`,
    };

    try {
      const response = await fetch(`${API_BASE}/add_item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "The item could not be saved.");
      }

      setSaved(true);
    } catch (err) {
      console.error("Error saving item:", err);
      setError(
        err.message ||
          "Could not save the item. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = {
    name: 0,
    categoryConfirm: 1,
    categoryManual: 1,
    location: 2,
    packaging: 3,
    state: 4,
    done: 5,
  }[step];

  const OptionButton = ({ selected, icon, title, description, onClick }) => (
    <Paper
      component="button"
      type="button"
      elevation={0}
      onClick={onClick}
      sx={{
        width: "100%",
        textAlign: "left",
        p: 2.2,
        borderRadius: "14px",
        border: selected ? "2px solid #16845b" : "1px solid #e5ebe6",
        bgcolor: selected ? "#eff9f2" : "#fff",
        color: "#1c2c23",
        transition: "all .2s ease",
        "&:hover": {
          borderColor: "#16845b",
          bgcolor: "#f5fbf6",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box sx={{ color: "#16845b", mb: 1 }}>{icon}</Box>
      <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
      {description && (
        <Typography variant="body2" sx={{ color: "#78857c", mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Paper>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
        <Box sx={{ mb: 3.5 }}>
          <Typography
            variant="body2"
            sx={{ color: "#16845b", fontWeight: 800, mb: 1 }}
          >
            SMARTFOODAI / INVENTORY
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 800,
              letterSpacing: "-1px",
              color: "#1c2c23",
            }}
          >
            Add food to inventory
          </Typography>
          <Typography sx={{ mt: 1, color: "#78857c" }}>
            Tell us about your food and get an AI-powered shelf-life estimate.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            borderRadius: "18px",
            background: "linear-gradient(110deg, #105d43, #16845b)",
            color: "#fff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
            <AutoAwesomeOutlinedIcon />
            <Typography sx={{ color: "#fff", fontWeight: 800 }}>
              Smart shelf-life assistant
            </Typography>
          </Box>
          <Typography sx={{ color: "#e0f3e8", lineHeight: 1.7 }}>
            Follow a few quick steps to estimate how long your food may last.
            Predictions are estimates, not a guarantee of food safety.
          </Typography>
        </Paper>

        {step !== "done" && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" },
              gap: 1,
              mb: 3,
            }}
          >
            {steps.map((label, index) => {
              const active = index === currentStepIndex;
              const completed = index < currentStepIndex;
              return (
                <Box
                  key={label}
                  sx={{
                    p: 1.3,
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: active || completed ? "#b8dcca" : "#e5ebe6",
                    bgcolor: active || completed ? "#e8f6ee" : "#fff",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: active || completed ? "#16845b" : "#78857c",
                      fontWeight: 700,
                    }}
                  >
                    STEP {index + 1}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#1c2c23",
                      fontWeight: active ? 800 : 500,
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        <Paper elevation={0} sx={panelStyle}>
          {step === "name" && (
            <Box component="form" onSubmit={handleNameSubmit}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                What food are you adding?
              </Typography>
              <Typography sx={{ color: "#78857c", mb: 3 }}>
                Enter the food name to start the prediction.
              </Typography>
              <TextField
                fullWidth
                label="Food name"
                placeholder="e.g. Apple, Milk, Chicken breast"
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                required
                autoFocus
              />
              <Button
                type="submit"
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ ...primaryButton, mt: 2.5 }}
              >
                Continue
              </Button>
            </Box>
          )}

          {step === "categoryConfirm" && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Confirm food category
              </Typography>
              <Typography sx={{ color: "#78857c", mb: 3 }}>
                We detected a possible category for{" "}
                <b>{form.name}</b>.
              </Typography>
              <Chip
                icon={<RestaurantOutlinedIcon />}
                label={form.category}
                sx={{
                  mb: 3,
                  bgcolor: "#e8f6ee",
                  color: "#16845b",
                  fontWeight: 800,
                  "& .MuiChip-icon": { color: "#16845b" },
                }}
              />
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button
                  onClick={() => handleCategoryConfirm(true)}
                  sx={primaryButton}
                >
                  Yes, continue
                </Button>
                <Button
                  onClick={() => handleCategoryConfirm(false)}
                  sx={{
                    textTransform: "none",
                    borderRadius: "11px",
                    color: "#40594a",
                    borderColor: "#dce6df",
                  }}
                  variant="outlined"
                >
                  Change category
                </Button>
              </Box>
              <Button
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => setStep("name")}
                sx={{ mt: 2, color: "#78857c", textTransform: "none" }}
              >
                Back
              </Button>
            </Box>
          )}

          {step === "categoryManual" && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Select the correct category
              </Typography>
              <Typography sx={{ color: "#78857c", mb: 3 }}>
                Choose the category that best describes your food.
              </Typography>
              <Grid container spacing={1.5}>
                {["fruit", "vegetable", "meat", "dairy", "grain", "other"].map(
                  (category) => (
                    <Grid item xs={6} sm={4} key={category}>
                      <OptionButton
                        selected={form.category === category}
                        icon={<RestaurantOutlinedIcon />}
                        title={category.charAt(0).toUpperCase() + category.slice(1)}
                        onClick={() => updateForm("category", category)}
                      />
                    </Grid>
                  )
                )}
              </Grid>
              <Button
                onClick={() => setStep("location")}
                disabled={!form.category || form.category === "unknown"}
                sx={{ ...primaryButton, mt: 3 }}
              >
                Continue
              </Button>
            </Box>
          )}

          {step === "location" && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Where do you store it?
              </Typography>
              <Typography sx={{ color: "#78857c", mb: 3 }}>
                Storage temperature affects the shelf-life estimate.
              </Typography>
              <Grid container spacing={2}>
                {[
                  ["Fridge", "Chilled storage", "Keep refrigerated"],
                  ["Freezer", "Frozen storage", "Keep frozen"],
                  ["Pantry", "Room temperature", "Shelf or cupboard"],
                ].map(([location, title, description]) => (
                  <Grid item xs={12} sm={4} key={location}>
                    <OptionButton
                      selected={form.location === location}
                      icon={<KitchenOutlinedIcon />}
                      title={title}
                      description={description}
                      onClick={() => {
                        updateForm("location", location);
                        setStep("packaging");
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              <Button
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => setStep("categoryManual")}
                sx={{ mt: 2, color: "#78857c", textTransform: "none" }}
              >
                Back
              </Button>
            </Box>
          )}

          {step === "packaging" && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                How is it packaged?
              </Typography>
              <Typography sx={{ color: "#78857c", mb: 3 }}>
                Choose the packaging condition.
              </Typography>
              <Grid container spacing={2}>
                {[
                  ["sealed", "Sealed", "Closed or unopened packaging"],
                  ["open", "Open", "Opened or unpacked"],
                ].map(([value, title, description]) => (
                  <Grid item xs={12} sm={6} key={value}>
                    <OptionButton
                      selected={form.packaging === value}
                      icon={<Inventory2OutlinedIcon />}
                      title={title}
                      description={description}
                      onClick={() => {
                        updateForm("packaging", value);
                        setStep("state");
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              <Button
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => setStep("location")}
                sx={{ mt: 2, color: "#78857c", textTransform: "none" }}
              >
                Back
              </Button>
            </Box>
          )}

          {step === "state" && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                What is its current condition?
              </Typography>
              <Typography sx={{ color: "#78857c", mb: 3 }}>
                Select the option that best matches the food.
              </Typography>
              <Grid container spacing={2}>
                {[
                  ["raw", "Raw / fresh", "Not cooked"],
                  ["cooked", "Cooked", "Already prepared"],
                ].map(([value, title, description]) => (
                  <Grid item xs={12} sm={6} key={value}>
                    <OptionButton
                      selected={form.state === value}
                      icon={<CheckCircleOutlineRoundedIcon />}
                      title={title}
                      description={description}
                      onClick={() => {
                        updateForm("state", value);
                        handlePredict(value);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              <Button
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => setStep("packaging")}
                sx={{ mt: 2, color: "#78857c", textTransform: "none" }}
              >
                Back
              </Button>
            </Box>
          )}

          {loading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mt: 3,
                color: "#16845b",
              }}
            >
              <CircularProgress size={22} sx={{ color: "#16845b" }} />
              <Typography sx={{ fontWeight: 600 }}>
                {step === "done"
                  ? "Saving your item..."
                  : "Estimating shelf life..."}
              </Typography>
            </Box>
          )}

          {error && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: "12px",
                bgcolor: "#fff1f0",
                color: "#b42318",
              }}
            >
              {error}
            </Box>
          )}

          {step === "done" && prediction && (
            <Box>
              <Chip
                icon={<CheckCircleOutlineRoundedIcon />}
                label="Prediction complete"
                sx={{
                  bgcolor: "#e8f6ee",
                  color: "#16845b",
                  fontWeight: 800,
                  mb: 2,
                  "& .MuiChip-icon": { color: "#16845b" },
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Your shelf-life estimate
              </Typography>
              <Typography sx={{ color: "#78857c", mb: 3 }}>
                Review the details, then save this item to your inventory.
              </Typography>

              <Box
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: "16px",
                  bgcolor: "#eff9f2",
                  border: "1px solid #d7ecde",
                }}
              >
                <Typography variant="body2" sx={{ color: "#50725d" }}>
                  ESTIMATED SHELF LIFE
                </Typography>
                <Typography
                  sx={{
                    fontSize: 42,
                    fontWeight: 800,
                    color: "#16845b",
                    lineHeight: 1.3,
                  }}
                >
                  {prediction.predicted_shelf_life_days.toFixed(1)}
                  <Typography
                    component="span"
                    sx={{ fontSize: 17, fontWeight: 600, ml: 1 }}
                  >
                    days
                  </Typography>
                </Typography>
                <Typography variant="body2" sx={{ color: "#50725d", mt: 1 }}>
                  This is an estimate based on the selected category and storage
                  conditions.
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  ["Food", form.name],
                  ["Category", form.category],
                  ["Storage", form.location],
                  ["Packaging", form.packaging],
                  ["Condition", form.state],
                ].map(([label, value]) => (
                  <Grid item xs={12} sm={6} key={label}>
                    <Box
                      sx={{
                        p: 1.8,
                        border: "1px solid #e5ebe6",
                        borderRadius: "12px",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "#78857c" }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, mt: 0.5 }}>
                        {value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                Choose expiry date
              </Typography>
              <Typography variant="body2" sx={{ color: "#78857c", mb: 2 }}>
                The predicted date is preselected. You can change it if needed.
              </Typography>

              <DatePicker
                label="Expiry date"
                value={customExpiry}
                minDate={dayjs()}
                onChange={(newValue) => setCustomExpiry(newValue)}
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                  mt: 3,
                }}
              >
                <Button
                  onClick={() => handleSave(false)}
                  disabled={loading || saved}
                  sx={primaryButton}
                >
                  Use predicted date & save
                </Button>
                <Button
                  onClick={() => handleSave(true)}
                  disabled={loading || saved}
                  variant="outlined"
                  sx={{
                    borderColor: "#b8dcca",
                    color: "#16845b",
                    textTransform: "none",
                    borderRadius: "11px",
                    px: 2.5,
                    py: 1.25,
                  }}
                >
                  Use selected date & save
                </Button>
              </Box>

              {saved && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: "#e8f6ee",
                    color: "#106746",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CheckCircleOutlineRoundedIcon />
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>
                      Item saved successfully!
                    </Typography>
                    <Typography variant="body2">
                      Your item has been added to the inventory.
                    </Typography>
                  </Box>
                </Box>
              )}

              <Button
                onClick={() => {
                  setForm({
                    name: "",
                    category: "",
                    location: "",
                    packaging: "sealed",
                    state: "raw",
                  });
                  setPrediction(null);
                  setSaved(false);
                  setError("");
                  setStep("name");
                }}
                sx={{ mt: 2, color: "#78857c", textTransform: "none" }}
              >
                + Add another item
              </Button>
            </Box>
          )}
        </Paper>

        <Typography
          variant="caption"
          sx={{ display: "block", mt: 2, color: "#78857c", lineHeight: 1.7 }}
        >
          Food safety note: shelf-life predictions are estimates. Always check
          storage guidance and the food's actual condition before consuming.
        </Typography>
      </Box>
    </LocalizationProvider>
  );
}
