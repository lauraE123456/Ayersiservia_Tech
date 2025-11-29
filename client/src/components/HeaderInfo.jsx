import React from "react";
import { Paper, Typography, Box, Chip } from "@mui/material";

const HeaderInfo = ({ ticket }) => (
  <Paper elevation={3} sx={{ p: 3, borderLeft: `6px solid ${ticket.churn_color || "gray"}` }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          {ticket.client_id}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Proyecto: <strong>{ticket.project || "N/A"}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Email: {ticket.client_email || "N/A"}
        </Typography>
      </Box>

      <Chip
        label={`Riesgo: ${ticket.churn_level || "Desconocido"}`}
        sx={{ bgcolor: ticket.churn_color, color: "white", fontWeight: "bold", fontSize: "1.2rem", p: 2 }}
      />
    </Box>
  </Paper>
);

export default HeaderInfo;
