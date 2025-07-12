const net = require("net");
const rl = require("readline");

class CF {
    constructor() {
        this.client = new net.Socket();
        this.connected = false;
        this.readline = rl.createInterface(this.client, this.client);
        this.readline.setMaxListeners(300);
        this.client.on('error', (err) => {
            this.connected = false;
            // Optionally log or handle the error
        });
    }

    connect(ip, port = 730) {
        return new Promise((res, rej) =>
            this.client
            .once("connect", () => (this.connected = true, res()))
            .once("error", e => (this.connected = false, rej(new Error(`Connection failed: ${e.message}`))))
            .connect(port, ip)
        );
    }

    sendCommand(command) {
        if (!this.connected) return Promise.reject("not connected to console");
        return new Promise((res, rej) => {
            try {
                this.client.write(`${command}\r\n`);
                const listener = line => {
                    if (!line.startsWith("202- ")) {
                        this.readline.removeListener("line", listener);
                        res(line);
                    }
                };
                this.readline.on("line", listener);
            } catch (err) {
                rej(err);
            }
        });
    }

    getMemory(addr, len, type = "hex") {
        return this.sendCommand(`getmem addr=${addr} length=${len}`)
            .then(d => type === "dec" ? parseInt(d, 16) : d);
    }
}

module.exports = CF;