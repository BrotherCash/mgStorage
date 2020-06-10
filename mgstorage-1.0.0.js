class browserStorage {
	constructor() {
		for (var i=0; i<this.length(); i++) {
			let key = this.key(i);
			let value = this.get(key);
			try {
				value = JSON.parse(value);
			} catch {
				continue;
			}
			if (value.expires_in) {
				let created = +new Date(value.creation_date);
				let expires = value.expires_in*3600000;
				let now = +new Date();

				if ((created+expires) < now) {
					this.remove(key);
					i--;
				} else {
					continue;
				}
			} else {
				continue;
			}
		}
	}
	//creates 'key':'value' item in storage of selected type
	//passed object and/or array will be converted to string
	//if storage quota will be exeeded - warning will be thrown to the console
	create (key, value, type) {
		if (key == undefined || value == undefined) {
			console.warn('Required parameter is missing');
			return;
		}
		type == 'session' ? type = type : type = 'local';
		
		let createFn = new Function("key, value", type+"Storage.setItem(key, value)");
		if (typeof(value) == 'object' || typeof(value) == 'array') {
			value = JSON.stringify(value);
		}
		try {
		  createFn(key, value);
		} catch (err) {
		  console.warn(err);
		}
	}
	//if value is not an object - converts it to object
	//adds to the object key "creation_date" with date and time of creation
	//then converts the object to string
	createNow (key, value, type) {
		type == 'session' ? type = type : type = 'local';
		if (typeof(value) == 'object' && Array.isArray(value) == false) {
			value.creation_date = new Date();
			value = JSON.stringify(value);
		} else {
			value = {
				'content':value,
				'creation_date': new Date()
			};
			value = JSON.stringify(value);
		}
		try {
			this.create(key,value,type);
		} catch(err) {
			console.warn(err);
		}
	}
	//if value is not an object - converts it to object
	//adds to the object key "expires_in" with the period in hours after which the object will be deleted
	//adds to the object key "creation_date" with date and time of creation
	//then converts the object to string
	createExpires (key, value, hours, type) {
		if (hours == undefined) {
			console.warn('Required parameter is missing');
			return;
		}
		type == 'session' ? type = type : type = 'local';
		if (typeof(value) == 'object' && Array.isArray(value) == false) {
			value.expires_in = hours;
			value.creation_date = new Date();
			value = JSON.stringify(value);
		} else {
			value = {
				'content':value,
				'expires_in': hours,
				'creation_date': new Date()
			};
			value = JSON.stringify(value);
		}
		try {
			this.create(key,value,type);
		} catch(err) {
			console.warn(err);
		}
	}
	//returns value of item with passed key from storage of selected type
	get (key, type) {
		if (key == undefined) {
			console.warn('Required parameter is missing');
			return;
		}
		type == 'session' ? type = type : type = 'local';
		let getFn = new Function("key", "return "+type+"Storage.getItem(key)");
		return getFn(key);
	}
	//returns value of item with passed key from storage of selected type. Returned string will be converted to object
	getConverted (key, type) {
		type == 'session' ? type = type : type = 'local';
		let value = this.get(key, type);
		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	}
	//removes item with passed key from storage of selected type
	remove (key, type) {
		if (key == undefined) {
			console.warn('Required parameter is missing');
			return;
		}
		type == 'session' ? type = type : type = 'local';
		let removeFn = new Function("key", type+"Storage.removeItem(key)");
		removeFn(key);
	}
	//removes item with creation date older than shown in argument (in hours)
	removeOlder (hours, type) {
		if (hours == undefined) {
			console.warn('Required parameter is missing');
			return;
		}
		type == 'session' ? type = type : type = 'local';
		for (var i=0; i<this.length(type); i++) {
			let key = this.key(i, type);
			let value = this.get(key, type);
			try {
				value = JSON.parse(value);
			} catch {
				continue;
			}
			let now = new Date(),
				objCreated = new Date(value.creationDate),
				hoursPassed = Math.floor((now - objCreated)/1000/60/60);
			if (hoursPassed > hours) {
				this.remove(key, type);
			}
		}
	}
	//returns key of item with passed index from storage of selected type
	key (index, type) {
		if (index == undefined) {
			console.warn('Required parameter is missing');
			return;
		}
		type == 'session' ? type = type : type = 'local';
		let keyFn = new Function("index", "return "+type+"Storage.key(index)");
		return keyFn(index); 
	}
	//returns length of the storage of selected type
	length (type) {
		type == 'session' ? type = type : type = 'local';
		let lengthFn = new Function("return "+type+"Storage.length");
		return lengthFn();
	}
	//clears storage of selected type
	clear (type) {
		type == 'session' ? type = type : type = 'local';
		let clearFn = new Function(type+"Storage.clear()");
		clearFn();
	}

}
window.mgStorage = new browserStorage;
