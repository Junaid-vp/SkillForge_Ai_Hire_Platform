import { RouterProvider } from "react-router-dom"
import { router } from "./Routes"
import { Toaster } from "react-hot-toast"

function App() {


  return (
    <>
  <Toaster
  position="top-right"
  reverseOrder={false}
  gutter={8}
  toastOptions={{
    duration: 4000,

    style: {
      background:   "#ffffff",
      color:        "#0f172a",
      fontSize:     "12.5px",
      fontWeight:   "500",
      fontFamily:   "inherit",
      padding:      "14px 16px",
      borderRadius: "16px",
      boxShadow:    "0 8px 32px rgba(37,99,235,0.08), 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)",
      maxWidth:     "360px",
      border:       "1px solid #e5e7eb",
      lineHeight:   "1.6",
      borderLeft:   "3px solid #2563eb",
    },

    success: {
      duration: 3000,
      style: {
        background:   "#ffffff",
        color:        "#0f172a",
        border:       "1px solid #e5e7eb",
        borderLeft:   "3px solid #2563eb",
        boxShadow:    "0 8px 32px rgba(37,99,235,0.08), 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)",
      },
      iconTheme: {
        primary:   "#2563eb",
        secondary: "#ffffff",
      },
    },

    error: {
      duration: 5000,
      style: {
        background:   "#ffffff",
        color:        "#0f172a",
        border:       "1px solid #e5e7eb",
        borderLeft:   "3px solid #ef4444",
        boxShadow:    "0 8px 32px rgba(239,68,68,0.08), 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)",
      },
      iconTheme: {
        primary:   "#ef4444",
        secondary: "#ffffff",
      },
    },
  }}
/>

    <RouterProvider router={router}/>
    </>
  )
}

export default App
