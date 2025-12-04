import { Navigate } from "react-router-dom";
import { useSession } from "./SessionContextProvider";

export default function AdminProtected({ children }: { children: JSX.Element }) {
  const { session } = useSession();

  if (!session) return <Navigate to="/login" replace />;

  if (session.user?.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
