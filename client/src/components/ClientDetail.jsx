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
  Card,
  CardContent,
  CardHeader,
  Divider,
  Avatar,
  Stack,
  Skeleton,
  IconButton,
  Tooltip as MuiTooltip,
  Snackbar,
} from "@mui/material";

// Iconos
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PieChartIcon from "@mui/icons-material/PieChart";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentIcon from "@mui/icons-material/Assessment";

// Gráficos
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

// --- CONFIGURACIÓN ---
// Cambia esto a TRUE cuando tengas tu backend Python corriendo en localhost:5000
const USE_LIVE_API = false;

// Respuesta simulada para cuando no hay backend (Evita el Network Error)
const MOCK_AI_RESPONSE = `Basado en el análisis histórico, este cliente presenta un riesgo crítico de fuga (Churn) debido a la recurrencia de incidentes técnicos no resueltos en los últimos 30 días.

**Factores Clave detectados:**
1. Fatiga por tickets repetitivos sobre el mismo módulo.
2. Tono de frustración creciente en las comunicaciones.
3. Comparación explícita con competidores en el último correo.

**Recomendación Estratégica:**
Sugiero una intervención proactiva inmediata. No esperes al próximo ticket. Programa una sesión de "Customer Success Review" para presentar el roadmap de soluciones y ofrecer un descuento por fidelidad del 10% en la próxima renovación.`;

const DEFAULT_TICKET = {
  client_id: "CLIENT-DEMO-001",
  project: "Proyecto Alpha",
  client_email: "demo@cliente.com",
  churn_score: 75,
  churn_level: "Alto",
  churn_color: "#f44336",
  urgency: "Alta",
  text_processed:
    "El cliente indica frustración recurrente con la estabilidad del servicio en horas pico. Menciona que ha abierto 3 tickets previos sin solución definitiva.",
};

