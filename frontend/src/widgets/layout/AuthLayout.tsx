import { Box, Card, CardContent, Typography } from "@mui/material";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: "100%" }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            {title}
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>

          {children}
        </CardContent>
      </Card>
    </Box>
  );
}