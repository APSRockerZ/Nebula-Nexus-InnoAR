"use client";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Header } from "./header";

export const CardWrapper = ({ children, headerLabel }) => (
  <Card className="register-card">
    <CardHeader className="register-card-header">
      <Header label={headerLabel} />
    </CardHeader>
    <CardContent className="register-card-content">
      {children}
    </CardContent>
  </Card>
);
