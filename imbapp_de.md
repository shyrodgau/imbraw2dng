<!-- SPDX-License-Identifier: 0BSD -->
# imbapp - versuche die App zu ersetzen

or [in English](https://shyrodgau.github.io/imbraw2dng/imbapp)  
 [日本語](https://shyrodgau.github.io/imbraw2dng/imbapp_ja)

## Kurze Einführung

Vorteile gegenüber der [APP von ImB](https://imback.eu/home/app/):
- auf jedem Browser benutzbar
- kann raw anzeigen
- konvertiert beim Herunterladen raw nach DNG
- kann wie imbraw2dng auch offline für Dateien benutzt werden

Nachteile gegenüber APP vom ImB:
- Keine Funktion für Live-Bild eingebaut
- Lokales Album auf Smartphone/PC/Mac kann nicht betrachtet werden
- kein knuffiger Kerl guckt dich an

Vorteile gegenüber (meinem) [bisherigen imbraw2dng](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html), wenn es auf ImB benutzt wird:
- Kann die Zeit auf ImB setzen
- JPEG Vorschau schneller
- Bildparameter (Größe, Belichtungskorrektur etc.) können gesetzt werden


Nachteile gegenüber bisherigem imbraw2dng, wenn nicht auf ImB benutzt:
- schrittweise Verarbeitung gibt es nicht mehr, es wird entweder alles (wenn man Dateien auswählt) verarbeitet oder der Bild-Browser präsentiert (bei drag-and-drop)

## Ausprobieren

Die Datei [imbapp.htm](https://github.com/shyrodgau/imbraw2dng/raw/master/imbapp.htm) auf den Computer oder Smartphone herunterladen.

### Mit einem Micro SD Kartenleser/Adapter

Die Micro SD aus der ImB entnehmen und in (einen Adapter am) Computer stecken. Wenn keiner da, müsste ich einen alternativen Weg beschreiben, bitte frag danach.

Inhalt der Micro SD öffnen, könnte `VOLUME1`  oder `0000-0001` heißen und müsste einen Ordner namens `IMBACK` oder `imback` enthalten.  
Mit dem Dateiexplorer oder Betriebssystem die heruntergeladene Datei `imbapp.htm` in diesen `IMBACK` Ordner kopieren.  
<!--Und/oder diese Datei in `imbapp_de.html` umbenennen. (Achtung, `html` statt `htm`)-->

Micro SD aus dem Computer auswerfen und wieder ins ImB stecken - fertig.

### Ohne die Micro SD aus ImB herauszunehmen

Smartphone oder Computer in das ImB WLAN stecken..

Neues Browserfenster (oder Registerkarte) verwenden, um auf  [http://192.168.1.254/IMBACK/](http://192.168.1.254/IMBACK/) zu navigieren.

`Datei auswählen` klicken und die gerade heruntergeladene `imbapp.htm` auswählen. Auf `upload file` (exakter Wortlaut muss geprüft werden) - fertig!

## Fertig zum Benutzen!

Computer oder Smartphone ins WLAN vom ImB reinhängen.  
Browser auf [http://192.168.1.254/IMBACK/IMBAPP.HTM](http://192.168.1.254/IMBACK/IMBAPP.HTM)<!-- oder wenn umbenannt: [http://192.168.1.254/IMBACK/imbapp_de.html](http://192.168.1.254/IMBACK/imbapp_de.html)-->.

### Einschränkungen

Nicht gut getestet, bitte ein genaues Auge darauf haben und Bescheid sagen, wenn etwas nicht wie erwartet funktioniert.

## Als App installieren

Dies könnte nicht möglich sein, weil der Standard hierfür zwingend eine https Verbindung vorsieht, die ImB nicht hergibt.

Bei den meisten Browser sollte man aber ein Lesezeichen erstellen können, oder auf Smartphone, eine Verknüpfung auf dem Startbildschirm, was dann fast wie eine App funktioniert.

## Lokal benutzen

Die Datei kann auf dem PC oder von hier [https://shyrodgau.github.io/imbraw2dng/imbapp.htm](https://shyrodgau.github.io/imbraw2dng/imbapp.htm) analog zum normalen imbraw2dng benutzt werden.
