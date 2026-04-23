import React from 'react'

function CircleLoader({ size = 40, color = "#8b5cf6" }) {
   return (
    <div
      className="circle-loader"
      style={{ width: size, height: size }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="dot"
          style={{
            "--i": i,
            background: color,
          }}
        />
      ))}
    </div>
  );
}

export default CircleLoader