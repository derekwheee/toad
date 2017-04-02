const test = require('ava');
const rooms = require('../../bot/rooms.js');

test('rooms', t => {
	t.truthy(typeof rooms === 'object');
});

test('new room', t => {
    rooms.set('test');
    t.truthy('test' in rooms);
});

test('get new room', t => {
    const room = rooms.get('test');
    t.truthy(rooms);
});

test('room structure', t => {
    const room = rooms.get('test');
    t.truthy('clients' in room && Array.isArray(room.clients));
    t.truthy('join' in room && typeof room.join === 'function');
    t.truthy('leave' in room && typeof room.leave === 'function');
});

test('add client', t => {
    const room = rooms.get('test');
    room.join('fake client');
    t.truthy(room.clients.indexOf('fake client') > -1);
});

test('duplicate room', t => {
    const room = rooms.get('test');
    const duplicate = rooms.set('test');
    t.truthy(duplicate.clients.length === 1);
});

test('remove client', t => {
    const room = rooms.get('test');
    room.leave('fake client');
    t.truthy(room.clients.indexOf('fake client') === -1);
});
