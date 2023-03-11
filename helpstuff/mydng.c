
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <time.h>
#include <math.h>
#include <tiffio.h>
#include <errno.h>


#define LINELEN 256            // how long a string we need to hold the filename
#define RAWBLOCKSIZE 14065920
#define HEADERSIZE 0
#define ROWSIZE 3456 // number of bytes per row of pixels, including 24 'other' bytes at end
#define IDSIZE 4    // number of bytes in raw header ID string
#define HPIXELS 4608   // number of horizontal pixels on OV5647 sensor
#define VPIXELS 3456   // number of vertical pixels on OV5647 sensor

int main (int argc, char **argv)
{
	static const short CFARepeatPatternDim[] = { 2,2 };
	// this color matrix is definitely inaccurate, TODO: calibrate
	static const float cam_xyz[] = {
		// R 	G     	B
		1.000,	0.000,	0.000,	// R
		0.000,	1.000,	0.000,	// G
		0.000,	0.000,	1.000	// B
	};
	static const float neutral[] = { 1.0, 1.0, 1.0 }; // TODO calibrate
	long sub_offset=0, white=0x03ff;

	int status=1, i, j, row, col;
	unsigned short curve[256];
	struct stat st;
	struct tm tm;
	char datetime[64];
	FILE *ifp;
	TIFF *tif;

	const char* fname = argv[1];
	unsigned long fileLen;  // number of bytes in file
	unsigned long offset;  // offset into file to start reading pixel data
	unsigned char *buffer;
	unsigned short pixel[HPIXELS];  // array holds 16 bits per pixel
	unsigned char split;        // single byte with 4 pairs of low-order bits

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
	if (fileLen < RAWBLOCKSIZE) {
		fprintf(stderr, "File %s too short to contain expected 6MB RAW data.\n", fname);
		exit(1);
	}
	offset = (fileLen - RAWBLOCKSIZE) ;  // location in file the raw header starts
	fseek(ifp, 0, SEEK_SET); 
 
	//printf("File length = %d bytes.\n",fileLen);
	//printf("offset = %d:",offset);

	//Allocate memory for one line of pixel data
	buffer=(unsigned char *)malloc(5760+1);
	unsigned short *buffer2=(unsigned short *)malloc(2*4608+1);
	if (!buffer || !buffer2)
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
	TIFFSetField (tif, TIFFTAG_BITSPERSAMPLE, 16);
	TIFFSetField (tif, TIFFTAG_MAXSAMPLEVALUE, 1023);
	TIFFSetField (tif, TIFFTAG_COMPRESSION, COMPRESSION_NONE);
	TIFFSetField (tif, TIFFTAG_MAKE, "ImBack");
	TIFFSetField (tif, TIFFTAG_MODEL, "unknown");
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
		fread(buffer, 5760, 1, ifp);  // read next line of pixel data
		int inoff = 0;
		for (int outoff = 0; outoff < 4608; outoff+=4) {
			/*buffer2[outoff] = buffer[inoff++];
			buffer2[outoff+1] = buffer[inoff++];
			buffer2[outoff+2] = buffer[inoff++];
			buffer2[outoff+3] = buffer[inoff++];
			unsigned int split = buffer[inoff++];
			buffer2[outoff] |= (split & 0xe0) << 2;
			buffer2[outoff+1] |= (split & 0x30) << 4;
			buffer2[outoff+2] |= (split & 0xe) << 6;
			buffer2[outoff+3] |= (split & 0x3) << 8;*/
			buffer2[outoff] = buffer[inoff++];
			buffer2[outoff] |= (buffer[inoff] & 0x3) << 8;
			buffer2[outoff+1] = buffer[inoff++] >> 2;
			buffer2[outoff+1] |= (buffer[inoff] & 0xf) << 6;
			buffer2[outoff+2] = buffer[inoff++] >> 4;
			buffer2[outoff+2] |= (buffer[inoff] & 0x3f) << 4;
			buffer2[outoff+3] = buffer[inoff++] >> 6;
			buffer2[outoff+3] |= (buffer[inoff] & 0xff) << 8;
		}
		//fprintf(stderr,"%d ", inoff);
		if (TIFFWriteScanline (tif, buffer2, row, 0) != 1) {
			//int rc;
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
