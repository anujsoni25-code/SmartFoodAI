
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

const API_BASE = "https://smartfoodai-backend.onrender.com";

const green = "#16845b";

function getDaysLeft(item) {
  if (item.days_left === "Expired") return -1;

  if (typeof item.days_left === "number") {
    return item.days_left;
  }

  if (item.expiry_on) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(`${item.expiry_on}T00:00:00`);
    if (!Number.isNaN(expiry.getTime())) {
      return Math.ceil((expiry - today) / 86400000);
    }
  }

  return null;
}

function getStatus(days) {
  if (days === null) {
    return {
      label: "Unknown",
      color: "#64748b",
      bg: "#f1f5f9",
      border: "#e2e8f0",
    };
  }

  if (days < 0) {
    return {
      label: "Expired",
      color: "#c62828",
      bg: "#fff0ef",
      border: "#ffd5d2",
    };
  }

  if (days <= 3) {
    return {
      label: days === 0 ? "Expires today" : "Expiring soon",
      color: "#b45309",
      bg: "#fff5e5",
      border: "#ffe3b3",
    };
  }

  return {
    label: "Fresh",
    color: "#16845b",
    bg: "#e8f6ee",
    border: "#ccebd8",
  };
}

export default function ItemsList({ urgent = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [sortUrgent, setSortUrgent] = useState(urgent);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = urgent
        ? `${API_BASE}/list_items_urgent`
        : `${API_BASE}/list_items`;

      const res = await fetch(endpoint);

      if (!res.ok) {
        throw new Error("Could not load inventory.");
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.items || [];
      setItems(list);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(
        "Could not connect to the backend. Check that FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }, [urgent]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete_item/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed.");
      await fetchItems();
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Unable to delete this item. Please try again.");
    }
  };

  const handleConsume = async (item) => {
    const amountText = window.prompt(
      `Enter amount to consume (${item.unit || "units"}):`,
      "1"
    );

    if (amountText === null || amountText.trim() === "") return;

    const amount = Number(amountText);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid quantity greater than zero.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/consume_item/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) throw new Error("Consume failed.");
      await fetchItems();
    } catch (err) {
      console.error("Error consuming item:", err);
      setError("Unable to update consumed quantity. Please try again.");
    }
  };

  const handleEdit = async () => {
    if (!editItem) return;

    setActionLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/update_item/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem),
      });

      if (!res.ok) throw new Error("Update failed.");

      setEditItem(null);
      await fetchItems();
    } catch (err) {
      console.error("Error updating item:", err);
      setError("Unable to update this item. Please check the values and retry.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = items.filter((item) =>
      [item.name, item.category, item.location]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );

    if (!sortUrgent) return filtered;

    return [...filtered].sort((a, b) => {
      const da = getDaysLeft(a);
      const db = getDaysLeft(b);
      const pa = da === null ? Infinity : da;
      const pb = db === null ? Infinity : db;
      return pa - pb;
    });
  }, [items, search, sortUrgent]);

  const stats = useMemo(() => {
    let expired = 0;
    let soon = 0;
    let fresh = 0;

    items.forEach((item) => {
      const days = getDaysLeft(item);
      if (days === null) return;
      if (days < 0) expired += 1;
      else if (days <= 3) soon += 1;
      else fresh += 1;
    });

    return { total: items.length, expired, soon, fresh };
  }, [items]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: green }} />
          <Typography sx={{ mt: 2, color: "#78857c" }}>
            Loading your inventory...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1500, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexWrap: "wrap",
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{ color: green, fontWeight: 800, mb: 1 }}
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
            {urgent ? "Items needing attention" : "Your food inventory"}
          </Typography>
          <Typography sx={{ mt: 1, color: "#78857c" }}>
            Track quantities, check expiry dates and manage your stored food.
          </Typography>
        </Box>

        <Button
          variant={sortUrgent ? "contained" : "outlined"}
          startIcon={<SortRoundedIcon />}
          onClick={() => setSortUrgent((value) => !value)}
          sx={{
            textTransform: "none",
            borderRadius: "11px",
            fontWeight: 700,
            px: 2,
            py: 1.2,
            ...(sortUrgent
              ? { bgcolor: green, "&:hover": { bgcolor: "#106746" } }
              : { borderColor: "#b8dcca", color: green }),
          }}
        >
          {sortUrgent ? "Urgency: On" : "Sort by urgency"}
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        {[
          {
            title: "Total items",
            value: stats.total,
            icon: <Inventory2OutlinedIcon />,
            color: green,
            bg: "#e8f6ee",
          },
          {
            title: "Expiring soon",
            value: stats.soon,
            icon: <AccessTimeRoundedIcon />,
            color: "#b45309",
            bg: "#fff5e5",
          },
          {
            title: "Expired items",
            value: stats.expired,
            icon: <RestaurantOutlinedIcon />,
            color: "#c62828",
            bg: "#fff0ef",
          },
          {
            title: "Fresh items",
            value: stats.fresh,
            icon: <CheckCircleOutlineRoundedIcon />,
            color: "#3878c5",
            bg: "#eaf2ff",
          },
        ].map((stat) => (
          <Grid item xs={6} md={3} key={stat.title}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 2.5 },
                height: "100%",
                border: "1px solid #e5ebe6",
                borderRadius: "16px",
                bgcolor: "#fff",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: "#78857c", fontWeight: 600 }}>
                  {stat.title}
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "12px",
                    color: stat.color,
                    bgcolor: stat.bg,
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
              <Typography sx={{ fontSize: 30, fontWeight: 800, color: "#1c2c23" }}>
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <TextField
        fullWidth
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search food, category or storage..."
        sx={{
          mb: 3,
          bgcolor: "#fff",
          "& .MuiOutlinedInput-root": {
            borderRadius: "13px",
            "& fieldset": { borderColor: "#e5ebe6" },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ color: "#78857c" }} />
            </InputAdornment>
          ),
          endAdornment: search ? (
            <InputAdornment position="end">
              <IconButton onClick={() => setSearch("")} size="small">
                ×
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {error && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: "12px",
            bgcolor: "#fff1f0",
            color: "#b42318",
          }}
        >
          <Typography>{error}</Typography>
          <Button
            startIcon={<RefreshRoundedIcon />}
            onClick={fetchItems}
            sx={{ mt: 1, textTransform: "none", color: "#b42318" }}
          >
            Try again
          </Button>
        </Paper>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: 1,
        }}
      >
        <Typography sx={{ fontWeight: 800, color: "#1c2c23" }}>
          Food items
        </Typography>
        <Typography variant="body2" sx={{ color: "#78857c" }}>
          {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}
        </Typography>
      </Box>

      {filteredItems.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            border: "1px dashed #cbd9ce",
            borderRadius: "18px",
            bgcolor: "#fff",
          }}
        >
          <Inventory2OutlinedIcon sx={{ fontSize: 44, color: "#9aafa0", mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {search ? "No matching items" : "Your inventory is empty"}
          </Typography>
          <Typography sx={{ mt: 1, color: "#78857c" }}>
            {search
              ? "Try a different food name or category."
              : "Add a food item to start tracking its shelf life."}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {filteredItems.map((item) => {
            const days = getDaysLeft(item);
            const status = getStatus(days);

            return (
              <Grid item xs={12} sm={6} lg={4} key={item.id}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid #e5ebe6",
                    borderLeft: `5px solid ${status.color}`,
                    borderRadius: "16px",
                    overflow: "hidden",
                    bgcolor: "#fff",
                    transition: "transform .2s, box-shadow .2s",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 28px rgba(25,60,40,.08)",
                    },
                  }}
                >
                  <Box sx={{ p: 2.5, flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 1,
                        mb: 1.5,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 19,
                            fontWeight: 800,
                            color: "#1c2c23",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {item.name || "Unnamed item"}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.6, color: "#78857c" }}>
                          {item.category || "Uncategorised"}{" "}
                          <Box component="span" sx={{ mx: 0.5 }}>•</Box>
                          {item.location || "Storage unknown"}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={status.label}
                        sx={{
                          flexShrink: 0,
                          fontWeight: 700,
                          color: status.color,
                          bgcolor: status.bg,
                          border: `1px solid ${status.border}`,
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        mt: 2.5,
                        p: 2,
                        borderRadius: "12px",
                        bgcolor: "#f7f9f7",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "#78857c", mb: 0.6 }}>
                        Quantity
                      </Typography>
                      <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                        {item.qty ?? "—"} {item.unit || ""}
                      </Typography>

                      <Typography variant="body2" sx={{ color: "#78857c", mb: 0.6 }}>
                        Expiry date
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {item.expiry_on || "Not specified"}
                      </Typography>

                      <Typography variant="body2" sx={{ color: "#78857c", mt: 1.5 }}>
                        Shelf-life status
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: status.color, mt: 0.3 }}>
                        {days === null
                          ? "Unknown"
                          : days < 0
                          ? `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} past expiry`
                          : days === 0
                          ? "Expires today"
                          : `${days} day${days === 1 ? "" : "s"} remaining`}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderTop: "1px solid #edf1ed",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => setEditItem({ ...item })}
                      sx={{ color: green, textTransform: "none", fontWeight: 700 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<RestaurantOutlinedIcon />}
                      onClick={() => handleConsume(item)}
                      sx={{ color: "#3878c5", textTransform: "none", fontWeight: 700 }}
                    >
                      Consume
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      onClick={() => handleDelete(item.id)}
                      sx={{ color: "#c62828", textTransform: "none", fontWeight: 700 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={!!editItem}
        onClose={() => !actionLoading && setEditItem(null)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Edit food item</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#78857c", mb: 1 }}>
            Update the name or quantity for this inventory item.
          </Typography>
          <TextField
            fullWidth
            label="Food name"
            sx={{ mt: 2 }}
            value={editItem?.name || ""}
            onChange={(event) =>
              setEditItem((current) => ({ ...current, name: event.target.value }))
            }
          />
          <TextField
            fullWidth
            label="Quantity"
            sx={{ mt: 2 }}
            type="number"
            inputProps={{ min: 0, step: "any" }}
            value={editItem?.qty ?? ""}
            onChange={(event) =>
              setEditItem((current) => ({
                ...current,
                qty: event.target.value === "" ? "" : Number(event.target.value),
              }))
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setEditItem(null)}
            disabled={actionLoading}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEdit}
            disabled={actionLoading || !editItem?.name?.trim() || editItem?.qty === ""}
            sx={{
              ...{ bgcolor: green, textTransform: "none", borderRadius: "10px" },
              "&:hover": { bgcolor: "#106746" },
            }}
          >
            {actionLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
