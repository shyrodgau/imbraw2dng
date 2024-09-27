<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - Konvertierung von RAW-Dateien von [I'mBack<sup>&reg;</sup>](https://imback.eu) nach DNG

Das meiste ist freie Software ([0-Klausel-BSD-Lizenz](LICENSE.txt)) ohne kommerzielle Unterstützung.

or [IN ENGLISH](https://shyrodgau.github.io/imbraw2dng/)  
 [日本語](https://shyrodgau.github.io/imbraw2dng/README_ja)

 
## Hier gibts:

- `imbraw2dng.html` - [Original Konverter](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.html) für Browser von Festplatte, Internet oder direkt von ImB    
auch in verschiedenen Sprachen als `imbraw2dng_XX.html` (siehe [Internationalisierung](#internationalisierung))

- `imbapp.htm` - neue [app-artige Version davon](https://shyrodgau.github.io/imbraw2dng/imbapp.htm)

- `imbapp.apk` - [Echte Android App](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk)

- [`imbraw2dng.js`](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) - Node.js Version für Benutzung auf der Kommandozeile   
auch in verschiedenen Sprachen als `imbraw2dng_XX.js` (siehe [Internationalisierung](#internationalisierung))

- Kalibrierte [Kameraprofile zum Herunterladen](cameraprofiles.md) für ImB

- [`imbdng2raw.html`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html), [`imbdng2raw.js`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js)
von DNG nach RAW zurück konvertieren, nur für originale hiermit nach DNG konvertierte Dateien
 
Es sind keine "Schwarz-Weiß RAW"-Dateien, sondern die echten Roh-Sensordaten mit der Farbfilterung darauf (leider aber nur 8 bit bei 35mm und MF, 12 bit bei Film). 

DNG ist ein auf TIFF basierendes Dateiformat, das hauptsächlich konstante Daten um die ursprünglichen Bilddaten herum hat. 
Bei Dateien von MF und Film ist die Farbfilter-Matrix (Color Filter Array) anders.
Bei der Konvertierung nach DNG werden die Zeitstempel-Metadaten gesetzt, wenn der Dateiname wie ein normaler I'm Back Dateiname 
aussieht (also `JJJJ_MMDD_hhmmss`), und OriginalRawFilename auf den Namen der RAW Eingabedatei. Somit können die DNG Dateien nach belieben 
benannt werden, ohne viel der ursprünglichen Daten zu verlieren.

Probleme und Ideen können auch unter "[Issues](https://github.com/shyrodgau/imbraw2dng/issues)" oder "[Discussions](https://github.com/shyrodgau/imbraw2dng/discussions)"  
des [github Repositorys](https://github.com/shyrodgau/imbraw2dng) oder in der [I'm Back Users Gruppe auf Facebook](https://www.facebook.com/groups/1212628099691211) diskutiert werden.

## Los gehts

Wenn jemand Android benutzt, probiert die [Android app](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk)

Wenn es jemand auf dem PC oder Smartphone im Browser verwenden möchte, folgende Möglichkeiten:

- eine (oder beide) [neuere `IMBAPP.HTM`](https://shyrodgau.github.io/imbraw2dng/imbapp.htm) oder [klassiche `IMBRAW2DNG.HTML`](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.html)   
direkt im Internet benutzen oder auf die Festplatte oder sonstwohin kopieren.    
(**Alle Daten bleiben im Browser!**)   
In diesem Fall müssen die Dateien von ImB per USB, Micro SD Adapter, original App oder sonstwie geholt werden.

- <a name="gucken-auf-imback-selbst"> wenn man diese Datei(en) auf die MicroSD vom ImB schiebt, ([wie macht man das?](#wie-kopiere-ich-html-dateien-auf-die-microsd)), kann Holen und Konvertieren nach DNG zusammengefasst werden (JPG und Filme können auch geholt werden).   
`http://192.168.1.254/IMBACK/IMBAPP.HTM` (neuer, kann auch die Zeit einstellen und Bilder und Video aufnehmen!) oder   
`http://192.168.1.254/IMBACK/IMBRAW2DNG.HTML`  (klassisch, nur herunterladen und konvertieren)   
**Das Gerät, auf dem die Seite geöffnet wird, muss im ImB WLAN sein.**


Wenn man gerne Kommandozeile verwendet, kann [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.js) mit node.js verwendet werden. Das kann auch direkt auf die Dateien von ImB zugreifen, wenn
man im WLAN ist. [Kommandozeilen-Doku](#kommandozeile-mit-nodejs)

## Wie kopiere ich HTML Dateien auf die MicroSD?

#### Android

Die [echte App](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk) installieren und Extras Menü schauen.

#### Mit einem Micro SD Kartenleser/Adapter oder USB-Kabel

Die Micro SD aus der ImB entnehmen und in (einen Adapter am) Computer stecken, oder Computer und ImB via USB verbinden und auf ImB `Massenspeicher` wählen

Inhalt der Micro SD/USB-Laufwerk öffnen, könnte `VOLUME1`  oder `0000-0001` heißen und müsste einen Ordner namens `IMBACK` oder `imback` enthalten.  
Mit dem Dateiexplorer oder Betriebssystem die heruntergeladene Datei `imbapp.htm` in diesen `IMBACK` Ordner kopieren.  
<!--Und/oder diese Datei in `imbapp_de.html` umbenennen. (Achtung, `html` statt `htm`)-->

Micro SD aus dem Computer auswerfen und wieder ins ImB stecken - fertig.

#### Per Netzwerk

Smartphone oder Computer in das ImB WLAN stecken..

Neues Browserfenster (oder Registerkarte) verwenden, um auf  [http://192.168.1.254/IMBACK/](http://192.168.1.254/IMBACK/) zu navigieren.

`Datei auswählen` klicken und die gerade heruntergeladene `imbapp.htm` auswählen. Auf `upload file` (exakter Wortlaut muss geprüft werden) - fertig!


## Benutzung

Man kann alle Dateien vom I'm back (also von der in den PC gesteckten micro-SD-Karte oder dem USB Massenspeicher) in das blaue Feld ziehen und ablegen. 
Dann werden nicht-RAW Dateien eins-zu-eins kopiert und die RAW-Dateien nach DNG konvertiert, wobei die `.raw`/`.RAW` Dateiendung 
durch `.dng` ersetzt wird. 
Mit der `Choose Files` Schaltfläche können RAW Dateien direkt ausgewählt werden. 

Der Browser wird das Herunterladen gemäß seiner Download-Einstellungen machen, könnte also einen Dialog zeigen, wo jede einzelne 
Datei gespeichert werden soll, wenn er so eingestellt ist, oder alle Dateien ins Downloads Verzeichnis schreiben (unter Umständen mit 
Umbenennung), wenn er so eingestellt ist, oder, oder, oder...

Bei der Konvertierung nach DNG werden die Zeitstempel-Metadaten gesetzt, wenn der Dateiname wie ein normaler I'm Back Dateiname 
aussieht (also `JJJJ_MMDD_hhmmss`), und OriginalRawFilename auf den Namen der RAW Eingabedatei. Somit können die DNG Dateien nach belieben 
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

Wenn in der Bildmitte ein rot hervorstechender Punkt ist, muss eine manuelle Retusche erfolgen, oder im darktable die folgende Einstellung 
verwenden und dann einen Kreis manuell darumherum platziern.

Um den roten Punkt von vornherein zu vermeiden, eine größere Blende (kleine Blendenzahl) nehmen oder die normale PDLC Mattscheibe mit 
einer Fresnel-Scheibe von I'm Back oder einer Canon EG-xxx Mattscheibe verbinden.

![darktable Beispiel gegen roten Kreis](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png 
"darktable Beispiel gegen roten Kreis")


## Internationalisierung

Im Moment werden die Sprachen Englisch (EN), Japanisch (JA) und Deutsch (DE) unterstützt. Wenn man die HTML-Datei mit geändertem Namen
als `imbraw2dng_XX.html` abspeichert, wobei `XX` das Sprachkürzel ist, öffnet sich die Seite direkt in dieser Sprache. Wenn
du beim Übersetzen helfen magst, übersetze die Seite, die du gerade liest oder schau [hier](https://shyrodgau.github.io/imbraw2dng/translations.xls) und nimm Kontakt
auf.

Wenn man [node.js](https://nodejs.org) Version &ge; V20.10(LTS) hat, kann man die Datei [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js), 
unter dem Namen `imbraw2dng_00.js` abspeichern und `node imbraw2dng_00.js -CSV > meinetexte.csv` aufrufen, um eine aktuelle Textliste für Übersetzung zu bekommen.


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
 -l XX - wo XX ein gültiger Sprachcode ist (derzeit: DE, EN, FR, JA)
         Die Sprache kann auch durch Umbenennen in imbraw2dng_XX.js geändert werden.
 -d ordner - Ausgabedateien in diesen Ordner ablegen
 -f - existierende Dateien überschreiben
 -r - Ausgabedatei umbenennen, falls schon existiert
 -np - Kein kleines Vorschaubild im DNG
 -owb - Alten konstanten Weißabgleich verwenden
 -ndcp - neues DCP Profil nicht einbetten
 -cr copyright - Copyrightvermerk zum DNG dazufügen
 -fla, -flx - mehrere Bilder als Langzeitbelichtung aufaddieren, flx skaliert dabei herunter
 -R - RAW von per WLAN verbundener ImB oder übergebenen Verzeichnissen konvertieren
 -J - JPEG von per WLAN verbundener ImB oder übergebenen Verzeichnissen kopieren
 -O - Nicht-JPEG/Nicht-RAW von per WLAN verbundener ImB oder übergebenen Verzeichnissen kopieren
 -n yyyy_mm_dd-hh_mm_ss (oder beliebig langer Anfang davon) - nur Dateien neuer als dieser Zeitstempel von ImB oder übergebenen Verzeichnissen holen
 -----
 -- - weitere Parameter als lokale Dateien oder Ordner betrachten
 <dateien-oder-ordner> - lokale Dateien oder Ordner rekursiv (z.B. von der MicroSD Karte aus ImB) verarbeiten
```

Bezüglich Konfigurierbarkeit siehe [imbraw2dng.json](imbraw2dng.json).


## Tipps, Tricks, Interna und Details

Bezüglich  `IMBAPP.HTM` und der Original App:    
Vorteile gegenüber der [APP von ImB](https://imback.eu/home/app/):
- auf jedem Browser benutzbar
- kann raw anzeigen
- konvertiert beim Herunterladen raw nach DNG
- kann wie imbraw2dng auch offline für Dateien benutzt werden

Nachteile gegenüber APP vom ImB:
- Keine Funktion für Live-Bild bei Video eingebaut
- Lokales Album auf Smartphone/PC/Mac kann nicht betrachtet werden
- kein knuffiger Kerl guckt dich an

Unterschiede gegenüber APP von ImB:
- Zeit wird nicht bei jeder Verbindung einstellt, muss manuell aus Menü gewählt werden

Vorteile gegenüber meinem klassischen `imbraw2dng.html`, wenn es auf ImB benutzt wird:
- Kann die Zeit auf ImB setzen
- Kann Bilder und Videos aufnehmen
- JPEG Vorschau schneller
- Bildparameter (Größe, Belichtungskorrektur etc.) können gesetzt werden


Nachteile gegenüber bisherigem imbraw2dng, wenn nicht auf ImB benutzt:
- schrittweise Verarbeitung gibt es nicht mehr, es wird entweder alles (wenn man Dateien auswählt) verarbeitet oder der Bild-Browser präsentiert (bei drag-and-drop)


Die EXIF Daten in den JPEG Bildern von ImB sind nur eingeschränkt nützlich, aber wenn sie in den DNG Dateien drin gewünscht werden, ist das möglich. Zuerst das JPEG und dann das passende RAW verarbeiten.
"Passend" ist definiert als: Zeitunterschied < 5 sec. und Unterschied des Zähler (letzter Teil des Dateinamens) eins. Muss nicht direkt aufeinanderfolgend sein, erst alle JPEGs und dann die RAWs sollte tun.

<a name="mehr-tricks-und-details">
Wenn du eine lange Aufnahme durch mehrere kürzere simulieren willst, und das spezifische Rauschen zu vermeiden, geht das bei node.js mit den `-fla`/`-flx` Parametern.
Oder im HTML das Häkchen unter dem blauen Bereich setzen und dann die aufzuaddierenden RAW-Dateien zusammen in das blaue Feld ziehen und ablegen.   
In der Android App funktioniert das im Moment nicht.

Persönliche Voreinstellungen können für node.js in einer Konfigurationsdatei (siehe oben) gespeichert werden, oder im Webbrowser falls die Seite vom Netz geladen wurde (Internet oder von ImB).

Anschauen des Codes ist gern erwünscht.

### iPhone

Die Android App besteht aus dem HTML/Javascript Code der Seiten, mit Apache Cordova verpackt. Eine IOS App sollte sich damit auch bauen lassen, allerdings habe ich weder Mac noch iphone. Wenn jemand helfen möchte?

------------------------------------

## Original Schnellanleitung klassisch


`.../IMBACK` ist das Verzeichnis auf der Micro SD Karte von ImB, zugänglich entweder per USB (`Massenspeicher` auf ImB auswählen), oder durch Einstecken der Micro SD Karte in PC oder Smartphone.

1. [imbraw2dng_de.html](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.html) im Browser öffnen. Dateien aus `.../IMBACK/PHOTO` und `.../IMBACK/MOVIE` Ordner in das blaue Feld ziehen. 
[(Details)](https://shyrodgau.github.io/imbraw2dng/moredoc_de#benutzung)

1. (Nachdem [imbraw2dng_de.html](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.html) in den `.../IMBACK` Ordner abgespeichert und Karte sauber ausgeworfen) PC oder Smartphone ins ImB WLAN hängen 
und dann [http://192.168.1.254/IMBACK/imbraw2dng_de.html](http://192.168.1.254/IMBACK/imbraw2dng_de.html) vom ImB im Browser öffnen. 
[(Details)](https://shyrodgau.github.io/imbraw2dng/moredoc_de#gucken-auf-imback-selbst)

1. [imbraw2dng_de.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.js) herunterladen und `node imbraw2dng_de.js .../IMBACK` aufrufen. 
[(Details)](https://shyrodgau.github.io/imbraw2dng/moredoc_de#kommandozeile-mit-nodejs)

1. PC ins WLAN von ImB verbinden, [imbraw2dng_de.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.js) herunterladen und `node imbraw2dng_de.js -R -J -O` aufrufen.
[(Details)](https://shyrodgau.github.io/imbraw2dng//moredoc_de#kommandozeile-mit-nodejs)

