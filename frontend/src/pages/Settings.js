
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const API_BASE = "http://127.0.0.1:8000";

const Settings = () => {
  const [backendStatus, setBackendStatus] = useState("checking");
  const [checking, setChecking] = useState(false);
  const [showExpired, setShowExpired] = useState(true);
  const [sortUrgent, setSortUrgent] = useState(false);

  const checkBackend = async () => {
    setChecking(true);
    setBackendStatus("checking");

    try {
      const response = await fetch(`${API_BASE}/`, {
        signal: AbortSignal.timeout(5000),
      });

      setBackendStatus(response.ok ? "connected" : "error");
    } catch {
      setBackendStatus("offline");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const cardStyle = {
    p: { xs: 2.5, md: 3 },
    borderRadius: "18px",
    border: "1px solid #e5ebe6",
    bgcolor: "#fff",
    boxShadow: "0 5px 22px rgba(25,60,40,0.04)",
  };

  const statusConfig = {
    checking: { label: "Checking...", color: "#b45309", bg: "#fff5e5" },
    connected: { label: "Reachable", color: "#16845b", bg: "#e8f6ee" },
    offline: { label: "Unavailable", color: "#c62828", bg: "#fff0ef" },
    error: { label: "Unexpected response", color: "#b45309", bg: "#fff5e5" },
  };

  const status = statusConfig[backendStatus];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="body2"
          sx={{ color: "#16845b", fontWeight: 800, mb: 1 }}
        >
          SMARTFOODAI / PREFERENCES
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: 28, md: 36 },
            fontWeight: 800,
            color: "#1c2c23",
            letterSpacing: "-1px",
          }}
        >
          Settings
        </Typography>

        <Typography sx={{ mt: 1, color: "#78857c" }}>
          Manage your local app preferences and check service availability.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: "20px",
          color: "#fff",
          background: "linear-gradient(110deg, #105d43, #16845b, #36a675)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <SettingsOutlinedIcon />
          <Typography sx={{ color: "#fff", fontSize: 21, fontWeight: 800 }}>
            Your SmartFoodAI workspace
          </Typography>
        </Box>
        <Typography sx={{ color: "#e0f3e8", lineHeight: 1.8, maxWidth: 650 }}>
          Check your backend connection, adjust inventory display preferences,
          and learn how this food management app works.
        </Typography>
      </Paper>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ ...cardStyle, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "13px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#e8f6ee",
                  color: "#16845b",
                }}
              >
                <DnsOutlinedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 17 }}>
                  Backend service
                </Typography>
                <Typography variant="body2" sx={{ color: "#78857c" }}>
                  FastAPI connection check
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "#edf1ed", mb: 2 }} />

            <Typography variant="body2" sx={{ color: "#78857c", mb: 1 }}>
              API address
            </Typography>
            <Typography
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: "10px",
                bgcolor: "#f6f8f5",
                overflowWrap: "anywhere",
                fontSize: 13,
              }}
            >
              {API_BASE}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Chip
                label={status.label}
                sx={{
                  color: status.color,
                  bgcolor: status.bg,
                  fontWeight: 700,
                }}
              />

              <Button
                onClick={checkBackend}
                disabled={checking}
                startIcon={
                  checking ? (
                    <CircularProgress size={16} />
                  ) : (
                    <RefreshRoundedIcon />
                  )
                }
                sx={{
                  textTransform: "none",
                  color: "#16845b",
                  fontWeight: 700,
                }}
              >
                Check connection
              </Button>
            </Box>

            {backendStatus === "connected" && (
              <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: "#78857c" }}>
                The API root responded. This does not guarantee that every model or endpoint is working.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ ...cardStyle, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "13px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#eaf2ff",
                  color: "#3878c5",
                }}
              >
                <Inventory2OutlinedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 17 }}>
                  Inventory preferences
                </Typography>
                <Typography variant="body2" sx={{ color: "#78857c" }}>
                  Local display options
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "#edf1ed", mb: 1 }} />

            <FormControlLabel
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mx: 0,
                py: 1,
                "& .MuiFormControlLabel-label": {
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#34463a",
                },
              }}
              label="Show expired items"
              labelPlacement="start"
              control={
                <Switch
                  checked={showExpired}
                  onChange={(event) => setShowExpired(event.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#16845b" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: "#16845b",
                    },
                  }}
                />
              }
            />

            <Divider sx={{ borderColor: "#edf1ed" }} />

            <FormControlLabel
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mx: 0,
                py: 1,
                "& .MuiFormControlLabel-label": {
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#34463a",
                },
              }}
              label="Sort inventory by urgency"
              labelPlacement="start"
              control={
                <Switch
                  checked={sortUrgent}
                  onChange={(event) => setSortUrgent(event.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#16845b" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: "#16845b",
                    },
                  }}
                />
              }
            />

            <Typography variant="caption" sx={{ display: "block", color: "#78857c", mt: 1.5 }}>
              These preferences currently apply only on this page; they are not saved between reloads.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={0} sx={cardStyle}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "13px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#fff5e5",
                  color: "#b45309",
                }}
              >
                <AutoAwesomeOutlinedIcon />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                About SmartFoodAI
              </Typography>
            </Box>

            <Typography sx={{ color: "#68766d", lineHeight: 1.9, mb: 2 }}>
              SmartFoodAI helps you manage stored food, estimate shelf life,
              and track expiry dates using a local inventory and prediction API.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#f6f8f5" }}>
                  <StorageOutlinedIcon sx={{ color: "#16845b", mb: 1 }} />
                  <Typography sx={{ fontWeight: 800 }}>Food inventory</Typography>
                  <Typography variant="body2" sx={{ color: "#78857c", mt: 0.5 }}>
                    View, edit, consume and delete stored items.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#f6f8f5" }}>
                  <AutoAwesomeOutlinedIcon sx={{ color: "#16845b", mb: 1 }} />
                  <Typography sx={{ fontWeight: 800 }}>Shelf-life estimate</Typography>
                  <Typography variant="body2" sx={{ color: "#78857c", mt: 0.5 }}>
                    Estimate shelf life from selected food and storage details.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#f6f8f5" }}>
                  <InfoOutlinedIcon sx={{ color: "#16845b", mb: 1 }} />
                  <Typography sx={{ fontWeight: 800 }}>Food safety</Typography>
                  <Typography variant="body2" sx={{ color: "#78857c", mt: 0.5 }}>
                    Predictions are estimates, not a guarantee of food safety.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2.5, borderColor: "#edf1ed" }} />

            <Typography variant="caption" sx={{ color: "#78857c" }}>
              SmartFoodAI · Local development build
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
