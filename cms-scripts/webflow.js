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

        /**
         * Verifica se link dinamico e adiciona variáveis de acordo com a situação
        */
        var mergeUrlVars = function(url, paramsUrl){
            if(url.indexOf('?link=') !== -1 || url.indexOf('&link=') !== -1) {
                var parts = url.split('?'); 
                var paramsParts = parts[1].split('&');
                paramsParts.forEach(function(v, k){	
                    var p = v.split('=');
                    if(p[0] === 'link') { paramsParts[k] = 'link='+ p[1] + '?' +encodeURIComponent(paramsUrl); }
                });
                url = parts[0] +'?'+ paramsParts.join('&') + '&' + paramsUrl;
            } else {
                url += (url.indexOf('?') === -1 ? '?' : '&') + paramsUrl;
            }
            return url    
        }

		// Adicionando informações ao form
		var linkAttr = [];
		for(var k in params){
			if(!!params[k]) { linkAttr.push(k +'='+ params[k]); }
            var inputsElms = document.getElementsByClassName('form-field-'+ k)
            if(inputsElms.length > 0) {
                for(var i in inputsElms) { inputsElms[i].value =  params[k]; }
            }
		}

        $( ".form-control" ).submit(function( event ) {            
            event.preventDefault();
            let formObj = $('#'+ event.target.id)
            let postUrl = formObj.find("input[name='postUrl']").val();
            let redirectUrl = formObj.find("input[name='redirectUrl']").val();
            // Construção do payload
            let params = {};
            let paramsUrl = []
            keys.forEach(function(key){
                let value = formObj.find('input[name="'+ key +'"]').val()
                if(!!value) {
                    params['fields_'+ key] = value
                    paramsUrl.push(key +'='+ value)
                }
            });
            paramsUrl = paramsUrl.join('&')
            $.post(postUrl, params).done(function( data ) {
                var redirect = mergeUrlVars(redirectUrl, paramsUrl)
                window.location.href = redirect
            });
        });        

		// Altera links adicionando os parametros na URL
		var buttonsHolder = document.querySelectorAll('[apply_params]');        
		if(linkAttr.length > 0 && buttonsHolder.length > 0){
			linkAttr = linkAttr.join('&');
			buttonsHolder.forEach(function(button) {
				var href = mergeUrlVars(button.getAttribute('href'), linkAttr)
				button.setAttribute('href', href);
			});
			// Envia parâmetros para a Kyte
            kyteParams.event = 'PageView';
            $.post('https://analytics.kyteapp.com/collect', kyteParams)
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
    $.post('https://analytics.kyteapp.com/get-kyte-id', kyteParams).done(function(data) {
        if(typeof (dataLayer) === 'object') dataLayer.push({ event: "KidIdentify", kid: data.kid });
        Object.assign(kyteParams, data); 
		fillFormAndLinks(kyteParams);
    });
	
})();