const ClientDetail = ({ ticket, onBack }) => {
  const safeTicket = ticket || DEFAULT_TICKET;

  const [urgency, setUrgency] = useState(safeTicket.urgency || "Media");
  const [emailSent, setEmailSent] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loadingAI, setLoadingAI] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  console.log("info:", safeTicket);
  // --- EFECTO: ANÁLISIS AUTOMÁTICO ---
  useEffect(() => {
    const fetchStrategicAnalysis = async () => {
      setLoadingAI(true);

      // Limpiamos cualquier error previo
      setAiAnalysis("");

      try {
        if (USE_LIVE_API) {
          // --- MODO REAL (Backend) ---
          const payload = {
            message:
              "Genera el diagnóstico y la recomendación estratégica ejecutiva para este caso.",
            context: {
              client_name: safeTicket.client_id,
              churn_score: safeTicket.churn_score,
              ticket_text: safeTicket.text_processed,
              status: safeTicket.status,
              project: safeTicket.project,
              antiguedad: safeTicket.real_antiguedad,
              urgency: safeTicket.urgency,
            },
          };

          const response = await axios.post(
            "http://localhost:5000/api/chat",
            payload
          );
          const replyText =
            typeof response.data.reply === "string"
              ? response.data.reply
              : JSON.stringify(response.data.reply);
          setAiAnalysis(replyText);
        } else {
          // --- MODO SIMULACIÓN (Sin errores de consola) ---
          await new Promise((r) => setTimeout(r, 2000)); // Simula "pensando"
          setAiAnalysis(MOCK_AI_RESPONSE);
        }
      } catch (error) {
        console.warn("Error en conexión IA (usando fallback):", error);
        setAiAnalysis(
          "⚠️ No se pudo conectar con el asistente estratégico. Verifica que el servidor backend esté corriendo en el puerto 5000."
        );
      } finally {
        setLoadingAI(false);
      }
    };

    fetchStrategicAnalysis();
  }, [safeTicket]);

  const handleCopyAnalysis = () => {
    if (aiAnalysis) {
      navigator.clipboard.writeText(aiAnalysis);
      setOpenSnackbar(true);
    }
  };

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  // --- DATOS GRÁFICOS ---
  const healthData = [
    { name: "Salud", valor: 100 - safeTicket.churn_score, color: "#4caf50" },
    {
      name: "Riesgo",
      valor: safeTicket.churn_score,
      color: safeTicket.churn_color || "#f44336",
    },
  ];

  const maintenanceData = [
    { name: "Correctivo", value: 65, color: "#FF8042" },
    { name: "Preventivo", value: 35, color: "#0088FE" },
  ];

  const projectData = [
    { name: "Web App", value: 40, color: "#00C49F" },
    { name: "Mobile", value: 30, color: "#FFBB28" },
    { name: "API", value: 30, color: "#FF8042" },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{ mb: 2, textTransform: "none", color: "text.secondary" }}
      >
        Volver
      </Button>

      {/* --- ENCABEZADO --- */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: `1px solid #e0e0e0`,
          borderLeft: `6px solid ${safeTicket.churn_color}`,
          borderRadius: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="800" sx={{ color: "#2c3e50" }}>
            {safeTicket.client_id}
          </Typography>
          <Stack direction="row" spacing={1} mt={1}>
            <Chip
              label={`Proyecto: ${safeTicket.project}`}
              size="small"
              variant="outlined"
              color="primary"
            />
            <Chip
              label={safeTicket.client_email}
              size="small"
              variant="outlined"
              icon={<SendIcon sx={{ fontSize: 14 }} />}
            />
          </Stack>
        </Box>
        <Box textAlign="right">
          <Typography
            variant="h4"
            fontWeight="900"
            color={safeTicket.churn_color}
            sx={{ lineHeight: 1 }}
          >
            {safeTicket.churn_score}%
          </Typography>
          <Typography
            variant="caption"
            fontWeight="bold"
            color="text.secondary"
          >
            RIESGO CHURN
          </Typography>
        </Box>
      </Paper>

      {/* --- LAYOUT PRINCIPAL --- */}
      <Grid container spacing={4} alignItems="stretch">
        {/* === COLUMNA IZQUIERDA: CHAT IA === */}
        <Grid
          item
          xs={12}
          lg={7}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Card
            elevation={3}
            sx={{
              flexGrow: 1,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: "600px",
            }}
          >
            <CardHeader
              avatar={
                <Avatar
                  sx={{ bgcolor: "#e3f2fd", border: "1px solid #bbdefb" }}
                >
                  <SmartToyIcon color="primary" />
                </Avatar>
              }
              action={
                !loadingAI && (
                  <MuiTooltip title="Copiar análisis">
                    <IconButton onClick={handleCopyAnalysis}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </MuiTooltip>
                )
              }
              title={
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  Consultor Estratégico
                  {loadingAI && (
                    <Typography
                      variant="caption"
                      sx={{ ml: 2, color: "text.secondary" }}
                    >
                      Analizando...
                    </Typography>
                  )}
                </Typography>
              }
              subheader="Diagnóstico inteligente basado en historial."
              sx={{ borderBottom: "1px solid #f0f0f0", py: 1.5 }}
            />

            <CardContent
              sx={{
                flexGrow: 1,
                p: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  flexGrow: 1,
                  overflowY: "auto",
                  bgcolor: "#fff",
                  maxHeight: "550px",
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#ccc",
                    borderRadius: "4px",
                  },
                }}
              >
                {loadingAI ? (
                  <Box>
                    <Skeleton height={40} width="60%" />
                    <Skeleton height={20} />
                    <Skeleton height={20} />
                    <Skeleton height={100} />
                  </Box>
                ) : (
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-line",
                      color: "#37474f",
                      lineHeight: 1.8,
                    }}
                  >
                    {/* Aseguramos que se renderice texto limpio */}
                    {typeof aiAnalysis === "string"
                      ? aiAnalysis
                      : JSON.stringify(aiAnalysis)}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{ p: 2, bgcolor: "#fcfcfc", borderTop: "1px solid #eee" }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="flex"
                  alignItems="center"
                  gutterBottom
                >
                  <LightbulbIcon
                    fontSize="inherit"
                    sx={{ mr: 0.5, color: "#fbc02d" }}
                  />
                  Contexto del ticket original:
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontStyle: "italic",
                    borderLeft: "3px solid #e0e0e0",
                    pl: 1.5,
                    maxHeight: "60px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  "{safeTicket.text_processed}"
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* === COLUMNA DERECHA: DASHBOARD UNIFICADO === */}
      </Grid>
      <div style={{ height: 24 }}></div>
      <Grid
        item
        xs={12}
        lg={7}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <Card
          elevation={3}
          sx={{
            width: "100%",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardHeader
            title="Visión 360° de la Cuenta"
            subheader="Métricas clave e indicadores de rendimiento"
            avatar={
              <Avatar sx={{ bgcolor: "#fff3e0", color: "#ed6c02" }}>
                <AssessmentIcon />
              </Avatar>
            }
            sx={{ borderBottom: "1px solid #f0f0f0", py: 1.5 }}
          />

          <CardContent
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              pt: 3,
            }}
          >
            {/* 1. SECCIÓN PRINCIPAL: SALUD */}
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight="bold"
                gutterBottom
              >
                SALUD GENERAL VS RIESGO
              </Typography>
              <Box
                sx={{
                  height: 60,
                  width: "100%",
                  bgcolor: "#fafafa",
                  borderRadius: 2,
                  p: 1,
                  border: "1px solid #eee",
                }}
              >
                <ResponsiveContainer>
                  <BarChart
                    layout="vertical"
                    data={healthData}
                    margin={{ left: 0, right: 30 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={60}
                      tick={{ fontSize: 11, fontWeight: "bold" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Bar dataKey="valor" barSize={20} radius={[0, 4, 4, 0]}>
                      {healthData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                    <Tooltip
                      cursor={false}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            <Divider />

            {/* 2. GRID DE DETALLES */}
            <Grid container spacing={2}>
              {/* Antigüedad */}
              <Grid item xs={6}>
                <Box sx={{ textAlign: "center", p: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    ANTIGÜEDAD
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{ mt: 1 }}
                  >
                    <HistoryIcon color="action" fontSize="large" />
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary"
                        sx={{ lineHeight: 1 }}
                      >
                        {safeTicket.real_antiguedad || 0}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Años
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              {/* Mantenimiento (Mini Donut) */}
              <Grid item xs={6} sx={{ borderLeft: "1px solid #eee" }}>
                <Box sx={{ textAlign: "center", height: 80, width: "100%" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="bold"
                    sx={{ mb: 0.5, display: "block" }}
                  >
                    MANTENIMIENTO
                  </Typography>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={maintenanceData}
                        innerRadius={20}
                        outerRadius={35}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {maintenanceData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>

            {/* Distribución de Proyectos */}
            <Box sx={{ mt: -1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
                sx={{ ml: 1 }}
              >
                DISTRIBUCIÓN DE TICKETS POR PROYECTO
              </Typography>
              <Box sx={{ height: 140, width: "100%" }}>
                <ResponsiveContainer>
                  <BarChart
                    data={projectData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f5f5f5" }}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {projectData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* 3. SECCIÓN DE ACCIÓN */}
            <Box sx={{ mt: "auto", pt: 2, borderTop: "1px dashed #e0e0e0" }}>
              <Box sx={{ bgcolor: "#f5f9ff", p: 2, borderRadius: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="primary"
                  fontWeight="bold"
                  gutterBottom
                >
                  Acciones Recomendadas
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    select
                    fullWidth
                    label="Prioridad"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  >
                    <MenuItem value="Baja">🟢 Baja</MenuItem>
                    <MenuItem value="Media">🟡 Media</MenuItem>
                    <MenuItem value="Alta">🟠 Alta</MenuItem>
                    <MenuItem value="Crítica">🔴 Crítica</MenuItem>
                  </TextField>
                  <Button
                    variant="contained"
                    onClick={handleSendEmail}
                    disabled={emailSent}
                    endIcon={emailSent ? <CheckCircleIcon /> : <SendIcon />}
                    sx={{
                      minWidth: 100,
                      textTransform: "none",
                      fontWeight: "bold",
                    }}
                  >
                    {emailSent ? "Listo" : "Enviar"}
                  </Button>
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* SNACKBAR */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="Análisis copiado al portapapeles"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Container>
  );
};

export default ClientDetail;
