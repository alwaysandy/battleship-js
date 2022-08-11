var socket = io();
socket.on('connect', () => {
    socket.emit('my event', {data: "I'm connected!"});
});

socket.on('disconnect', () => {
    socket.emit('disconnect');
});

socket.on('testing', (msg) => {
    console.log(JSON.parse(msg));
});

socket.emit('join', {username: 'alphameese', room: 'alphameese'});
