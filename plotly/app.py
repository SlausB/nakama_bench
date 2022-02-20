# Run this app with `python app.py` and
# visit http://127.0.0.1:8050/ in your web browser.

from dash import Dash, html, dcc
from dash_extensions import WebSocket
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from dash.dependencies import Input, Output
import json

app = Dash( __name__, prevent_initial_callbacks = True )
#app = Dash( __name__ )

def plot_delays( df ):
    if not df:
        #df = pd.read_json( "../values.json" )
        df = [{"delay":0,"amount":0}]
    fig = px.bar( df, x="delay", y="amount", text_auto='.2s' )
    # if ANY of x-values will be a number, then plotly will treat them ALL as numbers leaving literals outside the graph:
    fig.update_layout(xaxis_type='category')
    return fig

def plot_ratio( df ):
    #plotly.express:
    if not df:
        #df = json.load( open( "../ratio.json" ) )
        df = [{"state":0,"amount":0}]
    fig = px.pie(
        title = "Succeed ratio",
        data_frame = df,
        values = "amount",
        names = "state",
        hole = .3,
        color = "state",
        color_discrete_map = {
            "succeeded" : "green",
            "failed" : "red",
        },
    )
    fig.update_traces( textposition='inside', textinfo='percent+label' )
    return fig

app.layout = html.Div(children=[
    html.H1(children='Connection delays'),

    html.Div(children='''
        Til response to anonim 'yandex-login'
    '''),

    dcc.Graph(
        id='connection_delays',
        #figure = plot_delays(),
        #trying to animate makes bars go beyond chart area:
        #animate = True,
    ),
    dcc.Graph(
        id="succeed_ratio",
        #figure = plot_ratio(),
        #trying to animate makes bars go beyond chart area:
        #animate = True,
    ),

    html.Div(id="status"),
    WebSocket(url="ws://localhost:10000", id="ws"),
])

@app.callback(
    [
        Output('connection_delays', 'figure'),
        Output('succeed_ratio', 'figure'),
        Output("status", "children"),
    ],
    [Input("ws", "message")]
)
def message(e):
    #print( "Socket message:", e )
    status = "undefined"
    delays = None
    ratio = None
    if e and "data" in e:
        status = f"Response from websocket has some data."
        jd = json.loads( e[ "data" ] )
        delays = jd[ "delays" ]
        ratio = jd[ "ratio" ]
    status = "Response from websocket has no data field."
    return plot_delays( delays ), plot_ratio( ratio ), status



if __name__ == '__main__':
    print( "Running server ..." )
    app.run_server( host="0.0.0.0", debug=True )