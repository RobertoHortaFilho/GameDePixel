export default function createKeyboardListener(document){
    const state = {
        observers : [],
        playerId: null,
    }

    function registerPlayerId(playerId){
        state.playerId = playerId
    }
    function subscribe(observerFunction){
        state.observers.push(observerFunction)
    }

    function notifyAll(command){
        console.log(`notificando ${state.observers.length}`)

        for(const observerFunction of state.observers){
            observerFunction(command)
        }
    }


    document.addEventListener('keydown', handleKeyDown)
    function handleKeyDown(e){
        const keyPressed = e.key

        const command = {
            type: 'move-player',
            playerId:state.playerId, //player q vai mover
            keyPressed
        }

        notifyAll(command)
    }

    return {
        subscribe,
        registerPlayerId,
    }

}