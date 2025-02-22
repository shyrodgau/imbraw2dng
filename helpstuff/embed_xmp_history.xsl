<?xml version="1.0"?>
<!--
This stylesheet inserts the xmp document history from the file which name is given as "histdoc"
into the xmp data from the input file.
Darktable does export its own history into the jpeg but not the history from the dng, so this
just puts it back in.
e.g.
exiftool -b -xmp "${dngfile}"  > ${dngfile}.xmp
exiftool -b -xmp "${jpgfile}"  > ${jpgfile}.xmp
xsltproc &#x2d;&#x2d;stringparam histdoc $(pwd)/${dngfile}.xmp embed_xmp_history.xsl ${jpgfile}.xmp > ${jpgfile}n.xmp
exiftool -m -xmp'<='${jpgfile}n.xmp "$jpgfile"
-->
<xsl:transform
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
 xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:history="http://purl.org/dc/terms/" 
 xmlns:x="adobe:ns:meta/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
 xmlns:ex="http://exslt.org/common"
 xmlns:fx="http://exslt.org/functions"
 extension-element-prefixes="ex fx"
 version="1.0">

<xsl:output method="xml" omit-xml-declaration="yes"/>

<xsl:param name="histdoc" select="''"/>

<xsl:template match="*">
	<!-- generic recursive copy template -->
	<xsl:copy>
		<xsl:copy-of select="@*"/>
		<xsl:apply-templates/>
	</xsl:copy>
</xsl:template>

<xsl:template match="rdf:RDF">
  <!-- recursive copy template -->
  <xsl:copy>
  	<xsl:copy-of select="@*"/>
	<xsl:apply-templates/>
	<!-- add the history -->
	<rdf:Description>
		<xsl:copy-of select="document($histdoc)//history:documentHistory"/>
	</rdf:Description>
  </xsl:copy>
</xsl:template>

<xsl:template match="processing-instruction('xpacket')">
	<!-- copy the xpacket begin -->
	<xsl:if test="substring-after(.,' id=') != ''">
		<xsl:copy-of select="."/>
	</xsl:if>
</xsl:template>

<xsl:template match="x:xmpmeta">
	<!-- recursive copy template -->
	<xsl:copy>
		<xsl:copy-of select="@*"/>
		<xsl:apply-templates/>
	</xsl:copy>
	<!-- create the xpacket end -->
	<xsl:processing-instruction name="xpacket">end='r'</xsl:processing-instruction>
</xsl:template>


</xsl:transform>