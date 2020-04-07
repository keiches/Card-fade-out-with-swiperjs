import React from "react";
import "./styles.css";
import SwipeBox from "./SwipeBox";

export default function App() {
  return (
    <div className="App">
      <h1>Swipe Cards</h1>
      <div className="swiper-box">
        <SwipeBox />
      </div>
    </div>
  );
}
