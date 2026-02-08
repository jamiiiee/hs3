'use client';

import { Route } from '../lib/routes';

interface RouteMapProps {
  route: Route;
}

// The SVG has a viewBox of 0 0 1000 1000
// Using reference points from the SVG to calculate the transformation:
// Point 0: lat=50.456, lon=-12.918 -> x=174.1, y=914.5
// Point 1: lat=54.832, lon=-5.187 -> x=536.2, y=576.4
// Point 2: lat=60.301, lon=0.998 -> x=825.9, y=97.6

// Linear regression from the reference points gives us these coefficients
// Added +20 Y offset to correct for points appearing too high
function latLonToSvgXY(lat: number, lon: number): { x: number; y: number } {
  const x = (lon + 12.918) * 46.87 + 174.1;
  const y = (60.301 - lat) * 82.97 + 97.6 + 20;
  return { x, y };
}

// Cropped viewBox to zoom in on mainland UK (cutting out Shetland and empty space)
// Format: "minX minY width height"
const VIEWBOX = "350 260 550 680";

export default function RouteMap({ route }: RouteMapProps) {
  const origin = latLonToSvgXY(route.origin_lat, route.origin_lon);
  const destination = latLonToSvgXY(route.destination_lat, route.destination_lon);

  return (
    <div className="relative w-36 aspect-3/4 overflow-hidden bg-[#3b5dc9] border-4 border-black">
      {/* UK Map background - inline SVG with same viewBox for alignment */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={VIEWBOX}
        preserveAspectRatio="xMidYMid slice"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Load the map as an image within the SVG for proper alignment */}
        <image
          href="/uk-map.svg"
          x="0"
          y="0"
          width="1000"
          height="1000"
        />

        {/* Route line - black dotted */}
        <line
          x1={origin.x}
          y1={origin.y}
          x2={destination.x}
          y2={destination.y}
          stroke="#1a1c2c"
          strokeWidth="6"
          strokeDasharray="16 12"
          strokeLinecap="square"
        />

        {/* Origin point - circle */}
        <circle
          cx={origin.x}
          cy={origin.y}
          r="8"
          fill="#f77f00"
          stroke="#1a1c2c"
          strokeWidth="2"
        />

        {/* Destination point - circle */}
        <circle
          cx={destination.x}
          cy={destination.y}
          r="8"
          fill="#9b5de5"
          stroke="#1a1c2c"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
