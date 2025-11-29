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

const ClientDetail = ({ ticket, onBack }) => {
  const [urgency, setUrgency] = useState(ticket.urgency || "Media");
  const [emailSent, setEmailSent] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loadingAI, setLoadingAI] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  console.log("info:", ticket);
  // --- EFECTO: ANÁLISIS AUTOMÁTICO ---

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
    { name: "Salud", valor: 100 - ticket.churn_score, color: "#4caf50" },
    {
      name: "Riesgo",
      valor: ticket.churn_score,
      color: ticket.churn_color || "#f44336",
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
          borderLeft: `6px solid ${ticket.churn_color}`,
          borderRadius: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="800" sx={{ color: "#2c3e50" }}>
            {ticket.client_id}
          </Typography>
          <Stack direction="row" spacing={1} mt={1}>
            <Chip
              label={`Proyecto: ${ticket.project}`}
              size="small"
              variant="outlined"
              color="primary"
            />
            <Chip
              label={ticket.client_email}
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
            color={ticket.churn_color}
            sx={{ lineHeight: 1 }}
          >
            {ticket.churn_score}%
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
                  "{ticket.text_processed}"
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
                        {ticket.real_antiguedad || 0}
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
                <TextField
                  label="Mensaje para el usuario"
                  placeholder="Escribe aquí las instrucciones o comentarios..."
                  multiline
                  rows={3}
                  fullWidth
                  value={message} // Asumiendo que tienes un estado: const [message, setMessage] = useState("");
                  onChange={(e) => setMessage(e.target.value)}
                  size="small"
                  sx={{
                    bgcolor: "white",
                    mb: 2, // Margen inferior para separar de los controles de abajo
                  }}
                />
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
