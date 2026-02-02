<!-- SPDX-License-Identifier: 0BSD -->
<!-- pandoc -f markdown -t html -o README_de.html README_de.md -->
# imbraw2dng - Konvertierung von RAW-Dateien von [I'mBack<sup>&reg;</sup>](https://imback.eu) MiMi nach DNG

Das meiste ist freie Software ([0-Klausel-BSD-Lizenz](LICENSE.txt)) ohne kommerzielle Unterstützung.

or [IN ENGLISH&#x1f1ec;&#x1f1e7;](https://shyrodgau.github.io/imbraw2dng/README_MiMi)  
 [日本語&#x1f1ef;&#x1f1f5;](https://shyrodgau.github.io/imbraw2dng/README_MiMi_ja)   
 [**&rarr;35/MF/Film&larr;**](https://shyrodgau.github.io/imbraw2dng/README_de)
 
## Hier gibts:

[Los gehts](#getstarted) - [Benutzung](#usage) - [Verarbeitung des DNG](#processingdng) - [Metadata/Exif](#metaexif) - [Credits](#credits) - u.v.a.m

- [**&#x261e;**`imbapp.htm`](https://shyrodgau.github.io/imbraw2dng/imbapp.htm)  - App-artiger Konverter für Browser von Festplatte, Internet oder direkt von ImB    
auch in verschiedenen Sprachen als `imbapp_XX.htm` (siehe [Internationalisierung](#internationalisierung))   
Kann auch rückwärts von dng nach raw.

- [**&#x261e;**`imbapp.apk`](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk) - Echte Android App. Für Apple, [hier](#iphone) schauen.

- [**&#x261e;**`imbraw2dng.js`](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) - Node.js Version für Benutzung auf der Kommandozeile   
auch in verschiedenen Sprachen als `imbraw2dng_XX.js` (siehe [Internationalisierung](#internationalisierung))

<!--- [**&#x261e;**`imbraw2dng.html`](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.html) - Historische Version    
auch in verschiedenen Sprachen als `imbraw2dng_XX.html` (siehe [Internationalisierung](#internationalisierung))-->

- Kalibrierte [Kameraprofile zum Herunterladen](https://shyrodgau.github.io/imbraw2dng/profiles/README) für ImB

- [**&#x261e;**`imbdng2raw.js`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js)
von DNG nach RAW zurück konvertieren, nur für originale hiermit nach DNG konvertierte Dateien
 
Es sind keine "Schwarz-Weiß RAW"-Dateien, sondern die echten Roh-Sensordaten mit der Farbfilterung darauf (leider aber nur 8 bit bei 35mm und MF, 12 bit bei Film und MiMi). 

DNG (Adobe&reg; Digital NeGativ) ist offenes Dateiformat, das hauptsächlich aus den ursprünglichen Bilddaten besteht. 

Probleme und Ideen können auch unter "[Issues](https://github.com/shyrodgau/imbraw2dng/issues)" oder "[Discussions](https://github.com/shyrodgau/imbraw2dng/discussions)"
des [github Repositorys](https://github.com/shyrodgau/imbraw2dng) oder in der [I'm Back Users Gruppe auf Facebook](https://www.facebook.com/groups/1212628099691211) diskutiert werden.

## <a id="getstarted" name="getstarted">  </a>Los gehts

Wenn jemand **Android** benutzt, probiert die [Android app](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk), mit dem Androiden im (oder nicht im) ImB WLAN.

Wenn es jemand auf dem PC oder Smartphone im **Browser** verwenden möchte, folgende Möglichkeiten (Alle Daten bleiben im Browser!):

- die Datei [**&#x261e;**`imbapp_de.htm`](https://shyrodgau.github.io/imbraw2dng/imbapp_de.htm) direkt im Internet benutzen oder auf die Festplatte oder sonstwohin kopieren.   
Manche Browser (sogar auf Handys) bieten an, es als PortableWebApp zu installieren (leicht offline zu finden). Das könnte sich auch unter "Zum Desktop dazufügen" o.ä. verbergen.
In diesem Fall müssen die Dateien von ImB per USB, Micro SD Adapter, original App oder sonstwie geholt werden.

- <a id="browsing-on-the-imback" name="browsing-on-the-imback">  </a>wenn man diese Datei auf die MicroSD vom ImB schiebt, ([wie macht man das?](#wie-kopiere-ich-html-dateien-auf-die-microsd)), kann Holen und Konvertieren nach DNG zusammengefasst werden
(JPG und Filme können auch geholt werden, kann auch die Zeit einstellen, Dateien löschen und Bilder und Video aufnehmen!).   
`http://192.168.1.254/NOVATEK/IMBAPP.HTM`    
Das Gerät, auf dem die Seite geöffnet wird, muss im ImB WLAN sein.


Wenn man gerne **Kommandozeile** verwendet, kann [imbraw2dng_de.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.js) mit node.js verwendet werden. Das kann auch direkt auf die Dateien von ImB zugreifen, wenn
man im WLAN ist. [Kommandozeilen-Doku](#kommandozeile-mit-nodejs)

## Wie kopiere ich HTML Dateien auf die MicroSD?

.... wenn man direkt mit dem Browser per WLAN von ImB herunterladen/konvertieren möchte.

#### Android

Die [echte App](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk) installieren, dann ins ImB WLAN und Extras Menü schauen.

#### Mit einem Micro SD Kartenleser/Adapter oder USB-Kabel
Die Micro SD aus der ImB entnehmen und in (einen Adapter am) Computer stecken, oder Computer und ImB via USB verbinden und auf ImB `Massenspeicher` wählen.    
Inhalt der Micro SD/USB-Laufwerk öffnen, könnte `VOLUME1`  oder `0000-0001` heißen und müsste einen Ordner namens `NOVATEK` oder `novatek` enthalten.  
Mit dem Dateiexplorer oder Betriebssystem die [heruntergeladene Datei `imbapp.htm`](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbapp.htm) in diesen `NOVATEK` Ordner kopieren.    
Micro SD aus dem Computer auswerfen und wieder ins ImB stecken - fertig.    

#### Per Netzwerk
Smartphone oder Computer in das ImB WLAN stecken.    
Neues Browserfenster (oder Registerkarte) verwenden, um auf  [http://192.168.1.254/NOVATEK/](http://192.168.1.254/NOVATEK/) zu navigieren.    
`Datei auswählen` klicken und die gerade [heruntergeladene `imbapp.htm`](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbapp.htm) auswählen. Auf `upload file` (exakter Wortlaut muss geprüft werden) - fertig!    

## <a id="usage" name="usage"> </a>Benutzung

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
benannt werden, ohne <strike>viel</strike> irgendwas der ursprünglichen Daten zu verlieren.

Falls jemals das Original-RAW wieder benötigt wird (z.B. um es mit einer neueren Version nochmal zu konvertieren), <a href="#revert-to-raw"> siehe hier </a>.

![](https://shyrodgau.github.io/imbraw2dng/helpstuff/usercontrols.png "Bedienelemente")

1: <span style="font-weight:bold;">&#x22ee;</span> Menü    
2: Batteriefüllstand (wenn mit ImB verbunden)    
3: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f5d1;&#xfe0e;</span> Ausgewählte Löschen (wenn mit ImB verbunden)    
4: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x2b73;&#xfe0e;</span> Ausgewählte Herunterladen/Konvertieren (nur Bild-Browser)    
5: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f3d4;&#xfe0e;</span> Bild-Browser (wenn Bilder geladen)    
6: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f4f7;&#xfe0e;</span> Fotos aufnehmen (wenn mit ImB verbunden)    
7: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f4fd;&#xfe0e;</span> Video aufnehmen (wenn mit ImB verbunden)    
8: Gruppierung (nur Bild-Browser)         
9: Sortierung (nur Bild-Browser)    
10: Alle/Keine auswählen (nur Bild-Browser)    
11: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f5c2;&#xfe0e;</span> Datei-Auswahl (wenn nicht mit ImB verbunden. Dateien mit der App teilen geht immer)    
12: &#x2b73;&#xfe0e; dieses Herunterladen/Konvertieren    
13: &#x2b6e;&#xfe0e; im Uhrzeigersinn drehen (wenn RAW)  
14: &#x2b6f;&#xfe0e; gegen den Uhrzeigersinn drehen (wenn RAW)   
15: &#x231a;&#xfe0e; Zeitstempel korrigieren     
16: raw JPEG herunterladen (sofern konfiguriert und RAW)    
17: &#x1f5d1;&#xfe0e; Löschen   
18: Dieses auswählen für Aktion im Bild-Browser   
19: &#x270e;&#xfe0e; Beschreibung setzen (wenn RAW)    
20: &#x1f50d;&#xfe0e; Vergrößerte Ansicht


## <a id="processingdng" name="processingdng">  </a>Verarbeitung des DNG

Nimm deine Lieblingssoftware dafür, z.B. darktable, lightroom, ufraw, rawtherapee etc.


Bitte **nicht** erwarten, dass die Bilder direkt okay sind.
Die Farben mal richtig kriegen und dann den Rest. *Wenn jemand Erfahrung mit dem DNG-Dateiformat hat oder 
jemanden kennt, der helfen könnte - bitte Kontakt aufnehmen* z.B. über die 
[Discussion on pixls.us](https://discuss.pixls.us/t/converting-plain-raw-from-imback-to-dng/) für Darktable/RawSpeed oder 
I'm Back digital back [Developers Group on Facebook](https://www.facebook.com/groups/2812057398929350).    


## Internationalisierung

Im Moment werden die Sprachen Englisch (EN), Japanisch (JA) und Deutsch (DE) unterstützt. Wenn man die imbraw2dng.js-Datei mit geändertem Namen
als `imbraw2dng_XX.js` abspeichert, wobei `XX` das Sprachkürzel ist, arbeitet die Seite direkt in dieser Sprache. **Wenn
du beim Übersetzen helfen magst, übersetze die Seite, die du gerade liest oder schau [hier](https://shyrodgau.github.io/imbraw2dng/translations.xls) und nimm Kontakt
auf.**

Z.B. [deutsche Version](https://shyrodgau.github.io/imbraw2dng/imbapp_de.htm), [japanische Version](https://shyrodgau.github.io/imbraw2dng/imbapp_ja.htm) (gleiche Dateien, nur anderer Name). 

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
 -np - Kein kleines Vorschaubild im DNG
 -owb - Alten konstanten Weißabgleich verwenden
 -ndcp - neues DCP Profil nicht einbetten
 -cr "copyright..." - Copyrightvermerk zum DNG dazufügen
 -at "autor..." - Autor/Ersteller zum DNG dazufügen
 -fla, -flx - mehrere Bilder als Langzeitbelichtung aufaddieren, flx skaliert dabei herunter
 -j - JPEG Behandling: 1: herunterladen, 2: exif für dng nehmen, 3: beides (default)
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

### <a id="metaexif" name="metaexif">  </a>Metadaten, EXIF

Die EXIF Daten in den JPEG Bildern von ImB sind bei MiMi nützlich. Wenn sie in den DNG Dateien drin gewünscht werden, ist das möglich.    
Zuerst das JPEG und dann das passende RAW verarbeiten (im gleichen Lauf).
"Passend" ist definiert als: Zeitunterschied < 5 sec. und Unterschied des Zähler (letzter Teil des Dateinamens) &lt;= eins. Muss nicht direkt aufeinanderfolgend sein, erst alle JPEGs und dann die RAWs sollte tun.

Es können für alle Bilder Metadaten Autor/Ersteller und Copyright sowie pro Bild eine Beschreibung (&#x270e;&#xfe0e;) direkt gesetzt werden.

Zeitkorrektur kann automatisch mitgemacht werden (&#x231a;&#xfe0e;).

### Lange Aufnahme simulieren<a id="a-lot-more-tricks-and-details" name="a-lot-more-tricks-and-details"> </a>

Wenn du eine lange Aufnahme durch mehrere kürzere simulieren willst, und das spezifische Rauschen zu vermeiden, geht das bei node.js mit den `-fla`/`-flx` Parametern.
Oder im HTML das Häkchen unter dem blauen Bereich setzen und dann die aufzuaddierenden RAW- oder DNG-Dateien zusammen in das blaue Feld ziehen und ablegen.   
In der Android App müssen die RAWs zunächst nach DNG konvertiert werden. Dann die zu addierenden DNG Dateien (&gt;1) auswählen und mit der ImB OS App teilen.

### <a id="revert-to-raw" name="revert-to-raw"> </a>Zurück nach RAW

Um mit der App die ursprüngliche RAW Datei aus einer original konvertierten DNG-Datei zu bekommen(z.B. um es mit einer neueren Version nochmal zu konvertieren), jeweils genau eine DNG-Datei mit der ImB OS App teilen.

Oder die normale imbapp Seite nehmen und das entsprechende Häkchen setzen.

Oder [imbdng2raw.js](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js) nehmen.


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

## <a id="fmt" name="fmt">  </a>Formate

18000000 B = 4000 x 3000 (12bpp) = MiMi

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

## <a id="credits" name="credits">  </a>Credits

Besonderer Dank an:

**Michele Asciutti** - der erste, der das Farbfilter-Muster von ImBack decodiert hat

**Sadami Inoue** - Übersetzungen nach Japanisch

**Samuel Mello Medeiros** - Erfinder von ImBack
