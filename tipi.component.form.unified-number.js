function setUnifiedNumber() {
	var elements = {
		root 		: 'number',
		input		: 'input[type=number]',
		control		: 'number-control',
		increment	: 'number-increment',
		decrement	: 'number-decrement'
	};

	var states = {
		ready 		: '__number--ready',
		focus 		: '__number--focus',
		hover 		: '__number--hover',
		disabled 	: '__number--disabled'
	};

	var attributes = {
		disabled 	: 'disabled',
		min			: 'min',
		max			: 'max',
		step 		: 'step'
	};

	var unifiedNumber = $('.' + elements.root).not('.' + states.ready);
	if(unifiedNumber.length == 0) {
		return;
	}

	unifiedNumber.each(function() {
		var unifiedNumber = $(this);
		var unifiedNumberInput = getUnifiedNumber(unifiedNumber, 'input', elements);
		var unifiedNumberControl = getUnifiedNumber(unifiedNumber, 'control', elements);
		var unifiedNumberIncrement = getUnifiedNumber(unifiedNumber, 'increment', elements);
		var unifiedNumberDecrement = getUnifiedNumber(unifiedNumber, 'decrement', elements);

		if(unifiedNumberInput.length + unifiedNumberIncrement.length + unifiedNumberDecrement.length < 3) {
			return;
		}

		//Add the ready state on the .number element
		unifiedNumber.addClass(states.ready);

		unifiedNumber.on({
			'tipi.unifiedNumber.init' : function(event, unifiedNumber) {
				setUnifiedNumberDisabledState(unifiedNumber, elements, states, attributes);
			},
			'tipi.unifiedNumber.focus' : function(event, unifiedNumber) {
				focusUnifiedNumber(unifiedNumber, states);
			},
			'tipi.unifiedNumber.blur' : function(event, unifiedNumber) {
				blurUnifiedNumber(unifiedNumber, states);
			},
			'tipi.unifiedNumber.increment' : function(event, unifiedNumber) {
				incrementUnifiedNumber(unifiedNumber, elements, states, attributes);
			},
			'tipi.unifiedNumber.decrement' : function(event, unifiedNumber) {
				decrementUnifiedNumber(unifiedNumber, elements, attributes);
			}
		});

		unifiedNumber.trigger('tipi.unifiedNumber.init', [unifiedNumber]);

		unifiedNumberInput.on({
			focus : function(event) {
				var unifiedNumber = getUnifiedNumber($(this), 'root', elements);
				unifiedNumber.trigger('tipi.unifiedNumber.focus', [unifiedNumber]);
			},
			blur : function(event) {
				var unifiedNumber = getUnifiedNumber($(this), 'root', elements);
				unifiedNumber.trigger('tipi.unifiedNumber.blur', [unifiedNumber]);
			}
		});

		var incrementTimeout;
		var incrementInterval;
		unifiedNumberIncrement.on({
			touchend : function(event) {
				event.preventDefault();
			},
			click : function(event) {
				event.preventDefault();

				//Remove pressed state on touch devices
				$(this).blur();
			},
			'mousedown touchstart' : function(event) {
				event.preventDefault();
				var unifiedNumber = getUnifiedNumber($(this), 'root', elements);

				unifiedNumber.trigger('tipi.unifiedNumber.increment', [unifiedNumber]);

				if(typeof incrementTimeout != 'undefined') {
					clearTimeout(incrementTimeout);
				}

				incrementTimeout = setTimeout(function () {
					incrementInterval = setInterval(function() {
						unifiedNumber.trigger('tipi.unifiedNumber.increment', [unifiedNumber]);
					}, 100);
				}, 500);
			},
			'mouseup mouseleave touchend' : function(event) {
				event.preventDefault();

				var unifiedNumber = getUnifiedNumber($(this), 'root', elements);
				var unifiedNumberInput = getUnifiedNumber(unifiedNumber, 'input', elements);
				unifiedNumberInput.blur();

				if(typeof incrementTimeout != 'undefined') {
					clearTimeout(incrementTimeout);
				}

				if(typeof incrementInterval != 'undefined') {
					clearInterval(incrementInterval);
				}
			}
		});

		var decrementInterval;
		var decrementTimeout;
		unifiedNumberDecrement.on({
			touchend : function(event) {
				event.preventDefault();
			},
			'click' : function(event) {
				event.preventDefault();

				//Remove pressed state on touch devices
				$(this).blur();
			},
			'mousedown touchstart' : function(event) {
				event.preventDefault();
				var unifiedNumber = getUnifiedNumber($(this), 'root', elements);

				unifiedNumber.trigger('tipi.unifiedNumber.decrement', [unifiedNumber]);

				if(typeof decrementTimeout != 'undefined') {
					clearTimeout(decrementTimeout);
				}


				decrementTimeout = setTimeout(function() {
					decrementInterval = setInterval(function() {
						unifiedNumber.trigger('tipi.unifiedNumber.decrement', [unifiedNumber]);
					}, 100);
				}, 500);
			},
			'mouseup mouseleave touchend' : function(event) {
				var unifiedNumber = getUnifiedNumber($(this), 'root', elements);
				var unifiedNumberInput = getUnifiedNumber(unifiedNumber, 'input', elements);
				unifiedNumberInput.blur();

				if(typeof decrementTimeout != 'undefined') {
					clearTimeout(decrementTimeout);
				}

				if(typeof decrementInterval != 'undefined') {
					clearInterval(decrementInterval);
				}
			}
		});

	});
}

