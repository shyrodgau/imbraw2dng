
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <time.h>
#include <math.h>
#include <tiffio.h>
#include <errno.h>


int main (int argc, char **argv)
{
	unsigned int HPIXELS, VPIXELS, mode = 0;
	char *modestr[] = { "unknown", "MF 6x7 ", "MF6x4.5", "MF 6x6 ", "ImB35mm" };
	
	
	static const short CFARepeatPatternDim[] = { 2,2 };
	// this color matrix is definitely inaccurate, TODO: calibrate
	static const float cam_xyz[] = {
		// R 	G     	B
		1.000,	0.000,	0.000,	// R
		0.000,	1.000,	0.000,	// G
		0.000,	0.000,	1.000	// B
	};
	static const float neutral[] = { 1.0, 1.0, 1.0 }; // TODO calibrate
	long sub_offset=0, white=0x0ff;

	int status=1, i, j, row, col;
	unsigned short curve[256];
	struct stat st;
	struct tm tm;
	char datetime[64];
	FILE *ifp;
	TIFF *tif;

	const char* fname = argv[1];
	unsigned long fileLen;  // number of bytes in file
	unsigned char *buffer;

	if (argc != 3) {
		fprintf (stderr, "Usage: %s infile outfile\n"
			"Example: %s rpi.jpg output.dng\n", argv[0], argv[0]);
		return 1;
	}

	if (!(ifp = fopen (fname, "rb"))) {
		perror (argv[2]);
		return 1;
	}
	stat (fname, &st);
	gmtime_r (&st.st_mtime, &tm);
	sprintf (datetime, "%04d:%02d:%02d %02d:%02d:%02d",
	tm.tm_year+1900,tm.tm_mon+1,tm.tm_mday,tm.tm_hour,tm.tm_min,tm.tm_sec);

	//Get file length
	fseek(ifp, 0, SEEK_END);
	fileLen=ftell(ifp);
	switch (fileLen) {
	case 14065920: // historic
		HPIXELS = 4320; VPIXELS = 3256;
		break;
	case 15925248:
		HPIXELS = 4608; VPIXELS = 3456; mode=1;
		break;
	case 12937632:
		HPIXELS = 4152; VPIXELS = 3116; mode=2;
		break;
	case 11943936:
		HPIXELS = 3456; VPIXELS = 3456; mode=3;
		break;
	case 15335424:
		HPIXELS = 4608; VPIXELS = 3328; mode=4;
		break;
	case 11618752:
		HPIXELS = 4012; VPIXELS = 2896; mode=4;
		break;
	case 7667520:
		HPIXELS = 3260; VPIXELS = 2352; mode=5;
		break;
	default:
		fprintf(stderr, "File %s Unexpected length!\n", fname);
		exit(1);
	}
	fseek(ifp, 0, SEEK_SET); 
 
	//printf("File length = %d bytes.\n",fileLen);
	//printf("offset = %d:",offset);

	//Allocate memory for one line of pixel data
	buffer=(unsigned char *)malloc(HPIXELS+1);
	//unsigned short *buffer2=(unsigned short *)malloc(2*4608+1);
	if (!buffer /*|| !buffer2*/)
	{
		fprintf(stderr, "Memory error!");
		status = ENOMEM;
		goto fail;
	}
		
	if (!(tif = TIFFOpen (argv[2], "w"))) goto fail;
	//fprintf(stderr, "Writing TIFF header...\n");
	
	TIFFSetField (tif, TIFFTAG_SUBFILETYPE, 1);
	TIFFSetField (tif, TIFFTAG_IMAGEWIDTH, HPIXELS );
	TIFFSetField (tif, TIFFTAG_IMAGELENGTH, VPIXELS );
	TIFFSetField (tif, TIFFTAG_BITSPERSAMPLE, 8);
	//TIFFSetField (tif, TIFFTAG_MAXSAMPLEVALUE, 255);
	TIFFSetField (tif, TIFFTAG_COMPRESSION, COMPRESSION_NONE);
	TIFFSetField (tif, TIFFTAG_MAKE, "ImBack");
	TIFFSetField (tif, TIFFTAG_MODEL, modestr[mode]);
	TIFFSetField (tif, TIFFTAG_ORIENTATION, ORIENTATION_TOPLEFT);
	TIFFSetField (tif, TIFFTAG_SAMPLESPERPIXEL, 1);
	TIFFSetField (tif, TIFFTAG_PLANARCONFIG, PLANARCONFIG_CONTIG);
	TIFFSetField (tif, TIFFTAG_SOFTWARE, "imbraw2dng");
	//TIFFSetField (tif, TIFFTAG_DATETIME, datetime);
	//TIFFSetField (tif, TIFFTAG_SUBIFD, 1, &sub_offset);
	TIFFSetField (tif, TIFFTAG_DNGVERSION, "\001\001\0\0");
	TIFFSetField (tif, TIFFTAG_DNGBACKWARDVERSION, "\001\0\0\0");
	TIFFSetField (tif, TIFFTAG_UNIQUECAMERAMODEL, "ImBack");
	TIFFSetField (tif, TIFFTAG_COLORMATRIX1, 9, cam_xyz);
	//TIFFSetField (tif, TIFFTAG_COLORMATRIX2, 9, cam_xyz);
	//TIFFSetField (tif, TIFFTAG_CAMERACALIBRATION1, 9, cam_xyz);
	//TIFFSetField (tif, TIFFTAG_CAMERACALIBRATION2, 9, cam_xyz);
	TIFFSetField (tif, TIFFTAG_ASSHOTNEUTRAL, 3, neutral);
	TIFFSetField (tif, 306, "2022:12:31 18:29:13");
	TIFFSetField (tif, EXIFTAG_DATETIMEORIGINAL /*36867*/, "2022:12:31 18:29:13");
	//TIFFSetField (tif, TIFFTAG_CALIBRATIONILLUMINANT1, 21);
	//TIFFSetField (tif, TIFFTAG_CALIBRATIONILLUMINANT2, 21);
	//TIFFSetField (tif, TIFFTAG_ROWSPERSTRIP, 1);
	//TIFFSetField (tif, TIFFTAG_ORIGINALRAWFILENAME, strlen(fname), fname);

	// fprintf(stderr, "Writing TIFF thumbnail...\n");
	//memset (pixel, 0, HPIXELS);	// all-black thumbnail 
	//for (row=0; row < VPIXELS >> 6; row++)
	//	TIFFWriteScanline (tif, pixel, row, 0);
	//TIFFWriteDirectory (tif);
	// fprintf(stderr, "Writing TIFF header for main image...\n");

	const unsigned char cfapat[4] = { 0x1, 0x0, 0x2, 0x1 };
	TIFFSetField (tif, TIFFTAG_PHOTOMETRIC, PHOTOMETRIC_CFA);
	TIFFSetField (tif, TIFFTAG_CFAREPEATPATTERNDIM, CFARepeatPatternDim);
	TIFFSetField (tif, TIFFTAG_SUBFILETYPE, 0);
	TIFFSetField (tif, TIFFTAG_CFAPATTERN, /*, 4*/ cfapat); // 0 = Red, 1 = Green, 2 = Blue, 3 = Cyan, 4 = Magenta, 5 = Yellow, 6 = White 
	//TIFFSetField (tif, TIFFTAG_LINEARIZATIONTABLE, 256, curve);
	TIFFSetField (tif, TIFFTAG_WHITELEVEL, 1, &white);

	fprintf(stderr, "Processing RAW data...\n");

	for (row=0; row < VPIXELS; row++) {  // iterate over pixel rows
		fread(buffer, HPIXELS, 1, ifp);  // read next line of pixel data
		/*int inoff = 0;
		for (int outoff = 0; outoff < 4608; outoff+=4) {
			/ *buffer2[outoff] = buffer[inoff++];
			buffer2[outoff+1] = buffer[inoff++];
			buffer2[outoff+2] = buffer[inoff++];
			buffer2[outoff+3] = buffer[inoff++];
			unsigned int split = buffer[inoff++];
			buffer2[outoff] |= (split & 0xe0) << 2;
			buffer2[outoff+1] |= (split & 0x30) << 4;
			buffer2[outoff+2] |= (split & 0xe) << 6;
			buffer2[outoff+3] |= (split & 0x3) << 8;* /
			buffer2[outoff] = buffer[inoff++];
			buffer2[outoff] |= (buffer[inoff] & 0x3) << 8;
			buffer2[outoff+1] = buffer[inoff++] >> 2;
			buffer2[outoff+1] |= (buffer[inoff] & 0xf) << 6;
			buffer2[outoff+2] = buffer[inoff++] >> 4;
			buffer2[outoff+2] |= (buffer[inoff] & 0x3f) << 4;
			buffer2[outoff+3] = buffer[inoff++] >> 6;
			buffer2[outoff+3] |= (buffer[inoff] & 0xff) << 8;
		}*/
		//fprintf(stderr,"%d ", inoff);
		int rc;
		if ((rc = TIFFWriteScanline (tif, buffer, row, 0) != 1)) {
			//if ((rc = TIFFWriteRawStrip (tif, row, buffer, HPIXELS)) != HPIXELS) {
			fprintf(stderr, "Error writing TIFF scanline. %d\n", rc);
			exit(1);
		}
	} // end for(k..)
	TIFFWriteDirectory(tif);

	free(buffer); // free up that memory we allocated

	TIFFClose (tif);
	status = 0;
fail:
	fclose (ifp);
	return status;
}
