export interface Route {
  route_id: string;
  agency_name: string;
  origin_name: string;
  origin_lat: number;
  origin_lon: number;
  destination_name: string;
  destination_lat: number;
  destination_lon: number;
  avg_journey_min: number;
}

// Parse CSV data
function parseCSV(csv: string): Route[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      route_id: values[0],
      agency_name: values[1],
      origin_name: values[2],
      origin_lat: parseFloat(values[3]),
      origin_lon: parseFloat(values[4]),
      destination_name: values[5],
      destination_lat: parseFloat(values[6]),
      destination_lon: parseFloat(values[7]),
      avg_journey_min: parseFloat(values[8]),
    };
  });
}

// We'll load routes on the client side
let cachedRoutes: Route[] | null = null;

export async function loadRoutes(): Promise<Route[]> {
  if (cachedRoutes) return cachedRoutes;

  const response = await fetch('/route_journey_times.csv');
  const csv = await response.text();
  cachedRoutes = parseCSV(csv);
  return cachedRoutes;
}

export function getRandomRoute(routes: Route[], exclude?: Route): Route {
  let route: Route;
  do {
    route = routes[Math.floor(Math.random() * routes.length)];
  } while (exclude && route.route_id === exclude.route_id);
  return route;
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
