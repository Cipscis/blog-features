/* Expander 1.2 */

import activate from './activate.js';

const expander = (function (activate) {
	const selectors = {
		section: '.js-expander',
		trigger: '.js-expander__trigger'
	};

	const States = {
		OPENED: 'Opened',
		CLOSED: 'Closed'
	};

	const module = {
		init: function () {
			module._initEvents();

			// If no JS, expanders will be open
			module._closeByDefault();

			window.addEventListener('load', module._openByHash);
		},

		_initEvents: function () {
			let $triggers = document.querySelectorAll(selectors.trigger);

			activate($triggers, module._toggleEvent);

			window.addEventListener('hashchange', module._openByHash);
		},


		_toggleEvent: function (e) {
			e.preventDefault();

			let $trigger = e.target.closest(selectors.trigger);

			let $section = module._getTriggerSection($trigger);
			module._toggleSection($section);
		},

		_getTriggerSection: function ($trigger) {
			// 1. If a trigger has an aria-controls attribute, its section is
			// the section with the matching id attribute.

			// 2. If there is no matching section, or if the trigger has no
			// aria-controls attribute, its section is the most recent
			// ancestor that is an expandable section

			// 3. Otherwise, the trigger has no matching section

			let $section;

			let controls = $trigger.getAttribute('aria-controls');

			if (controls) {
				$section = document.getElementById(controls);
				if (!$section) {
					console.warn(`Could not find expander section with ID '${controls}'`);
				}
			} else if (!$section) {
				$section = $trigger.closest(selectors.section);
			}

			return $section;
		},

		_getSectionTriggers: function ($section) {
			// Inverse of _getTriggerSection

			let $allTriggers = Array.from(document.querySelectorAll(selectors.trigger));
			let $matchingTriggers = $allTriggers.filter($trigger => module._getTriggerSection($trigger) === $section);

			return $matchingTriggers;
		},


		_toggleSection: function ($section, desiredState) {
			let $triggers = $section.querySelectorAll(selectors.trigger);

			if (typeof desiredState === 'undefined') {
				let state = module._getSectionState($section);

				if (state === States.CLOSED) {
					desiredState = States.OPENED;
				} else if (state === States.OPENED) {
					desiredState = States.CLOSED;
				}
			}

			module._setSectionState($section, desiredState);
		},


		_getSectionState: function ($section ) {
			let ariaExpanded = $section.getAttribute('aria-expanded');

			let state = States.UNDEFINED;
			if (ariaExpanded === 'true') {
				state = States.OPENED;
			} else if (ariaExpanded === 'false') {
				state = States.CLOSED;
			}

			return state;
		},

		_setSectionState: function ($section, state) {
			let $triggers = module._getSectionTriggers($section);

			if (state === States.OPENED) {

				$section.setAttribute('aria-expanded', 'true');
				$triggers.forEach(($trigger) => $trigger.setAttribute('aria-expanded', 'true'));

			} else if (state === States.CLOSED) {

				$section.setAttribute('aria-expanded', 'false');
				$triggers.forEach(($trigger) => $trigger.setAttribute('aria-expanded', 'false'));

			} else {

				console.error(`Unrecognised state '${state}'`);

			}
		},


		_closeByDefault: function () {
			let $sections = document.querySelectorAll(selectors.section);

			$sections.forEach(($section) => {
				module._setSectionState($section, States.CLOSED);
			});
		},


		_openByHash: function () {
			// If URL contains a hash to an element within a collapsed section,
			// expand that section then scroll to the element

			// TODO: Allow clicking an anchor link to the current hash to
			// force relevant expanders to open again, if they've been closed

			let hash = document.location.hash;

			if (hash.length) {
				let $hash = document.querySelector(hash);

				if ($hash) {
					// Expand the containing section
					let $expander = $hash.closest(selectors.section);

					if ($expander) {
						module._setSectionState($expander, States.OPENED);
					}

					// If there are higher levels of expanders, expand them too
					while ($expander) {
						$expander = $expander.parentElement;

						if ($expander) {
							$expander = $expander.closest(selectors.section);

							if ($expander) {
								module._setSectionState($expander, States.OPENED);
							}
						}
					}

					// Scroll to the given element
					// Only works if asynchronous
					window.setTimeout(() => $hash.scrollIntoView(), 0);
				}
			}
		}
	};

	return {
		init: module.init
	};
})(activate);

// Self-initialise
expander.init();

export default expander;
