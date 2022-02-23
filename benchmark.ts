import { v4 as uuidv4 } from 'uuid'
import { init, plot_all, AllPlots, DelaysPlot, RatioPlot } from './plot'

import nakamajs from "@heroiclabs/nakama-js"
//nakama-js uses these (thinking it's a browser):
import xhr2 from 'xhr2'
global.XMLHttpRequest = xhr2
import fetch from 'node-fetch'
//@ts-ignore
global.fetch = fetch


init()

type SocketMessage = {
    event : string
    data : any
}
class Connection {
    client ?: nakamajs.Client
    received : SocketMessage[] = []
    uuid = uuidv4()

    started = Date.now()
    logged_in_at : number = 0
    get succeeded_at() {
        return this.logged_in_at
    }

    failed_at : number = 0
    get failed() {
        return this.failed_at
    }
}
const connections : Connection[] = []

function connected( connection : Connection ) {
    //console.log( 'Socket connected' )
}
function disconnected( connection : Connection ) {
    //console.log( 'Socket disconnected' )
}
function any_event( connection : Connection, event : string, data : any ) {
    //console.log( 'Socket event:', event/*, data*/ )
    connection.received.push({
        event,
        data,
    })
}

function spawn_connection() {
    const connection = new Connection
    connections.push( connection )
    //@ts-ignore
    connection.client = new nakamajs.Client( "defaultkey", "127.0.0.1", 7350 )
    connection.client.authenticateCustom( connection.uuid, true )
        .then(
            result => {
                //console.log( 'Client custom authenticated:', result )
                if ( result.created == true ) {
                    connection.logged_in_at = Date.now()
                }
                else {
                    console.error( 'Failed to create session' )
                    connection.failed_at = Date.now()
                }
            },
            e => {
                console.error( 'Client connection failed:', e )
                connection.failed_at = Date.now()
            },
        )

    /*const socket = connection.client.createSocket()
    var appearOnline = true;
    var connectionTimeout = 30;
    socket.connect( connection.uuid, true )*/


    return connection
}

let overall_conns = 0
let overall_successes = 0
let overall_failed = 0

function test() {
    const CONNS = parseInt( process.env.CONNECTIONS )
    let succeeded = 0
    let failed = 0
    for ( let i = 0; i < CONNS; ++ i ) {
        const connection = spawn_connection()
        ++ overall_conns
        setTimeout(
            () => {
                if ( connection.succeeded_at != 0 ) {
                    ++ succeeded
                    ++ overall_successes
                }
                else {
                    ++ failed
                    ++ overall_failed
                }
            },
            parseInt( process.env.FAIL_AFTER_MS ),
        )
    }
    const busy_wait = setInterval(
        () => {
            if ( succeeded + failed >= CONNS ) {
                clearInterval( busy_wait )
                console.log( 'TEST COMPLETED: attempts:', CONNS, ', succeeded:', succeeded, 'failed:', failed, ". Overall", overall_conns, ":", overall_successes, "-", overall_failed )
            }
        },
        100,
    )
}

//seems like there are no uncatched errors anymore:
/*//axios throws exception of not being able to connect within 15s which causes the WHOLE node.js to halt, but this technique prevents node.js from it:
process.on('uncaughtException', function (err) {
    //console.log('Caught exception: ', err);
})*/

const DELAY_BARS = [
    50,
    100,
    200,
    350,
    500,
    750,
    1000,
    1500,
    3000,
    5000,
    8000,
    12000,
    15000,
    20000,
    25000,
    50000,
    100000,
]
function closest( goal : number ) {
    return DELAY_BARS.reduce( ( prev, curr ) => Math.abs( curr - goal ) < Math.abs( prev - goal ) ? curr : prev )
}
function account_delay( delays : DelaysPlot, delay : number ) {
    const bar = closest( delay )
    const found_delay = delays.find( d => d.delay == bar )
    if ( found_delay ) {
        found_delay.amount += 1
    }
    else {
        delays.push({
            delay : bar,
            amount : 1,
        })
    }
}
function collect_plots() {
    const delays : DelaysPlot = []
    const succeeded = {
        state : "succeeded",
        amount : 0,
    }
    const failed = {
        state : "failed",
        amount : 0,
    }
    for ( const connection of connections ) {
        if ( connection.succeeded_at != 0 ) {
            account_delay( delays, connection.succeeded_at - connection.started )
            succeeded.amount += 1
        }
        else {
            if ( connection.failed ) {
                failed.amount += 1
            }
        }
    }
    delays.sort( ( a, b ) => a.delay - b.delay )

    plot_all({
        delays,
        ratio : [
            succeeded,
            failed,
        ],
    })
}

export default function benchmark() {
    test()
    setInterval( test, parseInt( process.env.CONNECTIONS_PERIOD_MS ) )

    //plot regularly:
    setInterval(
        collect_plots,
        1000,
    )
}

