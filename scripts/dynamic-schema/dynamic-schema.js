// Get the slug from the URL path
// Get the slug from the URL path
let slug = window.location.pathname;

// Get the h1 title
let h1 = $('.uui-heading-xlarge').text();

// Get the hero description
let heroDescription = $('.uui-text-size-xlarge').text();

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
	"url": "https://play.google.com/store/apps/details?id=com.kyte&hl=es_MX&gl=US&referrer=utm_source%3Dschema%26utm_medium%3D" + slug,
	"installUrl": "https://play.google.com/store/apps/details?id=com.kyte&hl=es_MX&gl=US&referrer=utm_source%3Dschema%26utm_medium%3D" + slug,
	"description": heroDescription,
	"featureList": [
		"Catálogo Online",
		"Menú Digital",
		"Punto de Venta Online",
		"Recibos Digitales",
		"Pedidos Online",
		"Gestión de Ventas",
		"Control de stock",
		"Ventas a crédito",
		"Informes y Estadísticas",
		"Control de Clientes",
		"Sistema de Créditos"
	],
	"operatingSystem": "ANDROID",
		"applicationCategory": "BusinessApplication",
			"applicationSubCategory": "MobileApplication",
				"screenshot": [
					"https://play-lh.googleusercontent.com/UfMgZ8UGABrNi1JYkf5OUmYLzzempvk8vVIrN36IG2Rxpi37borQJWKy5FTVklJxYQ=w2560-h1440-rw",
					"https://play-lh.googleusercontent.com/b0mnN0DURZVt70mVhSRUSxXs9Cgj3lZE0end0KEnbBFSE1FR-0Hw_LPWydjKzVcei6I=w2560-h1440-rw",
					"https://play-lh.googleusercontent.com/iIIvUmJqV_GZkpsnxKkq5SgTmW35EjM7oqQGHgTXEEVNwX_26gJ71rP-hN-SefHuTH4=w2560-h1440-rw",
					"https://play-lh.googleusercontent.com/GDC2vzyF8qwBF1JPQkvwD8lsdKckrwW9u3rO25lDcNxNSKfTtKDkTFF5HpurTumkLEo=w2560-h1440-rw",
					"https://play-lh.googleusercontent.com/-JSPE-lx04ma8b78n3xc9vwoauuN1FY3k84xy9BWxUS77LQSuwwjGTAVZ-b-epFq34g=w2560-h1440-rw",
					"https://play-lh.googleusercontent.com/IQ7AYkaaPzTIiNhNHPn6mN-A6EgtkQ1Q-OJVTVra3GShr1vGPgibiKXW2ogRBqgWdzWE=w2560-h1440-rw",
					"https://play-lh.googleusercontent.com/x28gAZMlguVoW-JZJlbggvybaN9ywBSRXWE7Tu9DcjdStjCNzNaLBGYP8SvQT_BKptYX=w2560-h1440-rw",
					"https://play-lh.googleusercontent.com/foiFX-zBelPERxAwVw3Eq0shEg2LO5iGPPZfOG9dLK3wlyLdNJFpdATvHb6bnWzlqEA=w2560-h1440-rw"
				],
					"image": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png",
						"video": {
	"@type": "VideoObject",
		"name": "¡ Sistema Kyte ! ¡Toma el control de tu negocio de una vez por todas!",
			"url": "https://www.youtube.com/watch?v=N774BjJObpU",
				"contentUrl": "https://www.youtube.com/watch?v=N774BjJObpU",
					"description": "¡Soluciones y recursos para la mejor gestión de su negocio y ventas! Integración completa entre ordenador, móvil y tablet. Gestiona tu negocio desde donde estés y como prefieras.",
	"uploadDate": "2022-11-08",
		"duration": "PT29S",
			"thumbnailUrl": "https://img.youtube.com/vi/N774BjJObpU/0.jpg"
},
"contentRating": "LIBRE",
	"softwareHelp": "https://www.appkyte.com/ayuda",
		"Author": {
	"@type": "Person",
		"name": "Kyte App Inc.",
			"url": "https://www.appkyte.com/"
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
		"@id": "https://www.appkyte.com/venda/" + slug + "/#webpage",
			"url": "https://www.appkyte.com/venda/" + slug,
				"name": metaTitle,
					"description": metaDescription,
					"inLanguage": "es-MX",
					"primaryImageOfPage":
						  {
							  "@type": "ImageObject",
							  "@id": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png/#primaryimage",
							  "inLanguage": "es-MX",
							  "url": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png",
							  "contentUrl": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png",
							  "caption": h1
							  },
					"breadcrumb":
						  {
							  "@type": "BreadcrumbList",
							  "@id": "https://www.appkyte.com/venda/" + slug + "/#breadcrumb",
							  "itemListElement":
								  [
					{
									  "@type": "ListItem",
									  "position": "1",
									  "item":	{
											  "@type": "Thing",
											  "@id": "https://www.appkyte.com/",
									  "name": "Inicio"
										  }
												  },
							{
					"@type": "ListItem",
								  "position": "2",
								  "item": {
									  "@type": "Thing",
									  "@id": "https://www.appkyte.com/venda/",
							  "name": "Venda Más"
										  }
								  },
								  {
								  "@type": "ListItem",
								  "position": "3",
								  "item": {
									  "@type": "Thing",
									  "@id": "https://www.appkyte.com/venda/" + slug,
							  "name": metaTitle
										  }
												  }]
						  },
					  "author":
						  {
							  "@type": "Person",
							  "@id": "https://www.appkyte.com/#person",
							  "name": "Kyte App Inc.",
							  "sameAs": "https://www.appkyte.com/"
						  },
						  "isPartOf":
						  {
							  "@type": "WebSite",
							  "@id": "https://www.appkyte.com/#website",
							  "url": "https://www.appkyte.com/",
							  "name": "Kyte",
							  "description": "Sistema de Control de Ventas e Inventario | Kyte para PC y App",
							  "inLanguage": "es-MX",
							  "publisher":
							  {
								  "@type": "Organization",
								  "@id": "https://www.appkyte.com/#organization",
								  "name": "Sistema de Control de Ventas e Inventario | Kyte para PC y App",
								  "url": "https://www.appkyte.com/",
								  "logo":
								  {
									  "@type": "ImageObject",
									  "@id": "https://www.appkyte.com/#logo",
									  "inLanguage": "es-MX",
									  "url": "https://uploads-ssl.webflow.com/60870fec5b198a263fa79bcb/60870fec5b198a9f91a79c31_img2.png",
									  "contentUrl": "https://uploads-ssl.webflow.com/60870fec5b198a263fa79bcb/60870fec5b198a9f91a79c31_img2.png",
									  "width": "256",
									  "height": "256",
									  "caption": "Sistema de Control de Ventas e Inventario | Kyte para PC y App"
									  },
									  "image":
									  {
										  "@type": "ImageObject",
										  "@id": "https://www.appkyte.com/#logo",
										  "inLanguage": "es-MX",
										  "url": "https://uploads-ssl.webflow.com/60870fec5b198a263fa79bcb/60870fec5b198a9f91a79c31_img2.png",
										  "contentUrl": "https://uploads-ssl.webflow.com/60870fec5b198a263fa79bcb/60870fec5b198a9f91a79c31_img2.png",
										  "width": "256",
										  "height": "256",
										  "caption": "Sistema de Control de Ventas e Inventario | Kyte para PC y App"
									  },
									  "sameAs": [
										  "https://www.facebook.com/appkyte",
										  "https://www.instagram.com/kyte.es/",
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
								  "urlTemplate": "https://www.appkyte.com/venda/" + slug
							  }
						  }
}

let script = document.createElement('script');
script.type = "application/ld+json";
script.text = JSON.stringify(schema);
document.querySelector('head').appendChild(script);
