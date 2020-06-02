import activate from './activate.js';

const expander = (function (activate) {
	const selectors = {
		section: '.js-expander',
		trigger: '.js-expander__trigger'
	};

	const module = {
		init: function () {
			module._initEvents();

			// If no JS, expanders will be open and non-interactable
			module._closeByDefault();
			module._addTabIndex();

			window.addEventListener('load', module._openByHash);
		},

		_initEvents: function () {
			let $triggers = document.querySelectorAll(selectors.trigger);
			activate($triggers, module._activateTrigger);

			window.addEventListener('hashchange', module._openByHash);
		},

		_activateTrigger: function (e) {
			e.preventDefault();

			let $section = e.target.closest(selectors.section);
			module._toggleSection($section);
		},

		_toggleSection: function ($section, close) {
			let $triggers = $section.querySelectorAll(selectors.trigger);

			if (typeof close === 'undefined') {
				close = $section.getAttribute('aria-expanded') === 'false';
			}

			if (close) {
				// Open the expander
				$section.setAttribute('aria-expanded', 'true');
				$triggers.forEach(($trigger) => $trigger.setAttribute('aria-expander', 'true'));
			} else {
				// Close the expander
				$section.setAttribute('aria-expanded', 'false');
				$triggers.forEach(($trigger) => $trigger.setAttribute('aria-expander', 'false'));
			}
		},

		_closeByDefault: function () {
			let $sections = document.querySelectorAll(selectors.section);

			$sections.forEach(($section) => {
				$section.setAttribute('aria-expanded', 'false');

				let $triggers = $section.querySelectorAll(selectors.trigger);
				$triggers.forEach(($trigger) => $trigger.setAttribute('aria-expander', 'false'));
			});
		},

		_openByHash: function () {
			// If URL contains a hash to an element within a collapsed section,
			// expand that section then scroll to the element

			let hash = document.location.hash;

			if (hash.length) {
				let $hash = document.querySelectorAll(hash);
				if ($hash.length) {

					// Expand the containing section
					$hash = $hash[0];
					let $expander = $hash.closest(selectors.section);

					if ($expander) {
						module._toggleSection($expander, true);
					}

					// Scroll to the given element
					// Only works if asynchronous
					window.setTimeout(() => $hash.scrollIntoView(), 0);
				}
			}
		},

		_addTabIndex: function () {
			let $triggers = document.querySelectorAll(selectors.trigger);
			$triggers.forEach(($trigger) => $trigger.setAttribute('tabindex', '0'));
		}
	};

	return {
		init: module.init
	};
})(activate);

// Self-initialise
expander.init();

export default expander;
