<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - Konvertierung von RAW-Dateien von [I'mBack<sup>&reg;</sup>&nbsp;35mm/MF](https://imback.eu) nach DNG - Schnelleinstieg

Dies ist freie Software ([0-Klausel-BSD-Lizenz](LICENSE.txt)) ohne kommerzielle Unterstützung.

Mehr Doku: [hier](https://shyrodgau.github.io/imbraw2dng/moredoc_de)

or [IN ENGLISH](https://shyrodgau.github.io/imbraw2dng/)  
 [日本語](https://shyrodgau.github.io/imbraw2dng/README_ja)

Es sind keine "Schwarz-Weiß RAW"-Dateien, sondern die echten Roh-Sensordaten mit der Farbfilterung darauf (leider aber nur 8 bit...). 

Die Seite kann inzwischen auch Teilfunktionen (teils auch mehr - nämlich RAW anzeigen) der Mobiltelefon App.

Aktuell scheint es für die aktuellen Firmwares auf 35mm (auch für "Winkel Mittel" und "klein") und auf I'm Back MF (Mittelformat) zu funktionieren. 
Für MF sind nicht alle Winkel-Einstellungen abgedeckt. Wenn du sie brauchst und ein bisschen mithelfen magst, nimm Kontakt auf.

Probleme und Ideen können auch unter "[Issues](https://github.com/shyrodgau/imbraw2dng/issues)" oder "[Discussions](https://github.com/shyrodgau/imbraw2dng/discussions)"  
des [github Repositorys](https://github.com/shyrodgau/imbraw2dng) oder in der [I'm Back Users Gruppe auf Facebook](https://www.facebook.com/groups/1212628099691211) diskutiert werden.

## Grundlagen ;tldr

Im Folgenden liegt der Fokus darauf, während des Kopierens die RAW-Dateien ins DNG-Format umzuwandeln.
Es wird je nur eine Datei für Benutzung im Browser und/oder eine Datei für Benutzung mit node.js gebraucht.

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

## Verarbeitung des DNG

Nimm deine Lieblingssoftware dafür, z.B. darktable, lightroom, ufraw, rawtherapee etc.

Bitte **nicht** erwarten, dass die Bilder direkt okay sind. Ich werde es kaum  schaffen, alles ins DNG hineinzupacken, was alle möglichen 
Programme dafür erwarten. Zeit nehmen, die Farben mal richtig kriegen und dann den Rest. *Wenn jemand Erfahrung mit dem DNG-Dateiformat hat oder 
jemanden kennt, der helfen könnte - bitte Kontakt aufnehmen* z.B. über die 
[Discussion on pixls.us](https://discuss.pixls.us/t/converting-plain-raw-from-imback-to-dng/) für Darktable/RawSpeed oder 
I'm Back digital back [Developers Group on Facebook](https://www.facebook.com/groups/2812057398929350).

Eine starke grüne oder magentafarbige Tönung der Bilder sollte nicht mehr vorkommen! Wenn aber eine da ist, die sich **nicht** durch 
Farbkalibrierung/Farbmatrix/Weißabgleich entfernen lässt, könnte ein Beispielbild interessant sein.

**Ein Wort zu den Farben:** Ich habe keine Ahnung davon...

Wenn in der Bildmitte ein rot hervorstechender Punkt ist, muss eine manuelle Retusche erfolgen, oder im darktable die folgende Einstellung 
verwenden und dann einen Kreis manuell darumherum platziern.

Um den roten Punkt von vornherein zu vermeiden, eine größere Blende (kleine Blendenzahl) nehmen oder die normale PDLC Mattscheibe mit 
einer Fresnel-Scheibe von I'm Back oder einer Canon EG-xxx Mattscheibe verbinden.

![darktable Beispiel gegen roten Kreis](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png 
"darktable Beispiel gegen roten Kreis")

