
import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
} from "@mui/material";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import KitchenOutlinedIcon from "@mui/icons-material/KitchenOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const stats = [
  {
    title: "Total Food Items",
    value: "—",
    note: "Your food inventory",
    icon: <RestaurantOutlinedIcon />,
    color: "#16845b",
    bg: "#e8f6ee",
  },
  {
    title: "Fresh Inventory",
    value: "—",
    note: "Items in good condition",
    icon: <KitchenOutlinedIcon />,
    color: "#3878c5",
    bg: "#eaf2ff",
  },
  {
    title: "Expiring Soon",
    value: "—",
    note: "Check items that need attention",
    icon: <AccessTimeOutlinedIcon />,
    color: "#d97706",
    bg: "#fff3df",
  },
];

const Dashboard = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1500, mx: "auto" }}>
      {/* Welcome section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{ color: "#16845b", fontWeight: 700, mb: 1 }}
          >
            SMARTFOODAI / OVERVIEW
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-1.2px",
              color: "#1c2c23",
              fontSize: { xs: 27, md: 34 },
            }}
          >
            Your smart food dashboard
          </Typography>

          <Typography sx={{ color: "#78857c", mt: 1 }}>
            Manage your food inventory and keep track of freshness.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => {
            window.dispatchEvent(new CustomEvent("smartfoodai:add-item"));
          }}
          sx={{
            bgcolor: "#16845b",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "11px",
            px: 2.5,
            py: 1.3,
            boxShadow: "none",
            "&:hover": { bgcolor: "#106746", boxShadow: "none" },
          }}
        >
          Add food item
        </Button>
      </Box>

      {/* AI banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3.5,
          borderRadius: "20px",
          color: "#fff",
          background:
            "linear-gradient(115deg, #105d43 0%, #16845b 55%, #36a675 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: "35px solid rgba(255,255,255,0.07)",
            right: -45,
            top: -95,
          }}
        />

        <Box sx={{ position: "relative", maxWidth: 650 }}>
          <Chip
            icon={<AutoAwesomeOutlinedIcon />}
            label="AI-POWERED FOOD MANAGEMENT"
            sx={{
              bgcolor: "rgba(255,255,255,0.14)",
              color: "#fff",
              mb: 2,
              fontWeight: 700,
              "& .MuiChip-icon": { color: "#d4f8df" },
            }}
          />

          <Typography
            variant="h5"
            sx={{ fontWeight: 800, mb: 1.2, color: "#fff" }}
          >
            Less food waste. Smarter choices.
          </Typography>

          <Typography sx={{ color: "#e0f3e8", lineHeight: 1.8, mb: 2.5 }}>
            Track your food, estimate shelf life, and make better decisions
            about what to consume first.
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "#d4f8df", fontWeight: 600 }}
          >
            Smart tracking starts with your inventory.
          </Typography>
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <Paper
              elevation={0}
              sx={{
                p: 2.7,
                height: "100%",
                border: "1px solid #e5ebe6",
                borderRadius: "17px",
                bgcolor: "#fff",
                transition: "transform .2s, box-shadow .2s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 30px rgba(25,60,40,.08)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#78857c", fontWeight: 600 }}
                >
                  {stat.title}
                </Typography>

                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "13px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: stat.bg,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>

              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "#1c2c23", mb: 1 }}
              >
                {stat.value}
              </Typography>

              <Typography variant="body2" sx={{ color: "#78857c" }}>
                {stat.note}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Lower panels */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              border: "1px solid #e5ebe6",
              borderRadius: "17px",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Quick actions
            </Typography>

            <Typography variant="body2" sx={{ color: "#78857c", mb: 2.5 }}>
              Get started with your food inventory.
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("smartfoodai:add-item")
                  )
                }
                sx={{
                  textTransform: "none",
                  borderColor: "#b8dcca",
                  color: "#16845b",
                  borderRadius: "10px",
                  py: 1.1,
                }}
              >
                Add a food item
              </Button>

              <Button
                variant="text"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("smartfoodai:view-items")
                  )
                }
                sx={{
                  textTransform: "none",
                  color: "#16845b",
                  borderRadius: "10px",
                }}
              >
                View inventory
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              border: "1px solid #e5ebe6",
              borderRadius: "17px",
              bgcolor: "#f0f8f2",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 1.5,
              }}
            >
              <AutoAwesomeOutlinedIcon sx={{ color: "#16845b" }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Smart tip
              </Typography>
            </Box>

            <Typography sx={{ color: "#40594a", lineHeight: 1.8 }}>
              Store perishable foods at the appropriate temperature and
              check their condition regularly. Use shelf-life estimates as
              a guide, not as a guarantee of food safety.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
