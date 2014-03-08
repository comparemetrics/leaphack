var Ascend = (function() {

	return func = function(config) {
		var ascend = this;

		// Setup the default configs
		defaults = {
			overlays: true,
		}

		// Merge the configs
		config = deepMerge(defaults,config);

		// Setup Overlays 
		if (config.overlays == true) {
			var overLayDiv = document.createElement('div');
			overLayDiv.setAttribute('style','display: block; width: 0px; height: 0px; color: white; background-color: rgba(0,0,0,0); overflow: hidden; position: fixed; top: 0px; left: 0px; z-index: 9999;');
			var overLayDevice = document.createElement('img');
			overLayDevice.setAttribute('src','/images/leapDeviceOn.gif');
			overLayDevice.setAttribute('style','width: 50px;position: fixed; bottom: 0px; right: 0px;');
			document.body.appendChild(overLayDiv).appendChild(overLayDevice);
		}

		// Setup to leap loop and check for gestures.
		if (!this.controller) {
			this.controller = new Leap.Controller({ enableGestures: true });
			this.controller.on('animationFrame', function(frame){
				if (frame.id%10 === 0) {
					if (frame.pointables.length) {
						// trigger('pointables', frame);
					} else {
						// trigger('pointablesout', frame);
					}
					if (frame.hands.length) {
						// trigger('hands', frame);
					} else {
						// trigger('handsout', frame);
					}
					if (frame.fingers.length) {
						// trigger('fingers', frame);
					} else {
						// trigger('fingersout', frame);
					}
					if (frame.tools.length) {
						console.log('Tool '+frame.tools[0].id+' Detected');
						// trigger('tools', frame);
					} else {
						// trigger('toolsout', frame);
					}
					if (frame.gestures.length > 0) {
						trigger('gesture', frame);
						frame.gestures.forEach(function(gesture) {
							trigger(gesture.type, gesture);
							trigger(gesture.type + gesture.state,gesture);
						});
					}
				}
			});
			
			//Lets bind some default functions
			bind('deviceConnected', function() {
				if (config.overlays == true) trigger('showDeviceConnected');
				console.log('Device Connected');
			});

			bind('deviceDisconnected', function() {
				if (config.overlays == true) trigger('showDeviceDisconnected');
				console.log('Device Disconnected');
			});

			bind('showDeviceConnected', function() {
				if (config.overlays == true) {
					overLayDevice.setAttribute('src','/images/leapDeviceOn.gif');
				}
			});

			bind('showDeviceDisconnected', function() {
				if (config.overlays == true) {
					overLayDevice.setAttribute('src','/images/leapDeviceOff.gif');
				}
			});

			//Lets monitor the default things for LeapJS
			this.controller.on('deviceConnected', function(){
				trigger('deviceConnected');
			});

			this.controller.on('deviceDisconnected', function(){
				trigger('deviceDisconnected');
			});
			this.controller.on('focus', function(){
				trigger('focus');
			});

			this.controller.on('blur', function(){
				trigger('blur');
			});

			//Finally Connect
			this.controller.connect();
			checkStatus(this.controller);
		}

		function checkStatus(controller) {
			whileBool(controller.connection.focusedState,function() {
				trigger('showDeviceDisconnected');
			})
			trigger('showDeviceConnected');
			// if (controller.connection.focusedState) {
			// 	trigger('deviceConnected');
			// } else {
			// 	trigger('deviceDisconnected');
			// }
		};

		function bind(eventType, listener) {
			if(!this._listeners) {
				 this._listeners = {};
			}
			if(!(eventType in this._listeners)) {
				this._listeners[eventType] = [];
			}
			var arr = this._listeners[eventType];
			if(arrIndexOf(arr, listener) === -1) {
				arr.push(listener);
			}
			return;
		};

		function showBindings() {
			return this._listeners ? this._listeners : null;
		};


		function unbind(eventType, listener) {
			if(!(this._listeners && (eventType in this._listeners))) {
				return;
			}
			var arr = this._listeners[eventType];
			var idx = arrIndexOf(arr, listener);
			if (idx !== -1) {
				if(arr.length > 1) {
					this._listeners[eventType] = arr.slice(0, idx).concat( arr.slice(idx+1) );
				} else {
					delete this._listeners[eventType];
				}
				return;
			}
			return;
		};

		function trigger(eventType) {
			var args = Array.prototype.slice.call(arguments, 0);
			if (this._listeners && eventType in this._listeners) {
				for(var i=0; i < this._listeners[eventType].length; i++) {
					this._listeners[eventType][i].apply(this, args);
				}
			}
		};

		//Utils
		function arrIndexOf(arr, obj) {
			for(var i=0; i < arr.length; i++){
				if(arr[i] === obj){
					return i;
				}
			}
			return -1;
		}

		function deepMerge(obj1, obj2) {
			for (var p in obj2) {
				try {
					if ( obj2[p].constructor==Object ) {
						obj1[p] = MergeRecursive(obj1[p], obj2[p]);
					} else {
						obj1[p] = obj2[p];
					}
				} catch(e) {
					obj1[p] = obj2[p];
				}
			}
			return obj1;
		}

		function whileBool(object, callback) {
			if (!object) setTimeout(function() {whileBool(object, callback)},1000);
			else return callback && callback();
		}

		return {
			controller: ascend.controller,
			bind: function(eventType, listener){ return bind.call(ascend, eventType, listener); },
			unbind: function(eventType, listener){ return unbind.call(ascend); },
			listbindings: function(){return showBindings.call(ascend)},
			trigger: function(eventType){ return trigger.call(ascend, eventType); }
		};
	}

})();