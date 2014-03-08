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
		if (!ascend.controller) {
			ascend.controller = new Leap.Controller({ enableGestures: true });
			ascend.controller.on('animationFrame', function(frame){
				if (frame.id%1 === 0) {
					if (frame.hands[0] && frame.hands[0].pitch) {
						if (frame.hands[0].pitch() > 0.28) {
							trigger('pitchUp', frame.hands[0].pitch())
						} else if (frame.hands[0].pitch() < -0.28) {
							trigger('pitchDown', frame.hands[0].pitch())
						}	
					}
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
			
			bind('circlestart', function(e, gesture){
				if (gesture.normal[2] < 0) {
					trigger('circleRight', gesture);
				} else {
					trigger('circleLeft', gesture);
				}
			});

			bind('swipestart', function(e, gesture){
				var dir = gesture.direction;
				if (Math.abs(dir[0]) > Math.abs(dir[1])) { // horizontal
					if (dir[0] > 0) {
						trigger('swipeRight', gesture);
					} else {
						trigger('swipeLeft', gesture);
					}
				} else if (Math.abs(dir[0]) < Math.abs(dir[1])) { // vertical
					if (dir[1] > 0) {
						trigger('swipeUp', gesture);
					} else {
						trigger('swipeDown', gesture);
					}
				}
			});

			bind('yawstart', function(e,hands){
			})

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
			ascend.controller.on('deviceConnected', function(){
				trigger('deviceConnected');
			});

			ascend.controller.on('deviceDisconnected', function(){
				trigger('deviceDisconnected');
			});
			ascend.controller.on('focus', function(){
				trigger('focus');
			});

			ascend.controller.on('blur', function(){
				trigger('blur');
			});

			//Finally Connect
			console.log('this: ', ascend)
			ascend.controller.connect();
			checkStatus(ascend.controller);
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
			if(!ascend._listeners) {
				 ascend._listeners = {};
			}
			if(!(eventType in ascend._listeners)) {
				ascend._listeners[eventType] = [];
			}
			var arr = ascend._listeners[eventType];
			if(arrIndexOf(arr, listener) === -1) {
				arr.push(listener);
			}
			return;
		};

		function showBindings() {
			return ascend._listeners ? ascend._listeners : null;
		};


		function unbind(eventType, listener) {
			if(!(ascend._listeners && (eventType in ascend._listeners))) {
				return;
			}
			var arr = ascend._listeners[eventType];
			var idx = arrIndexOf(arr, listener);
			if (idx !== -1) {
				if(arr.length > 1) {
					ascend._listeners[eventType] = arr.slice(0, idx).concat( arr.slice(idx+1) );
				} else {
					delete ascend._listeners[eventType];
				}
				return;
			}
			return;
		};

		function trigger(eventType) {
			var args = Array.prototype.slice.call(arguments, 0);
			if (ascend._listeners && eventType in ascend._listeners) {
				for(var i=0; i < ascend._listeners[eventType].length; i++) {
					ascend._listeners[eventType][i].apply(ascend, args);
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