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
  Select, // <--- IMPORTANTE
  MenuItem, // <--- IMPORTANTE
  FormControl,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EmailIcon from "@mui/icons-material/Email";
import WebIcon from "@mui/icons-material/Web";
import InfoIcon from "@mui/icons-material/Info";
import axios from "axios";
import ClientDetail from "./ClientDetail";
import FilterDates from "./FilterDates";

import { colorMap, getChurnColor } from "../functions/buttonColors";
import DialogDashboard from "./DialogDashboard";

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogTicket, setDialogTicket] = useState(null); // Dialog detalle

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
  });
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

  // 2. FUNCIÓN PARA LIMPIAR FILTROS
  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "", status: "" });
  };

  // 3. LÓGICA DE FILTRADO
  // Creamos una variable derivada, NO modificamos 'tickets' directamente
  const filteredTickets = tickets.filter((ticket) => {
    // Validación de seguridad: si el ticket no tiene fecha, lo ignoramos o lo mostramos según prefieras
    if (!ticket.date) return false;

    // A. Filtrar por Estado
    if (filters.status && ticket.status !== filters.status) {
      return false;
    }

    // B. Filtrar por Fechas
    const ticketDate = new Date(ticket.date); // Fecha del ticket (con hora exacta)

    // Filtro FECHA INICIO
    if (filters.startDate) {
      const filterStart = new Date(filters.startDate + "T00:00:00");

      if (ticketDate < filterStart) return false;
    }

    // Filtro FECHA FIN
    if (filters.endDate) {
      const filterEnd = new Date(filters.endDate + "T23:59:59");

      if (ticketDate > filterEnd) return false;
    }

    return true;
  });

  // 1. NUEVA FUNCIÓN: Manejar el cambio de estado
  const handleStatusChange = async (ticketId, newStatus) => {
    // A. Actualización OPTIMISTA (Actualiza la UI inmediatamente antes de que responda el servidor)
    setTickets((prevTickets) =>
      prevTickets.map((t) =>
        t.id === ticketId ? { ...t, status: newStatus } : t
      )
    );

    try {
      // B. Enviar al Backend
      await axios.put(
        `http://localhost:5000/api/update_ticket_status/${ticketId}/status`,
        {
          status: newStatus,
        }
      );
      // Opcional: Podrías hacer un fetchTickets() aquí para confirmar, pero no es estrictamente necesario
    } catch (error) {
      console.error("Error actualizando estado:", error);
      // Si falla, revertimos (opcional) o mostramos alerta
      alert("No se pudo guardar el estado");
    }
  };

  // 2. FUNCIÓN DE COLOR PARA EL ESTADO (Para que se vea bonito)
  const getStatusColor = (status) => {
    switch (status) {
      case "Recibido":
        return "info.main"; // Azul
      case "Visto":
        return "warning.main"; // Naranja
      case "Respondido":
        return "success.main"; // Verde
      default:
        return "text.primary";
    }
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
      {/* FILTER COMPONENT */}
      <FilterDates
        filters={filters}
        setFilters={setFilters}
        onClear={clearFilters}
      />
      {/* FEED TABLE */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ background: "background.paper" }}>
            <TableRow>
              <TableCell>Estado</TableCell>
              <TableCell>Fuente</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Tipo Mantenimiento </TableCell>

              <TableCell>Riesgo Churn</TableCell>
              <TableCell>Urgencia</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets
              .slice()
              .reverse()
              .map((ticket) => (
                <TableRow
                  key={ticket.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <FormControl
                      size="small"
                      variant="standard"
                      sx={{ minWidth: 100 }}
                    >
                      <Select
                        value={ticket.status || "Recibido"} // Valor por defecto
                        onChange={(e) =>
                          handleStatusChange(ticket.id, e.target.value)
                        }
                        disableUnderline
                        sx={{
                          color: getStatusColor(ticket.status || "Recibido"),
                          fontWeight: "bold",
                          fontSize: "0.875rem",
                          "& .MuiSelect-select": { padding: "4px 0" }, // Ajuste visual
                        }}
                      >
                        <MenuItem
                          value="Recibido"
                          disabled={
                            ticket.status === "Visto" ||
                            ticket.status === "Respondido"
                          }
                        >
                          Recibido
                        </MenuItem>
                        <MenuItem
                          value="Visto"
                          disabled={ticket.status === "Respondido"}
                        >
                          Visto
                        </MenuItem>
                        <MenuItem value="Respondido">Respondido</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
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
                        if (ticket.status === "Recibido") {
                          handleStatusChange(ticket.id, "Visto");
                        }
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
      {/* DIALOG DETALLE TICKET */}
      <DialogDashboard
        dialogTicket={dialogTicket}
        setDialogTicket={setDialogTicket}
      />
    </Container>
  );
};

export default Dashboard;
