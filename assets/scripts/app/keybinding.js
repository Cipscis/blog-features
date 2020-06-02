const keys = (function () {
	const bindings = {};
	/*
	{
		[keyString]: [
			{
				fn: fnA,
				fnWrapper: fnWrapperA
			},
			{
				fn: fnB,
				fnWrapper: fnWrapperB
			}
		]
	}
	*/

	const module = {
		_isFocusOnInput: function () {
			// Check if the current active element is an input that accepts keypresses

			let $activeEl = document.activeElement;
			let nodeName = $activeEl.nodeName.toLowerCase();

			let isInput = (['input', 'textarea', 'select'].includes(nodeName));

			if (nodeName === 'input') {
				let inputType = $activeEl.attributes.type.value.toLowerCase();

				if (['color', 'radio', 'checkbox'].includes(inputType)) {
					isInput = false;
				}
			} else if ($activeEl.isContentEditable) {
				isInput = true;
			}

			return isInput;
		},

		_bindFn: function (key, fn, fnWrapper) {
			document.addEventListener('keydown', fnWrapper);
			if (!bindings[key]) {
				bindings[key] = [];
			}

			bindings[key].push({
				fn: fn,
				fnWrapper: fnWrapper
			});
		},

		bind: function (key, fn, allowInInput, requireCtrl) {
			if (typeof key !== 'string') {
				throw new TypeError('The key parameter to bind must be a string.');
			} else {
				key = key.toLowerCase();
			}

			let fnWrapper = function (event) {
				// Don't check key if focus is on an input element,
				// unless it is allowed or requires Ctrl
				if (!allowInInput && module._isFocusOnInput() && !requireCtrl) {
					return;
				}

				// Some behaviour, like selecting an autocomplete result, can
				// fire a keydown event with no key
				if (event.key && event.key.toLowerCase() === key) {
					if (!requireCtrl || event.ctrlKey) {
						if (fn.apply(this, arguments) === false) {
							// Implement jQuery-like shorthand of return false;
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			};

			module._bindFn(key, fn, fnWrapper);
		},

		unbind: function (key, fn) {
			let binding = bindings[key];
			if (binding) {
				// Find index
				let index;
				for (index = 0; index < binding.length; index++) {
					if (binding[index].fn === fn) {
						break;
					}
				}

				if (index < binding.length) {
					document.removeEventListener('keydown', binding[index].fnWrapper);
					binding.splice(index, 1);
				}
			}
		},

		rebind: function (oldKey, fn, newKey, allowInInput, requireCtrl) {
			module.unbind(oldKey, fn);
			module.bind(newKey, fn, allowInInput, requireCtrl);
		},

		_getSequenceArgs: function (keyA, keyB, keyC, fn) {
			let args = Array.prototype.splice.call(arguments, 0);
			let keys = args[0];
			fn = args[args.length-1]; // The function should be the last event

			if (!Array.isArray(keys)) {
				keys = args.splice(0, args.length-1);
			}

			return {
				keys,
				fn
			};
		},

		bindSequence: function (keyA, keyB, keyC, fn) {
			let args = module._getSequenceArgs.apply(this, arguments);
			let keys = args.keys;

			let keysPressed = [];

			fn = args.fn;

			if (keys.length > 1) {
				// Record as many of the past keys pressed as required for the sequence

				let fnWrapper = function (event) {
					let key = event.key.toLowerCase();

					// Don't check key presses if focus is on an input element
					if (module._isFocusOnInput()) {
						return;
					}

					if (key !== 'shift') {
						// Ignore shift, as it's used as a modifier
						keysPressed.push(key);
					}
					if (keysPressed.length > keys.length) {
						keysPressed.shift();
					}

					if (key === keys[keys.length-1]) {
						// When the final key is pressed, check if the whole sequence matches
						let i;
						for (i = 0; i < keys.length; i++) {
							if (keys[i] !== keysPressed[i]) {
								break;
							}
						}

						// i only reaches keys.length if the break; line was never executed
						if (i === keys.length) {
							if (fn.apply(this, arguments) === false) {
								// Implement jQuery-like shorthand of return false;
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				};

				let keyString = keys.join(',');
				module._bindFn(keyString, fn, fnWrapper);
			}
		},

		unbindSequence: function (keyA, keyB, keyC, fn) {
			let args = module._getSequenceArgs.apply(this, arguments);
			let keyString = args.keys.join(',');

			fn = args.fn;

			module.unbind(keyString, fn);
		},

		rebindSequence: function (oldSequence, fn, newSequence) {
			module.unbindSequence(oldSequence, fn);
			module.bindSequence(newSequence, fn);
		},
	};

	return {
		bind: module.bind,
		unbind: module.unbind,
		rebind: module.rebind,

		bindSequence: module.bindSequence,
		unbindSequence: module.unbindSequence,
		rebindSequence: module.rebindSequence
	};
})();

export default keys;
