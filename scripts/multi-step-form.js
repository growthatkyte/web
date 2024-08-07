document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('LeadForm');

	function getAttributionInfo() {
		const params = new URLSearchParams(window.location.search);
		const attributionFields = [
			'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
			'cid', 'fbclid', 'gclid', 'ttclid', 'ref', 'referrer', 'campaignid',
			'adgroupid', 'keyword', 'gadid', 'fbadid', 'ttadid'
		];

		const attributionInfo = {};
		attributionFields.forEach(field => {
			const value = params.get(field) || localStorage.getItem(field);
			if (value) {
				attributionInfo[field] = value;
				form.elements[field].value = value;
			}
		});
		return attributionInfo;
	}

	const validate = (step) => {
		const elm = step ? form.querySelector(`.step${step}`) : form;
		const fields = elm.querySelectorAll('[name]');
		const validationRules = {
			email: (value) => {
				const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-1]\d{2}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
				return re.test(String(value));
			}
		};

		for (let f of fields) {
			const name = f.getAttribute('name');
			if (f.hasAttribute('required') && ((f.type === 'checkbox' && !f.checked) || !f.value)) {
				console.log(`Validation failed: required field '${name}' is missing or empty.`);
				return false;
			}
			if (validationRules[name] && !validationRules[name](f.value)) {
				console.log(`Validation failed: field '${name}' with value '${f.value}' did not pass custom validation.`);
				return false;
			}
		}
		return true;
	};

	const showStep = (step) => {
		if (step > form.steps || step < 1) return;
		form.currStep = step;
		for (let s = 1; s <= form.steps; s++) {
			setVisible(form.querySelector(`.step${s}`), step === s);
		}
		setVisible(form.prevBtn, step > 1);
		setVisible(form.nextBtn, step < form.steps);
		setVisible(form.submitBtn, step === form.steps);
	};

	const setVisible = (elm, isVisible) => {
		elm.classList.toggle('hidden', !isVisible);
		elm.classList.toggle('show', isVisible);
	};

	form.addEventListener('submit', function (e) {
		e.preventDefault();

		const mauticPayload = {
			email: form.elements['email'].value,
			monthly_sales: form.elements['monthly_sales'].value,
			opt_in: form.elements['opt-in'].checked,
			formTitle: form.elements['formTitle'].value,
			...getAttributionInfo()
		};

		fetch('https://marketing.kyte.is/api/contacts/new', {
			method: 'POST',
			headers: {
				'Authorization': 'Basic YWRtaW5BcGk6IVBvN1RCbTAzOTRdaHh5SU5udzkzSg==',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(mauticPayload)
		}).then(response => response.json())
			.then(data => {
				console.log('Success:', data);
				const attributionInfo = getAttributionInfo();
				const queryParams = new URLSearchParams(attributionInfo).toString();
				window.location.href = `https://pos.auth.kyteapp.com?${queryParams}`;
			})
			.catch(error => {
				console.error('Error:', error);
			});
	});

	const initLeadForm = function (id = 'LeadForm') {
		const alias = `leadScript_${id}`;
		form.steps = Number(form.getAttribute('data-steps'));
		form.submitBtn = form.querySelector('.btn-submit');

		form.submitBtn.addEventListener('click', (evt) => {
			evt.preventDefault();
			if (!validate()) {
				console.log('Validation failed');
				return false;
			}
			console.log('Validation passed, submitting form');
			form.submit();
			form.submitBtn.disabled = true;
		});

		if (form.steps > 0) {
			form.prevBtn = form.querySelector('.btn-prev');
			form.nextBtn = form.querySelector('.btn-next');
			form.prevBtn.addEventListener('click', (evt) => {
				evt.preventDefault();
				showStep(form.currStep - 1);
			});
			form.nextBtn.addEventListener('click', (evt) => {
				evt.preventDefault();
				if (validate(form.currStep)) showStep(form.currStep + 1);
			});
			showStep(1);
		}
	};

	initLeadForm('LeadForm');
});