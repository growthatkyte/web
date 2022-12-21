/**
 * Este script usa como referência os termos definidos na array keys, que são consideradas variáveis de interesse Kyte.
 * O Script funciona da seguinte forma:
 * 		- Baseado na lista de keys, procura por estas variáveis na URL (por GET) e alimenta "kyteParams"
 * 		- As variáveis não presentes na URL são procuradas em LocalStorage
 *		- As variáveis não presentes na URL e nem em LocalStorage são procuradas em Cookies
 * 		- Em cookies, é feito uma busca especial da variável "_ga". Este valor é armazenado em "kyteParams.cid"
 *		- Com os atributos disponíveis, é gerado o kid (Kyte ID) e armazenado em LocalStorage para outros serviços
 */


// Método para carregar KID
function getKid(params, onLoad = function(){}) {
	if(localStorage.getItem('kid')) {
		params.kid = localStorage.getItem('kid')
	}
	params.url = window.location.href || ''
	var xhrReceive = new XMLHttpRequest();
	xhrReceive.open('post', 'https://analytics.kyteapp.com/get-kyte-id');
	xhrReceive.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xhrReceive.onreadystatechange = function(){
		if(xhrReceive.readyState === XMLHttpRequest.DONE){
			if(xhrReceive.responseText) {
				var kidResult = JSON.parse(xhrReceive.responseText);
				onLoad(kidResult.kid);
			}
		}
	};    
	xhrReceive.send(JSON.stringify(params));
}

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

	// Captura todos os parâmetros recebidos por GET
	var kyteParams = {};
	var urlParams = location.search.substring(1).split('&');
	urlParams.forEach(function(v){
		var p = v.split('=');
		if (keys.indexOf(p[0]) !== -1 && !!p[1] && p[1] !== 'undefined')  { kyteParams[p[0]] = decodeURI(p[1]); }
	});

	// Adicona informações de LocalStorage para chaves não encontradas
	keys.forEach(function(k){
		var value = localStorage.getItem(k);
		if(!kyteParams[k] && !!value && value !== 'undefined') { kyteParams[k] = value; }
	});

	// Adiciona informações de Cookie para chaves não encontradas
	// Busca informação de variável com _ga_xxxxxxxx para preenchimento da chave cid
	var cookie = document.cookie.split(';');
	cookie.forEach(function(v){
		var p = v.trim().split('=');
		if(p[0] === '_ga' && !kyteParams.cid){
			kyteParams.cid = p[1].replace('GA1.1.', '');
		} // Parâmetro "cid" vem de "_ga"
		else if(keys.indexOf(p[0]) !== -1 && !kyteParams[p[0]] && !!p[1] && !!p[1] !== 'undefined'){ kyteParams[p[0]] = p[1]; }
	});

	// Carrega KID
	kyteParams.event = 'PageView';
	getKid(kyteParams, function(kid){
		if(localStorage.getItem('kid') !== kid) {
			localStorage.setItem('kid', kid)
			if(typeof (dataLayer) === 'object') dataLayer.push({ event:"KidIdentify", kid });
		}
	})
	
})();
