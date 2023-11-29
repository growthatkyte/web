// Translations object for signup
const signupTranslations = {
  // Sign-up form information
  'pfy-input-first_name': {
    en: 'My name is...',
    es: 'Mi nombre es...',
    pt: 'Meu nome é...'
  },
  'pfy-input-job_title': {
    en: 'Job title',
    es: 'Título profesional',
    pt: 'Profissão'
  },
  'pfy-input-phone_number': {
    en: 'Phone number',
    es: 'Número de teléfono',
    pt: 'Número de telefone'
  },
  'pfy-input-email': {
    en: 'name@email.com',
    es: 'nombre@email.com',
    pt: 'nome@email.com'
  },
  'custom_var1': {
    en: 'Do you have a Kyte account?',
    es: '¿Tienes una cuenta en Kyte?',
    pt: 'Você tem uma conta no Kyte?'
  },
  'pfy-input-opt_in': {
    en: 'I agree to the Affiliate Influencers <a href="https://www.kyteapp.com/terms-of-use" rel="external">Terms of Service</a> and <a href="https://www.kyteapp.com/privacy-policy" rel="external">Privacy Policy</a>.',
    es: 'Acepto los <a href="https://www.appkyte.com/terminos-de-uso" rel="external">Términos de Servicio</a> y la <a href="https://www.appkyte.com/politica-de-privacidad" rel="external">Política de Privacidad</a> de los Afiliados Influencers.',
    pt: 'Concordo com os <a href="https://www.kyte.com.br/termos-de-uso" rel="external">Termos de Serviço</a> e a <a href="https://www.kyte.com.br/politica-de-privacidade" rel="external">Política de Privacidade</a> dos Influenciadores Afiliados.'
  },
  'pfy-input-submit': {
    en: 'Become a partner',
    es: 'Iniciar asociación',
    pt: 'Iniciar parceria'
  }
};

// Function to get the user's locale
function getUserLocale() {
  const userLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
  // Extract the first language in the array (most preferred)
  const userLocale = userLanguages[0];
  return userLocale;
}

function updateElementContent(elementId, locale) {
  const element = document.getElementById(elementId);
  if (element) {
    const translation = signupTranslations[elementId];
    let language = locale.toLowerCase();

    if (language.includes('pt')) {
      language = 'pt';
    } else if (language.includes('es')) {
      language = 'es';
    } else {
      language = 'en';
    }

    const translatedContent = translation && translation[language] ? translation[language] : '';

    if (elementId === 'pfy-input-opt_in') {
      // Update the checkbox label and links
      const checkboxElement = document.querySelector(`input[name="${elementId}"]`);
      if (checkboxElement) {
        const parentLabel = checkboxElement.parentElement;
        if (parentLabel) {
          const linkElements = parentLabel.getElementsByTagName('a');
          const linkCount = linkElements.length;
          if (linkCount > 0) {
            for (let i = 0; i < linkCount; i++) {
              const linkElement = linkElements[i];
              const href = linkElement.getAttribute('href');
              const translatedLink = translation && translation[language] && translation[language][`${elementId}_link_${i + 1}`];
              if (translatedLink) {
                linkElement.setAttribute('href', translatedLink);
              }
            }
          }
          parentLabel.innerHTML = translatedContent;
        }
      }
    } else if (element.tagName === 'SELECT') {
      // Update the options in the select element
      const optionElements = element.getElementsByTagName('option');
      const optionCount = optionElements.length;
      if (optionCount > 0) {
        for (let i = 0; i < optionCount; i++) {
          const optionElement = optionElements[i];
          const translatedOption = translation && translation[language] && translation[language][`${elementId}_option_${i}`];
          if (translatedOption) {
            optionElement.text = translatedOption;
          }
        }
      }
    } else {
      // Update other elements' placeholder attribute or textContent
      if (element instanceof HTMLInputElement && element.hasAttribute('placeholder')) {
        element.placeholder = translatedContent;
      } else {
        element.textContent = translatedContent;
      }
    }
  }
}

const userLocale = getUserLocale();

// Get translated content for each element ID and user's locale
updateElementContent('pfy-input-first_name', userLocale);
updateElementContent('pfy-input-job_title', userLocale);
updateElementContent('pfy-input-phone_number', userLocale);
updateElementContent('pfy-input-email', userLocale);
updateElementContent('custom_var1', userLocale);
updateElementContent('pfy-input-opt_in', userLocale);
updateElementContent('pfy-input-submit', userLocale);
