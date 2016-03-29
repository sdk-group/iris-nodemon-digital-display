'use strict'

let storage = {
	api_server: '192.168.1.37',
	api_port: "9000"
};

class Settings {
	static getItem(name) {
		return storage[name];
	}
	static setItem(name, value) {
		storage[name] = value;
	}
}

module.exports = Settings;