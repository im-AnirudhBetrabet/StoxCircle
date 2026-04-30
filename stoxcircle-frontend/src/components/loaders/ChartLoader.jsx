export default function ChartLoader() {
  return (
    <div className="chart-loader">
      <svg width="100%" height="100%" viewBox="0 0 400 200">
        <defs>
          <linearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a1a1f" />
            <stop offset="50%" stopColor="#2a2a30" />
            <stop offset="100%" stopColor="#1a1a1f" />
          </linearGradient>

          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background shimmer */}
        <rect width="400" height="200" fill="url(#shimmer)">
          <animate
            attributeName="x"
            from="-400"
            to="400"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Fake chart line */}
        <path
          d="M0,150 C50,120 100,160 150,110 C200,80 250,140 300,90 C350,60 400,100"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Fake area */}
        <path
          d="M0,150 C50,120 100,160 150,110 C200,80 250,140 300,90 C350,60 400,100 L400,200 L0,200 Z"
          fill="url(#lineGradient)"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}