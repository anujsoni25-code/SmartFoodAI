
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

const menuItems = [
  { label: "Dashboard", path: "/", icon: <DashboardRoundedIcon /> },
  { label: "Add Food Item", path: "/add", icon: <AddCircleOutlineRoundedIcon /> },
  { label: "Inventory", path: "/items", icon: <Inventory2OutlinedIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsOutlinedIcon /> },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/items") {
      return location.pathname === "/items" || location.pathname === "/urgent";
    }
    return location.pathname === path;
  };

  return (
    <Box
      component="aside"
      sx={{
        width: { xs: 76, sm: 245 },
        minWidth: { xs: 76, sm: 245 },
        minHeight: "100vh",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
        borderRight: "1px solid #e5ebe6",
        px: { xs: 1, sm: 2 },
        py: 2.5,
        boxSizing: "border-box",
        zIndex: 10,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: { xs: 0, sm: 1 },
          justifyContent: { xs: "center", sm: "flex-start" },
          mb: 1,
          minHeight: 48,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: "12px",
            bgcolor: "#16845b",
            color: "#fff",
          }}
        >
          <AutoAwesomeRoundedIcon />
        </Box>
        <Typography
          sx={{
            display: { xs: "none", sm: "block" },
            fontWeight: 800,
            fontSize: 19,
            letterSpacing: "-0.6px",
            color: "#1c2c23",
            whiteSpace: "nowrap",
          }}
        >
          SmartFood<span style={{ color: "#16845b" }}>AI</span>
        </Typography>
      </Box>

      <Typography
        sx={{
          display: { xs: "none", sm: "block" },
          color: "#9aa69e",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "1.5px",
          mt: 4,
          mb: 1.5,
          px: 1.5,
        }}
      >
        WORKSPACE
      </Typography>

      <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);

          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => navigate(item.path)}
              title={item.label}
              sx={{
                minHeight: 46,
                px: { xs: 0, sm: 1.5 },
                justifyContent: { xs: "center", sm: "flex-start" },
                borderRadius: "12px",
                color: active ? "#116b49" : "#68766d",
                "&.Mui-selected": {
                  bgcolor: "#e8f6ee",
                  color: "#116b49",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "#def1e5",
                },
                "&:hover": {
                  bgcolor: "#f4f8f4",
                },
                transition: "background .2s ease",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: { xs: 0, sm: 38 },
                  justifyContent: "center",
                  color: "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  display: { xs: "none", sm: "block" },
                  "& .MuiTypography-root": {
                    fontSize: 13.5,
                    fontWeight: active ? 800 : 600,
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />

      <Divider sx={{ borderColor: "#edf1ed", mb: 2 }} />

      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          p: 1.7,
          borderRadius: "14px",
          bgcolor: "#f0f8f2",
          border: "1px solid #e0eee3",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.7 }}>
          <AutoAwesomeRoundedIcon sx={{ color: "#16845b", fontSize: 18 }} />
          <Typography sx={{ color: "#1c2c23", fontWeight: 800, fontSize: 12 }}>
            Smart food tracking
          </Typography>
        </Box>
        <Typography sx={{ color: "#78857c", fontSize: 11.5, lineHeight: 1.6 }}>
          Manage your inventory and monitor estimated shelf life.
        </Typography>
      </Box>

      <Typography
        sx={{
          display: { xs: "none", sm: "block" },
          color: "#9aa69e",
          fontSize: 10,
          textAlign: "center",
          mt: 2,
        }}
      >
        SMARTFOODAI · LOCAL APP
      </Typography>
    </Box>
  );
}
