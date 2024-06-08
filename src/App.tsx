/* eslint-disable @typescript-eslint/no-explicit-any */

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import { Offcanvas, OffcanvasBody, OffcanvasHeader, Table } from "reactstrap";
import "./styles.css";
function App() {

  const [nodes, setNodes] = useState<any>([]);
  const [selectedNodeName,setNodeName] = useState<any>("");
  const [tableData, setTableData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getWeatherCondition = (condition: number) => {
    let colors;
    switch (condition) {
      case 0:
        colors = "#81ecec";
        break;
      case 1:
        colors = "#3498db";
        break;
      case 2:
        colors = "#2ecc71";
        break;
      case 3:
        colors = "#f1c40f";
        break;
      case 4:
        colors = "#e67e22";
        break;
      case 5:
        colors = "#e74c3c";
        break;
      default:
        colors = "#81ecec";
        break;
    }
    return colors;
  };

  const getWeatherConditionMessage = (condition: number) => {
    let Message;
    switch (condition) {
      case 0:
        Message = "No Fire Risk";
        break;
      case 1:
        Message = "Low Fire Risk";
        break;
      case 2:
        Message = "Moderate Fire Risk";
        break;
      case 3:
        Message = "High Fire Risk";
        break;
      case 4:
        Message = "Very High Fire Risk";
        break;
      case 5:
        Message = "Extreme Fire Risk";
        break;
      default:
        Message = "grey";
        break;
    }
    return Message;
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async () => {
    const apiUrl = `http://127.0.0.1:8000/nodes/`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const jsonData = await response.json();
      if (response.status === 200) {
        setNodes(jsonData?.nodes);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchNodeData = async (nodeId: string) => {
    const apiUrl = `http://127.0.0.1:8000/nodes/${nodeId}`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const jsonData = await response.json();
      if (response.status === 200) {
        setTableData(jsonData?.last_readings);
        setIsOpen((prev) => !prev);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const toggleOffcanvas = () => {
    setTableData(null);
    setIsOpen(false);
  };
  return (
    <>
      <Offcanvas
        direction="end"
        isOpen={isOpen}
        style={{ width: "40%" }}
        backdrop={true}
        toggle={toggleOffcanvas}
      >
        <OffcanvasHeader toggle={toggleOffcanvas}>{selectedNodeName !== "" ? selectedNodeName +"'s": ""} Node</OffcanvasHeader>
        <OffcanvasBody>
          <Table size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Temperature</th>
                <th>Humidity</th>
                <th>Smoke Value</th>
                <th>Date</th>
                <th>Fire Risk</th>
              </tr>
            </thead>
            <tbody>
              {tableData?.map((nodeData: any, index: number) => (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  <td>{nodeData?.temperature}</td>
                  <td>{nodeData?.humidity}</td>
                  <td>{nodeData?.smoke_value}</td>
                  <td>{format(nodeData?.timestamp, "yyyy/MM/dd kk:mm:ss")}</td>
                  <td>{ getWeatherConditionMessage(nodeData.fire_risk_level)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </OffcanvasBody>
      </Offcanvas>

      <MapContainer center={[33.76616017083672, 35.90428950328893]} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {nodes.length > 0 &&
          nodes.map((node: any, index: number) => {
            return (
              <div key={index} className="marker-container">
                <CircleMarker
                  center={[node.latitude, node.longitude]}
                  pathOptions={{
                    color: getWeatherCondition(
                      node?.last_reading?.fire_risk_level
                    ),
                  }}
                  radius={50}
                  eventHandlers={{
                    click: () => {
                      setNodeName(node?.node_name)
                      fetchNodeData(node._id);
                    },
                  }}
                >
                  <Tooltip permanent={true}>
                    <div
                      className="emoji-container"
                      style={{
                        fontSize: 30,
                        zIndex: 1000,
                        top: "-10px",
                        left: "20px",
                        backgroundColor: "transparent",
                      }}
                    >
                      {node?.last_reading?.fire === true ? "🔥" : ""}
                    </div>
                  </Tooltip>
                </CircleMarker>
              </div>
            );
          })}
      </MapContainer>
    </>
  );
}

export default App;
