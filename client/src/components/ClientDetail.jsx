import React, { useState } from "react";
import { Box, Container, Grid, Button } from "@mui/material";
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
