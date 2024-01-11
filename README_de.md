# imbraw2dng - Konvertierung von RAW-Dateien von [I'm Back(R)](https://imback.eu) nach DNG

Dies ist freie Software ohne kommerzielle Unterstützung.

Hier gibts: [Installation](#installation) - [Internationalisierung](#internationalisierung) -    
[Benutzung](#benutzung) - [Gucken auf ImBack selbst](#gucken-auf-imback-selbst) - [Per Kommandozeile mit node.js](#kommandozeile-mit-nodejs) -   
[Verarbeitung des DNG](#verarbeitung-des-dng) - [Wie funktioniert es](#wie-funktioniert-es)


or [IN ENGLISH](https://github.com/shyrodgau/imbraw2dng/blob/master/README.md)

Es sind keine "Schwarz-Weiß RAW"-Dateien, sondern die echten Roh-Sensordaten mit der Farbfilterung darauf (leider aber nur 8 bit...). 

Die Seite kann inzwischen auch Teilfunktionen (teils auch mehr - nämlich RAW anzeigen) der Mobiltelefon App.

Aktuell scheint es für die aktuellen Firmwares auf 35mm (auch für "Winkel Mittel" und "klein") und auf MF I'm Back zu funktionieren. 
Für MF sind nicht alle Winkel-Einstellungen abgedeckt. Wenn du sie brauchst und ein bisschen mithelfen magst, nimm Kontakt auf.

Probleme und Ideen können auch in der [I'm Back Users Gruppe auf Facebook](https://www.facebook.com/groups/1212628099691211) diskutiert werden.

## Installation

Die aktuelle Version ist [V3.1.2_412bb89 - fixes](https://github.com/shyrodgau/imbraw2dng/releases/tag/V3.1.2_412bb89). 
Anmerkung: Weiterentwicklung wenn Fehler gefunden, neue Übersetzung beigesteuert, oder neues Bildformat.

Die Datei [imbraw2dng.html](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.html) auf den PC kopieren oder aus der 
Version "Source code".zip oder .tar.gz auspacken und im Lieblingsbrowser öffnen (alles halbwegs aktuellen sollten gehen).

Wenn eine lokale Installation nicht möglich ist, kann es vom Netzwerk wie von [meiner github Seite](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.html) 
(sollte immer die neueste Version sein) oder [von deinem ImB](#gucken-auf-imback-selbst) oder von [imback.eu](https://imback.eu/home/im-back-raw-dng-converter-ib35/) 
(mit automatisierter Übersetzung in andere Sprachen, aber vielleicht nicht immer aktuell) genommen werden. Die Bilddaten bleiben auf jeden Fall im Browser.

Für [node.js](#kommandozeile-mit-nodejs) wird nur die Javascript-Datei [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) gebraucht.

Das github Repository ist [hier](https://github.com/shyrodgau/imbraw2dng).

### Internationalisierung

Im Moment werden die Sprachen Englisch (EN) und Deutsch (DE) unterstützt. Wenn man die HTML-Datei mit geändertem Namen
als `imbraw2dng_XX.html` abspeichert, wobei `XX` das Sprachkürzel ist, öffnet sich die Seite direkt in dieser Sprache. Wenn
du beim Übersetzen helfen magst, schau [hier](https://shyrodgau.github.io/imbraw2dng/translations.xls) und nimm Kontakt
auf.

Wenn man [node.js](https://nodejs.org) Version &ge; V20.10(LTS) hat, kann man die Datei [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js), 
unter dem Namen `imbraw2dng_00.js` abspeichern und `node imbraw2dng_00.js -CSV > meinetexte.csv` aufrufen, um eine aktuelle Textliste für Übersetzung zu bekommen.


## Benutzung

Man kann alle Dateien vom I'm back (also von der in den PC gesteckten micro-SD-Karte) in das blaue Feld ziehen und ablegen. 
Dann werden nicht-RAW Dateien eins-zu-eins kopiert und die RAW-Dateien nach DNG konvertiert, wobei die `.raw`/`.RAW` Dateiendung 
durch `.dng` ersetzt wird. 
Mit der `Choose Files` Schaltfläche können RAW Dateien direkt ausgewählt werden. 

Der Browser wird das Herunterladen gemäß seiner Download-Einstellungen machen, könnte also einen Dialog zeigen, wo jede einzelne 
Datei gespeichert werden soll, wenn er so eingestellt ist, oder alle Dateien ins Downloads Verzeichnis schreiben (unter Umständen mit 
Umbenennung), wenn er so eingestellt ist, oder, oder, oder...

Bei der Konvertierung nach DNG werden die Zeitstempel-Metadatan gesetzt, wenn der Dateiname wie ein normaler I'm Back Dateiname 
aussieht (also `JJJJ_MMDD_hhmmss`), und OriginalRawFilename auf den Namen der RAW Eingabedatei. Somit können die DNG Dateien nach belieben 
benannt werden, ohne irgendwelche ursprünglichen Daten zu verlieren.

Neu: man kann Schritt-für-Schritt durchgehen und eine Vorschau der RAW-Datei dabei sehen. Hierzu das Häkchen bei `Single Step with preview` 
bzw. `Einzelschritt mit Vorschau`
einschalten. Bei jeder Datei kann entschieden werden, ob sie verarbeitet oder übersprungen werden soll und ob diese Aktion auch für 
alle folgenden Dateien der Auswahl durchgeführt werden soll. 


### Gucken auf ImBack selbst

Man kann die html-Datei (auch wegen [Internationalisierung](#internationalisierung) umbenannt) auf die micro-SD-Karte im ImBack kopieren, 
sagen wir mal in dan `IMBACK` Ordner. Dann den PC mit dem WLAN des ImBack verbinden und mit dem Browser auf 
[die Seite im Imback](http://192.168.1.254/IMBACK/imbraw2dng.html) (ggf. mit geändertem Namen) gehen.

Dann kann man direkt alle Dateien, die neuer als ein angegebener Zeitstempel sind, verarbeiten/kopieren, oder mit dem Bildbrowser alle 
Dateien auf dem ImBack nach Typ und/oder Zeitstempel ansehen. RAW- und JPEG-Bilder werden dabei angezeigt. Man kann Dateien auswählen, 
die man kopieren/herunterladen oder auch löschen möchte.

### Kommandozeile mit node.js

Sofern man [node.js](https://nodejs.org) in Version &ge; V20.10(LTS) hat, kann man die Konvertierung auf der Kommandozeile durchführen. Hierzu die Datei 
[imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) verwenden. Kann wie bei 
[Internationalisierung](#internationalisierung) beschrieben umbenannt werden. Hilfe zum Aufruf z.B. mit `node imbraw2dng.js` oder 
umbenannt auf Deutsch `node imbraw2dng_de.js`.
```
Aufruf: node imbraw2dng_de.js [-l sprache] [-f] [ -d ordner] [-nc] { [-R] [-J] [-O] [-n yy_mmdd_hhmmss] | [--] <dateien-oder-ordner> }   
Optionen:  
 -h - diesen Hilfetext zeigen   
 -nc - keinen farbigen Text zeigen   
 -l XX - wo XX ein gültiger Sprachcode ist (derzeit: DE, EN)   
         Die Sprache kann auch durch Umbenennen in imbraw2dng_XX.js geändert werden.   
 -d ordner - Ausgabedateien in diesen Ordner ablegen   
 -f - existierende Dateien überschreiben  
 -- - weitere Parameter als lokale Dateien oder Ordner betrachten
 -----   
 <dateien-oder-ordner> - lokale Dateien oder Ordner rekursiv (z.B. von der MicroSD Karte aus ImB) verarbeiten   
 -----   
 -R - RAW von per WLAN verbundener ImB konvertieren   
 -J - JPEG von per WLAN verbundener ImB kopieren   
 -O - Nicht-JPEG/Nicht-RAW von per WLAN verbundener ImB kopieren   
 -n yyyy_mmdd_hhmmss (oder beliebig langer Anfang davon) - nur Dateien neuer als dieser Zeitstempel von ImB holen   
 -----   
<dateien-oder-ordner> und -R/-J/-O/-n können nicht gleichzeitig verwendet werden.
```

## Verarbeitung des DNG

Nimm deine Lieblingssoftware dafür, z.B. darktable, lightroom, ufraw, rawtherapee etc.

Bitte **nicht** erwarten, dass die Bilder direkt okay sind. Ich werde es kaum  schaffen, alles ins DNG hineinzupacken, was alle möglichen 
Programme dafür erwarten. Zeit nehmen, die Farben mal richtig kriegen und dann den Rest. *Wenn jemand Erfahrung mit dem DNG-Dateiformat hat oder 
jemanden kennt, der helfen könnte - bitte Kontakt aufnehmen* z.B. über die 
[Discussion on pixls.us](https://discuss.pixls.us/t/converting-plain-raw-from-imback-to-dng/) für Darktable/RawSpeed oder 
I'm Back digital back [Developers Group on Facebook](https://www.facebook.com/groups/2812057398929350).

Eine starke grüne oder magentafarbige Tönung der Bilder sollte nicht mehr vorkommen! Wenn aber eine da ist, die sich **nicht** durch 
Farbkalibrierung/Farbmatrix/Weißabgleich entfernen lässt, könnte ein Beispielbild interessant sein.

**Ein Wort zu den Farben:** Der für mich richtige Weg, zu guten Farben zu kommen, besteht darin, mit der Farbkalibrierung/Farbmatrix anzufangen. 
Ich versuche, entsprechende Werte in die DNG-Datei hinenzubekommen, bin da aber nicht weit. Den Faktor grün/grün auf etwa 0,6..0,7 setzen. 
Damit sieht das Bild zunächst rötlich aus, weil der vorgegebene Weißabgleich da nicht dazu passt. Aber dann kann man mit dem Weißabgleich 
die Farben ordentlich hinzutzeln.  Beispielkonfigurationen wie die Änderung an der Matrix und ein halbwegs neutraler Weißabgleich in darktable aussehen sollten:

![darktable Beispiel grüne Farbmatrix](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_color_calib_ok.png 
"darktable Beispiel grüne Farbmatrix") 
![darktable Beispiel neutraler Weißabgleich ](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_neutral_white_balance.png 
"darktable Beispiel neutraler Weißabgleich")

Wenn in der Bildmitte ein rot hervorstechender Punkt ist, muss eine manuelle Retusche erfolgen, oder im darktable die folgende Einstellung 
verwenden und dann einen Kreis manuell darumherum platziern.

Um den roten Punkt von vornherein zu vermeiden, eine größere Blende (kleine Blendenzahl) nehmen oder die normale PDLC Mattscheibe mit 
einer Fresnel-Scheibe von I'm Back oder einer Canon EG-xxx Mattscheibe verbinden.

![darktable Beispiel gegen roten Kreis](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png 
"darktable Beispiel gegen roten Kreis")

## Wie funktioniert es?

DNG ist ein auf TIFF basierendes Dateiformat, das hauptsächlich konstante Daten um die ursprünglichen Bilddaten herum hat. Die Unterschiede hängen 
ab von Breite und Höhe (die explizit drinstehen, sowie sich auf viele Offsets auswirken, die von der Gesamtlänge abhängen) sowie der Dateiename 
(OriginalRawFilename Tag). Falls das Datum von ImB Dateinamen gültig aussieht, werden die Tags dafür (EXIFTAG_DATETIMEORIGINAL, TIFFTAG_DATETIME) 
eingebaut. Bei Dateien von MF ist die Farbfilter-Matrix (Color Filter Array) anders.
