'use strict'
const workstation_type = 'digital-display';

let SerialPort = require("serialport").SerialPort;

let User = require('./classes/User.js');
let dd = new User(workstation_type);

let login = 'dd';
let password = '1';

dd.login(login, password).then(() => {
	console.log('connection complete');

	let ws = dd.getWorkstation(workstation_type);

	let port = new SerialPort(ws.port, {
		baudRate: ws.baund_rate,
		dataBits: ws.data_bits,
		parity: ws.parity,
		stopBits: ws.stop_bits
	});

	port.on('data', function (data) {
		console.log("DATA", data);
	});

	port.on('open', function (data) {
		console.log("OPENED", data);
	});

	port.on('error', function (err) {
		console.log("ERR", err);
	});

	port.open(function (err) {
		console.log("SENDING");
		ws.on('command', (command) => {
			console.log('command:', command);
			port.write(command,
				function (res) {
					console.log("RESPONSE", res);
					done();
				});
		});
	});

})