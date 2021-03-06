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

//app.use(express.static('publico'))

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


// routes scripts
app.get('/game.js', (req,res) =>{
    res.sendFile(path.resolve(__dirname,'publico/game.js'))
})
app.get('/keyboard-listener.js', (req,res) =>{
    res.sendFile(path.resolve(__dirname,'publico/keyboard-listener.js'))
})
app.get('/render-screen.js', (req,res) =>{
    res.sendFile(path.resolve(__dirname,'publico/render-screen.js'))
})
app.get('/sounds/coin.wav', (req,res) =>{
    res.sendFile(path.resolve(__dirname,'publico/sounds/coin.wav'))
})
app.get('/sounds/oneup.wav', (req,res) =>{
    res.sendFile(path.resolve(__dirname,'publico/sounds/oneup.wav'))
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

    socket.on('switch-game', (frequency)=>{
        if (game.gameStats()){
            game.stop()
           // console.log('pause')
        }else{
            game.start(frequency)
           // console.log('start')
        }  
    })

    socket.on('add-nick', nick =>{
        const playerId = socket.id
        const playerNick = nick ? nick : 'unknown'
        game.addNick({playerId,playerNick})
    })

    socket.on('special', () =>{
        game.special()
    })

    
})



server.listen(3000, ()=>{
    console.log(`Server listening on port: ${PORT}`)
})