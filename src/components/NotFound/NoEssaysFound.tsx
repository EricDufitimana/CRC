const NoEssaysFound = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {/* Main SVG Illustration */}
      <div className="mb-4">
        <svg
          width="280"
          height="240"
          viewBox="0 0 280 240"
          className="drop-shadow-sm"
        >
          {/* Background blob */}
          <path
            d="M70 40 
               Q 100 20, 140 30
               Q 180 15, 220 40
               Q 260 60, 250 110
               Q 260 160, 220 190
               Q 180 220, 130 210
               Q 80 220, 50 180
               Q 25 150, 35 100
               Q 40 70, 70 40 Z"
            fill="#bbf7d0"  /* light green */
          />

          {/* Accent shapes */}
          <circle cx="50" cy="70" r="8" fill="#86efac" />
          <circle cx="230" cy="60" r="6" fill="#4ade80" />
          <circle cx="40" cy="160" r="4" fill="#22c55e" />

          {/* Paper sheet */}
          <rect
            x="85"
            y="55"
            width="110"
            height="150"
            rx="8"
            fill="#ffffff"
            stroke="#22c55e"
            strokeWidth="3"
          />

          {/* Paper lines */}
          <rect x="95" y="70" width="80" height="6" rx="3" fill="#bbf7d0" />
          <rect x="95" y="85" width="60" height="4" rx="2" fill="#bbf7d0" />
          <rect x="95" y="100" width="70" height="4" rx="2" fill="#bbf7d0" />
          <rect x="95" y="115" width="90" height="4" rx="2" fill="#bbf7d0" />
          <rect x="95" y="130" width="50" height="4" rx="2" fill="#bbf7d0" />

          {/* Dashed "empty" lines */}
          <line
            x1="95"
            y1="150"
            x2="175"
            y2="150"
            stroke="#4ade80"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
          <line
            x1="95"
            y1="160"
            x2="165"
            y2="160"
            stroke="#4ade80"
            strokeWidth="2"
            strokeDasharray="6,4"
          />

          {/* Pen icon */}
          <g transform="translate(200, 180) rotate(-20)">
            <rect
              x="0"
              y="0"
              width="10"
              height="40"
              rx="2"
              fill="#22c55e"
            />
            <polygon points="0,0 10,0 5,-10" fill="#16a34a" />
            <rect x="0" y="30" width="10" height="10" fill="#166534" />
          </g>

          {/* Floating shapes */}
          <polygon points="250,120 255,130 245,130" fill="#22c55e" />
          <rect
            x="220"
            y="150"
            width="20"
            height="20"
            rx="4"
            fill="#86efac"
            transform="rotate(15 230 160)"
          />
          <circle cx="65" cy="200" r="10" fill="#bbf7d0" />
        </svg>
      </div>

      {/* Text content */}
      <div className="space-y-4 max-w-md">
        <h3 className="text-xl font-bold text-gray-800">
          No Essay Requests Found
        </h3>
      </div>
    </div>
  );
};

export default NoEssaysFound;
