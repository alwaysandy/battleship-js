from flask import Flask, render_template, url_for, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('place_ships.html');

@socketio.on('my event')
def handle_my_custom_event(jsonMsg):
    print('Received json: ' + str(jsonMsg))

@socketio.on('join')
def on_join(data):
    print(request.sid)
    username = data['username']
    room = data['room']
    join_room(room)
    print(username + " has entered the room")
    msg = json.dumps({"msg": "Ass"})
    emit('testing', msg, to=request.sid)

@socketio.on('disconnect')
def on_disconnect():
    print("Leaving")

if __name__ == '__main__':
    socketio.run(app)
