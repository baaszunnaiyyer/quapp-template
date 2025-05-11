import { execSync } from "child_process";
import os from "os";
import qrcode from "qrcode-terminal";

// Get LAN IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    for (const iface of interfaces[key]) {
      if (!iface.internal && iface.family === "IPv4") {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const lanIP = getLocalIP();
const url = `http://${lanIP}:5173`; // Default Vite server port

console.log("🌍 Access your app from LAN at:", url);
console.log("\n📱 Scan the QR code below to open the app on any device:\n");

// Generate and display QR code
qrcode.generate(url, { small: true });

// Run Vite dev server
execSync("vite --host", { stdio: "ignore" });
