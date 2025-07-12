const express = require('express');
const cors = require('cors');
const CF = new (require("./utils"))();
const fs = require("fs").promises;
const path = require("path");
const { Client } = require("discord-rpc");
require("dotenv").config();
const dotenv = require('dotenv');
const fsSync = require('fs');

function getConfig() {
    dotenv.config({ path: path.join(__dirname, '../.env') });
    return {
        IP: process.env.IP,
        clientId: process.env.clientId,
        showGamertag: process.env.showGamertag
    };
}

const titleIdsFile = "TitleIDs.txt";
let currentTitleId = null;

const rpc = new Client({ transport: "ipc" });

async function startRPC() {
    try {
        rpc.removeAllListeners();
        rpc.on("ready", () => {
            discordConnected = true;
            console.log("Connected to Discord client");
        });
        rpc.on("disconnected", () => {
            discordConnected = false;
            console.log("Discord client disconnected");
        });
        rpc.on("error", () => {
            discordConnected = false;
            console.log("Discord client error");
        });
        await rpc.login({ clientId });
    } catch (err) {
        console.error("Discord RPC connection failed:", err.message);
        process.exit(1);
    }
}

const getMemoryHex = async (address, length, label) => {
    try {
        const memory = await CF.getMemory(address, length);
        return memory.toString("hex").toUpperCase().trim();
    } catch (err) {
        throw new Error(`Unable to get ${label}: ${err.message}`);
    }
};

const getTitleId = () => getMemoryHex(0xC0292070, 4, "Title ID");
const getProfileId = () => getMemoryHex(0xC0291FF0, 7, "Profile ID");

async function getGamertag() {
    try {
        const hex = await CF.getMemory(0x81AA28FC, 32);
        const buffer = Buffer.from(hex, "hex");
        let name = "";

        // Only read pairs of bytes when there are at least 2 bytes left
        for (let i = 0; i < buffer.length - 1; i += 2) {
            const code = buffer.readUInt16BE(i);
            if (code >= 32 && code <= 126) name += String.fromCharCode(code);
        }

        const trimmedName = name.trim();
        return trimmedName || "Not Signed In";
    } catch (err) {
        return "Not Signed In";
    }
}

async function updateGamePresence(titleId) {
    try {
        const data = await fs.readFile(path.join(__dirname, titleIdsFile), "utf-8");
        const match = data.split("\n").find(line => line.split(",")[0].trim() === titleId.trim());

        if (!match) return console.error(`Title ID not recognized: ${titleId}`);

        const [, gameName] = match.split(",");
        let tag = null;
        if (showGamertag?.toLowerCase() === "true") {
            tag = await getGamertag();
        }
        const presence = {
            details: `Playing ${gameName.trim()}`,
            state: tag ? `Gamertag: ${tag}` : undefined,
            largeImageKey: "main_menu",
            largeImageText: "Made By Avieah",
            smallImageKey: "main_menu",
            smallImageText: "https://github.com/Safauri",
            startTimestamp: new Date()
        };

        rpc.setActivity(presence);
        console.log(`Presence updated: ${gameName.trim()}`);
    } catch (err) {
        console.error("Presence update failed:", err.message);
    }
}

async function checkActivity() {
    while (true) {
        try {
            const titleId = await getTitleId();
            const profileId = await getProfileId();

            if (!titleId || !profileId) {
                console.error("Missing Title ID or Profile ID");
            } else if (titleId.trim() !== currentTitleId?.trim()) {
                currentTitleId = titleId;
                await updateGamePresence(titleId);
            }
        } catch (err) {
            console.error("Activity check error:", err.message);
        } finally {
            await new Promise(res => setTimeout(res, 30000)); // 1-minute refresh
        }
    }
}

// --- State for API ---
let xboxConnected = false;
let discordConnected = false;
let lastStatus = {
    titleId: null,
    profileId: null,
    gamertag: null,
    gameName: null,
    error: null
};

// --- Express API Setup ---
const app = express();
app.use(cors());
app.use(express.json());

// Log the IP address and .env values at startup
const { IP, clientId, showGamertag } = getConfig();
console.log('Using Xbox IP:', IP);
console.log('Discord clientId:', clientId);
console.log('Show Gamertag:', showGamertag);

// Enhance /connect endpoint with more logging
app.post('/connect', async (req, res) => {
    if (xboxConnected) {
        console.log('Already connected to Xbox at', IP);
        return res.json({ success: true, message: 'Already connected to Xbox' });
    }
    try {
        console.log('Attempting to connect to Xbox at', IP);
        await CF.connect(IP);
        xboxConnected = true;
        console.log('Successfully connected to Xbox at', IP);
        await startRPC();
        checkActivity(); // Let it run in background
        res.json({ success: true, message: 'Connected to Xbox' });
    } catch (err) {
        xboxConnected = false;
        console.error('Failed to connect to Xbox at', IP, 'Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/status', async (req, res) => {
    if (!xboxConnected || !CF.connected) {
        return res.status(200).json({
            xboxConnected: false,
            discordConnected,
            titleId: null,
            profileId: null,
            gamertag: null,
            gameName: null,
            error: "Not connected to Xbox"
        });
    }
    try {
        const titleId = await getTitleId();
        const profileId = await getProfileId();
        let gamertag = null;
        let gameName = null;
        if (showGamertag?.toLowerCase() === "true") {
            gamertag = await getGamertag();
        }
        const data = await fs.readFile(path.join(__dirname, titleIdsFile), "utf-8");
        const match = data.split("\n").find(line => line.split(",")[0].trim() === titleId.trim());
        if (match) {
            [, gameName] = match.split(",");
        }
        lastStatus = { titleId, profileId, gamertag, gameName, error: null };
        res.json({
            xboxConnected,
            discordConnected,
            ...lastStatus
        });
    } catch (err) {
        lastStatus.error = err.message;
        res.status(500).json({
            xboxConnected,
            discordConnected,
            ...lastStatus
        });
    }
});

// GET /env - return current env values
app.get('/env', (req, res) => {
    const { IP, clientId, showGamertag } = getConfig();
    res.json({
        clientId: clientId,
        IP: IP,
        showGamertag: showGamertag
    });
});

// POST /env - update .env file and process.env
app.post('/env', async (req, res) => {
    const { clientId, IP, showGamertag } = req.body;
    const envContent = `clientId=${clientId}\nIP=${IP}\nshowGamertag=${showGamertag}\n`;
    try {
        await fs.writeFile(path.join(__dirname, '../.env'), envContent, 'utf-8');
        // No need to touch or restart, just reload env vars
        dotenv.config({ path: path.join(__dirname, '../.env') });
        process.env.clientId = clientId;
        process.env.IP = IP;
        process.env.showGamertag = showGamertag;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    if (CF.connected) {
        CF.client.destroy();
    }
    if (rpc) {
        rpc.destroy();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    if (CF.connected) {
        CF.client.destroy();
    }
    if (rpc) {
        rpc.destroy();
    }
    process.exit(0);
});

// --- Start API server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
