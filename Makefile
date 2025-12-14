
all:	README.html README_de.html README_ja.html README_MiMi.html README_MiMi_de.html README_MiMi_ja.html

README.html:	README.md Makefile
	pandoc -f markdown -t html -o README.html README.md
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_MiMi@"README_MiMi.html"@g' README.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_de"@"README_de.html"@g' README.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_ja"@"README_ja.html"@g' README.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/helpstuff/usercontrols.png"@"usercontrols.png"@g' README.html

README_de.html:	README_de.md Makefile
	pandoc -f markdown -t html -o README_de.html README_de.md
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_MiMi_de"@"README_MiMi_de.html"@g' README_de.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README"@"README.html"@g' README_de.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_ja"@"README_ja.html"@g' README_de.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/helpstuff/usercontrols.png"@"usercontrols.png"@g' README_de.html

README_ja.html:	README_ja.md Makefile
	pandoc -f markdown -t html -o README_ja.html README_ja.md
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_MiMi_ja"@"README_MiMi_ja.html"@g' README_ja.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README"@"README.html"@g' README_ja.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_de"@"README_de.html"@g' README_ja.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/helpstuff/usercontrols.png"@"usercontrols.png"@g' README_ja.html

README_MiMi.html:	README_MiMi.md Makefile
	pandoc -f markdown -t html -o README_MiMi.html README_MiMi.md
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README@"README.html"@g' README_MiMi.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_MiMi_de"@"README_MiMi_de.html"@g' README_MiMi.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_MiMi_ja"@"README_MiMi_ja.html"@g' README_MiMi.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/helpstuff/usercontrols.png"@"usercontrols.png"@g' README_MiMi.html

README_MiMi_de.html:	README_MiMi_de.md Makefile
	pandoc -f markdown -t html -o README_MiMi_de.html README_MiMi_de.md
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_de"@"README_de.html"@g' README_MiMi_de.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_MiMi"@"README_MiMi.html"@g' README_MiMi_de.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_MiMi_ja"@"README_MiMi_ja.html"@g' README_MiMi_de.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/helpstuff/usercontrols.png"@"usercontrols.png"@g' README_MiMi_de.html

README_MiMi_ja.html:	README_MiMi_ja.md Makefile
	pandoc -f markdown -t html -o README_MiMi_ja.html README_MiMi_ja.md
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_ja"@"README_ja.html"@g' README_MiMi_ja.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_MiMi"@"README_MiMi.html"@g' README_MiMi_ja.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/README_MiMi_de"@"README_MiMi_de.html"@g' README_MiMi_ja.html
	sed -i -e 's@"https://shyrodgau.github.io/imbraw2dng/helpstuff/usercontrols.png"@"usercontrols.png"@g' README_MiMi_ja.html

LICENSE.html:	LICENSE.txt Makefile
	/home/hegny/prog/imbraw2dng/github/helpstuff/licensehelp.sh

LICENSE_noapp.html:	LICENSE_noapp.txt Makefile
	/home/hegny/prog/imbraw2dng/github/helpstuff/licensehelp.sh

