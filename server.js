import express from 'express'
import http from 'http'
import createGame from './public/game.js'
import { Server } from 'socket.io'
import path from 'path'
const __dirname = path.resolve()

const app = express()
const server = http.createServer(app)
const sockets = new Server(server)

app.use(express.static('public'))


const game = createGame()
game.start()


//adcionando o observer
game.subscribe((command)=>{
    //console.log(command)
    sockets.emit(command.type,command)

})



// routes
app.get('/', (req,res) => {
    console.log('req.query')
    res.sendFile(path.resolve(__dirname,'public/login.html'))
})

app.get('/game', (req,res) =>{
    console.log(req.query)
    res.sendFile(path.resolve(__dirname,'public/game.html'))
})

app.get('/gameadm', (req,res) =>{
    res.sendFile(path.resolve(__dirname,'public/gameadm.html'))

})





//configurando sockets e players
sockets.on('connection', (socket)=>{
    const playerId = socket.id
    console.log(`player connected on Server with id: ${playerId}`)

    game.addPlayer({playerId:playerId})

    socket.emit('setup',game.state)

    socket.on('disconnect', ()=>{
        game.removePlayer({playerId:playerId})
    })

    socket.on('move-player',(command) =>{
        command.playerId = playerId
        command.type = 'move-player'
        game.movePlayer(command)
    })
})






server.listen(3000, ()=>{
    console.log(`Server listening on port: 3000`)
})