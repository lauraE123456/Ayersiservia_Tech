import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
  CircularProgress,
  Container,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";

const TicketForm = () => {
  const [formData, setFormData] = useState({
    text: "",
    client_id: "",
    date: dayjs(),
    software_type: "ERP",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({
      ...prev,
      date: newDate,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.text.trim())
      newErrors.text = "La descripción del problema es obligatoria";
    if (!formData.client_id.trim())
      newErrors.client_id = "El ID del cliente es obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setResult(null);

    if (!validate()) return;

    setLoading(true);

    const payload = {
      ...formData,
      date: formData.date ? formData.date.format("YYYY-MM-DD") : "",
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/process_ticket",
        payload
      );
      setResult(response.data);
    } catch (err) {
      console.error("Error processing ticket:", err);
      if (err.response && err.response.status === 400) {
        // Error de seguridad o validación
        setApiError(err.response.data.error || "Error de validación");
      } else {
        setApiError(
          "Error al procesar el ticket. Verifique que el servidor esté activo."
        );
      }
    } finally {
      setLoading(false);
    }
    console.log(result);
    console.log(payload);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 4,
            borderRadius: 2,
            background: "background.paper",
            borderTop: "4px solid var(--vortex-primary)",
          }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600, color: "var(--vortex-primary)" }}>
            Nuevo Ticket de Soporte
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Complete el formulario para registrar una incidencia en el
            hackathon.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="ID del Cliente"
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              error={!!errors.client_id}
              helperText={errors.client_id}
              margin="normal"
              variant="outlined"
              required
            />

            <TextField
              fullWidth
              label="Descripción del Problema"
              name="text"
              value={formData.text}
              onChange={handleChange}
              error={!!errors.text}
              helperText={errors.text}
              margin="normal"
              multiline
              rows={6}
              variant="outlined"
              required
            />

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}>
              <DatePicker
                label="Fecha del Incidente"
                value={formData.date}
                onChange={handleDateChange}
                slotProps={{ textField: { fullWidth: true } }}
              />

              <TextField
                select
                fullWidth
                label="Tipo de Software"
                name="software_type"
                value={formData.software_type}
                onChange={handleChange}>
                {[
                  "Phishing",
                  "Correo sospechoso",
                  "Acceso no autorizado",
                  "Malware",
                  "ERP",
                  "CRM",
                  "Red",
                  "Otro",
                ].map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  bgcolor: "var(--vortex-primary)",
                  "&:hover": { bgcolor: "var(--vortex-primary-dark)" },
                }}
                startIcon={
                  loading && <CircularProgress size={20} color="inherit" />
                }>
                {loading ? "Procesando..." : "Procesar Ticket"}
              </Button>
            </Box>
          </Box>

          {result && (
            <Box sx={{ mt: 4 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Ticket procesado correctamente
              </Alert>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: "var(--vortex-gray-900)",
                  color: "common.white",
                  overflowX: "auto",
                  border: "1px solid var(--vortex-success)",
                }}>
                <pre style={{ margin: 0, fontFamily: "Fira Code, monospace" }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default TicketForm;
