<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - Konvertierung von RAW-Dateien von [I'mBack<sup>&reg;</sup>&nbsp;35mm/MF](https://imback.eu) nach DNG

Dies ist freie Software ([0-Klausel-BSD-Lizenz](LICENSE.txt)) ohne kommerzielle Unterstützung.

Hier gibts: [Installation](#installation) - [Internationalisierung](#internationalisierung) -    
[Benutzung](#benutzung) - [Gucken auf ImBack selbst](#gucken-auf-imback-selbst) - [Per Kommandozeile mit node.js](#kommandozeile-mit-nodejs) - [Wie funktioniert es](#wie-funktioniert-es)

Kurz-Doku: [hier](https://shyrodgau.github.io/imbraw2dng/README_de)

or [IN ENGLISH](https://shyrodgau.github.io/imbraw2dng/moredoc)

## Installation

Die aktuelle Version ist [V3.4.0_c322e96 - Überarbeitung](https://github.com/shyrodgau/imbraw2dng/releases/tag/V3.3.0_2087006). 
Anmerkung: Weiterentwicklung wenn Fehler gefunden, neue Übersetzung beigesteuert, oder neues Bildformat.

Die Datei [imbraw2dng.html](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.html) auf den PC kopieren oder aus der 
Version "Source code".zip oder .tar.gz auspacken und im Lieblingsbrowser öffnen (alles halbwegs aktuellen sollten gehen).

Wenn eine lokale Installation nicht möglich ist, kann es vom Netzwerk wie von [meiner github Seite](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_de.html) 
(sollte immer die neueste Version sein) oder [von deinem ImB](#gucken-auf-imback-selbst) oder von [imback.eu](https://imback.eu/home/im-back-raw-dng-converter-ib35/) 
(mit automatisierter Übersetzung in andere Sprachen, aber vielleicht nicht immer aktuell) genommen werden. Die Bilddaten bleiben auf jeden Fall im Browser.

Für [node.js](#kommandozeile-mit-nodejs) wird nur die Javascript-Datei [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) gebraucht.

Das github Repository ist [hier](https://github.com/shyrodgau/imbraw2dng).

### Internationalisierung

Im Moment werden die Sprachen Englisch (EN), Französisch (FR) und Deutsch (DE) unterstützt. Wenn man die HTML-Datei mit geändertem Namen
als `imbraw2dng_XX.html` abspeichert, wobei `XX` das Sprachkürzel ist, öffnet sich die Seite direkt in dieser Sprache. Wenn
du beim Übersetzen helfen magst, übersetze die Seite, die du gerade liest oder schau [hier](https://shyrodgau.github.io/imbraw2dng/translations.xls) und nimm Kontakt
auf.

Wenn man [node.js](https://nodejs.org) Version &ge; V20.10(LTS) hat, kann man die Datei [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js), 
unter dem Namen `imbraw2dng_00.js` abspeichern und `node imbraw2dng_00.js -CSV > meinetexte.csv` aufrufen, um eine aktuelle Textliste für Übersetzung zu bekommen.


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
Aufruf: node imbraw2dng_de.js [-l sprache] [-f] [-d ordner] [-nc | -co] [-R] [-J] [-O] [-n yyyy_mm_dd-hh_mm_ss] [ [--] <dateien-oder-ordner>* ]
Optionen:
 -h - diesen Hilfetext zeigen
 -nc - keinen farbigen Text zeigen
 -co - farbigen Text zeigen
 -l XX - wo XX ein gültiger Sprachcode ist (derzeit: DE, EN, FR)
         Die Sprache kann auch durch Umbenennen in imbraw2dng_XX.js geändert werden.
 -d ordner - Ausgabedateien in diesen Ordner ablegen
 -f - existierende Dateien überschreiben
 -R - RAW von per WLAN verbundener ImB oder übergebenen Verzeichnissen konvertieren
 -J - JPEG von per WLAN verbundener ImB oder übergebenen Verzeichnissen kopieren
 -O - Nicht-JPEG/Nicht-RAW von per WLAN verbundener ImB oder übergebenen Verzeichnissen kopieren
 -n yyyy_mm_dd-hh_mm_ss (oder beliebig langer Anfang davon) - nur Dateien neuer als dieser Zeitstempel von ImB oder übergebenen Verzeichnissen holen
 -----
 -- - weitere Parameter als lokale Dateien oder Ordner betrachten
 <dateien-oder-ordner> - lokale Dateien oder Ordner rekursiv (z.B. von der MicroSD Karte aus ImB) verarbeiten
```

## Wie funktioniert es?

DNG ist ein auf TIFF basierendes Dateiformat, das hauptsächlich konstante Daten um die ursprünglichen Bilddaten herum hat. Die Unterschiede hängen 
ab von Breite und Höhe (die explizit drinstehen, sowie sich auf viele Offsets auswirken, die von der Gesamtlänge abhängen) sowie der Dateiename 
(OriginalRawFilename Tag). Falls das Datum von ImB Dateinamen gültig aussieht, werden die Tags dafür (EXIFTAG_DATETIMEORIGINAL, TIFFTAG_DATETIME) 
eingebaut. Bei Dateien von MF ist die Farbfilter-Matrix (Color Filter Array) anders.
