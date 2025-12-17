import Footer from "@/components/shared/Footer";
import React from "react";
import AdvertiseId from "./components/AdvertiseId";

const page = () => {
  return (
    <>

      <div className="main-content">
        <div className="row">
          <AdvertiseId />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default page;
