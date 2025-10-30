
all:	README.html README_de.html README_ja.html

README.html:	README.md
	pandoc -f markdown -t html -o README.html README.md

README_de.html:	README_de.md
	pandoc -f markdown -t html -o README_de.html README_de.md

README_ja.html:	README_ja.md
	pandoc -f markdown -t html -o README_ja.html README_ja.md

