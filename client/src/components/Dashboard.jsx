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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EmailIcon from "@mui/icons-material/Email";
import WebIcon from "@mui/icons-material/Web";
import axios from "axios";

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

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
    if (score > 70) return "error";
    if (score > 40) return "warning";
    return "success";
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "var(--vortex-primary)" }}>
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
            sx={{ borderLeft: "5px solid var(--vortex-info)" }}>
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
            sx={{ borderLeft: "5px solid var(--vortex-danger)" }}>
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
            sx={{ borderLeft: "5px solid var(--vortex-warning)" }}>
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
              <TableCell>Clasificación</TableCell>
              <TableCell>Riesgo Churn</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets
              .slice()
              .reverse()
              .map((ticket) => (
                <TableRow key={ticket.id} hover>
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
                      label={ticket.clasificacion}
                      color={
                        ticket.clasificacion === "Evolutivo"
                          ? "success"
                          : "default"
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
                    <Button
                      size="small"
                      onClick={() => setSelectedTicket(ticket)}>
                      Ver Insight
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay tickets procesados aún.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DETAIL MODAL */}
      <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)}>
        <DialogTitle>Detalle del Ticket #{selectedTicket?.id}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            <strong>Cliente:</strong> {selectedTicket?.client_id}
          </DialogContentText>
          <DialogContentText sx={{ mb: 2 }}>
            <strong>Texto Original:</strong>
            <br />
            {selectedTicket?.text_original}
          </DialogContentText>
          <Alert severity="info" icon={<SecurityIcon />}>
            <strong>Insight (IA):</strong> {selectedTicket?.insight}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTicket(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
