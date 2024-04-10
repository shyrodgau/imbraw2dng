#!/usr/bin/env node
/* 
***************************************************** 

imbraw2dng.js

Convert RAW from I'm back(R)(https://imback.eu) into DNG

Based on work by Michele Asciutti.

https://github.com/shyrodgau/imbraw2dng

Usage: node imbraw2dng.js [-l lang] [-f] [-d dir] [-nc | -co] [-R] [-J] [-O] [-n yyyy_mm_dd-hh_mm_ss] [ [--] <files-or-dirs>* ]
Options:
 -h - show this help
 -nc - do not use coloured text
 -co - force coloured text
 -l XX - where XX is a valid language code (currently: DE, EN, FR)
         Language can also be set by changing filename to imbraw2dng_XX.js .
 -d dir - put output files into dir
 -f - overwrite existing files
 -r - rename output file, if already exists
 -np - Do not add preview thumbnail to DNG
 -R - get RAW from ImB connected via Wifi or from given directories
 -J - get JPEG from ImB connected via Wifi or from given directories
 -O - get non-RAW/non-JPEG from ImB connected via Wifi or from given directories
 -n yyyy_mm_dd-hh_mm_ss (or prefix of any length) - select only newer than this timestamp from ImB or from given directories
 -----
 -- - treat rest of parameters as local files or dirs
 <files-or-dirs> - process local files or directories recursively, e.g. on MicroSD from ImB

The following js code is identical to the js inside imbraw2dng.html.

***************************************************** 

Copyright (C) 2023,2024 by Stefan Hegny, stefan@hegny.de

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. 
IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, 
DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

// SPDX-License-Identifier: 0BSD

***************************************************** 
*/
"use strict;"
/* Main class */
class ImBC {
/* Indentation out */
constructor() {
	if (!document) {
		this.fs = require('fs');
		this.ht = require('http');
		this.pa = require('path');
		if (process.platform.substring(0,3) === 'win') this.#withcolours = false;
	}
}
#version = "V3.5.6_71844f9"; // actually const
#alllangs = [ 'de' , 'en', 'fr', 'ru', '00' ]; // actually const
#texts = { // actually const
	langs: { de: 'DE', en: 'EN', fr: 'FR' , ru: 'RU' },
	main: {
		coloursyourrisk: {
			de: 'Bei Farben bin ich raus! Eigenes Risiko, fraach mich net!',
			en: 'About colurs, I am out! Own risk, do not ask me!',
			fr: 'About colurs, I am out! Own risk, do not ask me!'
		},
		title: {
			de: 'ImB RAW nach DNG Konverter',
			en: 'ImB RAW to DNG converter',
			fr: 'Convertisseur ImB RAW a DNG',
			ru: 'Конвертер ImB RAW в DNG'
		},
		file: {
			de: 'Datei',
			en: 'File',
			fr: 'Fiche',
			ru: 'файл'
		},
		help: {
			de: '? Hilfe Doku',
			en: '? Help Doc',
			fr: '? Aide Doc',
			ru: '? Помощь Док'
		},
		helplink: {
			de: 'https://shyrodgau.github.io/imbraw2dng/README_de',
			en: 'https://shyrodgau.github.io/imbraw2dng/',
			fr: 'https://shyrodgau.github.io/imbraw2dng/',
		},
		generaladvice: {
			de: 'Daten werden nur im Browser verarbeitet, nicht im \'Internet\'.<br>Kann sein, dass der Browser fragt, ob Sie zulassen wollen, dass mehrere Dateien heruntergeladen werden.<br>Dateien, die nicht oder unbekannte RAW-Dateien sind, werden 1:1 kopiert.',
			en: 'Data processing is entirely in the browser, not in \'the internet\'<br>Browser may ask you if you want to allow downloading multiple files.<br>Not or unrecognized RAW Files simply will be copied.',
			fr: 'L\'information est entièrement traitée dans le navigateur et non sur \'Internet\'<br>Le navigateur peux questionner que vous acceptez le téléchargement de beaucoup de fiches.<br>Fiches pas-RAW ou RAW inconnue sont copiée 1:1.',
			ru: 'Данные обрабатываются только в браузере, а не в \'Интернете\'.<br>Браузер может спросить, хотите ли вы разрешить загрузку нескольких файлов.<br>Файлы, которые не являются или неизвестными файлами RAW, копируются 1:1.'
		},
		drophere: {
			de: 'Dateien von ImB hier ablegen: ',
			en: 'Drop Files from ImB here: ',
			fr: 'Posez fiches de ImB ici: ',
			ru: 'Храните файлы из ImB здесь: '
		},
		selectraw: {
			de: 'Oder diese Seite per WLAN <a href=\'https://github.com/shyrodgau/imbraw2dng/blob/master/moredoc_de.md#gucken-auf-imback-selbst\'>direkt von ImB</a> verwenden.<br>Oder <tt>.RAW</tt> Datei(en) auswählen:',
			en: 'Or use this page via Wifi <a href=\'https://github.com/shyrodgau/imbraw2dng/blob/master/moredoc.md#browsing-on-the-imback\'>directly from ImB</a>.<br>Or select <tt>.RAW</tt> File(s):',
			fr: 'Ou utiliez cette page <a href=\'https://github.com/shyrodgau/imbraw2dng/blob/master/moredoc.md#browsing-on-the-imback\'>via Wifi sur ImB</a>.<br>Ou selectez <tt>.RAW</tt> fiche(s):',
			ru: 'Или используйте эту страницу через Wi-Fi <a href=\'https://github.com/shyrodgau/imbraw2dng/blob/master/moredoc.md#browsing-on-the-imback\'>прямо из ImB</a>.<br>Или выберите файл(ы) <tt>RAW</tt>:'
		},
		stillcounting: {
			de: '... zähle ... ',
			en: '... counting ... ',
			fr: '... compter ...',
			ru: '... подсчет ...'
		},
		types: {
			rawpics: {
				de: 'RAW Bilder',
				en: 'RAW Pictures',
				fr: 'RAW images',
			},
			jpgpics: {
				de: 'JPEG-Bilder',
				en: 'JPEG Pictures',
				fr: 'JPEG images'
			},
			other: {
				de: 'Andere',
				en: 'Other',
				fr: 'Autre',
			},
			notpic: {
				de: 'Keine Bilder',
				en: 'Not pictures',
				fr: 'Pas images'
			}
		},
		file: {
			jpeg: {
				de: 'Datei $$0 (JPEG)',
				en: 'File $$0 (JPEG)',
				fr: 'Fiche $$0 (JPEG)'
			},
			nopreview: {
				de: 'Datei $$0<br>Nicht jpeg oder raw, keine Vorschau...',
				en: 'File $$0<br>Not jpeg or raw, no preview...',
				fr: 'Fiche $$0<br>Ni jpeg ni raw, pas de aperçu...'
			},
			rawunknown: {
				de: 'Datei $$0<br>Unerkannte RAW Dateigröße $$1, bitte Entwickler kontaktieren! Keine Vorschau...',
				en: 'File $$0<br>Unknown raw size $$1, please contact developer! No preview...',
				fr: 'Fiche $$0<br>taille de fiche $$1 non reconnue, contacter le développeur, pas de aperçu...' 
			},
			dngimpnote: {
				de: 'Import eines DNG geht nur, wenn diese genau das hiermit erzeugte Original ist.',
				en: 'Re-import of a DNG is only possible if this is exactly the original that was created here.',
				fr: 'La réimportation d\'un DNG n\'est possible que s\'il s\'agit exactement de l\'original créé ici.'
			},
			de: 'Datei $$0',
			en: 'File $$0',
			fr: 'Fiche $$0'
		},
		sort: {
			de: 'Sortiere',
			en: 'Sort:',
			fr: 'Trier:'
		},
		or: {
			de: 'Oder ',
			en: 'Or ',
			fr: 'Ou '
		},
		log: {
			de: 'Protokoll-Ausgabe:',
			en: 'Message Log:',
			fr: 'Journal des messages'
		},
		selected: {
			de: 'Ausgewählt',
			en: 'Selected',
			fr: 'Sélectionné(s)'
		}
	},
	browser: {
		bytype: {
			de: 'nach Typ',
			en: 'by type',
			fr: 'par type'
		},
		olderfirst: {
			de: 'Ältere nach oben',
			en: 'Older first',
			fr: 'Plus anciens ci-dessus'
		},
		selall: {
			tooltip: {
				de: 'Wenn Haken nicht gesetzt, wähle alles aus. Bei Klick wenn angehakt setze Auswahl auf Nichts.',
				en: 'If not selected then select all. If it is selected and clicked then unselect all.',
				fr: 'S\'il n\'est pas sélectionner, sélectionner tout. Au clic si sélectionné, vider la sélection'
			},
			de: 'Alle de-/ oder selektieren',
			en: 'De-/select all',
			fr: 'De-/sélectionner tout'
		},
		procall: {
			de: 'Alle ausgewählte kopieren/verarbeiten',
			en: 'Copy/process all selected',
			fr: 'Traiter les sélectionnés'
		},
		delall: {
			de: 'Alle ausgewählte löschen',
			en: 'Delete all selected',
			fr: 'Supprimer les sélectionnés'
		}
	},
	onimback: {
		connected: {
			de: 'ImB Verbunden! ',
			en: 'ImB Connected! ',
			fr: 'ImB Connecté! '
		},
		dlconvert: {
			de: 'Konvertiere / Lade herunter: ',
			en: 'Download / convert: ',
			fr: 'Telecharger / convertir'
		},
		totalnum: {
			de: 'gesamt:',
			en: 'total:',
			fr: 'total:'
		},
		fromtime: {
			de: 'ab Zeitstempel bzw. jünger als ',
			en: 'from timestamp or younger than ',
			fr: 'à partir de l\'horodatage ou plus jeune que '
		},
		nullforall: {
			de: '0000 oder leer für \'alle\'',
			en: '0000 or empty for \'all\'',
			fr: '0000 ou déposer pour \'tout\''
		},
		doit: {
			de: 'Mach es',
			en: 'Do it',
			fr: 'Fais-le'
		},
		visual: {
			de: 'Bild-Browser benutzen',
			en: 'Use visual Picture Browser',
			fr: 'Ou outilizer navigateur visuel des images'
		},
		errconnect: {
			de: '\x1b[31mFEHLER\x1b[0m bei der Verbindung zu ImB auf $$0! Im ImB WLAN?',
			en: '\x1b[31mERROR\x1b[0m connecting to ImB on $$0! In the ImB WiFi?',
			fr: '\x1b[31mERREUR\x1b[0m lors de la connexion à imback. Dans le Wifi ImB?'
		},
		nomatch: {
			de: 'Keine passenden Dateien gefunden. Kann vorübergehend sein.',
			en: 'No matching files found. Might be temporary.',
			fr: 'Aucun fiche correspondant trouvé. Peut-etre temporaire.'
		},
		strangename: {
			de: '<b style=\'background-color:#ffdddd;\'>Warnung:</b> Komischer Dateiname: $$0',
			en: '<b style=\'background-color:#ffdddd;\'>Warning:</b> Strange file name: $$0',
			fr: '<b style=\'background-color:#ffdddd;\'>Avertissement:</b> Nom de fiche inhabituel: $$0'
		},
		strangenamex: {
			de: '\x1b[31mWarnung:\x1b[0m Komischer Dateiname: $$0',
			en: '\x1b[31mWarning:\x1b[0m Strange file name: $$0',
			fr: '\x1b[31mAvertissement:\x1b[0m Nom de fiche inhabituel: $$0'
		},
		invaltime: {
			de: '<b style=\'background-color:#ffdddd;\'>FEHLER:</b> Ungültiger Zeitstempel: $$0',
			en: '<b style=\'background-color:#ffdddd;\'>ERROR:</b> Invalid timestamp: $$0',
			fr: '<b style=\'background-color:#ffdddd;\'>ERREUR:</b> Horodatage invalide: $$0'
		},
		invaltimex: {
			de: '\x1b[31mFEHLER:\x1b[0m Ungültiger Zeitstempel: $$0',
			en: '\x1b[31mERROR:\x1b[0m Invalid timestamp: $$0',
			fr: '\x1b[31mERREUR:\x1b[0m Horodatage invalide: $$0'
		},
	},
	process: {
		singlestep: {
			de: 'Einzelschritt mit Vorschau',
			en: 'Single Step with preview',
			fr: 'Seule étape avec aperçu'
		},
		nothing: {
			de: 'Nichts ausgewählt.. ?',
			en: 'Nothing selected...?',
			fr: 'Rien de sélectionné'
		},
		erraccess: {
			de: '<b>Fehler beim Zugriff auf $$0. ENTSCHLDIGUNG! </b>',
			en: '<b>Error occured accessing $$0. SORRY! </b>',
			fr: '<b>Erreur lors de l\'accès à $$0. DÉSOLÉE!</b>'
		},
		erraccessx: {
			de: '\x1b[31mFEHLER\x1b[0m beim Zugriff auf $$0. ENTSCHLDIGUNG!',
			en: '\x1b[31mERROR\x1b[0m occured accessing $$0. SORRY!',
			fr: '\x1b[31mERREUR\x1b[0m lors de l\'accès à $$0. DÉSOLÉE!'
		},
		notraw: {
			de: 'Durchleitung weil nicht raw: $$0',
			en: 'Passing through as not raw: $$0',
			fr: 'Passage comme non RAW: $$0'
		},
		selectedn: {
			de: '$$0 Datei(en) wurden ausgewählt.',
			en: 'Got $$0 file(s) selected.',
			fr: '$$0 fiche(s) sélectionné(s)'
		},
		copyok: {
			de: '<b style=\'background-color:#ddffdd;\'>Fertig! Nach $$0 kopiert (Downloads-Ordner prüfen)</b>&nbsp;',
			en: '<b style=\'background-color:#ddffdd;\'>Finished! Copied to $$0 (Check Downloads Folder)</b>&nbsp;',
			fr: '<b style=\'background-color:#ddffdd;\'>Fini! Copié sur $$0 (Vérifier le dossier de téléchargements/Downloads)</b>&nbsp;'
		},
		copyokx: {
			de: '\x1b[32mFertig!\x1b[0m Nach $$0 kopiert',
			en: '\x1b[32mFinished!\x1b[0m Copied to $$0',
			fr: '\x1b[32mFini!\x1b[0m Copié sur $$0'
		},
		errorreadingfile: {
			de: '<b style=\'background-color:#ffdddd;\'>Fehler beim Lesen der Datei $$0. ENTSCHULDIGUNG! </b>',
			en: '<b style=\'background-color:#ffdddd;\'>Error occured reading file $$0. SORRY! </b>',
			fr: '<b style=\'background-color:#ffdddd;\'>Erreur de lecture du fiche $$0. DÉSOLÉE! </b>'
		},
		errorreadingfilex: {
			de: '\x1b[31mFEHLER\x1b[0m beim Lesen der Datei $$0. ENTSCHULDIGUNG!',
			en: '\x1b[31mERROR\x1b[0m occured reading file $$0. SORRY!',
			fr: '\x1b[31mERREUR\x1b[0m de lecture du fiche $$0. DÉSOLÉE!'
		},
		unknownsize: {
			de: '<b style=\'background-color:#ffdddd;\'>[$$0] Entschuldigung, die Dateigröße <b>$$1</b> passt zu keinem bekannten Format. Bitte Entwickler kontaktieren!</b>',
			en: '<b style=\'background-color:#ffdddd;\'>[$$0] Sorry, file Size <b>$$1</b> does not match known formats. Please contact developer!</b>',
			fr: '<b style=\'background-color:#ffdddd;\'>[$$0] Désolée, la taille du fiche $$1 ne correspond pas au format connu. Veuillez contacter le développeur</b>'
		},
		unknownsizex: {
			de: '[$$0] \x1b[31mEntschuldigung, die Dateigröße $$1 passt zu keinem bekannten Format. Bitte Entwickler kontaktieren!\x1b[0m',
			en: '[$$0] \x1b[31mSorry, file Size $$1 does not match known formats. Please contact developer!\x1b[0m',
			fr: '[$$0] \x1b[31mDésolée, la taille du fiche $$1 ne correspond pas au format connu. Veuillez contacter le développeur\x1b[0m'
		},
		processing: {
			de: 'Verarbeite Datei: $$0 ',
			en: 'Processing file: $$0',
			fr: 'Je suis en train de traiter le fiche $$0'
		},
		assuming: {
			de: 'Annahme: $$0 $$1',
			en: 'Assuming $$0 $$1',
			fr: 'Hypothèse: $$0 $$1'
		},
		datetime: {
			de: 'Datum/Zeit: $$0',
			en: 'Date/Time: $$0 ',
			fr: 'Date/heure: $$0'
		},
		orientation: {
			de: 'Drehung: ',
			en: 'Orientation: ',
			fr: 'Rotation: '
		},
		converted: {
			de: '<b style=\'background-color:#ddffdd;\'>Fertig! Nach $$0 konvertiert (Downloads-Ordner prüfen)</b>&nbsp;',
			en: '<b style=\'background-color:#ddffdd;\'>Finished! Converted to $$0 (Check Downloads Folder)</b>&nbsp;',
			fr: '<b style=\'background-color:#ddffdd;\'>Fini! Converti en $$0 (Vérifier le dossier de téléchargements/Downloads)</b>&nbsp;'
		},
		convertedx: {
			de: '\x1b[32mFertig!\x1b[0m Nach $$0 konvertiert',
			en: '\x1b[32mFinished!\x1b[0m Converted to $$0',
			fr: '\x1b[32mFini!\x1b[0m Converti en $$0'
		},
		errsave: {
			de: '\x1b[31mFEHLER!\x1b[0m Konnte Datei $$0 nicht speichern.',
			en: '\x1b[31mERROR!\x1b[0m Could not write file $$0',
			fr: '\x1b[31mERREUR\x1b[0m Impossible d\'écrire le fiche $$0.'
		},
		droppedn: {
			de: '$$0 Datei(en) wurden abgelegt.',
			en: 'Got $$0 file(s) dropped.',
			fr: '$$0 fiche(s) ont été stockés'
		},
		frombackn: {
			de: '$$0 Datei(en) vom ImB zu verarbeiten.',
			en: 'Got $$0 file(s) from ImB.',
			fr: 'J\'ai reçu $$0 fiche(s) d\'ImB'
		},
		frombrowsern: {
			de: '$$0 Datei(en) vom Bild-Browser zu verarbeiten.',
			en: 'Got $$0 file(s) from Visual browser.',
			fr: 'J\'ai obtenu $$ fiche(s) du navigateur visuel'
		},
		skipped: {
			remaining: {
				de: 'Verbleibende $$0 Dateien auf Anforderung übersprungen',
				en: 'Skipping remaining $$0 images at your request',
				fr: '$$0 fiches restants ignorés sur demande'
			},
			de: 'Auf Anforderung übersprungen: $$0',
			en: 'Skipped at your request: $$0',
			fr: 'Ignoré à votre demande: $$0'
		},
		totals: {
			en: 'Total $$0, ok $$1, skipped $$2, Errors $$3',
			de: 'Total $$0, ok $$1, übersprungen $$2, Fehler $$3',
			fr: 'Total : $$0, ok :$$1, Ignoré : $$2, Erreur : $$3'
		},
		addpreview: {
			en: 'Add preview thumbnail to DNG',
			de: 'Kleines Vorschaubild im DNG',
			fr: 'Petite image d\'aperçu en DNG'
		}
	},
	preview: {
		err: {
			de: 'Fehler bei Vorschau :-(',
			en: 'Error with Preview :-(',
			fr: 'Erreur dans l\'aperçu :-('
		},
		rotcw: {
			de: 'im Uhrzeigersinn drehen',
			en: 'Rotate clockwise',
			fr: 'tourner dans le sens des aiguilles d\'une montre'
		},
		rotccw: {
			de: 'gegen den Uhrzeigersinn drehen',
			en: 'rotate counterclockwise',
			fr: 'tourner dans le sens inverse des aiguilles d\'une montre'
		},
		rot180: {
			de: 'auf den Kopf',
			en: 'Rotate 180°',
			fr: 'retourné'
		},
		rotreset: {
			de: 'Drehung zurücksetzen',
			en: 'Reset',
			fr: 'Réinitialiser la rotation',
			tooltip: {
				de: 'Ursprüngliche Bildausrichtung wiederherstellen',
				en: 'Reset original image orientation',
				fr: 'Restaurer l\'orientation originale de l\'image'
			}
		},
		process: {
			de: 'Kopieren/Konvertieren',
			en: 'Copy/Convert',
			fr: 'Copie/Convertir'
		},
		skip: {
			de: 'Überspringen',
			en: 'Skip',
			fr: 'Sauter'
		},
		forall: {
			de: 'Für alle weiteren das selbe',
			en: 'Do this for all following',
			fr: 'Faites ceci pour tous les suivants'
		},
		orients: {
			none: {
				de: 'keine',
				en: 'none',
				fr: 'aucune'
			},
			upsidedown: {
				de: '180°',
				en: '180°',
				fr: '180°'
			},
			clockwise: {
				de: 'im Uhrzeigersinn',
				en: 'clockwise',
				fr: 'dans le sens des aiguilles d\'une montre'
			},
			counterclockwise: {
				de: 'gegen den Uhrzeigersinn',
				en: 'counterclockwise',
				fr: 'dans le sens inverse des aiguilles d\'une montre'
			}
		}
	},
	raw: {
		unknownsize: {
			de: 'Unerkannte RAW-Dateigröße, Entwickler kontaktieren',
			en: 'Unrecognized RAW file size, contact developer',
			fr: 'La taille du fiche RAW ne correspond pas au format connu. Veuillez contacter le développeur'
		},
	},
	selection: {
		got: {
			de: '$$0 Dateien wurden ausgewählt.',
			en: 'Got $$0 files selected.',
			fr: '$$0 dossiers ont été sélectionnés.'
		},
	},
	del: {
		question: {
			en: 'Deleting $$0 file(s) can not be undone! Are you sure you want to continue?',
			de: 'Löschen von $$0 Datei(en) kann nicht rückgängig gemacht werden. Sicher damit weitermachen?',
			fr: 'La suppression de $$0 fiche(s) est irréversible. Es-tu sur de vouloir continuer?',
			ok: {
				de: 'Ok',
				en: 'Ok',
				fr: 'Ok'
			},
			cancel: {
				de: 'Abbrechen',
				en: 'Cancel',
				fr: 'Annuler'
			}
		},
		nostatus: {
			de: 'Der Status des Löschens kann nicht sicher geprüft werden. Bitte laden Sie die Seite nach dem Löschen neu.',
			en: 'The status of the delete can not be checked safely. Reload the page after deleting.',
			fr: 'Le statut de la suppression ne peut pas être vérifié avec certitude. Veuillez recharger la page après la suppression.'
		},
		reload: {
			de: 'Bitte Seite neu laden.',
			en: 'Please reload page.',
			fr: 'Veuillez recharger la page.'
		}
	},
	node: {
		help: {
			en: [ '\x1b[1mWelcome to imbraw2dng\x1b[0m $$0 !', 'Usage: node $$0 \x1b[1m[\x1b[0m-l lang\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-f\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-d dir\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-nc \x1b[1m|\x1b[0m -co\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-R\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-J\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-O\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-n yyyy_mm_dd-hh_mm_ss\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m \x1b[1m[\x1b[0m--\x1b[1m]\x1b[0m \x1b[1m<\x1b[0mfiles-or-dirs\x1b[1m>*\x1b[0m \x1b[1m]\x1b[0m',
				'Options:',
				' \x1b[1m-h\x1b[0m - show this help',
				' \x1b[1m-nc\x1b[0m - do not use coloured text',
				' \x1b[1m-co\x1b[0m - force coloured text',
				' \x1b[1m-l XX\x1b[0m - where XX is a valid language code (currently: DE, EN, FR)',
				'         Language can also be set by changing filename to imbraw2dng_XX.js .',
				' \x1b[1m-d dir\x1b[0m - put output files into dir',
				' \x1b[1m-f\x1b[0m - overwrite existing files',
				' \x1b[1m-r\x1b[0m - rename output file, if already exists',
				' \x1b[1m-np\x1b[0m - Do not add preview thumbnail to DNG',
				' \x1b[1m-R\x1b[0m - get RAW from ImB connected via Wifi or from given directories',
				' \x1b[1m-J\x1b[0m - get JPEG from ImB connected via Wifi or from given directories',
				' \x1b[1m-O\x1b[0m - get non-RAW/non-JPEG from ImB connected via Wifi or from given directories',
				' \x1b[1m-n yyyy_mm_dd-hh_mm_ss\x1b[0m (or prefix of any length) - select only newer than this timestamp from ImB or from given directories',
				' -----',
				' \x1b[1m--\x1b[0m - treat rest of parameters as local files or dirs',
				' <files-or-dirs> - process local files or directories recursively, e.g. on MicroSD from ImB',],
			fr: [ '\x1b[1mBienvenu a imbraw2dng\x1b[0m $$0 !', 'Operation: node $$0 \x1b[1m[\x1b[0m-l lang\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-f\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-d repertoire\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-nc \x1b[1m|\x1b[0m -co\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-R\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-J\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-O\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-n yyyy_mm_dd-hh_mm_ss\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m \x1b[1m[\x1b[0m--\x1b[1m]\x1b[0m \x1b[1m<\x1b[0mfiches-ou-repertoires\x1b[1m>*\x1b[0m \x1b[1m]\x1b[0m',
				'Choix:',
				' \x1b[1m-h\x1b[0m - montrer cette aide',
				' \x1b[1m-nc\x1b[0m - n\'utilisez pas de texte en couleur',
				' \x1b[1m-co\x1b[0m - utilisez de texte en couleur',
				' \x1b[1m-l XX\x1b[0m - quand XX est une code du langue valide (actuellement: DE, EN, FR)',
				'         La langue peut également être définie en changeant le nom du fiche en imbraw2dng_XX.js .',
				' \x1b[1m-d repertoire\x1b[0m - mettre les fiches de sortie dans le répertoire',
				' \x1b[1m-f\x1b[0m - écraser les fiches existants',
				' \x1b[1m-r\x1b[0m - quand fiche existe, renommer le résultat',
				' \x1b[1m-np\x1b[0m - Pas petite image d\'aperçu en DNG',
				' \x1b[1m-R\x1b[0m - obtenez RAW d\'ImB connecté via Wifi ou repertoires donnés',
				' \x1b[1m-J\x1b[0m - obtenez JPEG d\'ImB connecté via Wifi ou repertoires donnés',
				' \x1b[1m-O\x1b[0m - obtenez du non-RAW/non-JPEG d\'ImB connecté via Wifi ou repertoires donnés',
				' \x1b[1m-n yyyy_mm_dd-hh_mm_ss\x1b[0m (ou préfixe de n\'importe quelle longueur) - sélectionnez uniquement plus récent que cet horodatage d\'ImB ou repertoires donnés',
				' -----',
				' \x1b[1m--\x1b[0m - traiter le reste des paramètres comme des fiches ou des répertoires locaux',
			' <fiches-ou-repertoires> - traiter des fiches ou des répertoires locaux de manière récursive, par exemple sur MicroSD d\'ImB',],
			de: [ '\x1b[1mWillkommen bei imbraw2dng\x1b[0m $$0 !', 'Aufruf: node $$0 \x1b[1m[\x1b[0m-l sprache\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-f\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-d ordner\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-nc \x1b[1m|\x1b[0m -co\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-R\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-J\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-O\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m-n yyyy_mm_dd-hh_mm_ss\x1b[1m]\x1b[0m \x1b[1m[\x1b[0m \x1b[1m[\x1b[0m--\x1b[1m]\x1b[0m \x1b[1m<\x1b[0mdateien-oder-ordner\x1b[1m>*\x1b[0m \x1b[1m]\x1b[0m',
				'Optionen:',
				' \x1b[1m-h\x1b[0m - diesen Hilfetext zeigen',
				' \x1b[1m-nc\x1b[0m - keinen farbigen Text zeigen',
				' \x1b[1m-co\x1b[0m - farbigen Text zeigen',
				' \x1b[1m-l XX\x1b[0m - wo XX ein gültiger Sprachcode ist (derzeit: DE, EN, FR)',
				'         Die Sprache kann auch durch Umbenennen in imbraw2dng_XX.js geändert werden.',
				' \x1b[1m-d ordner\x1b[0m - Ausgabedateien in diesen Ordner ablegen',
				' \x1b[1m-f\x1b[0m - existierende Dateien überschreiben',
				' \x1b[1m-r\x1b[0m - Ausgabedatei umbenennen, falls schon existiert',
				' \x1b[1m-np\x1b[0m - Kein kleines Vorschaubild im DNG',
				' \x1b[1m-R\x1b[0m - RAW von per WLAN verbundener ImB oder übergebenen Verzeichnissen konvertieren',
				' \x1b[1m-J\x1b[0m - JPEG von per WLAN verbundener ImB oder übergebenen Verzeichnissen kopieren',
				' \x1b[1m-O\x1b[0m - Nicht-JPEG/Nicht-RAW von per WLAN verbundener ImB oder übergebenen Verzeichnissen kopieren',
				' \x1b[1m-n yyyy_mm_dd-hh_mm_ss\x1b[0m (oder beliebig langer Anfang davon) - nur Dateien neuer als dieser Zeitstempel von ImB oder übergebenen Verzeichnissen holen',
				' -----',
				' \x1b[1m--\x1b[0m - weitere Parameter als lokale Dateien oder Ordner betrachten',
				' <dateien-oder-ordner> - lokale Dateien oder Ordner rekursiv (z.B. von der MicroSD Karte aus ImB) verarbeiten',]
		},
		unkopt: {
			en: '\x1b[31mUnknown Option:\x1b[0m $$0',
			de: '\x1b[31mUnbekannte Option:\x1b[0m $$0',
			fr: '\x1b[31mOption inconnue:\x1b[0m $$0'
		},
		missingval: {
			en: '\x1b[31mMissing value for last parameter.\x1b[0m',
			de: '\x1b[31mFehlender Wert für letzten Parameter.\x1b[0m',
			fr: '\x1b[31mValeur manquante pour le dernier paramètre.\x1b[0m'
		},
		fnwarn: {
			en: '\x1b[31mWarning:\x1b[0m $$0 looks like a timestamp, did you forget \x1b[1m-n\x1b[0m or \x1b[1m--\x1b[0m in front of it?',
			de: '\x1b[31mWarnung:\x1b[0m $$0 sieht wie ein Zeitstempel aus, vielleicht \x1b[1m-n\x1b[0m oder \x1b[1m--\x1b[0m davor vergessen?',
			fr: '\x1b[31mAvertissement:\x1b[0m $$0 ressemble à un horodatage, oubliée \x1b[1m-n\x1b[0m ou \x1b[1m--\x1b[0m?',
		},
		renamed: {
			en: '(renamed)',
			de: '(umbenannt)',
			fr: '(renomee)'
		}
	}
};
#mylang = 'en';
#withcolours = true;
#withpreview = true;
/* node js: */
#outdir = '';
#ovwout = false;
#typeflags = 0;
#fromts = '0000';
#connmsg = false;
#renamefiles = false;
// generic user input timestamp (any prefix)
//           y      y     y     y      .      m     m     .      d      d      .      h     h      .      m     m      .      s     s
#tsregex = /^[02-3]([0-9]([0-9]([0-9](([^0-9])[01]([0-9](([^0-9])[0123]([0-9](([^0-9])[012]([0-9](([^0-9])[0-5]([0-9](([^0-9])[0-5]([0-9])?)?)?)?)?)?)?)?)?)?)?)?)?$/ // actually const
/* Data for the Imback variants and exif stuff */
// generic imb filename format
//            y    y    y    y     .         m    m     .        d     d      .        h    h      .        m    m      .        s    s            EXT
#fnregex = /^([2-3][0-9][0-9][0-9])([^0-9]?)([01][0-9])([^0-9]?)([0123][0-9])([^0-9]?)([012][0-9])([^0-9]?)([0-6][0-9])([^0-9]?)([0-6][0-9])(.*[.])([^.]*)$/ // actually const
// generic imb filename format, only timestamp
//             y    y    y    y     .         m    m     .        d     d      .        h    h      .        m    m      .        s    s
#fnregexx = /^([2-3][0-9][0-9][0-9])([^0-9]?)([01][0-9])([^0-9]?)([0123][0-9])([^0-9]?)([012][0-9])([^0-9]?)([0-6][0-9])([^0-9]?)([0-6][0-9])/ // actually const
#orients = [ '', 'none', '', 'upsidedown', '', '', 'clockwise', '', 'counterclockwise' ]; // actually const
#oriecw = [ 1, 6, 3, 8 ]; // clockwise indices // actually const
#types = [ "unknown", "ImB35mm", "MF 6x7 ", "MF6x4.5", "MF 6x6 " ]; // all length 7, actually const
#infos = [ // actually const
	{
		size: 14065920,
		w: 4320,
		h: 3256,
		typ: 0,
		mode: "historic"
	},
	{ /* MF 6x7 */
		size: 15925248,
		w: 4608,
		h: 3456,
		typ: 2,
		mode: ""
	},
	{ /* MF 6x4.5 */
		size: 12937632,
		w: 4152, h: 3116,
		typ: 3,
		mode: ""
	},
	{
		size: 9806592,
		w: 3616, h: 2712,
		typ: 3,
		mode: "Medium-angle"
	},
	{
		size: 6470944,
		w: 2936, h: 2204,
		typ: 3,
		mode: "Small-angle"
	},
	{ /* MF 6x6 */
		size: 11943936,
		w: 3456, h: 3456,
		typ: 4,
		mode: ""
	},
	{ /* 35mm */
		size: 15335424,
		w: 4608, h: 3328,
		typ: 1,
		mode: ""
	},
	{
		size: 11618752,
		w: 4012, h: 2896,
		typ: 1,
		mode: "Medium-angle"
	},
	{
		size: 7667520,
		w: 3260, h: 2352,
		typ: 1,
		mode: "Small-angle"
	}
	/* Film ? */
];