function setUnifiedNumberDisabledState(unifiedNumber, elements, states, attributes) {
	var unifiedNumberInput = getUnifiedNumber(unifiedNumber, 'input', elements);
	if(unifiedNumberInput.length == 0) {
		return;
	}

	if(unifiedNumberInput.prop(attributes.disabled)) {
		unifiedNumber.addClass(states.disabled);
	} else {
		unifiedNumber.addClass(states.disabled);
	}
}

function focusUnifiedNumber(unifiedNumber, states) {
	unifiedNumber.addClass(states.focus);
}

function blurUnifiedNumber(unifiedNumber, states) {
	unifiedNumber.removeClass(states.focus);
}

function incrementUnifiedNumber(unifiedNumber, elements, states, attributes) {
	var input = getUnifiedNumber(unifiedNumber, 'input', elements);
	var value = parseUnifiedNumberData(input, attributes).value + parseUnifiedNumberData(input, attributes).step;

	if(parseUnifiedNumberData(input, attributes).max != false) {
		if(value >= parseUnifiedNumberData(input, attributes).max) {
			value = parseUnifiedNumberData(input, attributes).max;
		}
	}

	input.val(value);
	input.trigger('change');
}

function decrementUnifiedNumber(unifiedNumber, elements, attributes) {
	var input = getUnifiedNumber(unifiedNumber, 'input', elements);


	var value = parseUnifiedNumberData(input, attributes).value - parseUnifiedNumberData(input, attributes).step;

	if(value <= parseUnifiedNumberData(input, attributes).min) {
		value = parseUnifiedNumberData(input, attributes).min;
	}

	input.val(value);
	input.trigger('change');
}

function parseUnifiedNumberData(input, attributes) {
	var inputData = {
		value : input.val(),
		step : input.attr(attributes.step),
		min : input.attr(attributes.min),
		max : input.attr(attributes.max)
	};


	//Check if the default value is an actual integer or set it to 0.
	if(parseFloat(inputData.value) == NaN || inputData.value == '') {
		inputData.value = 0;
	} else {
		inputData.value = parseFloat(inputData.value);
	}

	//Check if the default value is an actual integer or set it to 0.
	if(inputData.step == NaN || typeof inputData.step == 'undefined') {
		inputData.step = 1;
	} else {
		inputData.step = parseFloat(inputData.step);
	}

	//Check if the default value is an actual integer or set it to 0.
	if(inputData.min == NaN || typeof inputData.min == 'undefined') {
		inputData.min = 0;
	} else {
		inputData.min = parseFloat(inputData.min);
	}

	//Check if the default value is an actual integer or set it to 0.
	if(inputData.max == NaN || typeof inputData.max == 'undefined') {
		inputData.max = false;
	} else {
		inputData.max = parseFloat(inputData.max);
	}

	return inputData;
}

function getUnifiedNumber(origin, type, elements) {
	if(typeof origin == 'undefined' && typeof type == 'undefined') {
		return;
	}

	var element;

	switch(type) {
		case 'root':
			element = origin.parents('.' + elements.root).first();
		break;
		case 'input':
			element = origin.find(elements.input).first();
		break;
		case 'control':
			element = origin.find('.' + elements.control);
		break;
		case 'increment':
			element = origin.find('.' + elements.increment);
		break;
		case 'decrement':
			element = origin.find('.' + elements.decrement);
		break;
		default:
			return;
	}

	return element;
}