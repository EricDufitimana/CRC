import { Search } from 'lucide-react';

const NoOpportunitiesFound = () => {
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
          {/* Background blob shape */}
          <path
            d="M60 40 
               Q 80 25, 120 25
               Q 160 15, 200 35
               Q 240 25, 260 60
               Q 270 100, 250 140
               Q 265 180, 230 200
               Q 190 220, 150 215
               Q 110 225, 80 200
               Q 45 185, 35 150
               Q 25 110, 40 80
               Q 35 50, 60 40 Z"
            fill="#fed7aa"
          />
          
          {/* Smaller accent shapes */}
          <circle cx="50" cy="70" r="8" fill="#fdba74" />
          <circle cx="230" cy="50" r="6" fill="#fb923c" />
          <circle cx="35" cy="160" r="4" fill="#f97316" />
          
          {/* Main content area - document/folder */}
          <rect
            x="80"
            y="60"
            width="120"
            height="140"
            rx="12"
            fill="#ffffff"
            stroke="#fb923c"
            strokeWidth="3"
          />
          
          {/* Document header */}
          <rect
            x="90"
            y="75"
            width="100"
            height="8"
            rx="4"
            fill="#fed7aa"
          />
          
          {/* Empty list lines */}
          <rect
            x="90"
            y="95"
            width="80"
            height="4"
            rx="2"
            fill="#fde68a"
          />
          <rect
            x="90"
            y="105"
            width="60"
            height="4"
            rx="2"
            fill="#fde68a"
          />
          <rect
            x="90"
            y="115"
            width="70"
            height="4"
            rx="2"
            fill="#fde68a"
          />
          
          {/* Dashed lines to show emptiness */}
          <line
            x1="90"
            y1="135"
            x2="180"
            y2="135"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
          <line
            x1="90"
            y1="145"
            x2="160"
            y2="145"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
          <line
            x1="90"
            y1="155"
            x2="170"
            y2="155"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
          
          {/* Search magnifying glass */}
          <g transform="translate(210, 90)">
            {/* Glass circle */}
            <circle
              cx="0"
              cy="0"
              r="18"
              fill="none"
              stroke="#f97316"
              strokeWidth="4"
            />
            {/* Handle */}
            <line
              x1="13"
              y1="13"
              x2="25"
              y2="25"
              stroke="#f97316"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* X mark inside to show "not found" */}
            <line
              x1="-6"
              y1="-6"
              x2="6"
              y2="6"
              stroke="#f97316"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="6"
              y1="-6"
              x2="-6"
              y2="6"
              stroke="#f97316"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
          
          {/* Floating elements */}
          <rect
            x="45"
            y="120"
            width="12"
            height="12"
            rx="6"
            fill="#fb923c"
          />
          
          <polygon
            points="250,120 255,130 245,130"
            fill="#f97316"
          />
          
          {/* Abstract geometric shapes */}
          <rect
            x="220"
            y="160"
            width="20"
            height="20"
            rx="4"
            fill="#fdba74"
            transform="rotate(15 230 170)"
          />
          
          <circle cx="60" cy="200" r="10" fill="#fed7aa" />
        </svg>
      </div>
      
      {/* Text content */}
      <div className="space-y-4 max-w-md">
        <h3 className="text-xl font-bold text-gray-800">
          No Opportunities Found
        </h3>
      </div>
    </div>
  );
};

export default NoOpportunitiesFound;