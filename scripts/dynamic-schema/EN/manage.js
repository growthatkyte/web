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
	"url": "https://play.google.com/store/apps/details?id=com.kyte&hl=en_US&gl=US&referrer=utm_source%3Dschema%26utm_medium%3D" + slug,
	"installUrl": "https://play.google.com/store/apps/details?id=com.kyte&hl=en_US&gl=US&referrer=utm_source%3Dschema%26utm_medium%3D" + slug,
	"description": heroDescription,
	"featureList": [
		"Online catalog",
		"Menu maker",
		"Point of sale system",
		"Personalized receipts",
		"Online orders",
		"Sell on WhatsApp",
		"Inventory management",
		"On account system",
		"Analytics",
		"Customer management"
	],
	"operatingSystem": "ANDROID",
		"applicationCategory": "BusinessApplication",
			"applicationSubCategory": "MobileApplication",
				"screenshot": [
					"https://play-lh.googleusercontent.com/JE4DsONFwxNG9jd5jCzCkOfzmBrivWwmXZ0MylLbUX71NZYu8J4h22zaap55aSWTzCI=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/cPP76qe-_Xg9Od70vGEgtnVavLsQe4N6q6mftL7hPQ3zB4fn2B2M4NaIeYT75KNlETvV=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/ss7v7aiK0CxH-QOJjrOr82i4VygSPPcuehlDR0gxCzqTK6fVxA98sGVTYCwENvnvEg=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/Tipp0Gi4rrXJ6nT8EMLvSsjxq3JC4j2_NRqkMUHx5r24BP7aBqsxI0lKFJEU0HtCzE8=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/AHdL4Ka5UJ3McASZLH7p_FSViM_RP5eJOI3yI4FAQtPfsVRoumhofVby4o0wANX57Tc=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/VsWiNRqXKewSxBE8Z3TMkO6oLkLAaQjW7ojg4bxaI6vjhK3moU37okhgZHExwLFUeupa=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/rIAEHiaOpQ3ViS64cgpwmFNjFRm3wOkncufFqSZFMZ1k9S9BHSU-cWDM_mQMDGAQvQ=w1052-h592-rw",
					"https://play-lh.googleusercontent.com/iIJbiYh8oFmkvbsoQX2y14whkLvtVed8_TpJWD5icgpnpsCwfend9Ze0ea3HrSjzhgc=w1052-h592-rw"
				],
					"image": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png",
						"video": {
	"@type": "VideoObject",
		"name": "Kyte System | Take control of your business once and for all",
			"url": "https://www.youtube.com/watch?v=AzXdorhoUjA",
				"contentUrl": "https://www.youtube.com/watch?v=AzXdorhoUjA",
					"description": "Solutions and resources for the best management of your business and sales. Complete integration among computer, smartphone, and tablet. Manage your business from wherever you are and however you prefer.",
	"uploadDate": "2022-11-08",
		"duration": "PT29S",
			"thumbnailUrl": "https://img.youtube.com/vi/AzXdorhoUjA/0.jpg"
},
"contentRating": "GENERAL",
	"softwareHelp": "https://www.kyteapp.com/help",
		"Author": {
	"@type": "Person",
		"name": "Kyte App Inc.",
			"url": "https://www.kyteapp.com/"
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
		"@id": "https://www.kyteapp.com" + slug + "/#webpage",
			"url": "https://www.kyteapp.com" + slug,
				"name": metaTitle,
					"description": metaDescription,
					"inLanguage": "en-US",
					"primaryImageOfPage":
						  {
							  "@type": "ImageObject",
							  "@id": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png/#primaryimage",
							  "inLanguage": "en-US",
							  "url": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png",
							  "contentUrl": "https://assets-global.website-files.com/60870fec5b198a263fa79bcb/632c7f1386a6ce75f2b4231d_Kyte%20no%20PC%2C%20Tablet%20e%20Celular-p-800.png",
							  "caption": h1
							  },
					"breadcrumb":
						  {
							  "@type": "BreadcrumbList",
							  "@id": "https://www.kyteapp.com" + slug + "/#breadcrumb",
							  "itemListElement":
								  [
					{
									  "@type": "ListItem",
									  "position": "1",
									  "item":	{
											  "@type": "Thing",
											  "@id": "https://www.kyteapp.com/",
									  "name": "Home"
										  }
												  },
							{
					"@type": "ListItem",
								  "position": "2",
								  "item": {
									  "@type": "Thing",
									  "@id": "https://www.kyteapp.com/manage-better",
							  "name": "Manage Better"
										  }
								  },
								  {
								  "@type": "ListItem",
								  "position": "3",
								  "item": {
									  "@type": "Thing",
									  "@id": "https://www.kyteapp.com" + slug,
							  "name": h1
										  }
												  }]
						  },
					  "author":
						  {
							  "@type": "Person",
							  "@id": "https://www.kyteapp.com/#person",
							  "name": "Kyte App Inc.",
							  "sameAs": "https://www.kyteapp.com/"
						  },
						  "isPartOf":
						  {
							  "@type": "WebSite",
							  "@id": "https://www.kyteapp.com/#website",
							  "url": "https://www.kyteapp.com/",
							  "name": "Kyte",
							  "description": "Sales and Inventory Control System | Kyte for PC & App",
							  "inLanguage": "en-US",
							  "publisher":
							  {
								  "@type": "Organization",
								  "@id": "https://www.kyteapp.com/#organization",
								  "name": "Sales and Inventory Control System | Kyte for PC & App",
								  "url": "https://www.kyteapp.com/",
								  "logo":
								  {
									  "@type": "ImageObject",
									  "@id": "https://www.kyteapp.com/#logo",
									  "inLanguage": "en-US",
									  "url": "https://uploads-ssl.webflow.com/60870fec5b198a263fa79bcb/60870fec5b198a9f91a79c31_img2.png",
									  "contentUrl": "https://uploads-ssl.webflow.com/60870fec5b198a263fa79bcb/60870fec5b198a9f91a79c31_img2.png",
									  "width": "256",
									  "height": "256",
									  "caption": "Sales and Inventory Control System | Kyte for PC & App"
									  },
									  "image":
									  {
										  "@type": "ImageObject",
										  "@id": "https://www.kyteapp.com/#logo",
										  "inLanguage": "en-US",
										  "url": "https://uploads-ssl.webflow.com/60870fec5b198a263fa79bcb/60870fec5b198a9f91a79c31_img2.png",
										  "contentUrl": "https://uploads-ssl.webflow.com/60870fec5b198a263fa79bcb/60870fec5b198a9f91a79c31_img2.png",
										  "width": "256",
										  "height": "256",
										  "caption": "Sales and Inventory Control System | Kyte for PC & App"
									  },
									  "sameAs": [
										  "https://www.facebook.com/KytePOS",
										  "https://www.instagram.com/kyte.app/",
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
								  "urlTemplate": "https://www.kyteapp.com" + slug
							  }
						  }
}

let script = document.createElement('script');
script.type = "application/ld+json";
script.text = JSON.stringify(schema);
document.querySelector('head').appendChild(script);
