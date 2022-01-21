import express from 'express'
import http from 'http'
import createGame from './publico/game.js'
import { Server } from 'socket.io'
import path from 'path'
const __dirname = path.resolve()
const PORT = process.env.PORT || 5050;

const app = express()
const server = http.createServer(app)
const sockets = new Server(server)

app.use(express.static('publico'))

const game = createGame()

//adcionando o observer
game.subscribe((command)=>{
    //console.log(command)
    sockets.emit(command.type,command)
})



// routes
app.get('/', (req,res) => {
    console.log('req.query')
    res.sendFile(path.resolve(__dirname,'publico/login.html'))
})

app.get('/game', (req,res) =>{
    res.sendFile(path.resolve(__dirname,'publico/game.html'))
})

app.get('/gameadm', (req,res) =>{
    res.sendFile(path.resolve(__dirname,'publico/gameadm.html'))

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

    socket.on('switch-game', ()=>{
        if (game.gameStats()){
            game.stop()
           // console.log('pause')
        }else{
            game.start()
           // console.log('start')
        }  
    })

    socket.on('add-nick', nick =>{
        const playerId = socket.id
        const playerNick = nick ? nick : 'unknown'
        game.addNick({playerId,playerNick})
    })

    
})



server.listen(3000, ()=>{
    console.log(`Server listening on port: ${PORT}`)
})