> This project using nodejs v22.0.0

> This project using docker-compose v2.24.6

## Install

```shell
npm i
```

## Setting up

Make sure you write your settings in config/.env file

## Database run (flag -d run the database container in background)

```shell
docker-compose up -d
```

## Bot run (dev)

```shell
npm run dev
```

## Bot run (production, it will be create a pm2 task)

```shell
npm start
```

### Install on server
1) Login in your server
2) Install the nodejs AND docker
3) Clone the repo and install modules
4) Run the docker compose
5) Run bot using production mode
