import Footer from "@/components/shared/Footer";
import React from "react";
import Token from "./components/Token";

const page = () => {
  return (
    <>

      <div className="main-content">
        <div className="row">
          <Token />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default page;
