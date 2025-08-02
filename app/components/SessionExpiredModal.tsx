// components/SessionExpiredModal.tsx
import { useRouter } from "next/router";
import React from "react";

interface SessionExpiredModalProps {
  isExpired: boolean;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isExpired,
}) => {
  const router = useRouter();
  if (!isExpired) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        padding: "20px",
      }}
    >
      <p>Your session has expired. Please log in again.</p>
      <button onClick={() => router.push("/login")}>Log In</button>
    </div>
  );
};

export default SessionExpiredModal;
