
all:	imbraw2dng imbraw2dng.exe imbraw2dng_64

clean:
	rm -f imbraw2dng imbraw2dng_64 imbraw2dng.exe

imbraw2dng_64:	imbraw2dng.c
	gcc -Wall -oimbraw2dng_64 imbraw2dng.c


imbraw2dng:	imbraw2dng.c
	gcc -m32 -Wall -oimbraw2dng imbraw2dng.c


imbraw2dng.exe:	imbraw2dng.c
	i686-w64-mingw32-gcc-win32 -Wall -o imbraw2dng.exe imbraw2dng.c





