function createBoardDiv() {
    const boardNode = document.querySelector('.board-container');
    for (let y = 0; y < 10; y++) {
        const line = document.createElement('div');
        line.classList.add('line');
        boardNodes.push([]);
        for (let x = 0; x < 10; x++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
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
}

function createBoardDataArray() {
    for (let y = 0; y < 10; y++) {
        board.push([]);
        for (let x = 0; x < 10; x++) {
            board[y][x] = 0;
        }
    }
}

function getRandomLoc(size) {
    let dir = Math.floor(Math.random() * 2);
    let x, y;
    if (dir === 0) {
        x = Math.floor(Math.random() * (10 - size));
        y = Math.floor(Math.random() * 10);
    } else {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * (10 - size));
    }
    return {
        x: x,
        y: y,
        dir: dir,
        size: size,
    };
}

function placeShip(size, shipNum) {
    let loc;
    let collision = true;
    while (collision) {
        loc = getRandomLoc(size);
        collision = false;
        for (let i = 0; i < size; i++) {
            if (loc.dir === 0) {
                if (board[loc.y][loc.x + i] !== 0) {
                    collision = true;
                    break;
                }
            } else {
                if (board[loc.y + i][loc.x] !== 0) {
                    collision = true;
                    break;
                }
            }
        }
    }

    ships.push(loc);
    for (let i = 0; i < size; i++) {
        if (loc.dir === 0) {
            boardNodes[loc.y][loc.x + i].classList.add('ship');
            board[loc.y][loc.x + i] = shipNum;
        } else {
            boardNodes[loc.y + i][loc.x].classList.add('ship');
            board[loc.y + i][loc.x] = shipNum;
        } 
    }
}

function placeRandomShips() {
    placeShip(5, 1);
    placeShip(4, 2);
    placeShip(3, 3);
    placeShip(3, 4);
    placeShip(2, 5);
}

function moveShip(x, y) {
    let s = ships[selected];

    if (s.dir === 0) {
        if (s.size + x  - 1> 9) {
            return;
        }

        for (let i = 0; i < s.size; i++) {
            if (board[y][x + i] !== 0) {
                return;
            }
        }
    } else {
        if (s.size + y - 1 > 9) {
            return;
        }
        for (let i = 0; i < s.size; i++) {
            if (board[y + i][x] !== 0) {
                return;
            }
        }
    }

    if (s.dir === 0) {
        for (let i = 0; i < s.size; i++) {
            board[s.y][s.x + i] = 0;
            board[y][x + i] = selected + 1;
            boardNodes[s.y][s.x + i].classList.remove('ship');
            boardNodes[y][x + i].classList.add('ship');
        }
    } else {
        for (let i = 0; i < s.size; i++) {
            board[s.y + i][s.x] = 0;
            board[y + i][x] = selected + 1;
            boardNodes[s.y + i][s.x].classList.remove('ship');
            boardNodes[y + i][x].classList.add('ship');
        }
    }

    ships[selected].x = x;
    ships[selected].y = y;
    unselectShips();
}

function unselectShips() {
    let selectedTiles = document.querySelectorAll('.selected');
    if (selectedTiles) {
        selectedTiles.forEach((t) => {
            t.classList.remove('selected');
            selected = -1;
        });
    }
}

function selectShip(x, y) {
    let ship = ships[board[y][x] - 1];
    if (ship.dir === 0) {
        for (let i = 0; i < ship.size; i++) {
            boardNodes[ship.y][ship.x + i].classList.add('selected');
        }
    } else {
        for (let i = 0; i < ship.size; i++) {
            boardNodes[ship.y + i][ship.x].classList.add('selected');
        }
    }
    selected = board[y][x] - 1;
}

function handleClick(t) {
    let x = parseInt(t.target.dataset.x);
    let y = parseInt(t.target.dataset.y);

    if (board[y][x] !== 0) {
        if (board[y][x] !== selected + 1) {
            unselectShips();
            selectShip(x, y);
        }
    } else if (selected !== -1) {
        moveShip(x, y);
    }
}

function addEventListeners() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach((t) => {
        t.addEventListener('click', handleClick);
    });
}

const boardNodes = [];
const board = [];
const ships = [];
let selected = -1;

createBoardDiv();
createBoardDataArray();
placeRandomShips();
addEventListeners();
