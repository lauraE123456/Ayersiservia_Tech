import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  AlertTitle,
  Stack,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EmailIcon from "@mui/icons-material/Email";
import WebIcon from "@mui/icons-material/Web";
import InfoIcon from "@mui/icons-material/Info";
import axios from "axios";
import ClientDetail from "./ClientDetail";

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogTicket, setDialogTicket] = useState(null); // Dialog detalle

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // KPIs
  const totalTickets = tickets.length;
  const avgChurn =
    totalTickets > 0
      ? (
          tickets.reduce((acc, t) => acc + t.churn_score, 0) / totalTickets
        ).toFixed(1)
      : 0;
  const highRiskCount = tickets.filter((t) => t.churn_score > 70).length;

  const getChurnColor = (score) => {
    // 1. Rango Crítico y Muy Alto (81 - 100) -> ROJO
    if (score > 80) return "error";

    // 2. Rango Alto (61 - 80) -> NARANJA (Warning suele ser naranja en Material UI)
    if (score > 60) return "warning";

    // 3. Rango Medio (31 - 60) -> AMARILLO (O "info" si quieres otro tono)
    // Nota: Si usas Material UI, "warning" cubre amarillo/naranja.
    if (score > 30) return "warning";

    // 4. Rango Bajo (0 - 30) -> VERDE
    return "success";
  };

  // If a ticket is selected, show the Detail View
  if (selectedTicket) {
    return (
      <ClientDetail
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
      />
    );
  }
  console.log(tickets);

  const colorMap = {
    Bajo: "success", // verde
    Medio: "warning", // amarillo
    Alto: "warning", // naranja no existe, warning es lo más cercano
    "Muy Alto": "error", // rojo
    Crítico: "error", // rojo fuerte
  };
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "var(--vortex-primary)" }}
        >
          Dashboard de Control
        </Typography>
        <IconButton onClick={fetchTickets} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* KPI CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{ borderLeft: "5px solid var(--vortex-info)" }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <WebIcon color="info" sx={{ mr: 1 }} />
                <Typography color="text.secondary">Total Tickets</Typography>
              </Box>
              <Typography variant="h3">{totalTickets}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{ borderLeft: "5px solid var(--vortex-danger)" }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                <Typography color="text.secondary">
                  Riesgo Churn Promedio
                </Typography>
              </Box>
              <Typography variant="h3">{avgChurn}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{ borderLeft: "5px solid var(--vortex-warning)" }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <SecurityIcon color="warning" sx={{ mr: 1 }} />
                <Typography color="text.secondary">
                  Clientes en Riesgo Alto
                </Typography>
              </Box>
              <Typography variant="h3">{highRiskCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FEED TABLE */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ background: "background.paper" }}>
            <TableRow>
              <TableCell>Fuente</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Tipo Mantenimiento </TableCell>

              <TableCell>Riesgo Churn</TableCell>
              <TableCell>Urgencia</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets
              .slice()
              .reverse()
              .map((ticket) => (
                <TableRow
                  key={ticket.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <TableCell>
                    {ticket.source === "Email" ? (
                      <EmailIcon color="action" />
                    ) : (
                      <WebIcon color="primary" />
                    )}
                  </TableCell>
                  <TableCell>{ticket.client_id}</TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.classification}
                      color={
                        ticket.classification === "Evolutivo"
                          ? "success"
                          : "error"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ width: "30%" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ width: "100%", mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={ticket.churn_score}
                          color={getChurnColor(ticket.churn_score)}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {ticket.churn_score}%
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Prioridad basada en Churn y Antigüedad">
                      <Chip
                        label={ticket.urgency || "N/A"}
                        size="small"
                        color={colorMap[ticket.urgency] || "default"}
                        icon={<InfoIcon />}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation(); // evita que el click seleccione la fila
                        setDialogTicket(ticket);
                      }}
                    >
                      Ver Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay tickets procesados aún.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={!!dialogTicket}
        onClose={() => setDialogTicket(null)}
        maxWidth="sm" // Controla el ancho máximo para que no se estire demasiado
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" component="div">
              Detalle del Ticket #{dialogTicket?.id}
            </Typography>
            {/* Chip opcional si tienes estado del ticket */}
            <Chip
              label="Abierto"
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            {/* SECCIÓN 1: Información del Cliente */}
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon color="action" />
              <Typography variant="subtitle1" fontWeight="bold">
                Cliente:
              </Typography>
              <Typography variant="body1">{dialogTicket?.client_id}</Typography>
            </Box>

            {/* SECCIÓN 2: Descripción (En un contenedor visualmente distinto) */}
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Descripción del Caso
              </Typography>
              <Box
                sx={{
                  bgcolor: "grey.50",
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "grey.200",
                  maxHeight: "150px",
                  overflowY: "auto",
                }}
              >
                <Typography variant="body2" style={{ whiteSpace: "pre-line" }}>
                  {dialogTicket?.text_processed ||
                    "Sin descripción disponible."}
                </Typography>
              </Box>
            </Box>

            {/* SECCIÓN 3: Análisis de Seguridad y Datos */}
            <Alert
              severity="info"
              icon={<SecurityIcon fontSize="inherit" />}
              sx={{ "& .MuiAlert-message": { width: "100%" } }} // Asegura que el contenido ocupe todo el ancho
            >
              <AlertTitle>Análisis de Perfil</AlertTitle>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Proyecto */}
                <Grid item xs={12} sm={4}>
                  <Box display="flex" flexDirection="column">
                    <Typography
                      variant="caption"
                      display="flex"
                      alignItems="center"
                      gap={0.5}
                    >
                      <WorkIcon fontSize="inherit" /> Proyecto
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {dialogTicket?.project || "N/A"}
                    </Typography>
                  </Box>
                </Grid>

                {/* Antigüedad */}
                <Grid item xs={12} sm={4}>
                  <Box display="flex" flexDirection="column">
                    <Typography
                      variant="caption"
                      display="flex"
                      alignItems="center"
                      gap={0.5}
                    >
                      <AccessTimeIcon fontSize="inherit" /> Antigüedad
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {dialogTicket?.real_antiguedad}
                    </Typography>
                  </Box>
                </Grid>

                {/* Nivel de Phishing (Destacado) */}
                <Grid item xs={12} sm={4}>
                  <Box display="flex" flexDirection="column">
                    <Typography
                      variant="caption"
                      display="flex"
                      alignItems="center"
                      gap={0.5}
                    >
                      <WarningAmberIcon fontSize="inherit" /> Riesgo Phishing
                    </Typography>
                    <Box mt={0.5}>
                      {/* Lógica de color según probabilidad (ejemplo) */}
                      <Chip
                        label={`${dialogTicket?.phishing_prob.toFixed(3)}%`}
                        size="small"
                        color={
                          dialogTicket?.phishing_prob > 50 ? "error" : "success"
                        }
                        variant="filled"
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDialogTicket(null)} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
