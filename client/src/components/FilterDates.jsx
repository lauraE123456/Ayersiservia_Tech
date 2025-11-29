import React from "react";
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Stack,
  Paper,
  Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

const FilterDates = ({ filters, setFilters, onClear }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <FilterListIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" color="text.secondary">
          Filtros de Búsqueda
        </Typography>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {/* Filtro por Fecha Inicio */}
        <TextField
          label="Desde"
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          size="small"
          fullWidth
        />

        {/* Filtro por Fecha Fin */}
        <TextField
          label="Hasta"
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          size="small"
          fullWidth
        />

        {/* Filtro por Estado (Recibido, Visto, Respondido) */}
        <FormControl fullWidth size="small">
          <InputLabel id="status-label">Estado</InputLabel>
          <Select
            labelId="status-label"
            name="status"
            value={filters.status}
            label="Estado"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            <MenuItem value="Recibido">Recibido</MenuItem>
            <MenuItem value="Visto">Visto</MenuItem>
            <MenuItem value="Respondido">Respondido</MenuItem>
          </Select>
        </FormControl>

        {/* Botón de Limpiar */}
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ClearIcon />}
          onClick={onClear}
          sx={{ minWidth: "120px" }}
        >
          Limpiar
        </Button>
      </Stack>
    </Paper>
  );
};

export default FilterDates;
