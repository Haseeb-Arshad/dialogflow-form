import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
// import { initializeKendoLicense } from "./utils/kendoLicense"

// Initialize Kendo UI license
// initializeKendoLicense()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
