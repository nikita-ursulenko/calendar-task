import React from "react";

const AuthContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        {children}
      </div>
    </div>
  );
};

export default AuthContainer;