/**
 * Este script usa como referência os termos definidos na array keys, que são consideradas variáveis de interesse Kyte.
 * O Script funciona da seguinte forma:
 * 		- Baseado na lista de keys, procura por estas variáveis na URL (por GET) e alimenta "kyteParams"
 * 		- As variáveis não presentes na URL são procuradas em LocalStorage
 *		- As variáveis não presentes na URL e nem em LocalStorage são procuradas em Cookies
 * 		- Em cookies, é feito uma busca especial da variável "_ga". Este valor é armazenado em "kyteParams.cid"
 * 		- Com todas as informações encontradas e disponíveis em "kyteParams", é feito o preenchimento do "form de Elements"
 * 		- É feito uma busca por "buttons de Elements" que contém o valor "apply_params" na configuração de Custom Attributes. Seu link receberá todos os valores de "kyteParams" na URL
 * 		- Valores acumulados em "kyteParams" serão armazenados em kyte-analytics
 */
	
(function(){
	// Chaves de referência
	var keys = [
		// A busca desta chave é feita em cookies pava variável _ga_xxxxx
		'cid',
		'aid',
		'kid',
		'first_name',
		'email',
		'fbclid',
		'gclid',
		'utm_source',
		'utm_medium',
		'utm_campaign',
		'utm_content',
		'utm_term',
		'bento_visitor_id',
		'ref',
		'referrer',
		'campaignid',
		'adgroupid',
		'keyword',
		'channel_flow'
	];

	/**
	 * Faz as devidas alterações no FORM de Elements e altera links
	 */
	var fillFormAndLinks = function(params){
		// Adicionando informações ao form
		var linkAttr = [];
		for(var k in params){
			if(!!params[k]) { linkAttr.push(k +'='+ params[k]); }
            var inputsElms = document.getElementsByClassName('form-field-'+ k)
            if(inputsElms.length > 0) {
                for(var i in inputsElms) { inputsElms[i].value =  params[k]; }
            }
		}
		// Altera links adicionando os parametros na URL
		var buttonsHolder = document.querySelectorAll('[apply_params]');        
		if(linkAttr.length > 0 && buttonsHolder.length > 0){
			linkAttr = linkAttr.join('&');
			buttonsHolder.forEach(function(button) {
				var href = button.getAttribute('href');
				if(href.indexOf('?link=') !== -1 || href.indexOf('&link=') !== -1) {
					var hrefParts = href.split('?');
					var hrefUrlParams = hrefParts[1].split('&');
					hrefUrlParams.forEach(function(v, k){	
						var p = v.split('=');
						if(p[0] === 'link') { hrefUrlParams[k] = 'link='+ p[1] + '?' +encodeURIComponent(linkAttr); }
					});
					href = hrefParts[0] +'?'+ hrefUrlParams.join('&') + '&' + linkAttr;
				} else {
					href += (href.indexOf('?') === -1 ? '?' : '&') + linkAttr;
				}
				button.setAttribute('href', href);
			});
			// Envia parâmetros para a Kyte
			var xhrSend = new XMLHttpRequest();
			kyteParams.event = 'PageView';
			xhrSend.open('post', 'https://analytics.kyteapp.com/collect');
			xhrSend.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
			xhrSend.send(JSON.stringify(kyteParams));
		}
	};

	/**
	 * Inicia a captura de parâmetros vindos por GET, em LocalStorage e KID via server
	 */
	
	// Captura todos os parâmetros recebidos por GET
	var kyteParams = {};
	var urlParams = location.search.substring(1).split('&');
	urlParams.forEach(function(v){
		var p = v.split('=');
		if (keys.indexOf(p[0]) !== -1) { kyteParams[p[0]] = decodeURI(p[1]); }
	});

	// Adicona informações de LocalStorage para chaves não encontradas
	keys.forEach(function(k){
		var value = localStorage.getItem(k);
		if(!kyteParams[k] && value) { kyteParams[k] = value; }
	});

	// Adiciona informações de Cookie para chaves não encontradas
	// Busca informação de variável com _ga_xxxxxxxx para preenchimento da chave cid
	var cookie = document.cookie.split(';');
	cookie.forEach(function(v){
		var p = v.trim().split('=');
		if(p[0] === '_ga' && !kyteParams.cid){
			kyteParams.cid = p[1].replace('GA1.1.', '');
		} // Parâmetro "cid" vem de "_ga"
		else if(keys.indexOf(p[0]) !== -1 && !!kyteParams[p[0]]){ kyteParams[p[0]] = p[1]; }
	});

	// Carrega KID
	var xhrReceive = new XMLHttpRequest();
	xhrReceive.open('post', 'https://analytics.kyteapp.com/get-kyte-id');
	xhrReceive.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhrReceive.onreadystatechange = function(){
		if(xhrReceive.readyState === XMLHttpRequest.DONE){
            var kidResult = JSON.parse(xhrReceive.responseText)
            if(typeof (dataLayer) === 'object') dataLayer.push({ event:"KidIdentify", kid: kidResult.kid });
            Object.assign(kyteParams, kidResult); 
			fillFormAndLinks(kyteParams);
		}
	};    
	xhrReceive.send(JSON.stringify(kyteParams));    
	
})();
