import { Navigate } from "react-router-dom";
import { useSession } from "./SessionContextProvider";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session } = useSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
