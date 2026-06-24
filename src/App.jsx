import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { UnifiedCensusGuard, UnifiedPatientProfile } from "@/pages/UnifiedCensusGuard";
import "./styles.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UnifiedCensusGuard mode="dashboard" />} />
        <Route path="/dashboard" element={<UnifiedCensusGuard mode="dashboard" />} />
        <Route path="/dashboard/:section" element={<UnifiedCensusGuard mode="dashboard" />} />
        <Route path="/patient/:id" element={<UnifiedPatientProfile mode="dashboard" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
