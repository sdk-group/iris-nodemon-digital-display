'use strict'

let _ = require('lodash');
let Promise = require('bluebird');

let EventEmitter2 = require('eventemitter2').EventEmitter2;
let SharedEntities = require('../SharedEntities.js');
let connection = require('../connection-instance.js');

class BaseWorkstation extends EventEmitter2 {
	constructor(user, type) {
		super();
		this.user = user;
		this.type = type;
		this.shared = [];
	}
	init(id, data) {
		this.label = data.label;
		this.id = id;
		this.fields = data;

		let bootstrap_uri = '/' + this.type + '/bootstrap';

		return connection.request(bootstrap_uri, {
				workstation: id
			})
			.then((data) => this.bootstrap(data))
			.then(() => this.getShared())
			.then(() => this.middleware())
			.then(() => {
				this.active = true;
			})
			.then(() => this.ready());
	}
	leave() {
		return connection.request('/workstation/leave', {
				workstation: this.id
			})
			.then(() => this.cleanUp())
			.then(() => {
				this.active = false;
				return this.id;
			});
	}
	ready() {
		return connection.request('/' + this.type + '/ready', {
			workstation: this.getId()
		});
	}
	getId() {
		return this.id;
	}
	getShared() {
		if (_.isEmpty(this.request_shared)) return true;

		let request = _.map(this.request_shared, shared => {
			let t = {};
			t.name = _.isString(shared) ? shared : shared.name;
			t.params = !!shared.params ? _.cloneDeep(shared.params) : {};
			t.params.workstation = this.getId();

			return t;
		});

		return SharedEntities.request(request);
	}
	middleware() {
		return true;
	}
	cleanUp() {
		return true;
	}
	bootstrap(data) {
		return true;
	}
	subscriptionName(event) {
		let office = SharedEntities.get('hierarchy');
		//@NOTE: rework this after stable Event API
		let event_name = _.isString(event) ? event : event.name;
		let params = _.isString(event) ? {} : event;

		let owner_id = params.owner_id || this.user.id;
		let full_name = _.reduceRight(office, (r, v) => {
			r.push(v.id);
			return r;
		}, [event_name]);

		full_name.push(owner_id);

		return full_name.join('.');
	}
	subscribe(event_name, cb) {
		let name = this.subscriptionName(event_name);
		return connection.subscribe(name, cb)
	}
	unsubscribe(event_name, cb) {
		let name = this.subscriptionName(event_name);
		return connection.unsubscribe(name, cb)
	}
	getId() {
		return this.id;
	}
}

module.exports = BaseWorkstation;