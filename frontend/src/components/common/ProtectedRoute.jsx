import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentSession = await authService.getSession();
        setSession(currentSession);
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-inactive uppercase tracking-widest">
            กำลังตรวจสอบสิทธิ์...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    // Redirect to login but save the current location to come back after login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
