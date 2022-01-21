export default function createGame(){
    const state = {
        players:{},
        fruits:{},
        screen:{
            width:20,
            height:20,
        },
    }

    var inGame = {
        _destroyed: true,
    }


    const observers = []

    function start(){
        const frequency = 2000 

        inGame = setInterval(addFruit, frequency)
        console.log(inGame)
        const command = {
            type : 'switch-game',
            status : true,
        }
        notifyAll(command)
    }
    function stop(){
        clearInterval(inGame)
        console.log(inGame)
        const command = {
            type : 'switch-game',
            status : false,
        }
        notifyAll(command)
    }
    function gameStats(){
        return !inGame._destroyed
    }

    function subscribe(observerFunction){
        observers.push(observerFunction)
    }

    function notifyAll(command){
        for(const observerFunction of observers){
            observerFunction(command)
        }
    }

    function setState(newState){
        Object.assign(state,newState)
    }

    //players
    function addPlayer(command){
        const playerId = command.playerId
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width)
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height)
        const score = 0
        const nick = command.nick
        
        

        state.players[playerId] = {
            x: playerX,
            y: playerY,
            score,
            nick,
           
        }

        notifyAll({
            type:'add-player',
            playerId,
            playerX,
            playerY,
        })
    }



    function removePlayer(command){
        const playerId = command.playerId

        notifyAll({
            type:'remove-player',
            playerId,
        })

        delete state.players[playerId]
    }


    //frutas
    function addFruit(command){
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 100000000)
        const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width)
        const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height)
        
        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY,
        }

        notifyAll({
            type: 'add-fruit',
            fruitId,
            fruitX,
            fruitY,
        })
    }

    function removeFruit(command){
        const fruitId = command.fruitId
        notifyAll({
            type: 'delete-fruit',
            fruitId,
        })

    delete state.fruits[fruitId]
    }



    function movePlayer(command){   //funçao passada para observer do keybord listener
        notifyAll(command)
        const acceptedMoves ={  //funçoes dos botoes 
            ArrowUp(player){
                if (player.y - 1 >= 0){
                    player.y = player.y - 1
                }
            },
            ArrowDown(player){
                if (player.y +1 < state.screen.height){
                    player.y = player.y + 1
                }
            },
            ArrowRight(player){
                if (player.x + 1 < state.screen.width){
                    player.x = player.x + 1
                }
            },
            ArrowLeft(player){
                if (player.x - 1 >= 0){
                    player.x = player.x - 1
                }
            },
        }


        const keyPressed = command.keyPressed
        const playerId = command.playerId
        const player = state.players[command.playerId]
        const moveFunction = acceptedMoves[keyPressed]
        if(player && moveFunction){
            moveFunction(player)
            checkForFruitCollision(playerId) 
        }
    }


    //colisao de player e fruta
    function checkForFruitCollision(playerId){
        const player = state.players[playerId]

        for (const fruitId in state.fruits){
            const fruit = state.fruits[fruitId]
            if (player.x === fruit.x && player.y === fruit.y){
                //esta colidindo
                //console.log(`${playerId} esta colidindo com ${fruitId}`)
                addScore(playerId)
                removeFruit({fruitId:fruitId}) 
            }
        }
        
    }

    function addScore(playerId){
        const player = state.players[playerId]
        player.score +=1
        //console.log(state.players)
        notifyAll({
            type: 'att-score',
            playerId
        })
    }

    function attScore(){
        const playersScore = document.querySelector('.player')
        playersScore.innerHTML = `<div class="player-nick" style="font-weight: bold;"> Nick </div>
          <div class="player-score" style="font-weight: bold;"> Score </div>`
        for (const playerId in state.players){
            const player = state.players[playerId]
            const score = player.score
            const nick = player.nick
            playersScore.innerHTML += `<div class="player-nick">${nick}</div>  <div class="player-score">${score}</div>`
        }
    }

    function addNick(command){
        const playerId = command.playerId
        const playerNick = command.playerNick
        const player = state.players[playerId]
        player.nick = playerNick

        command.type = 'att-nick'

        notifyAll(command)

    }

    return {
        movePlayer,
        state,
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit,
        setState,
        subscribe,
        start,
        stop,
        attScore,
        gameStats,
        addNick,
    
    }
}