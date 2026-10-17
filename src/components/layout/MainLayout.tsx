import { Box, Container } from "@mui/material";

import Header from "./Header";
import Footer from "./Footer";

interface Props {
  children: React.ReactNode;
}

export default function MainLayout({ children }: Props) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <Container component="main" maxWidth="xl" sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>

      <Footer />
    </Box>
  );
}
