
import { useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";

const LoginPage = () => {
  const [showRegister, setShowRegister] = useState(false);
  
  const toggleForm = () => {
    setShowRegister(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {showRegister ? (
        <RegisterForm onToggleForm={toggleForm} />
      ) : (
        <LoginForm onToggleForm={toggleForm} />
      )}
    </div>
  );
};

export default LoginPage;
