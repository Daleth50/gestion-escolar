import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        textAlign: "center",
        bgcolor: "grey.100",
      }}
    >
      <Typography variant="body2">
        © 2026 - Sistema de Gestión Escolar
      </Typography>
    </Box>
  );
}
