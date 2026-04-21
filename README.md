# CS3500-WebServer

A Node.js web application for creating and managing Minecraft servers via Docker containers. Built with Express, EJS, MongoDB, and Passport.js authentication.

---

## Features

- **User authentication** — Register, login, and manage your profile (name, email, phone, username)
- **Role-based access control** — Three roles: `public`, `moderator`, and `admin`
- **Server management** — Create, start, stop, and delete Minecraft servers running in Docker containers
- **Server configuration** — Set port, memory allocation, game version, and server type (e.g. Vanilla)
- **Admin panel** — Create, update, and remove users; manage roles

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 5 |
| Templating | EJS + express-ejs-layouts |
| Database | MongoDB 7 + Mongoose |
| Auth | Passport.js (local strategy) + bcrypt |
| Containers | Dockerode |
| Dev | Nodemon, VS Code Dev Containers |

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/DrCDeVries/CS3500-WebServer.git
   cd CS3500-WebServer
   ```

2. Copy the environment template and fill in your values:
   ```bash
   cp template.env .env
   ```

3. Open the project in VS Code and select **Reopen in Container** when prompted. The dev container will build and start automatically.

4. The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Description |
|---|---|
| `PORT` | App port (default: `3000`) |
| `SESSION_SECRET` | Secret key for session signing |
| `ADMIN_USERNAME` | Default admin account username |
| `ADMIN_PASSWORD` | Default admin account password |
| `MONGO_INITDB_ROOT_USERNAME` | MongoDB root username |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB root password |
| `MONGO_INITDB_DATABASE` | Database name (default: `mcmanager`) |

---

## Project Structure

```
├── controllers/        # Business logic (auth, server management)
├── db/                 # MongoDB connection and operations
├── public/             # Static assets (CSS, JS)
├── routes/             # Express route handlers
├── views/
│   ├── admin/          # Admin panel pages
│   ├── modals/         # Login and profile modals
│   ├── pages/          # Public-facing pages (dashboard, register, 404)
│   └── serverManagement/  # Server manager UI
├── .devcontainer/      # Dev container config (Docker Compose, devcontainer.json)
├── server.js           # App entry point
└── template.env        # Environment variable template
```

---

## Ports

| Port | Service |
|---|---|
| `3000` | Web application |
| `9229` | Node.js debugger |
| `41017` | MongoDB (mapped from container port `27017`) |

---

## Deploying on Ubuntu / Linux

This section covers running the app on a Linux server using Docker Compose. Docker is required because the app manages Minecraft server containers via the Docker socket.

### Prerequisites

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt-get install -y git
```

### 1. Clone and Configure

```bash
git clone https://github.com/DrCDeVries/CS3500-WebServer.git
cd CS3500-WebServer
cp template.env .env
```

Edit `.env` with your production values — change all default passwords and the session secret:

```bash
nano .env
```

```env
PORT=3000
SESSION_SECRET=<long-random-string>
ADMIN_USERNAME=<your-admin-username>
ADMIN_PASSWORD=<strong-password>
MONGO_INITDB_ROOT_USERNAME=<db-username>
MONGO_INITDB_ROOT_PASSWORD=<strong-db-password>
MONGO_INITDB_DATABASE=mcmanager
```



### 2. Start the Application

```bash
docker compose up -d
```

Check that both containers are running:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs app
```

The app will be available at `http://<your-server-ip>:3000`.

> **Note:** The app mounts `/var/run/docker.sock` to manage Minecraft server containers. Make sure the user running Docker has permission to access the socket, or add your user to the `docker` group (`sudo usermod -aG docker $USER`).
