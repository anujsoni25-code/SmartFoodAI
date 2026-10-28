
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import { useLocation } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

const pageTitles = {
  "/": "Dashboard",
  "/add": "Add Food Item",
  "/items": "Food Inventory",
  "/urgent": "Urgent Items",
  "/settings": "Settings",
};

export default function Topbar() {
  const location = useLocation();
  const [connected, setConnected] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    try {
      const response = await fetch(`${API_BASE}/`, {
        signal: AbortSignal.timeout(4000),
      });
      setConnected(response.ok);
    } catch {
      setConnected(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const title = pageTitles[location.pathname] || "SmartFoodAI";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.94)",
        color: "#1c2c23",
        borderBottom: "1px solid #e5ebe6",
        backdropFilter: "blur(12px)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "72px !important",
          px: { xs: 2, md: 4 },
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 11,
              color: "#16845b",
              fontWeight: 800,
              letterSpacing: 1.1,
              mb: 0.3,
            }}
          >
            SMARTFOODAI / WORKSPACE
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 18, md: 21 },
              fontWeight: 800,
              letterSpacing: "-0.4px",
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Chip
            icon={
              connected === true ? (
                <WifiRoundedIcon />
              ) : (
                <WifiOffRoundedIcon />
              )
            }
            label={
              connected === null
                ? "Checking API"
                : connected
                ? "API reachable"
                : "API unavailable"
            }
            size="small"
            sx={{
              display: { xs: "none", sm: "flex" },
              fontWeight: 700,
              bgcolor:
                connected === true
                  ? "#e8f6ee"
                  : connected === false
                  ? "#fff0ef"
                  : "#f1f5f9",
              color:
                connected === true
                  ? "#16845b"
                  : connected === false
                  ? "#c62828"
                  : "#64748b",
              "& .MuiChip-icon": { color: "inherit" },
            }}
          />

          <Tooltip title="Check backend connection">
            <span>
              <IconButton
                onClick={checkConnection}
                disabled={checking}
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid #e5ebe6",
                  borderRadius: "12px",
                  color: "#16845b",
                  "&:hover": { bgcolor: "#e8f6ee" },
                }}
              >
                <RefreshRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
