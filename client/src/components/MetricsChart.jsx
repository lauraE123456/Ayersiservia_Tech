import React from "react";
import { Paper, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const MetricsChart = ({ ticket }) => {
  const data = [
    { name: "Riesgo Churn", Cliente: ticket.churn_score, Promedio: 45 },
    { name: "Satisfacción", Cliente: 100 - ticket.churn_score, Promedio: 70 },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Comparativa de Métricas
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Cliente" fill="var(--vortex-primary)" />
          <Bar dataKey="Promedio" fill="var(--vortex-gray-400)" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default MetricsChart;
