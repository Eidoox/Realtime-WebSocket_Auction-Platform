import React, { useEffect } from "react";
import RegisterForm from "./components/authentication/RegisterComponent";
import LoginForm from "./components/authentication/LoginComponent";
import socket from ".//socket/socket";

function App() {
  useEffect(() => {
    // Connect and listen for events
    socket.on("connect", () => {
      console.log("Connected to WebSocket server with ID:", socket.id);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div>
      <h1>Welcome</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <LoginForm />
        <RegisterForm />
      </div>
    </div>
  );
}

export default App;
