import 'dotenv/config'
console.log( 'Environment variables:\n', process.env )
import express from "express"
import benchmark from './benchmark'

const app = express()
app.use( express.json() )

app.all('/', function (req, res) {
    console.log( 'Received:', req.body )
    res.send({
        message : 'Hello World',
        some : {
            structural : 'data might go here',
        },
    } )
})

const PORT = 8082
app.listen(
    PORT,
    () => console.log( 'Listening on port', PORT, '...' ),
)

benchmark()
