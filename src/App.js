import React, { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Proposal from "./pages/Proposal";
import paisanosLogo from "./images/paisanos.png";
import paisanosLogoMobile from "./images/paisanos-mobile.png";
import { ConnectButton } from "web3uikit";

const App = () => {
  const [header, setHeader] = useState("header");
  const [logo, setLogo] = useState(paisanosLogo);
  const [logoWidth, setLogoWidth] = useState("160px");
  async function componentDidMount() {
    window.addEventListener("resize", resize.bind());
    resize();
  }

  async function resize() {
    if (window.innerWidth < 760) {
      setHeader("header-mobile");
      setLogo(paisanosLogoMobile);
      setLogoWidth("40px");
    } else {
      setHeader("header");
      setLogo(paisanosLogo);
      setLogoWidth("160px");
    }
  }

  useEffect(() => {
    componentDidMount();
    resize();
  });
  return (
    <>
      <div className={header}>
        <img width={logoWidth} src={logo} alt="logo" />
        <ConnectButton style={{ margin: 0 }} />
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/proposal" element={<Proposal />} />
      </Routes>
    </>
  );
};

export default App;
