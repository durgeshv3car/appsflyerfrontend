import Footer from "@/components/shared/Footer";
import React from "react";
import AdvertiseId from "./components/AdvertiseId";
import UserPage from "./components/Table";

const page = () => {
  return (
    <>

      <div className="main-content">
        <div className="row">
          <UserPage/>
        </div>
      </div>

    </>
  );
};

export default page;
