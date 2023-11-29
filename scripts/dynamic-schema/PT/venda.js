// Get the slug from the URL path
// Get the slug from the URL path
let slug = window.location.pathname;

// Get the h1 title
let h1 = $('#h1').text();

// Get the hero description
let heroDescription = $('#hero-description').text();

// Get the meta title
let metaTitle = $('meta[name="title"]').attr("content");

// Get the meta description
let metaDescription = $('meta[name="description"]').attr("content");

// Get the currency
let priceCurrency = $('#pricing-group').text();

// Get the pro price
let pricePro = $('#pro-monthly').text();

// Get the grow price
let priceGrow = $('#grow-monthly').text();

// Get the prime price
let pricePrime = $('#prime-monthly').text();

// Insert values into the schema
let schema = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	"name": h1,
	"url": "https://play.google.com/store/apps/details?id=com.kyte&hl=pt_BR&gl=BR&referrer=utm_source%3Dschema%26utm_medium%3D" + slug,
	"installUrl": "https://play.google.com/store/apps/details?id=com.kyte&hl=pt_BR&gl=BR&referrer=utm_source%3Dschema%26utm_medium%3D" + slug,
	"description": heroDescription,
	"featureList": [
		"Catálogo online",
		"Cardápio digital",
		"Sistema PDV",
		"Recibos personalizados",
		"Pedidos online",
		"Gestão de pedidos",
		"Controle de estoque",
		"Controle de fiado",
		"Relatórios e estatísticas",
		"Controle de clientes"
	],
	"operatingSystem": "ANDROID",
		"applicationCategory": "BusinessApplication",
			"applicationSubCategory": "MobileApplication",
				"screenshot": [
					"https://play-lh.googleusercontent.com/kIFwFp1XcMIEKeWRzuQpLYcZ2e-hhcN8T1kdxjoGSTVI8ERuXJosZ_DAw7AwF7i722EW=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/CEx1iXz0f46XJLE1nC3PAC2eFTNCTHTDjoqWcAAMMxuXGQxe6DHnD1V7Scu3niy4700=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/PHBoKfc2Rn_OzikKMnBqmIDKgPU7zuchsB1NqAhGekOP6b0rDOeU5Hr0x8bNbEfgwR8V=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/B-ur0uqtC0gEL5108-Obaw55r4U5Jg5-pp06_GRwMSEpoYK7mL87Wlh6K9Nr2kvSqqx1=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/aO18CV3HhG9SEIMDrjWeg6M1wv5jBMsuJDjGWiBI27GOljfKpIn-CTBwjYnrGMHXzok=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/sSiTpXvB457uq4iDRHhXQko1f2OYY8TMchECKtVzxgSOmjRsZM6wweE9jPDw57bQFA=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/FWpfL1rFCTUJvas4K6PiC0q24kCz7OfzE_rZGBECMlapcmH3zO5NSgP0nf3hx1cP6Yw=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/MdFSlfuYaN0kzqiQkv_r7V1D3JwEQ3JniC7POTcnd6wAY1_vDlgRFwmAvTOl-3dv6rU5=w1052-h592-rw"
				],
					"image": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png",
						"video": {
	"@type": "VideoObject",
		"name": "Sistema Kyte | Assuma de uma vez por todas o controle do seu negócio",
			"url": "https://www.youtube.com/watch?v=SQigcVwmHnI",
				"contentUrl": "https://www.youtube.com/watch?v=SQigcVwmHnI",
					"description": "Soluções e recursos para o melhor gerenciamento do seu negócio e vendas. Integração completa entre computador, celular e tablet. Gerencie o seu negócio de onde você estiver e como você preferir.",
	"uploadDate": "2022-11-08",
		"duration": "PT29S",
			"thumbnailUrl": "https://img.youtube.com/vi/SQigcVwmHnI/0.jpg"
},
"contentRating": "LIVRE",
	"softwareHelp": "https://www.kyte.com.br/ajuda",
		"Author": {
	"@type": "Person",
		"name": "Kyte App Inc.",
			"url": "https://www.kyte.com.br/"
},
"aggregateRating": {
	"@type": "AggregateRating",
		"ratingValue": "4.488",
			"ratingCount": "15272"
},
"offers": [
	{
		"@type": "Offer",
		"price": "0",
		"category": "FREE",
		"priceCurrency": priceCurrency
	},
	{
		"@type": "Offer",
		"availability": "http://schema.org/InStock",
		"price": pricePro,
		"category": "PRO",
		"priceCurrency": priceCurrency,
		"url": "https://checkout.kyteapp.com?utm_source=" + slug + "&utm_id=schema"
	},
	{
		"@type": "Offer",
		"availability": "http://schema.org/InStock",
		"price": priceGrow,
		"category": "GROW",
		"priceCurrency": priceCurrency,
		"url": "https://checkout.kyteapp.com?utm_source=" + slug + "&utm_id=schema"
		},
		{
		"@type": "Offer",
		"availability": "http://schema.org/InStock",
		"price": pricePrime,
		"category": "PRIME",
		"priceCurrency": priceCurrency,
		"url": "https://checkout.kyteapp.com?utm_source=" + slug + "&utm_id=schema"
		}
	],
	"isPartOf":
{
	"@type": "Webpage",
		"@id": "https://www.kyte.com.br" + slug + "/#webpage",
			"url": "https://www.kyte.com.br" + slug,
				"name": metaTitle,
					"description": metaDescription,
					"inLanguage": "pt-BR",
					"primaryImageOfPage":
						  {
							  "@type": "ImageObject",
							  "@id": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png/#primaryimage",
							  "inLanguage": "pt-BR",
							  "url": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png",
							  "contentUrl": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png",
							  "caption": h1
							  },
					"breadcrumb":
						  {
							  "@type": "BreadcrumbList",
							  "@id": "https://www.kyte.com.br" + slug + "/#breadcrumb",
							  "itemListElement":
								  [
					{
									  "@type": "ListItem",
									  "position": "1",
									  "item":	{
											  "@type": "Thing",
											  "@id": "https://www.kyte.com.br/",
									  "name": "Home"
										  }
												  },
							{
					"@type": "ListItem",
								  "position": "2",
								  "item": {
									  "@type": "Thing",
									  "@id": "https://www.kyte.com.br/venda-mais",
							  "name": "Venda Mais"
										  }
								  },
								  {
								  "@type": "ListItem",
								  "position": "3",
								  "item": {
									  "@type": "Thing",
									  "@id": "https://www.kyte.com.br" + slug,
							  "name": h1
										  }
												  }]
						  },
					  "author":
						  {
							  "@type": "Person",
							  "@id": "https://www.kyte.com.br/#person",
							  "name": "Kyte App Inc.",
							  "sameAs": "https://www.kyte.com.br/"
						  },
						  "isPartOf":
						  {
							  "@type": "WebSite",
							  "@id": "https://www.kyte.com.br/#website",
							  "url": "https://www.kyte.com.br/",
							  "name": "Kyte",
							  "description": "Sistema de Vendas e Controle de Estoque | Kyte para PC e App",
							  "inLanguage": "pt-BR",
							  "publisher":
							  {
								  "@type": "Organization",
								  "@id": "https://www.kyte.com.br/#organization",
								  "name": "Sistema de Vendas e Controle de Estoque | Kyte para PC e App",
								  "url": "https://www.kyte.com.br/",
								  "logo":
								  {
									  "@type": "ImageObject",
									  "@id": "https://www.kyte.com.br/#logo",
									  "inLanguage": "pt-BR",
									  "url": "https://uploads-ssl.webflow.com/60870fec5b198a263fa79bcb/60870fec5b198a9f91a79c31_img2.png",
									  "contentUrl": "https://uploads-ssl.webflow.com/60870fec5b198a263fa79bcb/60870fec5b198a9f91a79c31_img2.png",
									  "width": "256",
									  "height": "256",
									  "caption": "Sistema de Vendas e Controle de Estoque | Kyte para PC e App"
									  },
									  "image":
									  {
										  "@type": "ImageObject",
										  "@id": "https://www.kyte.com.br/#logo",
										  "inLanguage": "pt-BR",
										  "url": "https://uploads-ssl.webflow.com/60870fec5b198a263fa79bcb/60870fec5b198a9f91a79c31_img2.png",
										  "contentUrl": "https://uploads-ssl.webflow.com/60870fec5b198a263fa79bcb/60870fec5b198a9f91a79c31_img2.png",
										  "width": "256",
										  "height": "256",
										  "caption": "Sistema de Vendas e Controle de Estoque | Kyte para PC e App"
									  },
									  "sameAs": [
										  "https://www.facebook.com/kyte.brasil",
										  "https://www.instagram.com/kyte.br/",
										  "https://www.youtube.com/channel/UCa1bm2wm3XlgOMetic_TC3Q"
														  ]
								  }
							  }
					  },
						  "potentialAction":
						  {
							  "@type": "ReadAction",
							  "target":
							  {
								  "@type": "EntryPoint",
								  "urlTemplate": "https://www.kyte.com.br" + slug
							  }
						  }
}

let script = document.createElement('script');
script.type = "application/ld+json";
script.text = JSON.stringify(schema);
document.querySelector('head').appendChild(script);
