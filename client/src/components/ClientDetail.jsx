import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";

// Iconos para darle vida visual
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import PsychologyIcon from "@mui/icons-material/Psychology";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Gráficos
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const ClientDetail = ({ ticket, onBack }) => {
  const [urgency, setUrgency] = useState(ticket.urgency || "Media");
  const [emailSent, setEmailSent] = useState(false);

  // --- ESTADOS IA ---
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // --- EFECTO: EJECUTAR ANÁLISIS AUTOMÁTICO AL ABRIR ---
  useEffect(() => {
    const fetchStrategicAnalysis = async () => {
      setLoadingAI(true);
      try {
        // PROMPT ESPECIALIZADO PARA ACCOUNT MANAGER
        // Le pedimos a la IA que actúe como un consultor de negocios, no soporte técnico.
        const payload = {
          message:
            "Genera el diagnóstico y la recomendación estratégica para este caso.",
          contexto: {
            client_name: ticket.client_id,
            churn_score: ticket.churn_score,
            ticket_text: ticket.text_processed,
            status: ticket.status,
            project: ticket.project,
            antiguedad: ticket.real_antiguedad,
            urgency: ticket.urgency,
          },
        };

        const response = await axios.post(
          "http://localhost:5000/api/chat",
          payload
        );
        setAiAnalysis(response.data.reply);
      } catch (error) {
        console.error("Error IA:", error);
        setAiAnalysis(
          "No se pudo generar el análisis estratégico en este momento."
        );
      } finally {
        setLoadingAI(false);
      }
    };

    if (ticket) {
      fetchStrategicAnalysis();
    }
  }, [ticket]);

  // --- DATOS PARA GRÁFICOS ---
  const chartData = [
    {
      name: "Salud Cliente",
      valor: 100 - ticket.churn_score,
      color: "#4caf50",
    }, // Verde
    {
      name: "Riesgo Fuga",
      valor: ticket.churn_score,
      color: ticket.churn_color || "#f44336",
    }, // Rojo/Dinámico
    { name: "Promedio Industria", valor: 45, color: "#9e9e9e" }, // Gris
  ];

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Botón Volver */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{ mb: 2, fontWeight: "bold" }}
      >
        Volver al Tablero
      </Button>

      {/* --- ENCABEZADO: INFORMACIÓN CLAVE DEL CLIENTE --- */}
      <Paper
        elevation={2}
        sx={{ p: 3, mb: 3, borderLeft: `6px solid ${ticket.churn_color}` }}
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {ticket.client_id}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip label={`Proyecto: ${ticket.project}`} variant="outlined" />
              <Chip
                label={`Email: ${ticket.client_email}`}
                variant="outlined"
              />
              <Chip
                icon={<WarningAmberIcon />}
                label={`Riesgo: ${ticket.churn_level}`}
                sx={{
                  bgcolor: ticket.churn_color,
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={4} textAlign="right">
            <Typography
              variant="h3"
              color={ticket.churn_color}
              fontWeight="bold"
            >
              {ticket.churn_score}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              PROBABILIDAD DE CHURN
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* --- COLUMNA IZQUIERDA: ANÁLISIS IA (Estratégico) --- */}
        <Grid item xs={12} md={7}>
          <Card
            elevation={4}
            sx={{ height: "100%", position: "relative", overflow: "visible" }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: "var(--vortex-primary)" }}>
                  <PsychologyIcon />
                </Avatar>
              }
              title={
                <Typography variant="h6" fontWeight="bold">
                  Análisis del Account Manager (IA)
                </Typography>
              }
              subheader="Recomendación estratégica basada en datos históricos"
            />
            <Divider />
            <CardContent>
              {loadingAI ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  py={5}
                >
                  <CircularProgress color="secondary" />
                  <Typography
                    variant="body2"
                    sx={{ mt: 2 }}
                    color="text.secondary"
                  >
                    Analizando patrones de comportamiento y generando
                    estrategia...
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    bgcolor: "#f5f5ff",
                    p: 2,
                    borderRadius: 2,
                    border: "1px dashed #6c5ce7",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
                  >
                    {aiAnalysis}
                  </Typography>
                </Box>
              )}

              {/* Contexto del Ticket Original */}
              <Box mt={3}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  <LightbulbIcon
                    fontSize="small"
                    sx={{ verticalAlign: "middle", mr: 1 }}
                  />
                  Contexto del Ticket Original:
                </Typography>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ fontStyle: "italic", bgcolor: "#f9f9f9", p: 1 }}
                >
                  "{ticket.text_processed}"
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* --- COLUMNA DERECHA: ESTADÍSTICAS Y ACCIONES --- */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            {/* 1. GRÁFICO ESTADÍSTICO INTUITIVO */}
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <AutoGraphIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="h6">Métricas de Salud</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="valor" barSize={20} radius={[0, 10, 10, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>

            {/* 2. ACCIONES RÁPIDAS */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Gestión de Cuenta
              </Typography>

              <TextField
                select
                fullWidth
                label="Prioridad de Atención"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              >
                <MenuItem value="Baja">Baja (Monitoreo)</MenuItem>
                <MenuItem value="Media">Media (Seguimiento)</MenuItem>
                <MenuItem value="Alta">Alta (Riesgo)</MenuItem>
                <MenuItem value="Crítica">Crítica (Fuga Inminente)</MenuItem>
              </TextField>

              <Button
                variant="contained"
                fullWidth
                size="large"
                endIcon={emailSent ? <CheckCircleIcon /> : <SendIcon />}
                color={emailSent ? "success" : "primary"}
                onClick={handleSendEmail}
                disabled={emailSent}
              >
                {emailSent ? "Plan Enviado" : "Enviar Plan de Acción"}
              </Button>

              {emailSent && (
                <Alert severity="success" sx={{ mt: 1, fontSize: "0.85rem" }}>
                  Notificación enviada al equipo y al cliente.
                </Alert>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientDetail;