/* For processing several files */
#totnum=0;
#actnum=0;
#stats = { total: 0, skipped: 0, ok: 0, error: 0 };
#allfiles = [];
#dispcnt = 1;
#stepmode = 0; // 0: always save (when no preview checkbox or "save all" in dialog), 1: always ask (set on preview checkbox), 2: skip all (after selected in dialog)
// current preview image
#currentrot = 1; // see oriecw above
// from the back itself
#maxcache = 30; // max. length of cache for already downloaded raw data - you may increase or decrease this
#cache = []; // actual cache buffer
#imbpics = [];  // found jpegs
#rimbpics = []; // found raws
#imbmovies = []; // found other
#imbeles = [];  // elements for files for visual browser
#typedclasses = [];  // elements for groups w/o type for visual browser
#untypedclasses = []; // elements for groups with type for visual browser
#earliestmov = '9999';  // upper/lower bounds of dates for types
#latestmov='0000';
#earliestjpg='9999';
#latestjpg='0000';
#earliestraw='9999';
#latestraw='0000';
#loaderrunning=false; // currently handled browser raw preview download
/* deleting */
#deletephase = 0;
/* debug */
#debugflag = false;
/* primitive basename helper */
#basename(n) {
	while (n.lastIndexOf("/") > -1) {
		n = n.substring(n.lastIndexOf("/") + 1);
	}
	return n;
}
/* helper to append message */
#appendmsg(msg)  {
	if (document) {
		const msgel = document.getElementById('outmsg');
		const xmsg = document.getElementById('xmsg');
		xmsg.style["display"] = "";
		msgel.innerHTML += msg;
	}
	else console.log(msg);
}
/* helper to append message */
#appendmsgx(msg) {
	if (document) {
		const msgel = document.getElementById('outmsg');
		const xmsg = document.getElementById('xmsg');
		xmsg.style["display"] = "";
		msgel.append(msg);
	}
}
/* stupid helper */
#appendnl() {
	if (document) this.#appendmsg('<br>&nbsp;<br>');
}
/* browserdisplay: handler for file selection input */
fselected() {
	if (this.#actnum !== this.#allfiles.length) return;
    const stepprev = document.getElementById('steppreview');
    this.#stepmode = 0;
	if (stepprev !== null && stepprev.checked) this.#stepmode = 1;
	const el = document.getElementById('infile');
	this.#totnum = el.files.length;
	this.#actnum = 0;
	this.#stats = { total: this.#totnum, skipped: 0, error: 0, ok: 0 };
	this.#allfiles = el.files;
	if (this.#totnum > 0) {
		this.#mappx('process.selectedn', this.#totnum);
		this.#appendnl();
		document.getElementById('imbdoit').disabled = true;
		document.getElementById('imbvisbrows').disabled = true;
		document.getElementById('droptarget').style['display'] = 'none';
		document.getElementById('infile').disabled = true;
		this.#handleonex();
	}
}
/* nodejs: handle given files/dirs recursive */
#handlerecurse(already, index) {
	if (!already) {
		// initializsation
		already = [];
		index = 0;
		this.#stats.total = 0;
		this.#totnum = 0;
	}
	const d = this.#allfiles[index];
	if (undefined === d) {
		// beyond end of allfiles, finished recursion
		this.#allfiles = already;
		this.#stats.total = this.#totnum = already.length;
		if (this.#totnum > 0) this.#handleonex();
		else this.#mappx('onimback.nomatch');
		return;
	}
	this.fs.stat(d, (err, stat) => {
		if (err) {
			console.log(this.#xl('process.erraccessx', d));
			console.log(JSON.stringify(err));
			console.log('');
		}
		else if (stat.isDirectory()) {
			// recurse into
			this.fs.readdir(d, { withFileTypes: true, recursive: true }, (err2, f) => {
				if (err2) {
					console.log(this.#xl('process.erraccessx', d));
					console.log(JSON.stringify(err2));
				}
				else for (let i of f.filter(e => e.isFile())) {
					const n = i.name;
					if (n.substring(0,10).toUpperCase() === 'IMBRAW2DNG') continue;
					if (((n.substring(n.length -4).toUpperCase() === '.RAW') && (this.#typeflags % 2)) ||
						((n.substring(n.length -5).toUpperCase() === '.JPEG' || n.substring(n.length -4).toUpperCase() === '.JPG') && ((this.#typeflags % 4) > 1)) ||
						(n.substring(n.length -5).toUpperCase() !== '.JPEG' && n.substring(n.length -4).toUpperCase() !== '.JPG' &&
							n.substring(n.length -4).toUpperCase() !== '.RAW' && ((this.#typeflags % 8) > 3))) {
						if (this.#comptime(i.name, this.#fromts))
							already.push(i.path + this.pa.sep + i.name);
					}
					//console.log(i);
				}
			});
		}
		else {
			// plain files simply go
			already.push(d);
		}
		this.#handlerecurse(already, index + 1);
	});
}
/* continue with the next file if any */
#handlenext() {
	if (this.#actnum < this.#allfiles.length - 1) {
		this.#actnum++;
		this.#handleonex();
	} else {
		this.#actnum = 0;
		this.#allfiles = [];
		/*if (this.fromvisbrows) {
			this.fromvisbrows = false;
			this.showbrowser();
		} else*/ 
			this.shownormal();
		if (this.#stats.total > 0) {
			if (document) this.#appendnl();
			else this.#appendmsg('');
			this.#mappx('process.totals', this.#stats.total, this.#stats.ok, this.#stats.skipped, this.#stats.error);
			if (document) this.#appendnl();
			else this.#appendmsg('');
		}
		if (document) {
			document.getElementById('imbdoit').disabled = false;
			document.getElementById('imbvisbrows').disabled = false;
			document.getElementById('droptarget').style['display'] = '';
			document.getElementById('infile').disabled = false;
		}
	}
}
/* preview: switch preview config to jpeg img */
setjpegpv() {
	document.getElementById('jpegpreview').style['display'] = '';
	document.getElementById('rotations').style['display'] = 'none';
	document.getElementById('continues').style['display']='';
	document.getElementById('previewwait').style['display'] = 'none';
	document.getElementById('previewerr').style['display'] = 'none';
	document.getElementById('preview').style['display'] = 'none';
}
/* preview: switch preview config to err */
setpverr() {
	document.getElementById('jpegpreview').style['display'] = 'none';
	document.getElementById('rotations').style['display'] = 'none';
	document.getElementById('continues').style['display']='';
	document.getElementById('previewwait').style['display'] = 'none';
	document.getElementById('previewerr').style['display'] = '';
	document.getElementById('preview').style['display'] = 'none';
}
/* preview: switch preview config to wait */
setpvwait() {
	document.getElementById('jpegpreview').style['display'] = 'none';
	document.getElementById('rotations').style['display'] = 'none';
	document.getElementById('continues').style['display']='none';
	document.getElementById('previewwait').style['display'] = '';
	document.getElementById('previewerr').style['display'] = 'none';
	document.getElementById('preview').style['display'] = 'none';
}
/* nodejs: file/filereader like interface for node js */
#createFxNode(url, onok, onerr) {
	if (url.url) {
		let e = url;
		url = e.url;
	}
	let fx = {
		imbackextension: true,
		name: url
	};
	if (url.startsWith('http://')) {
		// http to imback
		this.ht.get(url, (res) => {
			let err = false;
			if (res.statusCode !== 200) {
				err = true;
				console.log(this.xl('onimback.errconnect', '192.168.1.254'));
				console.log('Status: ' + res.statusCode + ' Type: ' + res.headers['content-type']);
				res.resume();
				return onerr(url, fx);
			}
			let c = 0;
			let b = new ArrayBuffer(res.headers['content-length']);
			let a = new Uint8Array(b);
			res.on('data', (chunk) => {
				a.set(chunk, c);
				c += chunk.length;
			});
			res.on('end', () => {
				fx.size = c;
				fx.data = b;
				fx.readAsArrayBuffer = (fy) => {
					fy.onload({
							target: { result: fy.data }
					});
				};
				setTimeout(() => {
					onok(url, fx);
				});
			});
		}).on('error', (e) => {
			console.log(this.#xl('onimback.errconnect', '192.168.1.254'));
			console.log(JSON.stringify(e));
			onerr(url, fx);
		});
	}
	else {
		// read local (or cifs/nfs...) file
		let ab = new ArrayBuffer(20000000);
		let ua = new Uint8Array(ab);
		let len = 0;
		const str = this.fs.createReadStream(url, { highWaterMark: 20*1024*1024 });
		str.on('error', () => onerr(url,fx));
		str.on('data', (chunk) =>  {
			ua.set(chunk, len);
			len += chunk.length;
			fx.size = len;
			fx.data = ab.slice(0, len);
			fx.readAsArrayBuffer = (fy) => {
				fy.onload({
						target: { result: fy.data }
				});
			};
			setTimeout(() => {
					str.close();
					onok(url, fx);
			});
		});
	}
}
/* file/filereader like interface for imback http */
// url can also be an imbele member
#createFx(url, onok, onerr, notfirst) {
	if (!document) return this.#createFxNode(url, onok, onerr);
	let rot, e = url;
	if (url.url) {
		e = url;
		url = e.url;
		rot = e.rot;
	}
	let fx = {
		imbackextension: true,
		name: url
	};
	const ii = this.#cache.findIndex((v) => (v.url === url));
	if (ii !== -1) {
		fx.data = this.#cache[ii].d;
		fx.size = this.#cache[ii].l;
		fx.readAsArrayBuffer = (fy) => {
			fy.onload({
				target: {
					result: fy.data				}
			});
		};
		window.setTimeout(() => {
			onok(url, fx, rot);
		});
		return;
	}
	let xhr = new XMLHttpRequest();
	xhr.onload = (evt) => {
		let len = JSON.parse(xhr.getResponseHeader('content-length'));
		if (0 >= len) len=1;
		if (notfirst && (url.substring(url.length -4).toUpperCase() === '.RAW')) {
			this.#cache.push({ url: url, d: xhr.response, l: len });
			if (this.#cache.length > this.maxcache) this.#cache.splice(0,1);
		}
		fx.data = xhr.response;
		fx.size = xhr.response.byteLength;
		fx.readAsArrayBuffer = (fy) => {
			fy.onload({
				target: {
					result: fy.data				}
			});
		};
		xhr.onerror = undefined;
		xhr.ontimeout = undefined;
		xhr.onabort = undefined;
		if (notfirst) {
			window.setTimeout(() => {
					onok(url, fx, rot);
			});
		} else this.#createFx(e, onok, onerr, len);
	};
	xhr.onerror = (evt, typ) => {
		if (undefined === typ) typ = 'err';
		console.log('XHR err (createfx, ' + typ + ') for ' + url + ' readyState:' + xhr.readyState + ' http status:' + xhr.status + ' text: ' + xhr.statusText); 
		xhr.onerror = undefined;
		xhr.onload = undefined;
		xhr.ontimeout = undefined;
		xhr.onabort = undefined;
		window.setTimeout(() => {
				onerr(url, fx, rot);
		});
	};
	xhr.onabort = (evt) => { xhr.onerror(evt, 'abort'); };
	xhr.ontimeout = (evt) => { xhr.onerror(evt, 'timeout'); };
	xhr.open(notfirst ? 'GET' : 'HEAD', url);
	xhr.setRequestHeader('Cache-control','max-stale');
	xhr.responseType = 'arraybuffer';
	xhr.timeout = (!notfirst || notfirst < 10000000) ? 30000 : Math.round(notfirst / 600);
	try {
		xhr.send();
	} catch (e) {
		console.log('XHR send exception (createfx) for ' + url + ' ' + e.toString());
		xhr.onerror = undefined;
		xhr.onload = undefined;
		xhr.ontimeout = undefined;
		xhr.onabort = undefined;
		window.setTimeout(() => {
				onerr(url, fx, rot);
		});
	}
}
/* main handler function for one file */
#handleonex() {
	const f = this.#allfiles[this.#actnum];
	this.#currentrot = 1;
	if (undefined !== document) {
		document.getElementById('doforall').checked = false;
		if (this.#actnum < this.#totnum-1) {
			document.getElementById('forrest').style['display'] = '';
		} else document.getElementById('forrest').style['display'] = 'none';
	}
	let rawname = this.#basename(f.url ? f.url : (f.name ? f.name : f));
	if (this.#stepmode === 2) {
		// skip rest
		this.shownormal();
		return this.#handlenext();
	}
	else if (this.#stepmode === 1) {
		// show preview and ask for rotation, skip, save
		// then (in handler) set mode, call handleone (if save) or handlenext (if skip)
		this.showquestion();
		const f = this.#allfiles[this.#actnum];
		if (undefined === f) {
			return;
		}
		if (this.#totnum > 1) {
			document.getElementById('qhdr').innerHTML = '[' + (1 + this.#actnum) + ' / ' + this.#totnum + '] ';
		} else document.getElementById('qhdr').innerHTML = '';
		if (rawname.substring(rawname.length -4).toUpperCase() === '.JPG' ||
			rawname.substring(rawname.length -5).toUpperCase() === '.JPEG') {
			/* jpeg preview */
			this.#qappx('main.file.jpeg', rawname);
			if (f.name) {
				// read jpeg file for preview
				const fr = new FileReader();
				fr.onload = (evt) => {
					let contents = evt.target.result;
					contents = 'data:image/jpeg;' + contents.substring(8);
					document.getElementById('jpegpreview').src = contents;
					/* shown in onload of img */
				}
				fr.onerror = (evt) => {
					console.log('JPEG preview reader error for ' + f.name + ' ' + JSON.stringify(evt));
					this.setpverr();
				}
				fr.readAsDataURL(f);
			}
			else {
				// simply set image src
				document.getElementById('jpegpreview').src = f;
			}
		}
		else if (rawname.substring(rawname.length -4).toUpperCase() !== '.RAW') {
			/* no preview */
			this.#qappx('main.file.nopreview', rawname);
			this.setnopv();
		}
		else {
			const zz = this.#infos.findIndex((v, i, o) => v.size === f.size);
			if (zz === -1 && undefined !== f.size) {
				/* no preview */
				this.#qappx('main.file.rawunknown', rawname, f.size);
				this.setnopv();
			} else {
				this.#qappx('main.file',rawname);
				this.#buildpreview(f, () => { this.setrawpv(); }, () => { this.setpverr(); });
			}
		}
	}
	else { // normal processing without question
		this.shownormal();
		this.#handleone(f.rot);
	}
}
/* translation helper */
#genspan(key, arg0, arg1, arg2, arg3) {
	const s = document.createElement('span');
	s.setAttribute('data-myxlkey', key);
	if (undefined !== arg0) {
		s.setAttribute('data-myxlarg0', arg0);
		if (undefined !== arg1) {
			s.setAttribute('data-myxlarg1', arg1);
			if (undefined !== arg2) {
				s.setAttribute('data-myxlarg2', arg2);
				if (undefined !== arg3) {
					s.setAttribute('data-myxlarg3', arg3);
				}
			}
		}
	}
	return this.#xl1(s);
}
/* translation helper with title */
#genspantitle(title, key, arg0, arg1, arg2, arg3) {
	const s = this.#genspan(key, arg0, arg1, arg2, arg3);
	s.setAttribute('data-mytitlexlkey', title);
	return this.#xl1(s);
}
/* translated append to preview header */
#qappx(key, arg0, arg1, arg2, arg3) {
	const s = this.#genspan(key, arg0, arg1, arg2, arg3);
	document.getElementById('qhdr').append(s);
}
/* translated append to main log */
#mappx(key, arg0, arg1, arg2, arg3) {
	if (document) {
		const s = this.#genspan(key, arg0, arg1, arg2, arg3);
		this.#dispcnt++;
		s.id = 'mappx_' + this.#dispcnt;
		const msgel = document.getElementById('outmsg');
		const xmsg = document.getElementById('xmsg');
		xmsg.style["display"] = "";
		msgel.append(s);
	}
	else console.log(this.#xl(key, arg0, arg1, arg2, arg3));
}
/* actual processing function for one file */
#handleone(orientation) {
	const f = this.#allfiles[this.#actnum];
	if (undefined === f) {
		this.#mappx('process.nothing');
		this.#appendnl();
		return this.#handlenext();
	}
	if (undefined === f.size) {
		setTimeout(() => {
		  this.#createFx(f, (url, fx, rot) => {
				this.#allfiles[this.#actnum] = fx;
				this.#handleone(rot ? rot: orientation);
			}, (url) => {
				this.#mappx('process.erraccess' + (!document ? 'x' : ''), url);
				if (document) this.#appendnl();
				else this.#appendmsg('');
				this.#stats.error ++;
				this.#handlenext();
		  });
		});
		return;
	}
	let rawname = this.#basename(f.name);
	if (rawname.substring(rawname.length -4).toUpperCase() !== '.RAW') {
		const reader = f.imbackextension ? f : new FileReader();
		reader.onload = (evt) => {
			if (this.#totnum > 1) {
				this.#appendmsg("[" + (1 + this.#actnum) + " / " + this.#totnum + "] ");
			}
			this.#mappx('process.notraw',rawname);
			if (document) this.#appendmsg('<br>');
			const contents = evt.target.result;
			const view = new DataView(contents);
			const out = new Uint8Array(f.size);
			for (let j=0; j<contents.byteLength; j++) {
				out[j] = view.getUint8(j);
			}
			this.#output1(rawname, 'application/octet-stream', 'process.copyok', out);
		}
		reader.onerror = (evt) => {
			console.log('Non-RAW process reader error for ' + f.name + ' ' + JSON.stringify(evt));
			this.#mappx('process.errorreadingfile' + (!document ? 'x' : ''), f.name);
			this.#appendnl();
			this.#stats.error++;
			this.#handlenext();
		}
		reader.readAsArrayBuffer(f);
		return;
	}
	let w, h, mode = "??";
	let typ = 0;
	const zz = this.#infos.findIndex((v, i, o) => v.size === f.size);
	if (zz === -1) {
		if (this.#totnum > 1) {
			this.#appendmsg("[" + (1 + this.#actnum) + " / " + this.#totnum + "] ");
		}
		this.#mappx('process.unknownsize' + (!document ? 'x' : ''), f.name, f.size);
		if (document) this.#appendmsg('<br>');
		const reader = f.imbackextension ? f : new FileReader();
		reader.onload = (evt) => {
			const contents = evt.target.result;
			const view = new DataView(contents);
			const out = new Uint8Array(f.size);
			for (let j=0; j<view.byteLength; j++) {
				out[j] = view.getUint8(j);
			}
			this.#output1(rawname, 'application/octet-stream', 'process.copyok', out);
		}
		reader.onerror = (evt) => {
			console.log('Unk-RAW process reader error for ' + f.name + ' ' + JSON.stringify(evt));
			this.#mappx('process.errorreadingfile' + (!document ? 'x' : ''), f.name);
			this.#appendnl();
			this.#stats.error++;
			this.#handlenext();
		}
		reader.readAsArrayBuffer(f);
		return;
	} else {
		w = this.#infos[zz].w;
		h = this.#infos[zz].h;
		mode = this.#infos[zz].mode;
		if (mode.length !== 0) mode += ' ';
		mode += '(' + w + ' x ' + h + ')';
		typ = this.#infos[zz].typ;
	}
	const rawnamearr = new TextEncoder().encode(rawname);
	const verarr = new TextEncoder().encode(this.#version);
	const verlen = (verarr.length > 0) ? (verarr.length + 1) : 0;
	const veroff = (verlen && ((verlen % 2) === 0)) ? verlen : (verlen + 1);
	let datestr="", dateaddoff = 0, dateok = false;
	// date?
	if (undefined !== f.datestr) {
		datestr = f.datestr;
		dateok = true;
		dateaddoff = 24;
	}
	let res = this.#fnregexx.exec(rawname);
	if (res !== null && !dateok) {
		const yr = Number.parseInt(res[1]);
		const mon = Number.parseInt(res[3]);
		const day = Number.parseInt(res[5]);
		const hr = Number.parseInt(res[7]);
		const min = Number.parseInt(res[9]);
		const sec = Number.parseInt(res[11]);
		datestr = "" + yr + ":" + ((mon < 10) ? "0":"") + mon + ":" + ((day < 10) ? "0":"") + day + " "+
			((hr < 10) ? "0":"") + hr + ":" + ((min < 10) ? "0":"") + min + ":" + ((sec < 10) ? "0":"") + sec;
		dateaddoff = 24;
		dateok = true;
	}

	const reader = f.imbackextension ? f : new FileReader();
	reader.onload = (evt) => {
		if (this.#totnum > 1) {
			this.#appendmsg("[" + (1 + this.#actnum) + " / " + this.#totnum + "] ");
		}
		this.#mappx('process.processing', rawname);
		if (document) this.#appendmsg('<br>');
		this.#mappx('process.assuming', this.#types[typ], mode);
		if (document) this.#appendmsg('<br>');
		if (dateok) {
			this.#mappx('process.datetime', datestr);
			if (document) this.#appendmsg('<br>');
		}
		let ori = orientation ? orientation : 1;
		let transp = false;
		if (ori !== 1) {
			this.#mappx('process.orientation');
			if (document) {
				this.#appendmsgx(this.#genspan('preview.orients.' + this.#orients[ori]));
				this.#appendmsg('<br>');
			}
			if (ori === 6 || ori === 8) transp = true;
		}
		/* Here comes the actual building of the DNG */
		const contents = evt.target.result;
		const view = new DataView(contents);
		let ti = new TIFFOut();
		ti.addIfd(); /******************************************/
		if (this.#withpreview) {
			ti.addImageStrip(1, this.#buildpvarray(view, typ, w, h, ori, false), Math.floor(transp ? (h+31)/32:(w+31)/32), Math.floor(transp ? (w+31)/32: (h+31)/32));
			ti.addEntry(258 , 'SHORT', [ 8 ]); /* BitsPerSample */
			ti.addEntry(259 , 'SHORT', [ 1 ]); /* Compression - none */
			ti.addEntry(262, 'SHORT', [ 2 ]); /* Photometric - RGB */
			ti.addEntry(277, 'SHORT', [ 3 ]); /* Samples per Pixel */
			ti.addEntry(284, 'SHORT', [ 1 ]); /* Planar config - chunky */
		}
		ti.addEntry(271, 'ASCII', 'ImBack'); /* Make */
		ti.addEntry(50708, 'ASCII', 'ImBack' + ' ' + this.#types[typ]); /* Unique model */
		ti.addEntry(272, 'ASCII', this.#types[typ]); /* Model */
		ti.addEntry(274, 'SHORT', [ ori ]); /* Orientation */
		ti.addEntry(305, 'ASCII', 'imbraw2dng ' + this.#version); /* SW and version */
		if (dateok) {
			ti.addEntry(306, 'ASCII', datestr); /* datetime */
			ti.addEntry(36867, 'ASCII', datestr); /* Original date time */
		}
		ti.addEntry(50706, 'BYTE', [ 1, 2, 0, 0 ]); /* DNG Version */
		ti.addEntry(50707, 'BYTE', [ 1, 0, 0, 0 ]); /* DNG Backward Version */
		ti.addEntry(50717, 'LONG', [ 255 ]); /* White level */
		ti.addEntry(50721, 'SRATIONAL', [ 19624, 10000, -6105, 10000, -34134, 100000, -97877, 100000, 191614, 100000, 3345, 100000, 28687, 1000000, -14068, 100000, 1348676, 1000000 ]); /* Color Matrix 1 */
		ti.addEntry(50964, 'SRATIONAL', [ 7161, 10000, 10093, 100000, 14719, 100000, 25819, 100000, 72494, 100000, 16875, 1000000, 0, 1000000, 5178, 100000, 77342, 100000 ]); /* Forward Matrix 1 */
		ti.addEntry(50778, 'SHORT', [ 23 ]); /* Calibration Illuminant 1 - D50 */
		ti.addEntry(50728, 'RATIONAL', [ 6, 10, 1, 1, 6, 10 ]); /* As shot neutral */
		ti.addEntry(50827, 'BYTE', rawnamearr); /* Raw file name */
		ti.addEntry(50932, 'ASCII', 'Generic ImB conv profile Sig'); /* Profile calibration signature */
		ti.addEntry(50931, 'ASCII', 'Generic ImB conv profile Sig'); /* Camera calibration signature */
		//ti.addEntry(50936, 'ASCII', 'Generic ImB conv profile'); /* Camera calibration name */
		if (this.#withpreview) {
			ti.addEntry(50971, 'ASCII', new Date(Date.now()).toISOString() ); /* Preview date time */
			ti.addSubIfd(); /******************************************/
		}
		ti.addImageStrip(0, view, w, h);
		ti.addEntry(258 , 'SHORT', [ 8 ]); /* BitsPerSample */
		ti.addEntry(259 , 'SHORT', [ 1 ]); /* Compression - none */
		ti.addEntry(262, 'SHORT', [ 0x8023 ]); /* Photometric - CFA */
		ti.addEntry(277, 'SHORT', [ 1 ]); /* Samples per Pixel */
		ti.addEntry(284, 'SHORT', [ 1 ]); /* Planar config - chunky */
		ti.addEntry(33421, 'SHORT', [ 2, 2 ]); /* CFA Repeat Pattern Dim */
		ti.addEntry(33422, 'BYTE', [ 1, 0, 2, 1 ]); /* CFA Pattern */
		//ti.createCamProf('test1'); /******************************************/
		//ti.addEntry(50941, 'LONG', [ 3 ]); /* profile embed policy */
		//ti.addEntry(50932, 'ASCII', 'Generic ImB conv profile Sig'); /* Profile calibration signature */
		//ti.createCamProf('test2');
		//ti.addEntry(50941, 'LONG', [ 1 ]); /* profile embed policy */
		//ti.addEntry(50932, 'ASCII', 'Generic ImB conv profile Sig'); /* Profile calibration signature */
		this.#output1(rawname.substring(0, rawname.length - 3) + 'dng', 'image/x-adobe-dng', 'process.converted', ti.getData());
	};
	reader.onerror = (evt) => {
		console.log('Unk-RAW process reader error for ' + f.name + ' ' + JSON.stringify(evt));
		this.#mappx('process.errorreadingfile' + (!document ? 'x' : ''), f.name);
		this.#appendnl();
		this.#stats.error++;
		this.#handlenext();
	};
	reader.readAsArrayBuffer(f);
}
/* output one thing via browser or nodejs */
#output1(name, type, okmsg, arr1, renameidx) {
	if (document) {
		let b = new Blob([ arr1 ], { type: type });
		const outel = document.getElementById('result');
		outel.download = name;
		const thisurl = URL.createObjectURL(b);
		outel.href = thisurl;
		outel.click();
		this.#mappx(okmsg, name);
		this.#appendnl();
		const ie = this.#imbeles.find((v) => v.raw.substring(0, v.raw.length - 3) === name.substring(0, name.length - 3));
		if (ie) {
			ie.wasselected = true;
			if (ie.entry)
				ie.entry.classList.add('picprocd');
		}
		this.#stats.ok++;
		this.#appendmsg('');
		this.#handlenext();
	} 
	else {
		let outfile;
		if (this.#outdir.length > 0 && this.#outdir.substring(this.#outdir.length - 1) !== this.pa.sep)
			outfile = this.#outdir + this.pa.sep + name;
		else
			outfile = this.#outdir + name;

		this.fs.writeFile(outfile, arr1, {encoding: null, flush: true, flag: this.#ovwout ? 'w' : 'wx' }, (err) => {
				if (err) {
					if (err.errno === -17 && this.#renamefiles) {
						// try renaming
						if (undefined !== renameidx) {
							let newname = name;
							const ldot = name.lastIndexOf('.');
							const lunder = name.lastIndexOf('_');
							newname = name.substring(0, lunder) + '_';
							if (renameidx < 100) newname += '0';
							if (renameidx < 10) newname += '0';
							newname += renameidx;
							newname += '.' + name.substring(ldot + 1);
							this.#output1(newname, type, okmsg, arr1, renameidx + 1);
						}
						else {
							let newname = name;
							const ldot = name.lastIndexOf('.');
							newname = name.substring(0, ldot) + '_001.' + name.substring(ldot + 1);
							this.#output1(newname, type, okmsg, arr1, 2);
						}
						return;
					}
					this.#mappx('process.errsave', outfile);
					this.#appendmsg(JSON.stringify(err));
					this.#stats.error++;
					this.#appendmsg('');
					this.#handlenext();
				}
				else {
					this.#mappx(okmsg + 'x', outfile);
					if (undefined !== renameidx) this.#mappx('node.renamed');
					this.#stats.ok++;
					this.#appendmsg('');
					this.#handlenext();
				}
		});
	}
}
/* browserdisplay: handler function for dropping OS files into the rect */
drophandler(ev) {
	if (this.#actnum !== this.#allfiles.length) return;
    const stepprev = document.getElementById('steppreview');
    this.#stepmode = 0;
	if (stepprev !== null && stepprev.checked) this.#stepmode = 1;
	ev.preventDefault();
	this.#allfiles = [];
	this.#actnum = 0;
	if (ev.dataTransfer.items) {
		this.#totnum = [...ev.dataTransfer.items].length;
		[...ev.dataTransfer.items].forEach((item, i) => {
			if (item.kind === "file") {
				const file = item.getAsFile();
				this.#allfiles.push(item.getAsFile());
			}
		});
	} else {
		this.#totnum = [...ev.dataTransfer.files].length;
		[...ev.dataTransfer.files].forEach((file, i) => {
			this.#allfiles.push(file);
		});
	}
	this.#stats = { total: this.#totnum, skipped: 0, error: 0, ok: 0 };
	this.#mappx('process.droppedn', this.#totnum);
	this.#appendnl();
	document.getElementById('imbdoit').disabled = true;
	document.getElementById('imbvisbrows').disabled = true;
	document.getElementById('droptarget').style['display'] = 'none';
	document.getElementById('infile').disabled = true;
	this.#handleonex();
}
/* browserdisplay: some handler on the drop rectangle */
prevdef(ev) {
	ev.preventDefault();
}
/* get one downsampled median image value [ r g b ] */
#getPix(x, y, w, view, typ) {
	let outrgb = [];
	let reds = [];
	if (typ > 1) {
		reds.push(view.getUint8((y+1)*w + x + 1));
		reds.push(view.getUint8((y+1)*w + x + 3));
		reds.push(view.getUint8((y+1)*w + x + 2*w + 1));
		reds.push(view.getUint8((y+1)*w + x + 2*w + 3));
	} else {
		reds.push(view.getUint8(y*w + x + 1));
		reds.push(view.getUint8(y*w + x + 3));
		reds.push(view.getUint8(y*w + x + 2*w + 1));
		reds.push(view.getUint8(y*w + x + 2*w + 3));
	}
	reds.sort(function(a,b) { return a - b; });
	// median of red pixels
	outrgb.push((reds[1] + reds[2]) / 2.0);
	let greens = [];
	if (typ > 1) {
		greens.push(view.getUint8(y*w + x + 1));
		greens.push(view.getUint8(y*w + x + w));
		greens.push(view.getUint8(y*w + x + 3));
		greens.push(view.getUint8(y*w + x + 2 + w));
		greens.push(view.getUint8(y*w + x + 2*w + 1));
		greens.push(view.getUint8(y*w + x + 3*w));
		greens.push(view.getUint8(y*w + x + 2*w + 3));
		greens.push(view.getUint8(y*w + x + 3*w + 2));
	} else {
		greens.push(view.getUint8(y*w + x));
		greens.push(view.getUint8(y*w + x + w + 1));
		greens.push(view.getUint8(y*w + x + 2));
		greens.push(view.getUint8(y*w + x + 3 + w));
		greens.push(view.getUint8(y*w + x + 2*w));
		greens.push(view.getUint8(y*w + x + 3*w +1));
		greens.push(view.getUint8(y*w + x + 2*w + 2));
		greens.push(view.getUint8(y*w + x + 3*w + 3));
	}
	greens.sort(function(a,b) { return a - b; });
	outrgb.push((greens[3] + greens[4]) / 2.0);
	let blues = [];
	if (typ > 1) {
		blues.push(view.getUint8(y*w + x));
		blues.push(view.getUint8(y*w + x + 2));
		blues.push(view.getUint8(y*w + x + 2*w));
		blues.push(view.getUint8(y*w + x + 2*w + 2));
	} else {
		blues.push(view.getUint8((y+1)*w + x));
		blues.push(view.getUint8((y+1)*w + x + 2));
		blues.push(view.getUint8((y+1)*w + x + 2*w));
		blues.push(view.getUint8((y+1)*w + x + 2*w + 2));
	}
	blues.sort(function(a,b) { return a - b; });
	outrgb.push((blues[1] + blues[2]) / 2.0);
	return outrgb;
}
/* build preview in array */
#buildpvarray(view, typ, w, h, orientation, withalpha) {
	const sfact = withalpha ? 8 : 32;
	const w8 = Math.floor((w+(sfact -1))/sfact) - (withalpha ? 1 : 0);
	const h8 = Math.floor((h+(sfact -1))/sfact) - (withalpha ? 1 : 0);
	let minred=255, minblue = 255, mingreen = 255, maxred = 0, maxblue = 0, maxgreen = 0, allmin = 255, allmax = 0;
	let outpix = [];
	let rowiterstart, rowiterend;
	let coliterstart, coliterend;
	let transpose = false;
	if (orientation === 3) {
		rowiterstart = -1*(h8 -1);
		rowiterend = 1;
		coliterstart = -1*(w8 - 1);
		coliterend = 1;
	} else if (orientation === 6) {
		transpose = true;
		rowiterstart = 0;
		rowiterend = w8;
		coliterstart = -1*(h8 - 1);
		coliterend = 1;
	} else if (orientation === 8) {
		transpose = true;
		rowiterstart = -1*(w8 -1);
		rowiterend = 1;
		coliterstart = 0;
		coliterend = h8;
	} else {
		rowiterstart = 0;
		rowiterend = h8;
		coliterstart = 0;
		coliterend = w8;
	}
	for (let i = rowiterstart; i < rowiterend; i +=1) {
		for (let j = coliterstart; j < coliterend; j+=1) {
			let a = this.#getPix(Math.abs(transpose ? i :j)*sfact, Math.abs(transpose ? j :i)*sfact, w, view, typ);
			outpix.push(a[0]);
			if (a[0] > maxred) maxred = a[0];
			if (a[0] < minred) minred = a[0];
			if (a[0] > allmax) allmax = a[0];
			if (a[0] < allmin) allmin = a[0];
			outpix.push(a[1]);
			if (a[1] > maxgreen) maxgreen = a[1];
			if (a[1] < mingreen) mingreen = a[1];
			if (0.6*a[1] > allmax) allmax = a[1] * 0.6;
			if (0.6*a[1] < allmin) allmin = a[1] * 0.6;
			outpix.push(a[2]);
			if (a[2] > maxblue) maxblue = a[2];
			if (a[2] < minblue) minblue = a[2];
			if (a[2] > allmax) allmax = a[2];
			if (a[2] < allmin) allmin = a[2];
			if (withalpha) outpix.push(255);
		}
	}
	const fact = 255 / (allmax - allmin);
	const o = withalpha ? 4 : 3;
	for (let i = 0; i < h8; i++) {
		for (let j=0; j< w8; j++) {
			if ((outpix[o*((i * w8) + j)] > 250) &&
				(outpix[o*((i * w8) + j) + 2] > 250) &&
				(outpix[o*((i * w8) + j) + 1] > 0.6 * 250))
			{
				outpix[o*((i*w8) + j) + 1] = 255;
			} else {
				// maybe some brightening gamma?
				const r = (fact * (outpix[o * ((i*w8) + j)] - allmin));
				outpix[o * ((i*w8) + j)] = 255-Math.round(255*((255-r)/255)*((255-r)/255));
				const g = (fact * 0.6 * (outpix[o * ((i*w8) + j) + 1] - allmin* 0.6));
				outpix[o * ((i*w8) + j) + 1] = 255-Math.round(255*((255-g)/255)*((255-g)/255));
				const b = (fact * (outpix[o * ((i*w8) + j) + 2] - allmin));
				outpix[o * ((i*w8) + j) + 2] = 255-Math.round(255*((255-b)/255)*((255-b)/255));
			}
		}
	}
	return outpix;
}
/* browserdisplay: put preview into canvas */
// orientation: 1: norm, 3: rot 180, 6 rot 90 CW, 8: rot 270 CCW
#buildpreview(f, onok, onerr, orientation, targ, afterload) {
	let w, h, typ;
	if (undefined === f.size) {
		window.setTimeout(() => {
		  this.#createFx(f, (url, fx) => {
				this.#buildpreview(fx, onok, onerr, orientation, targ, afterload);
			}, (url) => {
				onerr(f);
		  });
		});
		return;
	}
	const zz = this.#infos.findIndex((v, i, o) => v.size === f.size);
	if (zz === -1) {
		console.log('preview: unsupported size ' + f.size + ' of ' + f.name);
		onerr(f);
		return;
	} else {
		w = this.#infos[zz].w;
		typ = this.#infos[zz].typ;
		h = this.#infos[zz].h;
	}
	let canv;
	if (undefined !== targ)
		canv = targ;
	else
		canv = document.getElementById('preview');
	const w8 = Math.floor((w+7)/8) - 1;
	const h8 = Math.floor((h+7)/8) - 1;
	canv.width = w8;
	canv.height = h8;
	if (orientation === 6 || orientation === 8) {
		canv.width = h8;
		canv.height = w8;
	}
	const ctx = canv.getContext('2d', { alpha: false });
	if (undefined !== targ) {
		const sc = 120 / canv.height;
		canv.style['width'] = '' + (sc*canv.width) + 'px';
	}
	const reader = f.imbackextension ? f : new FileReader();
	reader.onload = (evt) => {
		if (undefined !== afterload) afterload();
		const contents = evt.target.result;
		const view = new DataView(contents);
		let transpose = false;
		let outpix = this.#buildpvarray(view, typ, w, h, orientation, true);
        if (orientation === 6 || orientation === 8) {
                transpose = true;
        }
		ctx.putImageData(new ImageData(new Uint8ClampedArray(outpix), transpose ? h8: w8, transpose? w8 :h8), 0, 0);
		onok(f);
	};
	reader.onerror = (evt) => {
		console.log('preview: error reading ' + f.name);
		onerr();
	};
	reader.readAsArrayBuffer(f);
}
/* preview: raw preview okay */
setrawpv() {
	document.getElementById('preview').style['display'] = '';
	document.getElementById('rotations').style['display'] = '';
	document.getElementById('continues').style['display']='';
	document.getElementById('previewwait').style['display'] = 'none';
	document.getElementById('previewerr').style['display'] = 'none';
	document.getElementById('jpegpreview').style['display'] = 'none';
}
/* preview: no preview in question */
setnopv() {
	document.getElementById('preview').style['display'] = 'none';
	document.getElementById('rotations').style['display'] = 'none';
	document.getElementById('continues').style['display']='';
	document.getElementById('previewwait').style['display'] = 'none';
	document.getElementById('previewerr').style['display'] = 'none';
	document.getElementById('jpegpreview').style['display'] = 'none';
}
/* browserdisplay: show the preview question skip/process */
showquestion() {
	const norm = document.getElementById('normal');
	const quest = document.getElementById('question');
	quest.style['display'] = '';
	norm.style['display'] = 'none';
	this.setpvwait();
	document.getElementById('qhdr').innerHTML = '';
	document.getElementById('browser').style['display'] = 'none';
}
/* browserdisplay: put last message viewable */
showlastmsg() {
	const ll = document.getElementById('mappx_' + this.#dispcnt);
	if (ll) {
		ll.scrollIntoView(false, { block: 'nearest' });
	}
}
/* browserdisplay: as it says */
shownormal() {
	if (document) {
		window.onscroll = () => undefined;
		window.onresize = () => undefined;
		const norm = document.getElementById('normal');
		const quest = document.getElementById('question');
		document.getElementById('browser').style['display'] = 'none';
		document.getElementById('browser').style['display'] = 'none';
		quest.style['display'] = 'none';
		norm.style['display'] = '';
		window.setTimeout(() => { this.showlastmsg(); }, 100);
	}
}
/* preview: skip handler in the step preview */
skipthis() {
	if (document.getElementById('doforall').checked) this.#stepmode = 2;
	if (this.#totnum > 1) {
		this.#appendmsg("[" + (1 + this.#actnum) + " / " + this.#totnum + "] ");
	}
	if (document.getElementById('doforall').checked) {
		this.#mappx('process.skipped.remaining', this.#totnum - this.#actnum);
		this.#stats.skipped += (this.#totnum - this.#actnum);
	} else {
		let rawname = this.#basename(this.#allfiles[this.#actnum].name ? this.#allfiles[this.#actnum].name : this.#allfiles[this.#actnum]);
		this.#mappx('process.skipped', rawname);
		this.#appendnl();
		this.#stats.skipped ++;
	}
	this.shownormal();
	this.#handlenext();
}
/* previewquestion: process handler in the step preview */
procthis() {
	if (document.getElementById('doforall').checked) {
		this.#stepmode = 0;
		this.shownormal();
	}
	this.setpvwait();
	this.#handleone(this.#currentrot);
}
/* previewquestion, rotation hepler */
#rotxx(r) {
	this.setpvwait();
	let j = this.#oriecw.indexOf(this.#currentrot);
	j = ((j + r) % 4);
	this.#currentrot = this.#oriecw[j];
	this.#buildpreview(this.#allfiles[this.#actnum], () => { this.setrawpv(); }, () => { this.setpverr(); }, this.#currentrot);
}
/* previewquestion: handler for clockwise rotation */
rotcw() {
	this.#rotxx(1);
}
/* previewquestion: handler for counterclockwise rotation */
rotccw() {
	this.#rotxx(3);
}
/* previewquestion: handler for upside down rotation */
rot180() {
	this.#rotxx(2);
}
/* previewquestion: handler for reset rotation */
rot0() {
	if (1 === this.#currentrot) return;
	this.setpvwait();
	this.#currentrot = 1;
	this.#buildpreview(this.#allfiles[this.#actnum], () => { this.setrawpv(); }, () => { this.setpverr(); }, 1);
}
/* handle on entry from imb PHOTO/MOVIE listing page */
#handle1imb(url) {
	let rawname = this.#basename(url);
	if (rawname.substring(0,10).toUpperCase() === 'IMBRAW2DNG') return;
	let timestx = this.#fnregex.exec(rawname);
	let timest = null, cl = '9999_99_99-99';
	if (null !== timestx) {
		timest = timestx[1] + '_' + timestx[3] + '_' + timestx[5] + '-' + timestx[7] + '_' + timestx[9] + '_' + timestx[11];
		cl = timestx[1] + '_' + timestx[3] + '_' + timestx[5] + '-' + timestx[7];
	} else {
		this.#mappx('onimback.strangename' + (document?'':'x'), rawname);
		this.#appendnl();
	}
	if (rawname.substring(rawname.length -4).toUpperCase() === '.RAW') {
		if (null !== timest) {
			if (timest < this.#earliestraw) this.#earliestraw = timest;
			if (timest > this.#latestraw) this.#latestraw = timest;
		}
		this.#rimbpics.push(url);
		if (document) {
			this.#imbeles.push({
					type: 'RAW',
					url: url,
					raw: rawname,
					ts: cl,
					selected: false,
					preview: null,
					entry: null,
					waiting: false,
					error: false,
					processed: false
			});
			if (this.#untypedclasses.findIndex((v, i, o) => v === cl) === -1)
				this.#untypedclasses.push(cl);
			if (this.#typedclasses.findIndex((v, i, o) => v === ('RAW' + cl)) === -1)
				this.#typedclasses.push('RAW' + cl);
		}
	}
	else if (rawname.substring(rawname.length -4).toUpperCase() === '.JPG') {
		if (null !== timest) {
			if (timest < this.#earliestjpg) this.#earliestjpg = timest;
			if (timest > this.#latestjpg) this.#latestjpg = timest;
		}
		this.#imbpics.push(url);
		if (document) {
			this.#imbeles.push({
					type: 'JPG',
					url: url,
					raw: rawname,
					ts: cl,
					selected: false,
					preview: null,
					entry: null,
					waiting: false,
					error: false,
					processed: false
			});
			if (this.#untypedclasses.findIndex((v, i, o) => v === cl) === -1)
				this.#untypedclasses.push(cl);
			if (this.#typedclasses.findIndex((v, i, o) => v === ('JPG' + cl)) === -1)
				this.#typedclasses.push('JPG' + cl);
		}
	}
	else {
		if (null !== timest) {
			if (timest < this.#earliestmov) this.#earliestmov = timest;
			if (timest > this.#latestmov) this.#latestmov = timest;
		}
		this.#imbmovies.push(url);
		if (document) {
			this.#imbeles.push({
					type: 'oth',
					url: url,
					raw: rawname,
					ts: cl,
					selected: false,
					preview: null,
					entry: null,
					waiting: false,
					error: false,
					processed: false
			});
			if (this.#untypedclasses.findIndex((v, i, o) => v === cl) === -1)
				this.#untypedclasses.push(cl);
			if (this.#typedclasses.findIndex((v, i, o) => v === ('oth' + cl)) === -1)
				this.#typedclasses.push('oth' + cl);
		}
	}
}
/* nodejs: get imb data for node js */
#checkimbnode(type, found) {
	//let subdir = '';
	let subdir = 'PHOTO';
	if (type) subdir='MOVIE';
	//this.ht.get('http://127.0.0.1:8000/PHOTO.html' + subdir, (res) => {
	this.ht.get('http://192.168.1.254/IMBACK/' + subdir, (res) => {
			let err = false;
			if (res.statusCode !== 200 || !/^text\/html/.test(res.headers['content-type'])) {
				err = true;
				res.resume();
				if (!type) {
					return this.#checkimbnode(true, false);
				}
				else if (type && !found) {
					console.log(this.#xl('onimback.errconnect', '192.168.1.254'));
					console.log('Status: ' + res.statusCode + ' Type: ' + res.headers['content-type']);
					process.exit(1);
				}
				else this.imbdoit();
				return;
			}
			let b = '';
			res.on('data', (chunk) => {
				if (!this.#connmsg) console.log('\x1b[32m' + this.#xl('onimback.connected') + '\x1b[0m');
				this.#connmsg = true;
				b += chunk;
			});
			res.on('end', () => {
				let i=0, j;
				while ((j = b.substring(i).toLowerCase().indexOf('<a href=')) !== -1) {
					let delim = b.substring(i+j+8, i+j+9);
					let endstr = b.substring(i+j+9).indexOf(delim);
					let url = b.substring(i+j+9, i+j+9+endstr);
					if (-1 === url.indexOf('?del=')) {
						if (url.startsWith('http://192.168.1.254'))
							this.#handle1imb(url);
						else
							this.#handle1imb('http://192.168.1.254'+ url);
					}
					i=i+j+10;
				}
				if (type) { if (!err || found) this.imbdoit(); }
				else this.#checkimbnode(true, !err);
			});
	}).on('error', (e) => {
		if (!type) {
			return this.#checkimbnode(true, false);
		}
		else if (type && !found) {
			console.log(this.#xl('onimback.errconnect', '192.168.1.254'));
			console.log(JSON.stringify(e));
			process.exit(1);
		}
		else this.imbdoit();
	});
}
/* check if we are directly on a back */
checkimb(type) {
	if (this.#debugflag && document) {
		document.getElementById('dbgcache').value = this.#maxcache;
		document.getElementById('debugonly').style['display'] = '';
	}
	if (!window.location.href.startsWith('http://192.168.1.254')) return;
	document.getElementById('onimback').style['display'] = '';
	const xhr = new XMLHttpRequest();
	xhr.onloadend = (event) => {
		if (xhr.status === 200) {
			const sel2 = xhr.responseXML.querySelectorAll('a');
			for (const r of sel2) {
				if (r && r.href.indexOf('del=') === -1) {
					if (r.href.startsWith('http://192.168.1.254'))
						this.#handle1imb(r.href);
					else
						this.#handle1imb('http://192.168.1.254'+ r.href);
				}
			}
			if (type && (this.#imbpics.length + this.#rimbpics.length + this.#imbmovies.length > 0)) {
				this.#aftercheck();
			}
			else if (!type) this.checkimb(true);
		}
		else if (!type) this.checkimb(true);
	};
	xhr.onerror = (event) => {
		if (!type) this.checkimb(true);
		else if (this.#imbpics.length + this.#rimbpics.length + this.#imbmovies.length > 0) {
			this.aftercheck();
		}
	};
	xhr.open('GET', '/IMBACK/' + (type ? 'MOVIE' : 'PHOTO'));
	xhr.responseType = 'document';
	xhr.send();
}
/* compare timestamp */
#comptime(fname, compts) {
	const res = this.#fnregex.exec(fname);
	if (res === null) {
		this.#mappx('onimback.strangename'+ (document?'':'x'), fname);
		this.#appendnl();
		return (compts === '0000');
	} else {
		const ts = res[1] + '_' + res[3] + '_' + res[5] + '-' + res[7] + '_' + res[9] + '_' + res[11];
		if (ts.substring(0, ts.length) >= compts)
			return true;
	}
	return false;
}
/* handle the normal selection from imback (do it button), also for nodejs */
imbdoit() {
	if (this.#actnum !== this.#allfiles.length) return;
	let selecteds = [];
	let compval = '0000';
	if (document && document.getElementById('imbstartts').value != undefined && document.getElementById('imbstartts').value.length > 0) {
		compval = document.getElementById('imbstartts').value;
		if (null === this.#tsregex.exec(compval)) {
			this.#mappx('onimback.invaltime', compval);
			this.#appendnl();
			const wc = this.#withcolours;
			this.#withcolours = false;
			alert(this.#subst(this.#xl0('onimback.invaltimex'), compval));
			this.#withcolours = wc;
			return;
		}
	}
	else compval = this.#fromts;
	if ((document && document.getElementById('rpicfromimb').checked) ||
		(this.#typeflags % 2)) {
		for (const e of this.#rimbpics) {
			let rawname = this.#basename(e);
			if (this.#comptime(rawname, compval))
				selecteds.push(e);
		}
	}
	if ((document && document.getElementById('picfromimb').checked) ||
		((this.#typeflags % 4) > 1)) {
		for (const e of this.#imbpics) {
			let rawname = this.#basename(e);
			if (this.#comptime(rawname, compval))
				selecteds.push(e);
		}
	}
	if ((document && document.getElementById('movfromimb').checked) ||
		((this.#typeflags % 8) > 3)) {
		for (const e of this.#imbmovies) {
			let rawname = this.#basename(e);
			if (this.#comptime(rawname, compval))
				selecteds.push(e);
		}
	}
	selecteds.sort((a, b) => {
		let ra = this.#basename(a);
		let rb = this.#basename(b);
		if (ra < rb) return -1;
		else if (ra === rb) return 0;
		else return 1;
	});
    this.#stepmode = 0;
	if (document) {
		const stepprev = document.getElementById('steppreview');
		if (stepprev !== null && stepprev.checked) this.#stepmode = 1;
	}
	this.#totnum = selecteds.length;
	this.#stats = { total: this.#totnum, skipped: 0, error: 0, ok: 0 };
	this.#actnum = 0;
	this.#allfiles = selecteds;
	this.#mappx('process.frombackn', this.#totnum);
	if (document) this.#appendnl();
	else this.#appendmsg('');
	if (document && this.#totnum > 0) {
		document.getElementById('imbdoit').disabled = true;
		document.getElementById('imbvisbrows').disabled = true;
		document.getElementById('droptarget').style['display'] = 'none';
		document.getElementById('infile').disabled = true
		this.#handleonex();
	}
	else if (this.#totnum > 0) this.#handleonex();
	else this.#mappx('onimback.nomatch');
}
/* browserdisplay: open visual browser */
showbrowser() {
	const norm = document.getElementById('normal');
	const quest = document.getElementById('question');
	document.getElementById('browser').style['display'] = '';
	quest.style['display'] = 'none';
	norm.style['display'] = 'none';
	window.onscroll = () => this.#startloadimg();
	window.onresize = () => this.#startloadimg();
}
/* visual browser: create the wait dots */
#createwait(el) {
	const waitdiv = document.createElement('div');
	waitdiv.classList.add('eepvw');
	const d1 = document.createElement('span');
	d1.classList.add('blink');
	d1.append('.');
	waitdiv.append(d1);
	const d2 = document.createElement('span');
	d2.classList.add('blink2');
	d2.append('.');
	waitdiv.append(d2);
	const d3 = document.createElement('span');
	d3.classList.add('blink3');
	d3.append('.');
	waitdiv.append(d3);
	el.entry.append(waitdiv);
}
/* visual browser: prepare the browser display, group the stuff */
#aftercheck() {
	document.getElementById('piccnt').innerHTML = '' + this.#imbpics.length;
	if (this.#earliestjpg.length > 4) {
		document.getElementById('picinterval').innerHTML += '(';
		document.getElementById('picinterval').innerHTML += this.#earliestjpg;
		document.getElementById('picinterval').innerHTML += ' - ';
		document.getElementById('picinterval').innerHTML += this.#latestjpg;
		document.getElementById('picinterval').innerHTML += ')';
		document.getElementById('picinterval').style['display']='';
	}
	document.getElementById('piccnt').removeAttribute('data-myxlkey');
	document.getElementById('rpiccnt').innerHTML = '' + this.#rimbpics.length;
	if (this.#earliestraw.length > 4) {
		document.getElementById('rpicinterval').innerHTML += '(';
		document.getElementById('rpicinterval').innerHTML += this.#earliestraw;
		document.getElementById('rpicinterval').innerHTML += ' - ';
		document.getElementById('rpicinterval').innerHTML += this.#latestraw;
		document.getElementById('rpicinterval').innerHTML += ')';
		document.getElementById('rpicinterval').style['display']='';
	}
	document.getElementById('rpiccnt').removeAttribute('data-myxlkey');
	document.getElementById('movcnt').innerHTML = '' + this.#imbmovies.length;
	if (this.#earliestmov.length > 4) {
		document.getElementById('movinterval').innerHTML += '(';
		document.getElementById('movinterval').innerHTML += this.#earliestmov;
		document.getElementById('movinterval').innerHTML += ' - ';
		document.getElementById('movinterval').innerHTML += this.#latestmov;
		document.getElementById('movinterval').innerHTML += ')';
		document.getElementById('movinterval').style['display']='';
	}
	document.getElementById('movcnt').removeAttribute('data-myxlkey');
	document.getElementById('imbdoit').disabled = false;
	document.getElementById('imbvisbrows').disabled = false;
	document.getElementById('notimback').style['display'] = 'none';
	if (this.#untypedclasses[0].title) return;
	for (const x of this.#untypedclasses) {
		const cl = {
			title: x,
			level: 5,
			fmembers: []
		};
		cl.entry = document.createElement('div');
		cl.entry.id = 'gg_' + x + '_X';
		cl.entry.classList.add('gg');
		cl.entry.classList.add('ggclosed');
		cl.entry.classList.add('gl5');
		for (const y of this.#imbeles) {
			if (x === y.ts)
			{
				// todo: sort
				cl.fmembers.push(y);
				y.inuntyped = true;
			}
		}
		this.#untypedclasses.splice(this.#untypedclasses.findIndex((v,i,o) => v === x), 1, cl);
	}
	for (const x of this.#typedclasses) {
		const cl = {
			title: x,
			level: 5,
			fmembers: []
		};
		cl.entry = document.createElement('div');
		cl.entry.id = 'gg_' + x + '_X';
		cl.entry.classList.add('gg');
		cl.entry.classList.add('ggclosed');
		cl.entry.classList.add('gl5');
		for (const y of this.#imbeles) {
			if (x === y.type + y.ts)
			{
				// todo: sort
				cl.fmembers.push(y);
				y.intyped = true;
			}
		}
		this.#typedclasses.splice(this.#typedclasses.findIndex((v,i,o) => v === x), 1, cl);
	}
	this.#higherclasses(this.#untypedclasses, 10, 5);
	this.#higherclasses(this.#typedclasses, 13, 5);
	// top type classes here
	for (const u of this.#typedclasses.filter((o) => o.level === 2)) {
		if (u.ischild) continue;
		if (this.#typedclasses.filter((o) => u.title.substring(0,3) === o.title.substring(0,3)).length === 1) {
			u.level --;
			u.entry.classList.add('gl' + u.level);
			u.entry.classList.remove('gl' + (u.level + 1));
		} else if (this.#typedclasses.findIndex((o) => o.title === u.title.substring(0,3)) === -1) {
			const cl = {
				title: u.title.substring(0,3),
				level: 1,
				smembers: []
			};
			cl.entry = document.createElement('div');
			cl.entry.id = 'gg_' + u.title.substring(0,3) + '_X';
			cl.entry.classList.add('gg');
			cl.entry.classList.add('ggclosed');
			cl.entry.classList.add('gl1');
			for (const x of this.#typedclasses.filter((o) => u.title.substring(0,3) === o.title.substring(0,3))) {
				x.ischild = true;
				// todo: sort when display
				cl.smembers.push(x);
				cl.haschildren = true;
				this.#typedclasses.splice(this.#typedclasses.findIndex((o) => o.title === x.title),1);
			}
			this.#typedclasses.push(cl);
		}
	}
	// non-typed upgraded to gl1, unless only one
	if (this.#untypedclasses.filter((o) => o.level === 2).length === 1 && this.#untypedclasses.filter((o) => o.level === 2)[0].smembers) {
		const t = this.#untypedclasses.filter((o) => o.level === 2)[0];
		this.#untypedclasses.splice(0,1);
		for (const s of t.smembers) {
			s.entry.classList.add('gl1');
			s.level = 2;
			this.#untypedclasses.push(s);
		}
	} else
		for (const s of this.#untypedclasses.filter((o) => o.level === 2)) s.entry.classList.add('gl1');
	// build title elemenes
	for (const s of this.#untypedclasses) this.#buildtitlerec(s);
	for (const s of this.#typedclasses) this.#buildtitlerec(s);
	if (document) {
		document.getElementById('brnsel').innerHTML = '0';
		document.getElementById('brntot').innerHTML = '' + this.#imbeles.length;
		this.buildtree();
	}
	/* debug * /
	if (debugflag) {
		for (const s of untypedclasses.filter((o) => o.level === 2)) prgr(s,1);
		for (const s of typedclasses.filter((o) => o.level === 1)) prgr(s,1);
	} */
}
/* visual browser: build ordered lists */
buildtree() {
	let list, toplevel;
	if (document.getElementById('sbytype').checked) {
		list = this.#typedclasses;
		toplevel = 1;
	}
	else {
		list = this.#untypedclasses;
		toplevel = 2;
	}

	// first, make everything empty
	for (const e of this.#untypedclasses) {
		e.entry.remove();
		this.#doclose(e, true);
	}
	for (const e of this.#typedclasses) {
		e.entry.remove();
		this.#doclose(e, true);
	}
	for (const d of this.#imbeles) {
		if (undefined !== d.entry && null !== d.entry)
			d.entry.remove();
	}

	// now, sort and add
	for (const e of list.filter((o) => o.level === toplevel).sort((a,b) => this.#mysort(a, b))) {
		document.getElementById('browser').append(e.entry);
		this.#addsorted(e);
	}
}
/* visual browser: find next to load */
#findnexttoload(alsooutside) {
	for (const e of this.#imbeles.sort((a,b) => this.#myisort(a,b))) {
		// display: none somewhere?
		if (!e.entry) continue;
		const p = e.entry;
		if (!p.parentElement) continue;
		// not waiting or error at all?
		if (p.querySelector('.eepvx')) continue;
		if (e.nonewerr) continue;
		let nwaitandnerr = true;
		if (p.querySelector('.eepvw') && p.querySelector('.eepvw').style['display'] !== 'none') nwaitandnerr = false;
		if (p.querySelector('.errimg') && p.querySelector('.errimg').style['display'] !== 'none') nwaitandnerr = false;
		if (nwaitandnerr) continue;
		let dispno = false;
		let f = p.parentElement;
		while (f) {
			if (f.style['display'] === 'none') {
				dispno = true;
				break;
			}
			let y = f.classList;
			if (f.classList.contains('ggclosed')) {
				dispno = true;
				break;
			}
			f = f.parentElement;
		}
		if (dispno) continue;
		// display not none, check pos
		let rect = p.getBoundingClientRect();
		if (rect.top < window.innerHeight && rect.bottom > 0 && rect.width > 0)
			return e;
		if (alsooutside && rect.bottom > 0 && rect.width > 0)
			if ((p.querySelector('.eepvw') && p.querySelector('.eepvw').style['display'] !== 'none') ||
				(p.querySelector('.errimg') && p.querySelector('.errimg').style['display'] !== 'none'))
			return e;
	}
	return undefined;
}
/* visual browser: sort helper */
#mysort(a, b) {
	const fact = document.getElementById('solder').checked ? 1 : -1
	if (a.title > b.title) return fact;
	else if (a.title < b.title) return -1 * fact;
	else return 0;
}
/* visual browser: sort helper */
#myisort(a, b) {
	const fact = document.getElementById('solder').checked ? 1 : -1
	if (a.raw > b.raw) return fact;
	else if (a.raw < b.raw) return -1 * fact;
	else return 0;
}
/* visual browser: add images sorted  */
#addimgsorted(el) {
	if (el.fmembers !== null && el.fmembers !== undefined) {
		for (const e of el.fmembers.sort((a,b) => this.#myisort(a, b))) {
			if (null === e.entry || undefined === e.entry) this.#displaydiv(e);
			el.entry.querySelector('.igtype').append(e.entry);
			e.nonewerr = false; // retry again if was error
		}
	}
}
/* visual browser: add sorted recursively */
#addsorted(el) {
	if (el.smembers === null || el.smembers ===  undefined) return;
	for (const e of el.smembers.sort((a,b) => this.#mysort(a, b))) {
		this.#addsorted(e);
		el.entry.append(e.entry);
	}
}
/* visual browser: recursive texts */
#buildtitlerec(el) {
	this.#buildtitle(el);
	if (el.smembers === null || el.smembers ===  undefined) return;
	for (const e of el.smembers) {
		this.#buildtitlerec(e);
	}
}
/* visual browser: recursive fold close */
#doclose(gr, recurse) {
	gr.entry.querySelector('.ggtt').classList.add('ggttclosed');
	gr.entry.querySelector('.ggtt').classList.remove('ggttopen');
	gr.entry.classList.add('ggclosed');
	gr.entry.classList.remove('ggopen');
	if (recurse && gr.smembers)
		for (const e of gr.smembers) this.#doclose(e, recurse);
}
/* visual browser: recursive fold open */
#doopen(gr, recurse, nontop) {
	gr.entry.querySelector('.ggtt').classList.remove('ggttclosed');
	gr.entry.querySelector('.ggtt').classList.add('ggttopen');
	gr.entry.classList.remove('ggclosed');
	gr.entry.classList.add('ggopen');
	if (recurse && gr.smembers)
		for (const e of gr.smembers) this.#doopen(e, recurse, true);
	if (gr.fmembers) {
		for (const e of gr.fmembers) {
			if (e.entry) e.entry.remove();
		}
	}
	if (gr.fmembers && !gr.entry.querySelector('.ee'))
		this.#addimgsorted(gr);
	if (nontop !== true) this.#startloadimg();
}
/* visual browser: select all from top */
topreccheck(force) {
	if (undefined === force)
		force = document.getElementById('selall').checked;
	this.#reccheck(force);
}
/* visual browser: select all */
#reccheck(to, root) {
	if (undefined === root) {
		for (const e of this.#typedclasses) this.#reccheck(to, e);
		for (const e of this.#untypedclasses) this.#reccheck(to, e);
		return;
	} else {
		root.entry.querySelector('.selcb').checked = to;
		if (root.fmembers) {
			for (const e of root.fmembers) {
				e.selected = to;
				if (e.entry) e.entry.querySelector('.selcb').checked = to;
			}
		}
		if (root.smembers)
			for (const e of root.smembers) this.#reccheck(to, e);
	}
	this.#updateselections();
}
/* visual browser: text and controls on top of a group */
#buildtitle(gr) {
	let t = '', s = gr.title;
	const d = document.createElement('div');
	d.classList.add('ggtt');
	d.classList.add('ggttclosed');
	const pluss = document.createElement('span');
	pluss.classList.add('ggttplus');
	pluss.append('[+]');
	pluss.onclick = () => {
		this.#doopen(gr, false);
	};
	d.append(pluss);
	const pluspluss = document.createElement('span');
	pluspluss.classList.add('ggttplus');
	if (gr.haschildren) {
		pluspluss.append('[++]');
		pluspluss.onclick = () => {
			this.#doopen(gr, true);
		};
	}
	else
		pluspluss.append(' ');
	d.append(pluspluss);
	const minuss = document.createElement('span');
	minuss.classList.add('ggttminus');
	minuss.append('[‒]');
	minuss.onclick = () => {
		d.classList.remove('ggttopen');
		d.classList.add('ggttclosed');
		d.parentElement.classList.remove('ggopen');
		d.parentElement.classList.add('ggclosed');
		this.#startloadimg();
	};
	d.append(minuss);
	const nixs = document.createElement('span');
	nixs.classList.add('ggttminus');
	nixs.append(' ');
	d.append(nixs);
	if (s.startsWith('JPG') || s.startsWith('RAW')) {
		const sp = document.createElement('span');
		sp.classList.add('gtype');
		sp.append(' ' + s.substring(0,3) + ': ');
		sp.style['display'] = 'none';
		d.append(sp);
		s = s.substring(3);
	} else if (s.startsWith('oth')) {
		const sp = this.#genspan('main.types.notpic');
		sp.classList.add('gtype');
		sp.style['display'] = 'none';
		d.append(sp);
		s = s.substring(3);
	}
	if (s.length > 0) t += (' ' + s);
	const tit = document.createElement('span');
	tit.classList.add('grtit');
	tit.append(t);
	d.append(tit);
	d.append(' - ');
	d.append(this.#genspan('main.selected'));
	d.append(': ');
	const selno = document.createElement('span');
	selno.id = 'SEL_' + gr.title;
	selno.classList.add('selnumber');
	selno.append('0');
	d.append(selno);
	d.append(' / ');
	const totno = document.createElement('span');
	totno.id = 'TOT_' + gr.title;
	totno.append('' + this.#countfiles(gr));
	d.append(totno);
	d.append(' - ');
	const texttit = document.createElement('label');
	const cb = document.createElement('input');
	cb.type = 'checkbox';
	cb.checked = false;
	cb.classList.add('selcb');
	cb.id = 'SELC_' + gr.title;
	cb.classList.add('selcb');
	texttit.htmlFor = cb.id;
	texttit.append(cb);
	texttit.append(this.#genspantitle('browser.selall.tooltip', 'browser.selall'));
	cb.onclick = (ev) => {
		if (cb.checked) this.#reccheck(true, gr);
		else this.#reccheck(false, gr);
	};
	d.append(texttit);

	gr.entry.append(d);
	if (!gr.haschildren) {
		const ig = document.createElement('div');
		ig.classList.add('igtype');
		gr.entry.append(ig);
	}
}
/* visual browser: add classes upwards */
#higherclasses(arr, len, curlevel) {
	for (const u of arr.filter((o) => o.level === curlevel)) {
		if (u.ischild) continue;
		if (arr.filter((o) => u.title.substring(0,len) === o.title.substring(0,len)).length === 1) {
			u.level --;
			u.entry.classList.add('gl' + u.level);
			u.entry.classList.remove('gl' + (u.level + 1));
		} else if (arr.findIndex((o) => o.title === u.title.substring(0,len)) === -1) {
			const cl = {
				title: u.title.substring(0,len),
				level: curlevel - 1,
				smembers: []
			};
			cl.entry = document.createElement('div');
			cl.entry.id = 'gg_' + u.title.substring(0,len) + '_X';
			cl.entry.classList.add('gg');
			cl.entry.classList.add('ggclosed');
			cl.entry.classList.add('gl' + (curlevel - 1));
			for (const x of arr.filter((o) => u.title.substring(0,len) === o.title.substring(0,len))) {
				x.ischild = true;
				// todo: sort when open
				cl.smembers.push(x);
				cl.haschildren = true;
				arr.splice(arr.findIndex((o) => o.title === x.title),1);
			}
			arr.push(cl);
		}
	}
	if (curlevel === 5)
		this.#higherclasses(arr, len - 3, 4);
	else if (curlevel === 4)
		this.#higherclasses(arr, len - 3, 3);
}
/* visual browser: return count of files in class */
#countfiles(cla) {
	let res = 0;
	if (undefined !== cla.fmembers) res += cla.fmembers.length;
	if (undefined !== cla.smembers)
		for (const s of cla.smembers)
			res += this.#countfiles(s);
	return res;
}
/* visual browser: recursive count selection */
#countsel(gr) {
	let res = 0;
	if (gr.fmembers) {
		res += gr.fmembers.filter((o) => o.selected).length;
	}
	if (gr.smembers) {
		for (const g of gr.smembers)
			res += this.#countsel(g);
	}
	gr.entry.querySelector('.selnumber').innerHTML = '' + res;
	gr.entry.querySelector('.selcb').checked = (res === this.#countfiles(gr));
	gr.sels = res;
	return res;
}
/* visual browser: update all "selected" values */
#updateselections() {
	for (const s of this.#typedclasses) this.#countsel(s);
	for (const s of this.#untypedclasses) this.#countsel(s);
	let res = 0, sum = 0;
	for (const s of this.#typedclasses) {
		res += s.sels;
		sum += this.#countfiles(s);
	}
	document.getElementById('brnsel').innerHTML = '' + res;
	document.getElementById('selall').checked = (res === sum);
	document.getElementById('delselbut').disabled = (res === 0);
}
/* visual browser: fill a html div into an imbele */
#displaydiv(e) {
	e.entry = document.createElement('div');
	if (e.wasselected) e.entry.classList.add('picprocd');
	e.entry.id = 'div_' + e.raw + '_X';
	e.entry.classList.add('ee');
	e.entry.classList.add(e.type);
	let rawname = this.#basename(e.url);
	e.entry.classList.add('ET_' + e.type + rawname.substring(0,12));
	e.entry.classList.add('EY_' + rawname.substring(0,12));
	const topline = document.createElement('div');
	const texttit = document.createElement('label');
	texttit.classList.add('etit');
	const check = document.createElement('input');
	check.type = 'checkbox';
	check.name = 'cb_sel_' + e.raw + '_X';
	check.id = 'cb_sel_' + e.raw + '_X';
	check.classList.add('selcb');
	check.checked = e.selected;
	check.onclick = () => {
		e.selected = check.checked;
		this.#updateselections();
	};
	texttit.htmlFor = check.id;
	texttit.append(check);
	texttit.append(rawname);
	topline.append(texttit);
	if (e.type === 'RAW') {
		e.rot = 1;
		const rotbtn = document.createElement('span');
		rotbtn.id = 'rot_b_' + e.raw + '_Y';
		rotbtn.classList.add('rotbtn');
		rotbtn.classList.add('disabled');
		rotbtn.append('\u21b7');
		rotbtn.onclick = () => {
			if (!this.#debugflag && rotbtn.classList.contains('disabled')) return;
			let j = this.#oriecw.indexOf(e.rot);
			j = ((j + 1) % 4);
			e.rot = this.#oriecw[j];
			e.preview.style['display'] = 'none';
			e.entry.querySelector('.eepvw').style['display'] = '';
			this.#startloadimg();
		};
		topline.append(rotbtn);
	}
	const dlbtn = document.createElement('span');
	dlbtn.id = 'dl_b_' + e.raw;
	dlbtn.classList.add('dlbtn');
	if (e.type !== 'oth') dlbtn.classList.add('disabled');
	dlbtn.append('\u2193');
	if (e.type === 'RAW') {
		dlbtn.onclick = (ev) => {
			if (!this.#debugflag && dlbtn.classList.contains('disabled')) return;
			if (this.#actnum !== this.#allfiles.length) return;
			let selecteds = [ e.url ];
			this.#stepmode = 0;
			this.#totnum = 1;
			this.#stats = { total: this.#totnum, skipped: 0, error: 0, ok: 0 };
			this.#actnum = 0;
			this.#allfiles = selecteds;
			document.getElementById('imbdoit').disabled = true;
			document.getElementById('imbvisbrows').disabled = true;
			document.getElementById('droptarget').style['display'] = 'none';
			document.getElementById('infile').disabled = true
			//this.fromvisbrows = true;
			this.shownormal();
			this.#handleone(e.rot);
			e.entry.classList.add('picprocd');
		};
	} else {
		dlbtn.onclick = (ev) => {
			if (!this.#debugflag && dlbtn.classList.contains('disabled')) return;
			const outel = document.getElementById('result');
			outel.download = rawname;
			outel.href = e.url;
			outel.click();
			e.entry.classList.add('picprocd');
		};
	}
	topline.append(dlbtn);
	
	e.entry.append(topline);
	// rotate button if raw

	const errdiv = document.createElement('div');
	errdiv.classList.add('errimg');
	errdiv.append('X');
	errdiv.style['display'] = 'none';
	e.entry.append(errdiv);
	if (e.type === 'RAW') {
		e.preview = document.createElement('canvas');
		e.preview.classList.add('eeraw');
		e.preview.classList.add('eewait');
		e.preview.style['display'] = 'none';
		e.preview.style['height'] = '120px';
		e.preview.onmouseover = (ev) => {
			e.preview.classList.add('biggie');
		}
		e.preview.onmouseout = (ev) => {
			e.preview.classList.remove('biggie');
		}
		e.entry.append(e.preview);
		this.#createwait(e);
	} else if (e.type === 'JPG') {
		e.preview = document.createElement('img');
		e.preview.classList.add('eeimg');
		e.preview.classList.add('eewait');
		e.preview.style['display'] = 'none';
		e.preview.style['height'] = '120px';
		e.preview.onmouseover = (ev) => {
			e.preview.classList.add('biggie');
		}
		e.preview.onmouseout = (ev) => {
			e.preview.classList.remove('biggie');
		}
		e.entry.append(e.preview);
		this.#createwait(e);
	} else {
		e.preview = document.createElement('div');
		e.preview.classList.add('eepvx');
		e.preview.append('?');
		e.entry.append(e.preview);
	}
}
/* visual browser: image loader call */
#loadimg(url, type, to) {
	if (to.entry.querySelector('.eepvx')
			|| (to.entry.querySelector('.eepvw')?.style['display'] === 'none' && to.entry.querySelector('.errimg')?.style['display'] === 'none')
			|| (type === 'oth')) {
		if (this.#debugflag) console.log('ldr aa lnx ' + to.raw);
		this.#loadnextimg();
		return;
	}
	to.entry.querySelector('.errimg').style['display'] = 'none';
	to.entry.querySelector('.eepvw').style['display'] = '';
	to.preview.style['display'] = 'none';
	if (type === 'JPG') {
		to.preview.onload = (ev) => {
			to.entry.querySelector('.eepvw').style['display'] = 'none';
			to.preview.style['display'] = '';
			to.preview.style['width'] = to.preview.woidth * (120 / to.preview.height);
			to.entry.querySelector('.dlbtn').classList.remove('disabled');
			if (this.#debugflag) console.log('ldr j f lnx ' + to.raw);
			this.#loadnextimg();
		};
		to.preview.onerror = (ev) => {
			console.log('JPEG preview load error for ' + url + ' ' + JSON.stringify(ev));
			to.entry.querySelector('.eepvw').style['display'] = 'none';
			to.entry.querySelector('.errimg').style['display'] = '';
			to.entry.querySelector('.dlbtn').classList.add('disabled');
			if (this.#debugflag) console.log('ldr j e lnx ' + to.raw);
			to.nonewerr = true;
			this.#loadnextimg();
		};
		to.preview.src = url;
	}
	else if (type === 'RAW') {
		this.#buildpreview(url, () => { /* on ok: */
			to.entry.querySelector('.eepvw').style['display'] = 'none';
			to.entry.querySelector('.rotbtn').classList.remove('disabled');
			to.entry.querySelector('.dlbtn').classList.remove('disabled');
			to.preview.style['display'] = '';
			if (this.#debugflag) console.log('ldr r f ' + to.raw);
			if (this.#loaderrunning === url) {
				if (this.#debugflag) console.log('ldr r e lnx ' + to.raw);
				this.#loadnextimg();
			} // else the afterload had already been called
			else if (this.#debugflag) {
				console.log('ldr r ff lnyy ' + to.raw);
			}
		}, () => { /* on err: */
			to.entry.querySelector('.eepvw').style['display'] = 'none';
			to.entry.querySelector('.errimg').style['display'] = '';
			to.entry.querySelector('.rotbtn').classList.add['disabled'];
			to.entry.querySelector('.dlbtn').classList.add['disabled'];
			to.nonewerr = true;
			if (this.#debugflag) console.log('ldr r e ' + to.raw);
			if (this.#loaderrunning === url) {
				if (this.#debugflag) console.log('ldr r e lnx ' + to.raw);
				this.#loadnextimg();
			} // else the afterload had already been called
			else if (this.#debugflag) {
				console.log('ldr r ee lnyy ' + to.raw);
			}
		}, to.rot, to.preview, () => { /* afterload: */
			if (this.#debugflag) console.log('ldr r l lnx ' + to.raw);
			// invalidate url for err callback
			this.#loaderrunning = '1';
			this.#loadnextimg();
		});
	}
}
/* visual browser: load next from todo list */
#loadnextimg() {
	let e = this.#findnexttoload();
	if (!e) e = this.#findnexttoload(true);
	if (!e) {
		this.#loaderrunning = false;
		if (this.#debugflag) console.log('TERM loader');
		return;
	}
	else {
		this.#loaderrunning = e.url;
		window.setTimeout(() => {
			if (this.#debugflag) console.log('L ' + e.raw);
			this.#loadimg(e.url, e.type, e)
		}, 33);
	}
}
/* visual browser: start loading */
#startloadimg() {
	if (!this.#loaderrunning) {
		if (this.#debugflag) console.log('start loader');
		this.#loadnextimg();
	}
	else if (this.#debugflag) {
		console.log('load already on ' + this.#loaderrunning);
	}
}
/* visual browser: delete browser selected */
browserdelete() {
	document.getElementById('del_text').setAttribute('data-myxlarg0', this.#imbeles.filter((o) => o.selected).length);
	this.#xl1(document.getElementById('del_text'));
	document.getElementById('delq').style['display'] = '';
	document.getElementById('browser').style['display'] = 'none';
	document.getElementById('delokbut').disabled = false;
	document.getElementById('delcancelbut').disabled = false;
}
/* visual browser: do delete */
dodelete(list) {
	const deletephs = [ '|' , '/', '-', '\\' ]; 
	if (list === undefined && this.#imbeles.filter((o) => o.selected).length === 0) {
		this.delcancel();
		return;
	}
	else if (list === undefined) {
		document.getElementById('delokbut').disabled = true;
		document.getElementById('delcancelbut').disabled = true;
		this.dodelete(this.#imbeles.filter((o) => o.selected));
		this.#deletephase=0;
		document.getElementById('delprogmsg').innerHTML = deletephs[this.#deletephase];
		return;
	} else if (list.length > 0) {
		let xhr = new XMLHttpRequest();
		xhr.onload = () => {
			this.#deletephase ++;
			document.getElementById('delprogmsg').innerHTML = deletephs[this.#deletephase % deletephs.length];
			const pv = list[0].preview;
			//if (pv)
			//	pv.classList.add('picdeleted');
			list.splice(0,1);
			this.dodelete(list);
			xhr.onerror = undefined;
			xhr.onload = undefined;
			xhr.ontimeout = undefined;
		};
		xhr.onerror = xhr.onload;
		xhr.ontimeout = xhr.onload;
		xhr.open('GET',list[0].url + '?del=1');
		xhr.send();
	} else {
		alert(this.#xl('del.reload'));
		this.delcancel();
	}
}
/* visual browser: cancel the delete */
delcancel() {
	document.getElementById('delq').style['display'] = 'none';
	document.getElementById('browser').style['display'] = '';
}
/* visual browser: process browser selected */
browserprocess() {
	if (this.#actnum !== this.#allfiles.length) return;
	let selecteds = [];
	for (const i of this.#imbeles) {
		if (i.selected) {
			selecteds.push(i);
		}
	}
	selecteds.sort((a, b) => {
		let ra = this.#basename(a.url);
		let rb = this.#basename(b.url);
		if (ra < rb) return -1;
		else if (ra === rb) return 0;
		else return 1;
	});
    this.#stepmode = 0;
	this.#totnum = selecteds.length;
	this.#stats = { total: this.#totnum, skipped: 0, error: 0, ok: 0 };
	this.#actnum = 0;
	this.#allfiles = selecteds;
	if (this.#totnum > 0) {
		this.#mappx('process.frombrowsern', this.#totnum);
		this.#appendnl();
		document.getElementById('imbdoit').disabled = true;
		document.getElementById('imbvisbrows').disabled = true;
		document.getElementById('droptarget').style['display'] = 'none';
		document.getElementById('infile').disabled = true
		this.#handleonex();
		this.topreccheck(false);
	} else {
		this.shownormal();
	}
}
/* remove VT100 color escapes for windows */
#rmesc(str) {
	//console.log('RRR ' + str);
	if (this.#withcolours) return (str);
	let i = 0, j, k;
	while ((j = str.substring(i).indexOf('\x1b')) !== -1) {
		k = str.substring(i+j).indexOf('m');
		if (j !== -1 && k !== -1) {
			str = str.substring(0, i+j) + str.substring(i+j+k+1);
			i += (k+j-1);
		} else i++;
	}
	return str;
}
/* translate one element */
#xl1(el) {
	if (el.attributes.getNamedItem('data-myxlkey')) {
		el.innerHTML = this.#xl(el.attributes.getNamedItem('data-myxlkey').value, el.attributes.getNamedItem('data-myxlarg0')?.value, el.attributes.getNamedItem('data-myxlarg1')?.value, el.attributes.getNamedItem('data-myxlarg2')?.value, el.attributes.getNamedItem('data-myxlarg3')?.value );
	}
	if (el.attributes.getNamedItem('data-myvalxlkey')) {
		el.value = this.#xl(el.attributes.getNamedItem('data-myvalxlkey').value);
	}
	if (el.attributes.getNamedItem('data-mytitlexlkey')) {
		el.title = this.#xl(el.attributes.getNamedItem('data-mytitlexlkey').value);
	}
	if (el.attributes.getNamedItem('data-myhrefxlkey')) {
		el.href = this.#xl(el.attributes.getNamedItem('data-myhrefxlkey').value);
	}
	return el;
}
/* get part of translation */
#xl0(str, base) {
	if (undefined === base) base = this.#texts;
	const i = str.indexOf('.');
	if (i === -1) {
		let r = base[str][this.#mylang];
		if (undefined === r) r = base[str]['en'];
		if (typeof r === 'string')
			return this.#rmesc(r);
		else
			return r;
	}
	else {
		const e = base[str.substring(0,i)];
		return this.#xl0(str.substring(i+1),e);
	}
}
/* substitute in translation */
#subst(r, arg0, arg1, arg2, arg3, base) {
	if (r.indexOf('$$0') !== -1 && arg0 !== undefined) {
		r = r.substring(0, r.indexOf('$$0')) + arg0 + r.substring(r.indexOf('$$0') + 3);
		if (r.indexOf('$$1') !== -1 && arg1 !== undefined) {
			r = r.substring(0, r.indexOf('$$1')) + arg1 + r.substring(r.indexOf('$$1') + 3);
			if (r.indexOf('$$2') !== -1 && arg2 !== undefined) {
				r = r.substring(0, r.indexOf('$$2')) + arg2 + r.substring(r.indexOf('$$2') + 3);
				if (r.indexOf('$$3') !== -1 && arg3 !== undefined) {
					r = r.substring(0, r.indexOf('$$3')) + arg3 + r.substring(r.indexOf('$$3') + 3);
				}
			}
		}
	}
	return this.#rmesc(r);
}
/* translate one string with parameters */
#xl(str, arg0, arg1, arg2, arg3, base) {
	// console.log(' XL ' + str + ' - ' + base + ' - ' + arg0 + ' - ' + arg1);
	if (undefined === base) base = this.#texts;
	if (this.#mylang === '00') {
		let res = '[' + str;
		if (undefined !== arg0) {
			res += ',' + arg0;
			if (undefined !== arg1) {
				res += ',' + arg1;
				if (undefined !== arg2) {
					res += ',' + arg2;
					if (undefined !== arg3) {
						res += ',' + arg3;
					}
				}
			}
		}
		return (res + ']');
	}
	const i = str.indexOf('.');
	if (i === -1) {
		let r = base[str][this.#mylang];
		if (undefined === r) r = base[str]['en'];
		return this.#subst(r, arg0, arg1, arg2, arg3);
	}
	else {
		const e = base[str.substring(0,i)];
		return this.#xl(str.substring(i+1), arg0, arg1, arg2, arg3, e);
	}
}
/* translate everything */
xlateall() {
	document.getElementById('mainversion').innerHTML = this.#version;
	document.documentElement.lang = this.#mylang;
	const k = document.querySelectorAll('*[data-myxlkey]');
	for (const e of k)
		this.#xl1(e);
	const l = document.querySelectorAll('*[data-myvalxlkey]');
	for (const e of l)
		this.#xl1(e);
	const m = document.querySelectorAll('*[data-mytitlexlkey]');
	for (const e of m)
		this.#xl1(e);
	const h = document.querySelectorAll('*[data-myhrefxlkey]');
	for (const e of h)
		this.#xl1(e);
	document.title = this.#xl0('main.title') + ' ' + this.#version;
}
/* html dng preview checkbox handler */
chgdngpreview() {
    const dngprev = document.getElementById('dngpreview');
    this.#withpreview = (dngprev !== null && dngprev.checked);
}
/* translate html for new language */
setlang() {
	this.#mylang = document.getElementById('langsel').value;
	this.xlateall();
}
/* try lang from node param */
#trylang(i) {
	let found = 0;
	for (const l of this.#alllangs) {
		if (i.toUpperCase() === l.toUpperCase()) {
			this.#mylang = l;
			found = 1;
			break;
		}
	}
	if (!found) {
		this.#mylang = 'en';
		console.log('Unknown language: ' + i);
	}
	else if ('00' === this.#mylang)
		this.#debugflag = true;
}
/* find language from filename or nodejs scriptfile */
querylang(name, offset) {
	if (undefined === offset) offset = 8;
	let found = 0;
	for (const l of this.#alllangs) {
		if (name.substring(name.length - offset, name.length - offset + 4).toUpperCase() === ('_' + l.toUpperCase() + '.')) {
			this.#mylang = l;
			if ('00' === l) {
				this.#debugflag = true;
				if (document) {
					for (const el of Object.keys(this.#texts))
						this.#prxl(el, this.#texts[el]);
					document.getElementById('langsel').innerHTML += '<option value="00" onclick="imbc.setlang()">00</option></select>';
				}
			}
			if (document) {
				document.getElementById('langsel').value = l;
			}
			found = 1;
			break;
		}
	}
	if (!found) {
		if (name.substring(name.length - offset, name.length - offset+1) === '_') console.log('Unknown language: ' + name.substring(name.length - offset+1).substring(0,2));
	}
	// followed by xlall anyway
}
/* nodejs: show help */
#help(caller) {
	caller = this.#basename(caller);
	let texts = this.#xl0('node.help');
	console.log(this.#subst(texts[0], this.#version));
	console.log(this.#subst(texts[1], caller));
	for (let j=2; j<texts.length; j++) {
		console.log(this.#rmesc(texts[j]));
		if (this.#debugflag && j === 7) {
			console.log(' \x1b[1m-CSV\x1b[0m - Translation CSV');
		}
	}
}
/* nodejs runup */
startnode() {
	if (process.stdout.isTTY !== true) this.#withcolours = false;
	let wanthelp = false, wantxl = false, flagging=0, datefound = false, restisfiles = false;
	if (process.argv.length < 3) {
		wanthelp = true;
	}
	process.argv.forEach((v,i) => {
			if (i >= 2) {
				//console.log(` ${i} -- ${v} ${flagging}`);
				if (v ==='--') {
					restisfiles = true;
				}
				else if (restisfiles) {
					this.#allfiles.push(v);
					this.#totnum ++;
				}
				else if (flagging === 1) {
					flagging = 0;
					this.#trylang(v);
				}
				else if (flagging === 2) {
					flagging = 0;
					this.#outdir = v;
				}
				else if (flagging === 3) {
					flagging = 0;
					if (null !== this.#tsregex.exec(v)) {
						this.#fromts = v;
						datefound = true;
					} else {
						wanthelp = true;
						console.log(this.#subst(this.#xl0('onimback.invaltimex'), v));
					}
				}
				else if (v.substring(0,4)==='-CSV' && this.#debugflag) {
					for (const el of Object.keys(this.#texts))
						this.#prxl(el, this.#texts[el]);
					wantxl = true;
				}
				else if (v ==='-nc') {
					this.#withcolours = false;
				}
				else if (v ==='-co') {
					this.#withcolours = true;
				}
				else if (v ==='-np') {
					this.#withpreview = false;
				}
				else if (v.substring(0,2)==='-l') {
					if (v.substring(2).length > 0) {
						let l = v.substring(2);
						this.#trylang(l);
					}
					else
						flagging=1;
				}
				else if (v.substring(0,2)==='-d') {
					if (v.substring(2).length > 0) {
						this.#outdir = v.substring(2);
					}
					else
						flagging=2;
				}
				else if (v.substring(0,2)==='-n') {
					if (v.substring(2).length > 0) {
						if (null !== this.#tsregex.exec(v.substring(2))) {
							this.#fromts = v.substring(2);
							datefound = true;
						} else {
							wanthelp = true;
							console.log(this.#subst(this.#xl0('onimback.invaltimex'), v.substring(2)));
						}
					}
					else
						flagging=3;
				}
				else if (v ==='-h') {
					wanthelp = true;
				}
				else if (v ==='-f') {
					this.#ovwout = true;
				}
				else if (v ==='-r') {
					this.#renamefiles = true;
				}
				else if (v ==='-R') {
					if (!(this.#typeflags % 2)) this.#typeflags += 1;
				}
				else if (v ==='-J') {
					if ((this.#typeflags % 4) < 2) this.#typeflags += 2;
				}
				else if (v ==='-O') {
					if ((this.#typeflags % 8) < 4) this.#typeflags += 4;
				}
				else if (v.substring(0,1) === '-') {
					console.log(this.#subst(this.#xl0('node.unkopt'), v));
					wanthelp = true;
				}
				else {
					if (null !== this.#tsregex.exec(v)) {
						this.#mappx('node.fnwarn', v);
						wanthelp = true;
					}
					this.#allfiles.push(v);
					this.#totnum ++;
				}
			}
	});
	if (wantxl) return;
	else if (flagging) {
		console.log(this.#xl0('node.missingval'));
		wanthelp = true;
	}
	else if (datefound && 0 === this.#typeflags) this.#typeflags = 7;

	if (wanthelp || (this.#typeflags === 0 && this.#totnum === 0)) {
		this.#help(process.argv[1]);
		console.log('');
		console.log(this.#xl0('main.coloursyourrisk'));
		console.log('');
		return;
	}
	else if (this.#totnum > 0) {
		console.log(this.#subst(this.#xl0('node.help')[0], this.#version));
		console.log(this.#xl0('main.coloursyourrisk'));
		console.log('');
		if (this.#typeflags === 0) this.#typeflags = 7;
		this.#handlerecurse();
	}
	else if (this.#typeflags > 0) {
		console.log(this.#subst(this.#xl0('node.help')[0], this.#version));
		console.log(this.#xl0('main.coloursyourrisk'));
		console.log('');
		this.#checkimbnode();
	}
}
/* visual browser: change cache size (currently only visible in debug _00) */
chgcache() {
	this.#maxcache = document.getElementById('dbgcache').value;
}
/* debug */
#prgr(gr, indent) {
	const str = '                ';
	if (undefined === gr.title) return;
	console.log(str.substring(0,2*indent), gr.title, '   ', this.#countfiles(gr));
	if (undefined === gr.smembers) return;
	for (const s of gr.smembers) {
		prgr(s, indent + 1);
	}
}
/* debug: print translations for csv */
#prxl(key, el) {
	if (el['de'] && el['en']) {
		try{
		if (typeof el['de'] === 'string') {
			let out = key + ';';
			for (const l of this.#alllangs) {
				if (undefined !== el[l]) {
					let a = el[l];
					let b = '"';
					if (-1 !== a.indexOf('"')) b = '\'';
					out += b + a  + b + ';';
				} else out += ';'
			}
			console.log(out);
		}
		else if (typeof el['de'][0] === 'string') {
			for (let i=0; i< el['de'].length; i++) {
				let out = key + '[' + i + '];';
				for (const l of this.#alllangs) {
					if (undefined !== el[l] && undefined !== undefined !== el[l][i]) {
						let a = el[l][i];
						let b = '"';
						if (-1 !== a.indexOf('"')) b = '\'';
						out += b + a  + b + ';';
					} else out += ';';
				}
				console.log(out);
			}
		}
		} catch (e) { require('process').exit(); }
	}
	for (const ne of Object.keys(el).filter((k) => ((k !== 'en') && (k !== 'de') && (typeof(el[k]) !== 'string')))) {
		this.#prxl(key + '.' + ne, el[ne]);
	}
}
/* only debug */
dodebug() {
	const fr = new FileReader();
	fr.onload = (res) => {
		const dp = new DOMParser();
		const doc = dp.parseFromString(res.target.result,'text/html');
		const sel2 = doc.querySelectorAll('a');
		for (const r of sel2) {
			if (r && (-1 === r.href.indexOf('?del='))) {
				this.#handle1imb(r.href);
			}
		}
		document.getElementById('dbgfsel').style['display'] = 'none';
		document.getElementById('onimback').style['display'] = '';
		this.#aftercheck();
	};
	fr.readAsText(document.getElementById('dbgfsel').files[0]);
}
/* indentation in - end of class ImBC */
};
/* Tiff helper classes */
class IFDOut {
/* Indentation out */
#entrys = [];
#currentoff = 0;
// imgdata can be view or array
#imgdata = null;
#imglen = 0;
#data = new Uint8Array(20000000);
#dyndata = [] ; //new Uint8Array(20000);
camprofptr = -1; // first of the pointers, they are sequential, accessed by TIFFOut
/* add image data to ifd */
addImageStrip(typ, view, width, height) {
	this.#imgdata = view;
	this.#imglen = view.byteLength ? ((this.#imgdata.byteLength + 3) & 0xFFFFFFFC) : (view.length + 3) & 0xFFFFFFFC;
	this.addEntry(254 , 'LONG', [ typ ]); /* SubFileType */
	this.addEntry(256 , 'SHORT', [ width ]); /* width */
	this.addEntry(257 , 'SHORT', [ height ]); /* height */
	this.addEntry(273 , 'LONG', [ 0xFFFFFFFF ]); /* StipOffsets , special */
	this.addEntry(279 , 'LONG', [ this.#imgdata.byteLength ? this.#imgdata.byteLength : view.length ]); /* StripByte count */
	this.addEntry(278 , 'LONG', [ height ]); /* Rows per strip */
}
/* add entry to ifd */
addEntry(tag, type, value) {
	let x = TIFFOut.tToNum(type);
	let l = value.length;
	if (type === 'ASCII') l++;
	else if (type === 'RATIONAL' || type === 'SRATIONAL') l /= 2;
	if (tag === 273 || tag === 330) { /* special cases */
		let e = { 
			xtag: tag,
			tag: [ 0, 0 ],
			xtype: x.t,
			type: [ 0, 0 ],
			xcount: l,
			count: [ 0, 0, 0, 0 ],
			ptr: value[0]
		};
		TIFFOut.writeshorttoout(e.tag, tag, 0);
		TIFFOut.writeshorttoout(e.type, x.t, 0);
		TIFFOut.writeinttoout(e.count, l, 0);
		this.#entrys.push(e);
	} else if (l * x.l <= 4) { /* fits into data */
		let e = {
			xtag: tag,
			tag: [ 0, 0 ],
			xtype: x.t,
			type: [ 0, 0 ],
			xcount: l,
			count: [ 0, 0, 0, 0 ],
			value: [ 0, 0, 0, 0 ]
		};
		TIFFOut.writeshorttoout(e.tag, tag, 0);
		TIFFOut.writeshorttoout(e.type, x.t, 0);
		TIFFOut.writeinttoout(e.count, l, 0);
		if (type === 'BYTE' || type === 'SBYTE' || type === 'UNDEFINED') {
			for (let k=0; k<l; k++) e.value[k] = value[k];
		} else if (type === 'ASCII') {
			for (let k=0; k<l-1; k++) e.value[k] = value.charCodeAt(k) % 256;
		} else if (type === 'LONG') {
			TIFFOut.writeinttoout(e.value, value[0], 0);
		} else if (type === 'SLONG') {
			TIFFOut.writeinttoout(e.value, (65536*65536)+value[0], 0);
		} else if (type === 'SHORT') {
			TIFFOut.writeshorttoout(e.value, value[0], 0);
			if (l === 2) TIFFOut.writeshorttoout(e.value, value[1], 2);
		} else if (type === 'SSHORT') {
			TIFFOut.writeshorttoout(e.value, 65536-value[0], 0);
			if (l === 2) TIFFOut.writeshorttoout(e.value, 65536+value[1], 2);
		}
		this.#entrys.push(e);
	}
	else { /* data accessed via pointer */
		let e = { 
			xtag: tag,
			tag: [ 0, 0 ],
			xtype: x.t,
			type: [ 0, 0 ],
			xcount: l,
			count: [ 0, 0, 0, 0 ],
			ptr: this.#currentoff
		};
		TIFFOut.writeshorttoout(e.tag, tag, 0);
		TIFFOut.writeshorttoout(e.type, x.t, 0);
		TIFFOut.writeinttoout(e.count, l, 0);
		if (type === 'BYTE' || type === 'SBYTE' || type === 'UNDEFINED') {
			for (let k=0; k<l; k++) this.#dyndata.push(value[k]);
			this.#currentoff += l;
			while (this.#currentoff % 4) { // alignment
				this.#dyndata.push(0); this.#currentoff++;
			}
		} else if (type === 'ASCII') {
			for (let k=0; k<l-1; k++) this.#dyndata.push(value.charCodeAt(k) % 256);
			this.#dyndata.push(0);
			this.#currentoff += l;
			while (this.#currentoff % 4) { // alignment
				this.#dyndata.push(0); this.#currentoff++;
			}
		} else if (type === 'LONG') {
			for (let k = 0; k < l; k++) {
				this.#dyndata.push(0); this.#dyndata.push(0); this.#dyndata.push(0); this.#dyndata.push(0);
				TIFFOut.writeinttoout(this.#dyndata, value[k], this.#currentoff);
				this.#currentoff += 4;
			}
		} else if (type === 'SLONG') {
			for (let k = 0; k < l; k++) {
				this.#dyndata.push(0); this.#dyndata.push(0); this.#dyndata.push(0); this.#dyndata.push(0);
				if (value[k] < 0) TIFFOut.writeinttoout(this.#dyndata, (65536*65536)+value[k], this.#currentoff);
				else TIFFOut.writeinttoout(this.#dyndata, value[k], this.#currentoff);
				this.#currentoff += 4;
			}
		} else if (type === 'SHORT') {
			for (let k = 0; k < l; k++) {
				this.#dyndata.push(0); this.#dyndata.push(0);
				TIFFOut.writeinttoout(this.#dyndata, value[k], this.#currentoff);
				this.#currentoff += 2;
			}
			while (this.#currentoff % 4) { // alignment
				this.#dyndata.push(0); this.#currentoff++;
			}
		} else if (type === 'SSHORT') {
			for (let k = 0; k < l; k++) {
				this.#dyndata.push(0); this.#dyndata.push(0);
				if (value[k] < 0) TIFFOut.writeinttoout(this.#dyndata, 65536 + value[k], this.#currentoff);
				else TIFFOut.writeinttoout(this.#dyndata, value[k], this.#currentoff);
				this.#currentoff += 2;
			}
			while (this.#currentoff % 4) { // alignment
				this.#dyndata.push(0); this.#currentoff++;
			}
		} else if (type === 'RATIONAL') {
			for (let k = 0; k < l; k++) {
				this.#dyndata.push(0); this.#dyndata.push(0); this.#dyndata.push(0); this.#dyndata.push(0);
				this.#dyndata.push(0); this.#dyndata.push(0); this.#dyndata.push(0); this.#dyndata.push(0);
				TIFFOut.writeinttoout(this.#dyndata, value[2*k], this.#currentoff);
				TIFFOut.writeinttoout(this.#dyndata, value[2*k + 1], this.#currentoff + 4);
				this.#currentoff += 8;
			}
		} else if (type === 'SRATIONAL') {
			for (let k = 0; k < l; k++) {
				this.#dyndata.push(0); this.#dyndata.push(0); this.#dyndata.push(0); this.#dyndata.push(0);
				this.#dyndata.push(0); this.#dyndata.push(0); this.#dyndata.push(0); this.#dyndata.push(0);
				if (value[2*k] < 0) TIFFOut.writeinttoout(this.#dyndata, (65536*65536)+value[2*k], this.#currentoff);
				else TIFFOut.writeinttoout(this.#dyndata, value[2*k], this.#currentoff);
				if (value[2*k + 1] < 0) TIFFOut.writeinttoout(this.#dyndata, (65536*65536)+value[2*k + 1], this.#currentoff + 4);
				else TIFFOut.writeinttoout(this.#dyndata, value[2*k + 1], this.#currentoff + 4);
				this.#currentoff += 8;
			}
		}
		//console.log('After ptr tag ' + tag +  ' type ' + type + ' * ' + l + ' :' + this.#currentoff);
		this.#entrys.push(e);
	}
}
/* get data for this ifd, shifted to actual offset in file */
getData(offset) {
	let ioff = 0;
	if (this.#imgdata?.byteLength) {
		for (let z=0; z<this.#imgdata.byteLength; z++)
			this.#data[ioff++] = this.#imgdata.getUint8(z);
	} else if (this.#imgdata) {
		for (let z=0; z<this.#imgdata.length; z++)
			this.#data[ioff++] = this.#imgdata[z];
	}
	TIFFOut.writeshorttoout(this.#data, this.#entrys.length, ioff);
	ioff += 2;
	for (const i of this.#entrys.sort(function(a,b) { return a.xtag - b.xtag; })) {
		this.#data.set(i.tag, ioff);
		this.#data.set(i.type, ioff + 2);
		this.#data.set(i.count, ioff + 4);
		if (i.xtag === 273) { /* strip offsets is set here, subifd (-2) and private stuff outside */
			let parr = [ 0, 0, 0, 0 ];
			TIFFOut.writeinttoout(parr, offset, 0);
			this.#data.set(parr, ioff + 8);
		} else if (i.xtag === 50933) { // camera profiles
			if (undefined !== i.value) // only one, profile ptr fits into value
				this.camprofptr = offset + ioff + 8;
			else {			// more than one, dereference
				let parr = [ 0, 0, 0, 0 ];
				TIFFOut.writeinttoout(parr, i.ptr + offset + this.#imglen + 6 + (12 * this.#entrys.length), 0);
				this.#data.set(parr, ioff + 8);
				this.camprofptr = offset + this.#imglen + i.ptr + 6 + (12 * this.#entrys.length);
			}
		} else if (undefined !== i.value) {
			this.#data.set(i.value, ioff + 8);
		} else {
			let parr = [ 0, 0, 0, 0 ];
			TIFFOut.writeinttoout(parr, i.ptr + offset + this.#imglen + 6 + (12 * this.#entrys.length), 0);
			this.#data.set(parr, ioff + 8);
		}
		ioff += 12;
	}
	let oarr = [ 0, 0, 0, 0 ];
	// next ifd - stays zero if has sub ifd
	this.#data.set(oarr, ioff);
	ioff += 4;
	this.#data.set(this.#dyndata, ioff);
	return this.#data.slice(0, ioff + this.#currentoff);
}
/* tiff directory is placed after image data */
getOffset() {
	return this.#imglen;
}
/* if has sub ifd, then return that */
getNextIfdPosOffset() {
	if (this.hassub) {
		const i = this.#entrys.findIndex(v => v.xtag === 330);
		return this.#imglen + 2 + (12 * i) + 8;
	} else {
		return this.#imglen + 2 + (12 * this.#entrys.length);
	}
}
/* Indentation in - end of class IFD */
};
class TIFFOut {
/* Indentation out */
#ifds = [];
#cameraprofiles = [];
#currentifd = null;
#data = new Uint8Array(20000000);
/* add an ifd  (will set this as current IFD) */
addIfd(issub) {
	if (null !== this.#currentifd) {
		this.#ifds.push(this.#currentifd);
	}
	this.#currentifd = new IFDOut();
	if (issub) this.#currentifd.issub = true;
}
/* add sub ifd  (will set this as current IFD) */
addSubIfd() {
	if (null !== this.#currentifd) {
		this.#currentifd.hassub = true;
		this.#currentifd.addEntry(330, 'LONG', [ 0xFFFFFFFE ]); /* subifd, special */
	}
	this.addIfd(true);
}
/* add image data to current ifd */
addImageStrip(typ, view, width, height) {
	this.#currentifd.addImageStrip(typ, view, width, height);
}
/* add an entry to current ifd */
addEntry(tag, type, data) {
	if (this.#cameraprofiles.length > 0) {
		this.#cameraprofiles[this.#cameraprofiles.length - 1].addEntry(tag, type, data);
	} else
		this.#currentifd.addEntry(tag, type, data);
}
/* map string type to tiff id */
static types = [
	{ n: 'BYTE', t: 1, l: 1 },
	{ n: 'ASCII', t: 2, l: 1 },
	{ n: 'SHORT', t: 3, l: 2 },
	{ n: 'LONG', t: 4, l: 4 },
	{ n: 'RATIONAL', t: 5, l: 8 },
	{ n: 'SBYTE', t: 6, l: 1 },
	{ n: 'UNDEFINED', t: 7, l: 1 },
	{ n: 'SSHORT', t: 8, l: 2 },
	{ n: 'SLONG', t: 9, l: 4 },
	{ n: 'SRATIONAL', t: 10, l: 8 },
	//{ n: 'FLOAT', t: 11, l: 4 },
	//{ n: 'DOUBLE', t: 12, l: 8 },
];
/* map string type to tiff id */
static tToNum(type) {
	return (TIFFOut.types.filter(v =>  v.n === type )[0]);
}
/* helper function to put integer into dng */
static writeinttoout(out, num, off) {
	TIFFOut.writeshorttoout(out, num % 65536, off);
	TIFFOut.writeshorttoout(out, (Math.floor(num / 65536)) % 65536, off+2);
}
/* helper function to put short integer into dng */
static writeshorttoout(out, num, off) {
	out[off] = (num % 256);
	out[off + 1] = Math.floor(num / 256) % 256;
}
/* return the tiff binary data */
getData() {
	if (null !== this.#currentifd) {
		this.#ifds.push(this.#currentifd);
	}
	if (this.#cameraprofiles.length > 0) {
		let camprofarr = [];
		for (const j of this.#cameraprofiles) camprofarr.push(1);
		this.#ifds[0].addEntry(50933, 'LONG', camprofarr); /* camera profiles pointer */
	}
	TIFFOut.writeshorttoout(this.#data, 0x4949, 0); // magics
	TIFFOut.writeshorttoout(this.#data, 42, 2);
	let lastoffpos = 4;
	let lastlen = 8;
	for (const i of this.#ifds) {
		TIFFOut.writeinttoout(this.#data, i.getOffset() + lastlen, lastoffpos);
		let d = i.getData(lastlen);
		this.#data.set(d, lastlen);
		lastoffpos = i.getNextIfdPosOffset() + lastlen;
		lastlen += d.length;
	}
	TIFFOut.writeinttoout(this.#data, 0, lastoffpos);
	if (-1 !== this.#ifds[0].camprofptr && this.#cameraprofiles.length > 0) {
		for (let l=0; l<this.#cameraprofiles.length; l++) {
			TIFFOut.writeinttoout(this.#data, lastlen, this.#ifds[0].camprofptr + (4*l));
			let cpd = this.#getCamProfData(this.#cameraprofiles[l]);
			this.#data.set(cpd, lastlen);
			lastlen += cpd.length;
		}
	}
	return this.#data.slice(0, lastlen);
}
// add extra camera profile (will set this as current IFD), must go behind all other IFDs
createCamProf(name) {
	this.#cameraprofiles.push(new IFDOut());
	this.#cameraprofiles[this.#cameraprofiles.length - 1].addEntry(50936, 'ASCII', name); /* profile name */
}
/* get camera profile data analog to ifd */
#getCamProfData(p) {
	let camprofbuf = new Uint8Array(3000);
	TIFFOut.writeshorttoout(camprofbuf, 0x4949, 0); // magics
	TIFFOut.writeshorttoout(camprofbuf, 0x4352, 2);
	TIFFOut.writeinttoout(camprofbuf, 8, 4);
	let d = p.getData(8);
	camprofbuf.set(d, 8);
	return camprofbuf.slice(0, 8 + d.length);
}
/* Indentation in - end of class TIFFOut */
}
let imbc;
/* onload of html body */
function init() {
	imbc = new ImBC();
	imbc.querylang(window.location.pathname);
	imbc.xlateall();
	imbc.checkimb();
}
/* node js handling main function */
if (typeof process !== 'undefined') {
	var document = undefined;
	imbc = new ImBC();
	imbc.querylang(process.argv[1], 6);
	imbc.startnode();
}
