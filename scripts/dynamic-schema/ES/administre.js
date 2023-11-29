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
	"url": "https://play.google.com/store/apps/details?id=com.kyte&hl=es_MX&gl=US&referrer=utm_source%3Dschema%26utm_medium%3D" + slug,
	"installUrl": "https://play.google.com/store/apps/details?id=com.kyte&hl=es_MX&gl=US&referrer=utm_source%3Dschema%26utm_medium%3D" + slug,
	"description": heroDescription,
	"featureList": [
		"Catálogo online",
		"Menú digital",
		"Punto de venta online",
		"Recibos digitales",
		"Pedidos online",
		"Gestión de ventas",
		"Control de inventario",
		"Ventas a crédito",
		"Informes y estadísticas",
		"Control de clientes"
	],
	"operatingSystem": "ANDROID",
		"applicationCategory": "BusinessApplication",
			"applicationSubCategory": "MobileApplication",
				"screenshot": [
					"https://play-lh.googleusercontent.com/fqnUfE5RX8kfaRxqoGF9sCREWUZJ7yeJdZI9DTeJg9W8OKml2Kh78CSFdX8mxLzUteXL=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/BFc640JvpHLScgiq5aycDn-ONOGHz3FtlP61TiNfTMLGkx3-WD3iihoCGASsnHgQ4Q=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/KSTMF10SyQhCUXg4rCpJF-B-Y-7y91NJtvhJ9xpSN9LqZ9zWo_Pg1goWwpoEvrcIFg=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/ACQSq9ZoXfs62hSG85pKzsoi8gGmojLLRKW2xHvv4VGoHGc-BatcQybfCCbIMrxp1Fc=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/0AYIxBG1MiTKdcxn7BYoh7-p-pMbWomHfsHPEKMRl-lq4cBQSGKAzp9GV9atKu59rp8=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/oByZhM9fH5VVUMYzdOkGMz1Td-xpw7em9VWXtx8HImFWIkcYMFuxk7OcsHN7Y96FvbY=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/poVxjlYxAD6J18svt8L7M4i0MHabjawT5DS2rdnnJnSuw8RIs79CO8yB8JDqZE0vfg=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/CCAuZRe81Rw6qLyABEflfnALqVjHoOak3gOxGHtx3hwGG8guXmkVpQXNstPoMzvS_fI=w1052-h592-rw"
				],
					"image": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png",
						"video": {
	"@type": "VideoObject",
		"name": "Sistema Kyte | Tome el control de su negocio de una vez por todas",
			"url": "https://www.youtube.com/watch?v=N774BjJObpU",
				"contentUrl": "https://www.youtube.com/watch?v=N774BjJObpU",
					"description": "Soluciones y recursos para la mejor gestión de su negocio y ventas. Integración completa entre computador, celular y tableta. Gestione su negocio desde donde esté y como prefiera.",
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
		"@id": "https://www.appkyte.com" + slug + "/#webpage",
			"url": "https://www.appkyte.com" + slug,
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
							  "@id": "https://www.appkyte.com" + slug + "/#breadcrumb",
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
									  "@id": "https://www.appkyte.com/administre/",
							  "name": "Gestione Mejor"
										  }
								  },
								  {
								  "@type": "ListItem",
								  "position": "3",
								  "item": {
									  "@type": "Thing",
									  "@id": "https://www.appkyte.com" + slug,
							  "name": h1
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
								  "urlTemplate": "https://www.appkyte.com" + slug
							  }
						  }
}

let script = document.createElement('script');
script.type = "application/ld+json";
script.text = JSON.stringify(schema);
document.querySelector('head').appendChild(script);
