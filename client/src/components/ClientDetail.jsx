// File: ClientDetail.jsx
import React, { useState } from "react";
import { Box, Container, Grid, Paper, Typography, Button, Chip, TextField, MenuItem, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import MetricsChart from "./MetricsChart";
import HeaderInfo from "./HeaderInfo";
import ActionSection from "./ActionSection";

const ClientDetail = ({ ticket, onBack }) => {
  const [urgency, setUrgency] = useState(ticket.urgency || "Baja");
  const [emailSent, setEmailSent] = useState(false);

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Volver al Dashboard
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <HeaderInfo ticket={ticket} />
        </Grid>

        <Grid item xs={12} md={6}>
          <MetricsChart ticket={ticket} />
        </Grid>

        <Grid item xs={12} md={6}>
          <ActionSection
            ticket={ticket}
            urgency={urgency}
            setUrgency={setUrgency}
            emailSent={emailSent}
            handleSendEmail={handleSendEmail}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientDetail;

// File: HeaderInfo.jsx
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

// File: MetricsChart.jsx
import React from "react";
import { Paper, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const MetricsChart = ({ ticket }) => {
  const data = [
    { name: "Riesgo Churn", Cliente: ticket.churn_score, Promedio: 45 },
    { name: "Satisfacción", Cliente: 100 - ticket.churn_score, Promedio: 70 },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Comparativa de Métricas
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Cliente" fill="var(--vortex-primary)" />
          <Bar dataKey="Promedio" fill="var(--vortex-gray-400)" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default MetricsChart;

// File: ActionSection.jsx
import React from "react";
import { Paper, Typography, Box, TextField, MenuItem, Button, Alert } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const ActionSection = ({ ticket, urgency, setUrgency, emailSent, handleSendEmail }) => (
  <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
    <Typography variant="h6" gutterBottom>
      Acciones de Gestión
    </Typography>

    <Box sx={{ mt: 2 }}>
      <Typography variant="body1" gutterBottom>
        <strong>Insight IA:</strong> {ticket.insight}
      </Typography>

      <TextField select fullWidth label="Nivel de Urgencia" value={urgency} onChange={(e) => setUrgency(e.target.value)} sx={{ mt: 2, mb: 2 }}>
        <MenuItem value="Baja">Baja</MenuItem>
        <MenuItem value="Media">Media</MenuItem>
        <MenuItem value="Alta">Alta</MenuItem>
        <MenuItem value="Crítica">Crítica</MenuItem>
      </TextField>

      <Button
        variant="contained"
        fullWidth
        size="large"
        endIcon={<SendIcon />}
        onClick={handleSendEmail}
        sx={{ bgcolor: "var(--vortex-success)", "&:hover": { bgcolor: "#218838" } }}
      >
        Enviar Plan de Acción al Cliente
      </Button>

      {emailSent && <Alert severity="success" sx={{ mt: 2 }}>Correo enviado exitosamente a {ticket.client_email}</Alert>}
    </Box>
  </Paper>
);

export default ActionSection;
