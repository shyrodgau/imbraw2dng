<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - Konvertierung von RAW-Dateien von [I'mBack<sup>&reg;</sup>](https://imback.eu) nach DNG

Das meiste ist freie Software ([0-Klausel-BSD-Lizenz](LICENSE.txt)) ohne kommerzielle Unterstützung.

or [IN ENGLISH](https://shyrodgau.github.io/imbraw2dng/)  
 [日本語](https://shyrodgau.github.io/imbraw2dng/README_ja)

 
## Hier gibts:

- [**&#x261e;**`imbapp.htm`](https://shyrodgau.github.io/imbraw2dng/imbapp.htm)  - App-artiger Konverter für Browser von Festplatte, Internet oder direkt von ImB

- [**&#x261e;**`imbapp.apk`](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk) - Echte Android App. Für Apple, [hier](#iphone) schauen.

- [**&#x261e;**`imbraw2dng.js`](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) - Node.js Version für Benutzung auf der Kommandozeile   
auch in verschiedenen Sprachen als `imbraw2dng_XX.js` (siehe [Internationalisierung](#internationalisierung))

- [**&#x261e;**`imbraw2dng.html`](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.html) - Historische Version    
auch in verschiedenen Sprachen als `imbraw2dng_XX.html` (siehe [Internationalisierung](#internationalisierung))

- Kalibrierte [Kameraprofile zum Herunterladen](cameraprofiles.md) für ImB

- [**&#x261e;**`imbdng2raw.html`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html), [`imbdng2raw.js`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js)
von DNG nach RAW zurück konvertieren, nur für originale hiermit nach DNG konvertierte Dateien
 
Es sind keine "Schwarz-Weiß RAW"-Dateien, sondern die echten Roh-Sensordaten mit der Farbfilterung darauf (leider aber nur 8 bit bei 35mm und MF, 12 bit bei Film). 

DNG ist ein auf TIFF basierendes Dateiformat, das hauptsächlich konstante Daten um die ursprünglichen Bilddaten herum hat. 
Bei Dateien von MF und Film ist die Farbfilter-Matrix (Color Filter Array) anders.

Probleme und Ideen können auch unter "[Issues](https://github.com/shyrodgau/imbraw2dng/issues)" oder "[Discussions](https://github.com/shyrodgau/imbraw2dng/discussions)"  
des [github Repositorys](https://github.com/shyrodgau/imbraw2dng) oder in der [I'm Back Users Gruppe auf Facebook](https://www.facebook.com/groups/1212628099691211) diskutiert werden.

## Los gehts

Wenn jemand **Android** benutzt, probiert die [Android app](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk), mit dem Androiden im ImB WLAN.

Wenn es jemand auf dem PC oder Smartphone im **Browser** verwenden möchte, folgende Möglichkeiten:

- die Datei [**&#x261e;**`IMBAPP.HTM`](https://shyrodgau.github.io/imbraw2dng/imbapp.htm) direkt im Internet benutzen oder auf die Festplatte oder sonstwohin kopieren.    
(Alle Daten bleiben im Browser!)   
Manche Browser (sogar auf Handys) bieten an, es als PortableWebApp zu installieren (leicht offline zu finden). Das könnte sich auch unter "Zum Desktop dazufügen" o.ä. verbergen.   
In diesem Fall müssen die Dateien von ImB per USB, Micro SD Adapter, original App oder sonstwie geholt werden.

- <a name="browsing-on-the-imback">  </a>wenn man diese Datei auf die MicroSD vom ImB schiebt, ([wie macht man das?](#wie-kopiere-ich-html-dateien-auf-die-microsd)), kann Holen und Konvertieren nach DNG zusammengefasst werden (JPG und Filme können auch geholt werden).   
`http://192.168.1.254/IMBACK/IMBAPP.HTM` (neuer, kann auch die Zeit einstellen und Bilder und Video aufnehmen!)   
Das Gerät, auf dem die Seite geöffnet wird, muss im ImB WLAN sein.


Wenn man gerne **Kommandozeile** verwendet, kann [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.js) mit node.js verwendet werden. Das kann auch direkt auf die Dateien von ImB zugreifen, wenn
man im WLAN ist. [Kommandozeilen-Doku](#kommandozeile-mit-nodejs)

## Wie kopiere ich HTML Dateien auf die MicroSD?

.... wenn man direkt mit dem Browser per WLAN von ImB herunterladen/konvertieren möchte.

#### Android

Die [echte App](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk) installieren, dann ins ImB WLAN und Extras Menü schauen.

#### Mit einem Micro SD Kartenleser/Adapter oder USB-Kabel

Die Micro SD aus der ImB entnehmen und in (einen Adapter am) Computer stecken, oder Computer und ImB via USB verbinden und auf ImB `Massenspeicher` wählen

Inhalt der Micro SD/USB-Laufwerk öffnen, könnte `VOLUME1`  oder `0000-0001` heißen und müsste einen Ordner namens `IMBACK` oder `imback` enthalten.  
Mit dem Dateiexplorer oder Betriebssystem die [heruntergeladene Datei `imbapp.htm`](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbapp.htm) in diesen `IMBACK` Ordner kopieren.  
<!--Und/oder diese Datei in `imbapp_de.html` umbenennen. (Achtung, `html` statt `htm`)-->

Micro SD aus dem Computer auswerfen und wieder ins ImB stecken - fertig.

#### Per Netzwerk

Smartphone oder Computer in das ImB WLAN stecken..

Neues Browserfenster (oder Registerkarte) verwenden, um auf  [http://192.168.1.254/IMBACK/](http://192.168.1.254/IMBACK/) zu navigieren.

`Datei auswählen` klicken und die gerade [heruntergeladene `imbapp.htm`](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbapp.htm) auswählen. Auf `upload file` (exakter Wortlaut muss geprüft werden) - fertig!


## Benutzung

Man kann alle Verzeichnisse oder Dateien vom I'm back (also von der in den PC gesteckten micro-SD-Karte oder dem USB Massenspeicher) in das blaue Feld ziehen und ablegen. 
Dann werden nicht-RAW Dateien eins-zu-eins kopiert und die RAW-Dateien nach DNG konvertiert, wobei die `.raw`/`.RAW` Dateiendung 
durch `.dng` ersetzt wird. 
Mit der `Choose Files` Schaltfläche können RAW Dateien direkt ausgewählt werden. 

Der Browser wird das Herunterladen gemäß seiner Download-Einstellungen machen, könnte also einen Dialog zeigen, wo jede einzelne 
Datei gespeichert werden soll, wenn er so eingestellt ist, oder alle Dateien ins Downloads Verzeichnis schreiben (unter Umständen mit 
Umbenennung), wenn er so eingestellt ist, oder, oder, oder...

Bedienung der Android-App, oder wenn die Konverter-Seite direkt im Browser von ImB geladen wird, sollte intuitiv sein. Für wen das nicht der Fall ist, bitte melden.

Bei der Konvertierung nach DNG werden die Zeitstempel-Metadaten gesetzt, wenn der Dateiname wie ein normaler I'm Back Dateiname 
aussieht, und OriginalRawFilename auf den Namen der RAW Eingabedatei. Somit können die DNG Dateien nach belieben 
benannt werden, ohne viel der ursprünglichen Daten zu verlieren.

Falls jemals das Original-RAW wieder benötigt wird (z.B. um es mit einer neueren Version nochmal zu konvertieren), ist das mit [imbdng2raw.html](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html) möglich.



## Verarbeitung des DNG

Nimm deine Lieblingssoftware dafür, z.B. darktable, lightroom, ufraw, rawtherapee etc.

Bitte **nicht** erwarten, dass die Bilder direkt okay sind. Ich werde es kaum  schaffen, alles ins DNG hineinzupacken, was alle möglichen 
Programme dafür erwarten. Zeit nehmen, die Farben mal richtig kriegen und dann den Rest. *Wenn jemand Erfahrung mit dem DNG-Dateiformat hat oder 
jemanden kennt, der helfen könnte - bitte Kontakt aufnehmen* z.B. über die 
[Discussion on pixls.us](https://discuss.pixls.us/t/converting-plain-raw-from-imback-to-dng/) für Darktable/RawSpeed oder 
I'm Back digital back [Developers Group on Facebook](https://www.facebook.com/groups/2812057398929350).

Eine starke grüne oder magentafarbige Tönung der Bilder sollte nicht mehr vorkommen! Wenn aber eine da ist, die sich **nicht** durch 
Farbkalibrierung/Farbmatrix/Weißabgleich entfernen lässt, könnte ein Beispielbild interessant sein.

Wenn in der Bildmitte ein rot hervorstechender Punkt ist (ImB 35mm/MF), muss eine manuelle Retusche erfolgen, oder im darktable die folgende Einstellung 
verwenden und dann einen Kreis manuell darumherum platziern.

Um den roten Punkt von vornherein zu vermeiden, eine größere Blende (kleine Blendenzahl) nehmen oder die normale PDLC Mattscheibe mit 
einer Fresnel-Scheibe von I'm Back oder einer Canon EG-xxx Mattscheibe verbinden.

![darktable Beispiel gegen roten Kreis](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png 
"darktable Beispiel gegen roten Kreis")


## Internationalisierung

Im Moment werden die Sprachen Englisch (EN), Japanisch (JA) und Deutsch (DE) unterstützt. Wenn man die imbraw2dng.js-Datei mit geändertem Namen
als `imbraw2dng_XX.js` abspeichert, wobei `XX` das Sprachkürzel ist, arbeitet die Seite direkt in dieser Sprache. Wenn
du beim Übersetzen helfen magst, übersetze die Seite, die du gerade liest oder schau [hier](https://shyrodgau.github.io/imbraw2dng/translations.xls) und nimm Kontakt
auf.

Z.B. [historische deutsche Version](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.html), [historische japanische Version](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_ja.html) (gleiche Dateien, nur anderer Name). 

## Kommandozeile mit node.js

Sofern man [node.js](https://nodejs.org) in Version &ge; V20.10(LTS) hat, kann man die Konvertierung auf der Kommandozeile durchführen. Hierzu die Datei 
[imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) verwenden. Kann wie bei 
[Internationalisierung](#internationalisierung) beschrieben umbenannt werden. Hilfe zum Aufruf z.B. mit `node imbraw2dng.js` oder 
umbenannt auf Deutsch `node imbraw2dng_de.js`.
```
Aufruf: node imbraw2dng_de.js [-l sprache] [-f | -r] [-d ordner] [-nc | -co] [-np] [-owb] [-ndcp] [-cr copyright] [-R] [-J] [-O] [-n yyyy_mm_dd-hh_mm_ss] [-fla | -flx] [ [--] <dateien-oder-ordner>* ]
Optionen:
 -h - diesen Hilfetext zeigen
 -nc - keinen farbigen Text zeigen
 -co - farbigen Text zeigen
 -l XX - wo XX ein gültiger Sprachcode ist (derzeit: DE, EN, JA)
         Die Sprache kann auch durch Umbenennen in imbraw2dng_XX.js geändert werden.
 -d ordner - Ausgabedateien in diesen Ordner ablegen
 -f - existierende Dateien überschreiben
 -r - Ausgabedatei umbenennen, falls schon existiert
 -np - Kein kleines Vorschaubild im DNG
 -owb - Alten konstanten Weißabgleich verwenden
 -ndcp - neues DCP Profil nicht einbetten
 -cr "copyright..." - Copyrightvermerk zum DNG dazufügen
 -at "autor..." - Autor/Ersteller zum DNG dazufügen
 -fla, -flx - mehrere Bilder als Langzeitbelichtung aufaddieren, flx skaliert dabei herunter
 -R - RAW von per WLAN verbundener ImB oder übergebenen Verzeichnissen konvertieren
 -J - JPEG von per WLAN verbundener ImB oder übergebenen Verzeichnissen kopieren
 -O - Nicht-JPEG/Nicht-RAW von per WLAN verbundener ImB oder übergebenen Verzeichnissen kopieren
 -da rightigerzeitstempel=kamerazeitstempel - korrigiere Zeit (Format yyyy_mm_dd-hh_mm_ss)
 -n yyyy_mm_dd-hh_mm_ss (oder beliebig langer Anfang davon) - nur Dateien neuer als dieser Zeitstempel von ImB oder übergebenen Verzeichnissen holen
 -----
 -- - weitere Parameter als lokale Dateien oder Ordner betrachten
 <dateien-oder-ordner> - lokale Dateien oder Ordner rekursiv (z.B. von der MicroSD Karte aus ImB) verarbeiten
```

Bezüglich Konfigurierbarkeit siehe [imbraw2dng.json](imbraw2dng.json).


## Tipps, Tricks, Interna und Details

### Metadaten, EXIF

Die EXIF Daten in den JPEG Bildern von ImB sind nur eingeschränkt nützlich, da sie die Perspektive vom ImB Sensor abbilden. Aber wenn sie in den DNG Dateien drin gewünscht werden, ist das möglich. Zuerst das JPEG und dann das passende RAW verarbeiten.
"Passend" ist definiert als: Zeitunterschied < 5 sec. und Unterschied des Zähler (letzter Teil des Dateinamens) &lt;= eins. Muss nicht direkt aufeinanderfolgend sein, erst alle JPEGs und dann die RAWs sollte tun.

Es können für alle Bilder Metadaten Autor/Ersteller und Copyright sowie pro Bild eine Beschreibung (&#x270e;&#xfe0e;) direkt gesetzt werden.

Zeitkorrektur kann automatisch mitgemacht werden (&#x231a;&#xfe0e;).

### Lange Aufnahme simulieren<a name="a-lot-more-tricks-and-details"> </a>

Wenn du eine lange Aufnahme durch mehrere kürzere simulieren willst, und das spezifische Rauschen zu vermeiden, geht das bei node.js mit den `-fla`/`-flx` Parametern.
Oder im HTML das Häkchen unter dem blauen Bereich setzen und dann die aufzuaddierenden RAW-Dateien zusammen in das blaue Feld ziehen und ablegen.   
In der Android App müssen die RAWs zunächst nach DNG konvertiert werden. Dann die zu addierenden DNG Dateien auswählen und mit der ImB OS App teilen.

### Zurück nach RAW

Um mit der App die ursprüngliche RAW Datei aus einer original konvertierten DNG-Datei zu bekommen, jeweils genau eine DNG-Datei mit der ImB OS App teilen.

Oder [imbdng2raw.html](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html) oder [imbdng2raw.js](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js) nehmen.


### iPhone

Die Android App besteht aus dem HTML/Javascript Code der Seiten, mit Apache Cordova verpackt. Eine IOS App sollte sich damit auch bauen lassen, allerdings habe ich weder Mac noch iphone. Wenn jemand helfen möchte?

[Würde ungefähr so aussehen](https://www.facebook.com/groups/imbackofficial/posts/1656635048623845/?__cft__[0]=AZUQGC5WjATUlof9OXx2kE7BZLYYyqvhqUxhPdWTr9FO4NQBNIas8aA9MyhgNrgwVi49RuFZHBUUa-BH2mrAIYT1HQ8NRqvdRuaopAgHHT71hD1ZsDm4yuag3Lez_Ok74OVOYIY2tGymh9nIzngaZ9bCO0_dj-dGBLbPSxlXcZJc5g&__tn__=%2CO%2CP-R)

### Vergleiche

Bezüglich  `IMBAPP.HTM` und der Original App:    
Vorteile gegenüber der [APP von ImB](https://imback.eu/home/app/):
- auf jedem Browser benutzbar
- kann raw anzeigen
- konvertiert beim Herunterladen raw nach DNG
- kann auch offline für lokale Dateien benutzt werden

Nachteile gegenüber APP vom ImB:
- Keine Funktion für Live-Bild bei Video eingebaut
- Lokales Album auf Smartphone/PC/Mac kann nicht betrachtet werden
- kein knuffiger Kerl guckt dich an

Unterschiede gegenüber APP von ImB:
- Zeit wird nicht bei jeder Verbindung einstellt, muss manuell aus Menü gewählt werden (oder in Einstellungen auf automatisch ändern)   
(vorteilhaft bei ImB Film, weil Zeit setzen immer 0 Uhr setzt)

<!--Vorteile gegenüber historischem `imbraw2dng.html`, wenn es auf ImB benutzt wird:
- Kann die Zeit auf ImB setzen
- Kann Bilder und Videos aufnehmen
- JPEG Vorschau schneller
- Bildparameter (Größe, Belichtungskorrektur etc.) können gesetzt werden
-->

### etc.

Persönliche Voreinstellungen können für node.js in einer Konfigurationsdatei (siehe oben) gespeichert werden, oder im Webbrowser falls die Seite vom Netz geladen wurde (Internet oder von ImB).

Anschauen des Codes ist gern erwünscht.

## <a name="fmt">  </a>Formate

30607488 B = 5216 x 3912 (12bpp) = Film

15335424 B = 4608 x 3328 = 35mm

7667520 B = 3260 x 2352 = 35mm Small-angle

11618752 B = 4012 x 2896 = 35mm Medium-angle

11943936 B = 3456 x 3456 = MF6x6

12937632 B = 4152 x 3116 = MF6x4.5

6470944 B = 2936 x 2204 = MF6x4.5 Small-angle

9806592 B = 3616 x 2712 = MF6x4.5 Medium-angle

15925248 B = 4608 x 3456 = MF6x7

14065920 B = 4320 x 3256 = unknown historic

------------------------------------

## Credits

Besonderer Dank an:

**Michele Asciutti** - der erste, der das Farbfilter-Muster von ImBack decodiert hat

**Sadami Inoue** - Übersetzungen nach Japanisch

**Samuel Mello Medeiros** - Erfinder von ImBack
