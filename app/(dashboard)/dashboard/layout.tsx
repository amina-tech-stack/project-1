import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div>layout</div>
      <div className="container mx-auto px-4 py-8">{children}</div>
    </>
  );
};

export default layout;
