import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
const DialogDashboard = (props) => {
  const { dialogTicket, setDialogTicket } = props;
  return (
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
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
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
                {dialogTicket?.text_processed || "Sin descripción disponible."}
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
                      label={`${(dialogTicket?.phishing_prob ?? 0).toFixed(
                        3
                      )}%`}
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
  );
};

export default DialogDashboard;
