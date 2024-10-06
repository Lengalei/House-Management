import React from "react";
import TopSumarry from "./TopSumarry";
import "./NewDashboard.scss"
import DoughnutChart from "./DoughnutChart";
import CustomSlider from "./CustomSlider";
import ImageSlider from "./ImageSlider";

function NewDashboard() {
  return (
    <div className="NewDashboard">
      <TopSumarry />

      <div className="sum">
        <DoughnutChart/>

        
          <ImageSlider/>
       
      </div>
    </div>
  );
}

export default NewDashboard;
