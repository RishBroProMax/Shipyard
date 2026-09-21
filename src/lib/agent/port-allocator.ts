import net from "net";

const PORT_RANGE_START = 30000;
const PORT_RANGE_END = 39999;

const reservedPorts = new Set<number>();

/**
 * Checks if a port is currently free on localhost
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  if (reservedPorts.has(port)) {
    return false;
  }

  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port, "0.0.0.0");
  });
}

/**
 * Dynamically allocates the next available port in the 30000-39999 range.
 * Avoids collisions with active containers and reserved ports.
 */
export async function allocatePort(occupiedPorts: number[] = []): Promise<number> {
  // Add known occupied ports to reservation set
  for (const p of occupiedPorts) {
    reservedPorts.add(p);
  }

  for (let port = PORT_RANGE_START; port <= PORT_RANGE_END; port++) {
    if (!reservedPorts.has(port)) {
      const available = await isPortAvailable(port);
      if (available) {
        reservedPorts.add(port);
        return port;
      }
    }
  }

  throw new Error("No available ports in range 30000-39999");
}

/**
 * Releases a previously reserved port
 */
export function releasePort(port: number): void {
  reservedPorts.delete(port);
}

/**
 * Gets all currently reserved internal ports
 */
export function getReservedPorts(): number[] {
  return Array.from(reservedPorts);
}
