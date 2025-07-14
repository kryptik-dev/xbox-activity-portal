# Xbox Activity Portal

A modern desktop app to view and share your Xbox 360 activity, with Discord Rich Presence integration. Built with Electron, React, and Node.js for a seamless, responsive experience on Windows.

---

## Features

- **Xbox 360 Connection:** View real-time game, title ID, and gamertag from your Xbox 360.
- **Discord Rich Presence:** Automatically updates your Discord status with your current Xbox activity.
- **Discord Account Display:** See which Discord account is connected.
- **Responsive UI:** Mobile-friendly, flexible card-based dashboard.
- **Settings Management:** Configure Xbox IP, Discord client ID, and more. Settings are saved in your user profile.
- **Auto-Connect:** Optionally auto-connect to your Xbox every 10 seconds.
- **Windows Support:** Native look and feel for Windows desktop.

---

## Installation

1. **Download the latest release** from the [Releases page](https://github.com/lilpizzaro/xbox-activity-portal/releases/).
2. **Run** `Xbox Activity Portal.exe`.
3. **Configure your settings** (Xbox IP, Discord Client ID) in the appâ€™s settings panel.
4. **Connect and enjoy!**

---

## Development

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Setup
```bash
# Clone the repo
 git clone https://github.com/lilpizzaro/xbox-activity-portal.git

# Install dependencies
 npm install

# Launch the exe file
Xbox.Activity.Portal.Setup.1.0.0.exe


# For Electron development
 npm run electron:dev
```

---

## Repository Management

### Large File Storage (Git LFS)
This repository uses [Git Large File Storage (LFS)](https://git-lfs.github.com/) to efficiently manage large files and binaries. All files, including `.exe` files and hidden files, are tracked with Git LFS. This helps keep the repository size manageable and ensures smooth collaboration.

- **Tracked by LFS:**
  - All files (`*`, `.*`, `**/*`)
  - Executables (`*.exe`)
  - Specific files: `backend/node_modules/tr46/lib/.gitkeep`, `frontend/.gitignore`

If you clone or contribute to this repository, make sure you have Git LFS installed:
```bash
git lfs install
git lfs pull
```

### Ignored Files
The following files and folders are ignored and should not be committed:

- `node_modules/` (dependencies)
- `dist-working/` (build artifacts)
- `*.dll`, `*.exe` (binaries)

These rules are enforced in the `.gitignore` file.

---

## Usage
- Make sure your Xbox 360 has the XBDM plugin.
- Start the app, enter your Xbox IP and Discord Client ID in settings.
- Click **Connect** to link your Xbox and Discord.
- Your Discord status will update automatically with your Xbox activity.

---

## Credits
- Inspired by the Xbox 360 Metro Dashboard
- Uses [discord-rpc](https://www.npmjs.com/package/discord-rpc) and [React](https://react.dev/)
- Created by [кяуρтιк](https://github.com/kryptik-dev/) & [Safauri](https://github.com/Safauri/)

---
