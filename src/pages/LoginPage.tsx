
import { useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

const LoginPage = () => {
  const [activeForm, setActiveForm] = useState<"login" | "register" | "forgotPassword">("login");
  
  const toggleForm = (form: "login" | "register" | "forgotPassword") => {
    setActiveForm(form);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {activeForm === "register" && (
        <RegisterForm onToggleForm={() => toggleForm("login")} />
      )}
      {activeForm === "login" && (
        <LoginForm 
          onToggleForm={() => toggleForm("register")} 
          onForgotPassword={() => toggleForm("forgotPassword")}
        />
      )}
      {activeForm === "forgotPassword" && (
        <ForgotPasswordForm onToggleForm={() => toggleForm("login")} />
      )}
    </div>
  );
};

export default LoginPage;
