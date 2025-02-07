document.addEventListener('DOMContentLoaded', function () {
	const translations = {
		en: {
			explanation:
				'👉 Checkout this tab to learn more about our support-mode, and how you can help us 👈',
			supportMode: '🌟 {extension_name} support-mode',
			mainText:
				'Our extension is 100% free, and we want to keep it that way!<br>With our Support-Mode activated, you enable us to display our very non-intrusive Ad Partners logo in your search results.<br>If you visit the website of one of our Ad Partner, you contribute to the developement of our extension.<br><br>The best part is that it is 100% free :) ',
			howItWorks: '🔎 How support-mode work?',
			howItWorksText:
				'When you visit one of these Ad Partners, they will be highlighted with a small Support-Mode logo in your search results.<br>This logo helps you easily identify the Ad partners, and decide if you prefer to shop at their website, which will help us get some advertising revenues out of it.',
			optOutText:
				"👉 Manage Support-Mode<br><br>You can disable Support-Mode with the toggle below<div id='toggle_div'></div><br>If activated, you are supporting us, and we deeply thank you for that 🙏",
			privacy: '🔏 Respect of your Privacy',
			privacyText:
				'This new feature doesn’t store any information or data, ensuring full compliance with GDPR regulations.<br>We understand that trust is earned, which is why transparency and respect for your private data remain at the heart of all our decisions.<br><br>You can rely on us to maintain these standards consistently!!',
		},
		es: {
			explanation:
				'👉 Consulta esta pestaña para aprender más sobre nuestro modo de apoyo y cómo puedes ayudarnos 👈',
			supportMode: '🌟 Modo de apoyo de {extension_name}',
			mainText:
				'Nuestra extensión es 100% gratuita y queremos mantenerla así!<br>Con nuestro Modo de Apoyo activado, nos permites mostrar el logotipo de nuestros socios publicitarios no intrusivos en tus resultados de búsqueda.<br>Si visitas el sitio web de uno de nuestros socios publicitarios, contribuyes al desarrollo de nuestra extensión.<br><br>¡Lo mejor de todo es que es 100% gratis :) ',
			howItWorks: '🔎 ¿Cómo funciona el modo de apoyo?',
			howItWorksText:
				'Cuando visitas uno de estos socios publicitarios, se resaltarán con un pequeño logotipo de Modo de Apoyo en tus resultados de búsqueda.<br>Este logotipo te ayuda a identificar fácilmente a los socios publicitarios y decidir si prefieres comprar en su sitio web, lo que nos ayudará a obtener ingresos publicitarios de ello.',
			optOutText:
				"👉 Gestionar Modo de Apoyo<br><br>Puedes desactivar el Modo de Apoyo con el botón de alternancia a continuación<div id='toggle_div'></div><br>Si está activado, nos estás apoyando, y te lo agradecemos profundamente 🙏",
			privacy: '🔏 Respeto a tu privacidad',
			privacyText:
				'Esta nueva función no almacena ninguna información o dato, asegurando el pleno cumplimiento de las regulaciones GDPR.<br>Entendemos que la confianza se gana, por lo que la transparencia y el respeto por tus datos privados son la base de todas nuestras decisiones.<br><br>¡Puedes contar con nosotros para mantener estos estándares de manera constante!',
		},
		de: {
			explanation:
				'👉 Schau dir diesen Tab an, um mehr über unseren Support-Modus zu erfahren und wie du uns helfen kannst 👈',
			supportMode: '🌟 {extension_name} Support-Modus',
			mainText:
				'Unsere Erweiterung ist 100% kostenlos, und wir möchten, dass das so bleibt!<br>Wenn du unseren Support-Modus aktivierst, ermöglichst du es uns, das Logo unserer nicht aufdringlichen Werbepartner in deinen Suchergebnissen anzuzeigen.<br>Wenn du die Website eines unserer Werbepartner besuchst, trägst du zur Entwicklung unserer Erweiterung bei.<br><br>Das Beste daran ist, dass es 100% kostenlos ist :) ',
			howItWorks: '🔎 Wie funktioniert der Support-Modus?',
			howItWorksText:
				'Wenn du einen dieser Werbepartner besuchst, werden sie in deinen Suchergebnissen mit einem kleinen Support-Modus-Logo hervorgehoben.<br>Dieses Logo hilft dir, die Werbepartner leicht zu identifizieren und zu entscheiden, ob du lieber auf ihrer Website einkaufen möchtest, was uns helfen wird, Werbeeinnahmen zu erzielen.',
			optOutText:
				"👉 Support-Modus verwalten<br><br>Du kannst den Support-Modus mit dem Umschalter unten deaktivieren<div id='toggle_div'></div><br>Wenn aktiviert, unterstützt du uns, und wir danken dir dafür 🙏",
			privacy: '🔏 Respektiere deine Privatsphäre',
			privacyText:
				'Diese neue Funktion speichert keine Informationen oder Daten und gewährleistet die vollständige Einhaltung der GDPR-Vorschriften.<br>Wir verstehen, dass Vertrauen verdient werden muss, weshalb Transparenz und der Respekt für deine persönlichen Daten im Mittelpunkt all unserer Entscheidungen stehen.<br><br>Du kannst dich darauf verlassen, dass wir diese Standards konstant einhalten!',
		},
		fr: {
			explanation:
				'👉 Consultez cet onglet pour en savoir plus sur notre mode de soutien et comment vous pouvez nous aider 👈',
			supportMode: '🌟 Mode de soutien {extension_name}',
			mainText:
				"Notre extension est 100% gratuite et nous voulons qu'elle reste ainsi !<br>En activant notre mode de soutien, vous nous permettez d'afficher le logo de nos partenaires publicitaires non intrusifs dans vos résultats de recherche.<br>Si vous visitez le site web de l'un de nos partenaires publicitaires, vous contribuez au développement de notre extension.<br><br>Le meilleur, c'est que c'est 100% gratuit :) ",
			howItWorks: '🔎 Comment fonctionne le mode de soutien ?',
			howItWorksText:
				"Lorsque vous visitez l'un de ces partenaires publicitaires, ils seront mis en évidence avec un petit logo de mode de soutien dans vos résultats de recherche.<br>Ce logo vous aide à identifier facilement les partenaires publicitaires et à décider si vous préférez faire des achats sur leur site web, ce qui nous aidera à obtenir des revenus publicitaires.",
			optOutText:
				"👉 Gérer le mode de soutien<br><br>Vous pouvez désactiver le mode de soutien avec le bouton à bascule ci-dessous<div id='toggle_div'></div><br> s'il est activé, vous nous soutenez et nous vous en remercions profondément 🙏",
			privacy: '🔏 Respect de votre vie privée',
			privacyText:
				"Cette nouvelle fonctionnalité ne stocke aucune information ou donnée, garantissant ainsi le respect total des réglementations GDPR.<br>Nous comprenons que la confiance se mérite, c'est pourquoi la transparence et le respect de vos données privées sont au cœur de toutes nos décisions.<br><br>Vous pouvez compter sur nous pour maintenir ces normes de manière constante !",
		},
		it: {
			explanation:
				'👉 Controlla questa scheda per saperne di più sulla nostra modalità di supporto e su come puoi aiutarci 👈',
			supportMode: '🌟 Modalità di supporto {extension_name}',
			mainText:
				'La nostra estensione è 100% gratuita e vogliamo mantenerla tale!<br>Attivando la nostra modalità di supporto, ci consenti di mostrare il logo dei nostri partner pubblicitari non intrusivi nei tuoi risultati di ricerca.<br>Se visiti il sito web di uno dei nostri partner pubblicitari, contribuisci allo sviluppo della nostra estensione.<br><br>La parte migliore è che è 100% gratuita :) ',
			howItWorks: '🔎 Come funziona la modalità di supporto?',
			howItWorksText:
				'Quando visiti uno di questi partner pubblicitari, verranno evidenziati con un piccolo logo della modalità di supporto nei tuoi risultati di ricerca.<br>Questo logo ti aiuta a identificare facilmente i partner pubblicitari e a decidere se preferisci fare acquisti sul loro sito web, il che ci aiuterà a ottenere entrate pubblicitarie.',
			optOutText:
				"👉 Gestire la modalità di supporto<br><br>Puoi disattivare la modalità di supporto con il pulsante di attivazione qui sotto<div id='toggle_div'></div><br>Se attivato, ci stai supportando e ti ringraziamo profondamente per questo 🙏",
			privacy: '🔏 Rispetto della tua privacy',
			privacyText:
				'Questa nuova funzionalità non memorizza alcuna informazione o dato, garantendo il pieno rispetto delle normative GDPR.<br>Comprendiamo che la fiducia si guadagna, motivo per cui la trasparenza e il rispetto per i tuoi dati personali sono al centro di tutte le nostre decisioni.<br><br>Puoi contare su di noi per mantenere costantemente questi standard!',
		},
		pt: {
			explanation:
				'👉 Confira esta aba para saber mais sobre nosso modo de suporte e como você pode nos ajudar 👈',
			supportMode: '🌟 Modo de suporte {extension_name}',
			mainText:
				'Nossa extensão é 100% gratuita e queremos mantê-la assim!<br>Com o modo de suporte ativado, você nos permite exibir o logo de nossos parceiros publicitários não intrusivos nos seus resultados de pesquisa.<br>Se você visitar o site de um de nossos parceiros publicitários, você contribui para o desenvolvimento da nossa extensão.<br><br>A melhor parte é que é 100% gratuito :) ',
			howItWorks: '🔎 Como funciona o modo de suporte?',
			howItWorksText:
				'Quando você visita um desses parceiros publicitários, eles serão destacados com um pequeno logo de modo de suporte em seus resultados de pesquisa.<br>Esse logo ajuda você a identificar facilmente os parceiros publicitários e decidir se prefere comprar em seu site, o que nos ajudará a obter alguma receita publicitária.',
			optOutText:
				"👉 Gerenciar Modo de Suporte<br><br>Você pode desativar o Modo de Suporte com o botão de alternância abaixo<div id='toggle_div'></div><br>Se ativado, você está nos apoiando, e agradecemos profundamente por isso 🙏",
			privacy: '🔏 Respeito à sua Privacidade',
			privacyText:
				'Este novo recurso não armazena nenhuma informação ou dado, garantindo total conformidade com as regulamentações do GDPR.<br>Entendemos que a confiança é conquistada, por isso a transparência e o respeito pelos seus dados pessoais estão no centro de todas as nossas decisões.<br><br>Você pode contar conosco para manter esses padrões de forma consistente!',
		},
	};

	const userLang = (navigator.language || navigator.userLanguage).split('-')[0]; // Get the language part
	const lang = userLang in translations ? userLang : 'en'; // Fallback to English if translation is not available

	fetch(chrome.runtime.getURL('./sum/config.json'))
		.then((response) => response.json())
		.then((config) => {
			console.log('name:', config.extension_name);

			const extension_name = config.extension_name;

			document.getElementById('explanation').innerHTML = translations[lang].explanation.replace(
				'{extension_name}',
				extension_name
			);
			document.getElementById('supportMode').innerHTML = translations[lang].supportMode.replace(
				'{extension_name}',
				extension_name
			);
			document.getElementById('mainText').innerHTML = translations[lang].mainText;
			document.getElementById('howItWorks').innerHTML = translations[lang].howItWorks;
			document.getElementById('howItWorksText').innerHTML = translations[lang].howItWorksText;
			document.getElementById('optOutText').innerHTML = translations[lang].optOutText;
			document.getElementById('privacy').innerHTML = translations[lang].privacy;
			document.getElementById('privacyText').innerHTML = translations[lang].privacyText;

			//------------------ MANAGE SETTING POPUP -----------------------

			// check if an extension enough permissions
			const statusChecked = 'checked';
			chrome.runtime.sendMessage({ permAction: 'checkIfHasEnough' }, function (response) {
				console.log('checkIfHasEnough permission answer received', response);

				const hasEnough = response.permStatus;

				chrome.storage.local.get(['permissionsGranted'], function (result) {
					console.log('get permissionsGranted', result.permissionsGranted);

					const hasAccepted = result.permissionsGranted;

					if (!hasEnough || hasAccepted === false) {
						var statusChecked = '';
						console.log('permissionsGranted', hasAccepted);
					} else if (hasEnough && (hasAccepted === true || hasAccepted === undefined)) {
						var statusChecked = 'checked';
						console.log('permissionsGranted', hasAccepted);
					}

					//hide default message
					// const div_default_mess = document.getElementById("ih_default_alert_message");
					// div_default_mess.style.display = 'none';

					// Inject HTML
					const targetDiv = document.getElementById('toggle_div');
					const div = document.createElement('div');
					div.innerHTML =
						`<div style="text-align:left;margin-top:20px;"> 
                                          <p><label class="switch"><input type="checkbox" id="mySwitch" ` +
						statusChecked +
						`><span class="slider round"></span></label></p>
                                        </div>`;
					//document.body.appendChild(div);
					targetDiv.appendChild(div);

					// Inject CSS
					const style = document.createElement('style');
					style.textContent = `.switch { position: relative; display: inline-block; width: 60px; height: 34px; } .switch input { opacity: 0; width: 0; height: 0; } .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; -webkit-transition: .4s; transition: .4s; } .slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; -webkit-transition: .4s; transition: .4s; } input:checked + .slider { background-color: #4ed4b3; } input:focus + .slider { box-shadow: 0 0 1px #4ed4b3; } input:checked + .slider:before { -webkit-transform: translateX(26px); -ms-transform: translateX(26px); transform: translateX(26px); } .slider.round { border-radius: 34px; } .slider.round:before { border-radius: 50%; } body { font-family: 'Helvetica Neue', Helvetica, Verdana, Arial, sans-serif !important; font-size: 14px !important; }`;

					document.head.appendChild(style);

					//click on toggle
					document.getElementById('mySwitch').addEventListener('click', async function () {
						if (!hasEnough || hasAccepted === false) {
							//feature set to ON
							if (!hasEnough) {
								chrome.runtime.sendMessage({ permAction: 'getPerm', agreement: true });
							}
							if (hasAccepted === false || hasAccepted === undefined) {
								chrome.storage.local.set({ permissionsGranted: true }, function () {
									console.log('permissionsGranted SET TO ON');
									window.location.reload();
								});
							}
						} else if (
							(hasEnough && hasAccepted === true) ||
							(hasEnough && hasAccepted === undefined)
						) {
							// feature set to OFF
							console.log('permissionsGranted SET TO OFF');
							chrome.storage.local.set({ permissionsGranted: false }, function () {
								chrome.runtime.sendMessage({ permAction: 'refusePerm', agreement: true });
								window.location.reload();
							});
						}
					});
				});
			});

			//--------------------------------------------------
		})
		.catch((error) => console.error('Erreur lors du chargement du fichier config.json:', error));
});
