import { WebSocketServer, WebSocket } from 'ws'

const sockets : WebSocket[] = []

export function init() {
    const wss = new WebSocketServer(
        { port: 10000 },
        ()=>{
            console.log( 'Web socket server successfully inited.' )
        },
    )

    wss.on( 'connection', ws => {
        //console.log( 'Websocket connection received' )
        sockets.push( ws )
        ws.on('message', data => {
            console.log( 'WebSocket message received: %s', data.toString() )
            //echo:
            ws.send( data.toString() )
        })
    })
}

export type DelaysPlot = { delay : number, amount : number }[]
export type RatioPlot = { state : string | number, amount : number }[]
export type AllPlots = { delays : DelaysPlot, ratio : RatioPlot }
export function plot_all( data : AllPlots ) {
    //console.log( 'Sending plot data to ', sockets.length, ' socket clients:', data )
    for ( const s of sockets ) {
        s.send(
            JSON.stringify( data ),
            e => {
                if ( e ) {
                    console.error( 'Socket data send fail:', e )
                    //probably socket closed:
                    s.close()
                    sockets.splice( sockets.indexOf( s ), 1 )
                }
            },
        )
    }
}

