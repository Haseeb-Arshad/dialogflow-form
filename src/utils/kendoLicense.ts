import { setLicenseKey } from "@progress/kendo-licensing"

// Replace with your actual license key if you have one
// For free version, you can leave this empty
export const initializeKendoLicense = () => {
  try {
    setLicenseKey("")
  } catch (error) {
    console.warn("Kendo UI license initialization failed:", error)
  }
} 