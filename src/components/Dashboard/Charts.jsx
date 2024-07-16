import React from 'react'
import {Chart as chartJS} from "chart.js/auto"
import {Line, Doughnut} from "react-chartjs-2"
function Charts() {
  return (
    <div className="charts">
      <div className="linechart">
        <Line
          data={{
            labels: ["Jan", "Feb", "March", "April", "May", "Jun"],
            datasets: [
              {
                label: "Rent Paid",
                data: [200, 300, 100, 250, 270, 400, 550],
                backgroundColor: ["blue"],
                colors: ["#2E93fA", "#66DA26", "#546E7A", "#E91E63", "#FF9800"],
                fill: ["gradient"],
              },
            ],
          }}
        />
      </div>
      <div className="doghnut">
        <Doughnut
          data={{
            labels: ["Jan", "Feb", "March", "April", "May", "Jun"],
            datasets: [
              {
                label: "Rent Paid",
                data: [200, 300, 100, 250, 270, 400, 550],
                backgroundColor: ["blue", "red", "yellow", 'pink', 'orange', 'green', 'brown'],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}

export default Charts
