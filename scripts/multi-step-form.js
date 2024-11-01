/**
 * Manage small forms, validating them and applying a "steps" feature
 */

const initLeadForm = function (id = 'LeadForm', validationRules = {}) {
	var alias = `leadScript_${id}`;

	// Function to set visibility of elements
	var setVisible = function (elm, isVisible) {
		elm.classList.toggle('hidden', !isVisible);
		elm.classList.toggle('show', isVisible);
	};

	// Function to validate form fields
	var validate = function (step) {
		var elm = step ? window[alias].form.getElementsByClassName(`step${step}`)[0] : window[alias].form;
		var fields = elm.getElementsByTagName('*');
		for (var f of fields) {
			var name = f.getAttribute('name');
			if (
				(f.hasAttribute('required') && ((f.type === 'checkbox' && !f.checked) || !f.value)) ||
				(validationRules[name] && !validationRules[name](f.value))
			) {
				return false;
			}
		}
		return true;
	};

	// Function to show a specific step in the form
	var showStep = function (step) {
		if (step > window[alias].steps || step < 1) return;
		window[alias].currStep = step;
		for (var s = 1; s <= window[alias].steps; s++) {
			const stepElement = window[alias].form.getElementsByClassName(`step${s}`)[0];
			if (stepElement) {
				setVisible(stepElement, step === s);
			}
		}
		setVisible(window[alias].prevBtn, step > 1);
		setVisible(window[alias].nextBtn, step < window[alias].steps);
		setVisible(window[alias].submitBtn, step === window[alias].steps);
	};

	// Function to capture attribution data from URL or local storage
	var captureAttributionData = function () {
		const params = new URLSearchParams(window.location.search);
		const attributionFields = [
			'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
			'cid', 'fbclid', 'gclid', 'ttclid', 'referrer', 'campaignid',
			'adgroupid', 'keyword', 'gadid', 'fbadid', 'ttadid'
		];

		const attributionInfo = {};
		attributionFields.forEach(field => {
			const value = params.get(field); // Fetch from URL
			if (value) {
				attributionInfo[field] = value;
				const fieldElement = window[alias].form.querySelector(`[name="mauticform[${field}]"]`);
				if (fieldElement) {
					fieldElement.value = value;  // Populate hidden field
				}
			}
		});

		return attributionInfo;
	};

	// Initialize the form
	window[alias] = {
		form: document.getElementById(id),
		steps: Number(document.getElementById(id).getAttribute('data-steps')),
		submitBtn: document.getElementById(id).querySelector('.btn-submit')
	};

	// Capture and populate attribution data
	captureAttributionData();

	// Handle form submission
	window[alias].submitBtn.addEventListener('click', function (evt) {
		evt.preventDefault();
		if (!validate()) return false;

		// Capture form title for GA4 event
		const formTitle = window[alias].form.querySelector('[name="mauticform[formtitle]"]').value;

		// Send GA4 event for lead generation
		gtag("event", "generate_lead", {
			currency: "BRL",
			value: 1.00,
			lead_source: formTitle
		});

		// Check for qualifying lead criteria
		const monthlySalesField = window[alias].form.querySelector('[name="mauticform[monthlysales]"]');
		const selectedOption = monthlySalesField ? monthlySalesField.value : null;
		if (selectedOption === '30-sales' || selectedOption === '200-sales' || selectedOption === '200plus-sales') {
			gtag("event", "qualify_lead", {
				currency: "BRL",
				value: 1.00
			});
		}

		// Submit the form
		window[alias].form.submit();
		window[alias].submitBtn.disabled = true;
	});

	// Handle multi-step form
	if (window[alias].steps > 0) {
		window[alias].prevBtn = window[alias].form.querySelector('.btn-prev');
		window[alias].nextBtn = window[alias].form.querySelector('.btn-next');
		window[alias].prevBtn.addEventListener('click', function (evt) {
			evt.preventDefault();
			showStep(window[alias].currStep - 1);
		});
		window[alias].nextBtn.addEventListener('click', function (evt) {
			evt.preventDefault();
			if (validate(window[alias].currStep)) showStep(window[alias].currStep + 1);
		});
		showStep(1); // Show the first step on load
	}
};

// Initialize the form after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
	initLeadForm('LeadForm');
});