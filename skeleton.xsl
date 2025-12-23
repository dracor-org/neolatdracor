<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  xmlns:fn="http://www.w3.org/2005/xpath-functions"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map"
  xmlns="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="tei fn map"
  version="3.0">
  
  <xsl:output method="xml" encoding="utf-8" omit-xml-declaration="yes" indent="yes"/>
  
  <xsl:variable name="meta" select="json-doc('meta.json')"/>

  <xsl:template name="main">
    <xsl:for-each select="$meta?*">
      <xsl:variable name="item" select="."/>
      <xsl:variable name="tei-path" select="concat('tei/', $item?name, '.xml')"/>
      <xsl:value-of select=".?id"/>
      <xsl:text>  </xsl:text>
      <xsl:value-of select="$item?name"/>
      <xsl:text>
</xsl:text>
      <xsl:if test="not(doc-available($tei-path))">
        <xsl:result-document href="skeletons/{$item?name}.xml">
          <xsl:call-template name="tei">
            <xsl:with-param name="item" select="$item"/>
          </xsl:call-template>
        </xsl:result-document>
      </xsl:if>
    </xsl:for-each>
  </xsl:template>

  <xsl:template name="tei">
    <xsl:param name="item" as="map(*)"/>
    <TEI xmlns="http://www.tei-c.org/ns/1.0" xml:id="{$item?id}" xml:lang="lat">
      <teiHeader>
        <fileDesc>
          <titleStmt>
            <title><xsl:value-of select="$item?title"/></title>
            <xsl:if test="$item?subtitle">
              <title type="sub"><xsl:value-of select="$item?subtitle"/></title>
            </xsl:if>
            <xsl:for-each select="$item?authors?*">
              <author>
                <persName xml:lang="lat">
                  <xsl:choose>
                    <xsl:when test=".?name">
                      <name><xsl:value-of select=".?name"/></name>                      
                    </xsl:when>
                    <xsl:otherwise>
                      <forename><xsl:value-of select=".?forename"/></forename>
                      <surname><xsl:value-of select=".?surname"/></surname>
                    </xsl:otherwise>
                  </xsl:choose>
                </persName>
                <xsl:if test=".?qid">
                  <idno type="wikidata"><xsl:value-of select=".?qid"/></idno>
                </xsl:if>
              </author>
            </xsl:for-each>
          </titleStmt>
          <publicationStmt>
            <publisher xml:id="dracor">DraCor</publisher>
            <idno type="URL">https://dracor.org</idno>
            <availability>
              <xsl:if test="$item?availability?status">
                <xsl:attribute name="status" select="$item?availability?status"/>
              </xsl:if>
              <xsl:if test="$item?availability?notes">
                <p><xsl:value-of select="$item?availability?notes"/></p>
              </xsl:if>
              <licence target="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0</licence>
            </availability>
          </publicationStmt>
          <sourceDesc>
            <xsl:if test="count($item?source)">
              <xsl:call-template name="source">
                <xsl:with-param name="source" select="$item?source[1]"/>
                <xsl:with-param name="type" select="'digitalSource'"/>
              </xsl:call-template>
              <xsl:if test="count($item?source?source)">
                <xsl:call-template name="source">
                  <xsl:with-param name="source" select="$item?source?source[1]"/>
                  <xsl:with-param name="type" select="'originalSource'"/>
                </xsl:call-template>
              </xsl:if>
            </xsl:if>
          </sourceDesc>
        </fileDesc>
        <profileDesc>
          <textClass>
            <xsl:if test="$item?genre">
              <keywords>
                <term type="genreTitle">
                  <xsl:value-of select="$item?genre"/>
                </term>
              </keywords>
            </xsl:if>
            <xsl:if test="$item?genreQid">
              <classCode scheme="http://www.wikidata.org/entity/">
                <xsl:value-of select="$item?genreQid"/>
              </classCode>
            </xsl:if>
          </textClass>
        </profileDesc>
      </teiHeader>
      <standOff>
        <xsl:if test="$item?yearPrinted or $item?yearWritten or $item?premiered">
          <listEvent>
            <xsl:if test="$item?yearPrinted">
              <event type="print" when="{$item?yearPrinted}">
                <desc/>
              </event>
            </xsl:if>
            <xsl:if test="$item?premiered">
              <event type="print" when="{$item?premiered}">
                <desc/>
              </event>
            </xsl:if>
            <xsl:if test="$item?yearWritten">
              <event type="print" when="{$item?yearWritten}">
                <desc/>
              </event>
            </xsl:if>
          </listEvent>  
        </xsl:if>
        <xsl:if test="$item?qid">
          <listRelation>
            <relation name="wikidata"
              active="https://dracor.org/entity/{$item?id}"
              passive="http://www.wikidata.org/entity/{$item?qid}"/>
          </listRelation>
        </xsl:if>
      </standOff>
      <text>
        <front>
        </front>
        <body>
        </body>
      </text>
    </TEI>
  </xsl:template>
  
  <!-- TODO: revise after https://github.com/dracor-org/dracor-schema/issues/107 -->
  <xsl:template name="source">
    <xsl:param name="source" as="map(*)"/>
    <xsl:param name="type"/>
    <bibl>
      <xsl:if test="$type">
        <xsl:attribute name="type" select="$type"/>
      </xsl:if>
      <xsl:choose>
        <xsl:when test="$type eq 'digitalSource'">
          <name><xsl:value-of select="$source?title"/></name>
        </xsl:when>
        <xsl:otherwise>
          <title><xsl:value-of select="$source?title"/></title>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:if test="$source?url">
        <idno type="URL">
          <xsl:value-of select="$source?url"/>
        </idno>
      </xsl:if>
      <xsl:if test="$source?availability">
        <availability>
          <xsl:if test="$source?availability?licence">
            <licence>
              <xsl:if test="$source?availability?licenceUrl">
                <xsl:attribute name="target" select="$source?availability?licenceUrl"/>
              </xsl:if>
              <xsl:value-of select="$source?availability?licence"/>
            </licence>
          </xsl:if>
          <xsl:if test="$source?availability?note">
            <p><xsl:value-of select="$source?availability?note"/></p>
          </xsl:if>
        </availability>
      </xsl:if>
    </bibl>
  </xsl:template>
  
</xsl:stylesheet>
