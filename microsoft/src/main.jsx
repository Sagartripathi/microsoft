// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <div>Hello

//     </div>
//   </StrictMode>
// );
import React from "react";
import ReactDOM from "react-dom/client";

const App = () => {
  const formStyle = {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "100%",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    color: "#555",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ddd",
    borderRadius: "4px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div style={formStyle}>
        <h2 style={{ textAlign: "center", color: "#333" }}>Sign-In Form</h2>
        <form>
          <label htmlFor="name" style={labelStyle}>
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your full name"
            style={inputStyle}
          />

          <label htmlFor="business" style={labelStyle}>
            Business Name
          </label>
          <input
            type="text"
            id="business"
            name="business"
            placeholder="Enter your business name"
            style={inputStyle}
          />

          <label htmlFor="phone" style={labelStyle}>
            Phone Number
          </label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <select id="ext" name="ext" style={{ ...inputStyle, flex: "1" }}>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+91">+91</option>
              <option value="+61">+61</option>
            </select>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="123-456-7890"
              style={{ ...inputStyle, flex: "3" }}
            />
          </div>

          <label htmlFor="gmail" style={labelStyle}>
            Gmail
          </label>
          <input
            type="email"
            id="gmail"
            name="gmail"
            placeholder="Enter your Gmail address"
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
