import { WebSocketServer, WebSocket } from "ws";
const clients = new Map();
let wss;
export const initWebSocket = (server) => {
    wss = new WebSocketServer({ server });
    wss.on("connection", (ws, req) => {
        console.log("[WS] New Connection Established");
        ws.on("message", (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === "REGISTER" && data.companyId) {
                    clients.set(data.companyId, ws);
                    console.log(`[WS] Compay ${data.companyId} registered`);
                    ws.send(JSON.stringify({
                        type: "REGISTERED",
                        message: "Connected to DevHire Notifications",
                    }))

                }

            } catch (error) {
                console.error("[WS] Message parse error:", error.message);

            }
        })
        ws.on("close", () => {
            for (const [companyId, client] of clients.entries()) {
                if (client === ws) {
                    clients.delete(companyId);
                    console.log(`[WS] Company ${companyId} disconnected`);
                    break;
                }
            }
        });

        ws.on("error", (err) => {
            console.log("[WS] Error:", err.message);
        })
        console.log("[WS] Websocket Server initialised");
    });


};
export const notifyCompany = (companyId, payload) => {
    const client = clients.get(companyId);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
        console.log(`[ws] Notification sent to company ${companyId}`);

    } else {
        console.log(`[ws] Company ${companyId} not connected --skipping notification`);
    }
}