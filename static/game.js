//TODO show missing ships at end
//TODO allow restarting game

function createBoardDiv(opponent) {
    const container = document.querySelector('.flex-container');
    const boardNode = document.createElement('div');
    boardNode.classList.add('board-container');
    const boardNodes = [];
    for (let y = 0; y < 10; y++) {
        const line = document.createElement('div');
        line.classList.add('line');
        boardNodes.push([]);
        for (let x = 0; x < 10; x++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            if (opponent) {
                tile.classList.add('op-tile');
            }
            tile.dataset.x = x;
            tile.dataset.y = y;
            if (y === 0) {
                tile.classList.add('top-edge');
            } else if (y === 9) {
                tile.classList.add('bottom-edge')
            }

            if (x === 0) {
                tile.classList.add('left-edge');
            } else if (x === 9) {
                tile.classList.add('right-edge');
            }

            line.appendChild(tile);
            boardNodes[y][x] = tile;
        }
        boardNode.appendChild(line);
    }

    container.appendChild(boardNode);
    return boardNodes;
}

function createShotsDataArray() {
    let shots = [];
    for (let y = 0; y < 10; y++) {
        shots.push([]);
        for (let x = 0; x < 10; x++) {
            shots[y].push(0);
        }
    }

    return shots;
}

function updateShips(shipCoords) {
    for (let i = 0; i < shipCoords.length; i++) {
        let ship = shipCoords[i];
        ship.coords = [];
        if (ship.dir === 0) {
            for (let d = 0; d < ship.size; d++) {
                playerBoardNodes[ship.y][ship.x + d].classList.add('ship');
                ship.coords.push([ship.y, ship.x + d]);
            }
        } else{
            for (let d = 0; d < ship.size; d++) {
                playerBoardNodes[ship.y + d][ship.x].classList.add('ship');
                ship.coords.push([ship.y + d, ship.x]);
            }
        }

        ships.push(ship);
    }
}

function sink(s, opponent) {
    for (let i = 0; i < s.size; i++) {
        if (s.dir === 0) {
            if (opponent) {
                opBoardNodes[s.y][s.x + i].classList.add('sunk');
                opBoardNodes[s.y][s.x + i].textContent = "";
            } else {
                playerBoardNodes[s.y][s.x + i].classList.add('sunk');
                playerBoardNodes[s.y][s.x + i].textContent = "";
            }
        } else {
            if (opponent) {
                opBoardNodes[s.y + i][s.x].classList.add('sunk');
                opBoardNodes[s.y + i][s.x].textContent = "";
            } else {
                playerBoardNodes[s.y + i][s.x].classList.add('sunk');
                playerBoardNodes[s.y + i][s.x].textContent = "";
            }
        }
    }
}

function handleClick(t) {
    if (turn === 0) {
        let x = parseInt(t.target.dataset.x);
        let y = parseInt(t.target.dataset.y);

        if (!shots[y][x]) {
            socket.emit('sendShot', {'x': x, 'y': y});
        }
    }
}

function addEventListeners() {
    const opTiles = document.querySelectorAll('.op-tile');
    opTiles.forEach(tile => tile.addEventListener('click', handleClick));
    const restartGame = document.querySelector('#restart-game-button');
    restartGame.addEventListener('click', () => socket.emit("restart_game")); 
}

function clearEventListeners() {
    const opTiles = document.querySelectorAll('.op-tile');
    opTiles.forEach(tile => {
        tile.removeEventListener('click', handleClick);
        tile.classList.remove('op-tile');
    });
}

const playerBoardNodes = createBoardDiv(false);
const opBoardNodes = createBoardDiv(true);
const shots = createShotsDataArray();
let ships = [];
let turn;
const messageNode = document.querySelector('.message');

let socket = io();

socket.emit('updateID', sessionStorage.getItem('id'));
socket.on('start_game', (data) => {
    data = JSON.parse(data);
    if (data.turn === data.id) {
        turn = 0;
        messageNode.textContent = "Your shot";
    } else {
        turn = 1;
        messageNode.textContent = "Waiting for shot..";
    }
    updateShips(data.ships);
    addEventListeners();
});

socket.on('receiveShot', (c) => {
    let response = {};
    response.x = c.x;
    response.y = c.y;
    playerBoardNodes[c.y][c.x].textContent = "X";
    for (let i = 0; i < ships.length; i++) {
        let s = ships[i];
        if (s.coords.length > 0) {
            for (let j = 0; j < s.coords.length; j++) {
                let sc = s.coords[j];
                if (sc[0] === c.y && sc[1] === c.x) {
                    playerBoardNodes[c.y][c.x].classList.add('hit');
                    if (s.coords.length === 1) {
                        response.sunk = 1;
                        response.ship = s;
                        sink(ships[i], false);
                        ships.splice(i, 1);
                    } else {
                        response.sunk = 0;
                        ships[i].coords.splice(j, 1);
                    }
                    response.hit = 1;
                    socket.emit('shotResponse', response);
                    if (ships.length == 0) {
                        socket.emit("game_over");
                        clearEventListeners();
                        messageNode.textContent = "You lose!";
                    }
                    return;
                }
            }
        }
    }

    turn = 0;
    messageNode.textContent = "Your shot";
    response.hit = 0;
    socket.emit('shotResponse', response);
});

socket.on('shotResponse', (r) => {
    if (r.hit === 1) {
        shots[r.y][r.x] = 1;
        opBoardNodes[r.y][r.x].textContent = "X";
        opBoardNodes[r.y][r.x].classList.add('hit');
        opBoardNodes[r.y][r.x].classList.remove('op-tile');
        if (r.sunk === 1) {
            sink(r.ship, true);
        }
        turn = 0;
        messageNode.textContent = "Your shot";
    } else {
        shots[r.y][r.x] = 1;
        opBoardNodes[r.y][r.x].textContent = "X";
        opBoardNodes[r.y][r.x].classList.add('miss');
        turn = 1;
        messageNode.textContent = "Waiting for shot..";
    }
});

socket.on("game_over", () => {
    messageNode.textContent = "You win!";
    clearEventListeners();
    socket.emit("sendMissedShips", ships);
});

socket.on("receiveMissedShips", (ships) => {
    for (let s of ships) {
        if (s.dir === 0) {
            for (let i = 0; i < s.size; i++) {
                opBoardNodes[s.y][s.x + i].classList.add('missed');
            }
        } else {
            for (let i = 0; i < s.size; i++) {
                opBoardNodes[s.y + i][s.x].classList.add('missed');
            }
        }
    }
});

socket.on("restart_game", () => {
    alert("Game restarting..");
    window.location.replace("/");
});
