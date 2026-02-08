'use client';

import { Route, formatTime } from '../lib/routes';
import RouteMap from './RouteMap';

interface RouteCardProps {
  route: Route;
  showTime: boolean;
  isRevealing?: boolean;
  displayTime?: number; // Optional override for displayed time (used for counting animation)
}

export default function RouteCard({ route, showTime, isRevealing, displayTime }: RouteCardProps) {
  return (
    <div className={`
      pixel-card bg-[#41a6f6] p-4 w-full
      transition-all duration-300
      ${isRevealing ? 'bg-[#73eff7]' : ''}
    `}>
      <div className="flex gap-3 items-center w-full">
        {/* Map */}
        <div className="shrink-0">
          <RouteMap route={route} />
        </div>

        {/* Route info */}
        <div className="flex flex-col justify-center flex-1 min-w-0">
          {/* Agency name */}
          <div className="pb-2 mb-2 border-b-4 border-[#1a1c2c]">
            <div className="text-xs font-bold text-[#1a1c2c] uppercase">
              {route.agency_name}
            </div>
          </div>

          {/* Origin & Destination */}
          <div>
            <div className="flex items-start gap-2">
              <span className="text-[#f77f00] text-xs">►</span>
              <span className="text-xs font-bold text-[#1a1c2c] uppercase">
                {route.origin_name}
              </span>
            </div>
            <div className="border-l-4 border-dashed border-[#1a1c2c] h-3 ml-1"></div>
            <div className="flex items-start gap-2">
              <span className="text-[#9b5de5] text-xs">►</span>
              <span className="text-xs font-bold text-[#1a1c2c] uppercase">
                {route.destination_name}
              </span>
            </div>
          </div>

          {/* Journey time */}
          <div className="mt-2 pt-2 border-t-4 border-[#1a1c2c]">
            <div className="text-xs text-[#1a1c2c] opacity-70 uppercase">
              Journey Time
            </div>
            {showTime ? (
              <div className={`
                text-lg font-bold text-[#1a1c2c]
                ${isRevealing ? 'animate-pulse' : ''}
              `}>
                {formatTime(displayTime !== undefined ? displayTime : route.avg_journey_min)}
              </div>
            ) : (
              <div className="text-lg font-bold text-[#1a1c2c]">
                ???
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
