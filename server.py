from flask import Flask, render_template, url_for, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

playerOne = {
    "ships": None,
    "id": None,
}

playerTwo = {
    "ships": None,
    "id": None,
}

@app.route('/')
def index():
    return render_template('place_ships.html')

@app.route('/game')
def game():
    return render_template('game.html')

@socketio.on('connect')
def on_connect():
    print("Connected")

@socketio.on('ready')
def on_ready(ships):
    if not playerOne["id"]:
        playerOne["id"] = request.sid
        playerOne["ships"] = ships
    elif not playerTwo["id"]:
        playerTwo["id"] = request.sid
        playerTwo["ships"] = ships
        pOneId = json.dumps(playerOne["id"])
        pTwoId = json.dumps(playerTwo["id"])
        emit("redirectToGame", pOneId, to=playerOne["id"])
        emit("redirectToGame", pTwoId, to=playerTwo["id"])

@socketio.on('updateID')
def updateID(id):
    if playerOne["id"] == id:
        playerOne["id"] = request.sid
        pOneData = {
            "ships": playerOne["ships"],
            "id": playerOne["id"],
            "turn": playerOne["id"]
        }
        data = json.dumps(pOneData)
        emit("start_game", data, to=playerOne["id"])
    elif playerTwo["id"] == id:
        playerTwo["id"] = request.sid
        pTwoData = {
            "ships": playerTwo["ships"],
            "id": playerTwo["id"],
            "turn": playerOne["id"]
        }

        data = json.dumps(pTwoData)
        emit("start_game", data, to=playerTwo["id"])

@socketio.on('shoot')
def shoot(coords):
    if request.sid == playerOne["id"]:
        emit('attack', coords, to=playerTwo["id"])
    else:
        emit('attack', coords, to=playerOne["id"])

@socketio.on('response')
def send_reponse(r):
    if request.sid == playerOne["id"]:
        emit('response', r, to=playerTwo["id"])
    else:
        emit('response', r, to=playerOne["id"])
        

@socketio.on('disconnect')
def on_disconnect():
    print("Leaving")

@socketio.on('game_over')
def game_over():
    if request.sid == playerOne["id"]:
        emit("game_over", to=playerTwo["id"])
    else:
        emit("game_over", to=playerOne["id"])

if __name__ == '__main__':
    socketio.run(app)
