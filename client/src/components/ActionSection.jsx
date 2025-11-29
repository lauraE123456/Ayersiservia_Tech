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

      <TextField
        select
        fullWidth
        label="Nivel de Urgencia"
        value={urgency}
        onChange={(e) => setUrgency(e.target.value)}
        sx={{ mt: 2, mb: 2 }}
      >
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

      {emailSent && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Correo enviado exitosamente a {ticket.client_email}
        </Alert>
      )}
    </Box>
  </Paper>
);

export default ActionSection;
