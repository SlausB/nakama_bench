Scrappy and mostly dev-ops boilerplate for [`TypeScript`](https://www.typescriptlang.org/) + [`Node`](https://nodejs.org/) + [`Plotly`](https://plotly.com/) + [`Nakama`](https://heroiclabs.com/) disguised as benchmark test.

## Run
```
git clone https://github.com/heroiclabs/nakama
cd nakama
docker-compose up -d
cd ..

git clone https://github.com/SlausB/nakama_bench
cd nakama_bench
./run.sh
```
then visit http://localhost:8050/ for `Plotly` response times plots updated [in realtime](https://github.com/thedirtyfew/dash-extensions#websocket).

## What it does
Spawns clients and custom-authenticates them on nakama server every some time period: can be modified in `.env.example` or `.env`

## Niceties
- both (`Plotly` and `node(bench)`) containers running as host user
- running in development watch mode for automatic restarts on code changes
- plot data is fed to `Plotly` through sockets for truly realtime updates instead of timer-originated as Plotly docs [suggest](https://dash.plotly.com/live-updates)
- using [tsc-watch](https://github.com/gilamran/tsc-watch) with ESNext instead of cool [ts-node-dev](https://github.com/wclr/ts-node-dev/issues/265), because `node-fetch` (needed for `nakama.Client`) [requires](https://www.npmjs.com/package/node-fetch#loading-and-configuring-the-module) modules support (errors point to generated JS code though)

