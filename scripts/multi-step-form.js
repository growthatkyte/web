const initLeadForm = function (id = 'LeadForm', validationRules = {}) {
	const alias = `leadScript_${id}`;

	const setVisible = (elm, isVisible) => {
		elm.classList.toggle('hidden', !isVisible);
		elm.classList.toggle('show', isVisible);
	};

	const validate = (step) => {
		const elm = step ? window[alias].form.querySelector(`.step${step}`) : window[alias].form;
		const fields = elm.querySelectorAll('[name]');

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
		if (step > window[alias].steps || step < 1) return;
		window[alias].currStep = step;
		for (let s = 1; s <= window[alias].steps; s++) {
			setVisible(window[alias].form.querySelector(`.step${s}`), step === s);
		}
		setVisible(window[alias].prevBtn, step > 1);
		setVisible(window[alias].nextBtn, step < window[alias].steps);
		setVisible(window[alias].submitBtn, step === window[alias].steps);
	};

	window[alias] = {
		form: document.getElementById(id),
		steps: Number(document.getElementById(id).getAttribute('data-steps')),
		submitBtn: document.getElementById(id).querySelector('.btn-submit')
	};

	window[alias].submitBtn.addEventListener('click', (evt) => {
		evt.preventDefault();
		if (!validate()) {
			console.log('Validation failed');
			return false;
		}
		console.log('Validation passed, submitting form');

		const formData = new FormData(window[alias].form);
		fetch(window[alias].form.getAttribute('action'), {
			method: 'POST',
			body: formData
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				window.location.href = 'https://kyteapp.page.link/?link=https://web.kyteapp.com/login&apn=com.kyte&ibi=com.kytepos&isi=1345983058&pt=120346822&mt=8';
			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});

		window[alias].submitBtn.disabled = true;
	});

	if (window[alias].steps > 0) {
		window[alias].prevBtn = window[alias].form.querySelector('.btn-prev');
		window[alias].nextBtn = window[alias].form.querySelector('.btn-next');
		window[alias].prevBtn.addEventListener('click', (evt) => {
			evt.preventDefault();
			showStep(window[alias].currStep - 1);
		});
		window[alias].nextBtn.addEventListener('click', (evt) => {
			evt.preventDefault();
			if (validate(window[alias].currStep)) showStep(window[alias].currStep + 1);
		});
		showStep(1);
	}
};

initLeadForm('LeadForm', {
	email: (value) => {
		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-1]\d{2}\.\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
		return re.test(String(value));
	}
});