/**
 * OpenGraph, Twitter Cards & HTML Metadata Extractor
 */

export interface ExtractedMetaTags {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogSiteName?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
}

export function extractMetaTags(html: string): ExtractedMetaTags {
  const result: ExtractedMetaTags = {};
  if (!html) return result;

  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    result.title = decodeHtmlEntities(titleMatch[1].trim());
  }

  // Extract all <meta> tags
  const metaRegex = /<meta\s+([^>]+)>/gi;
  let match: RegExpExecArray | null;

  while ((match = metaRegex.exec(html)) !== null) {
    const metaAttrs = match[1];

    const name = getAttribute(metaAttrs, 'name')?.toLowerCase() ||
                 getAttribute(metaAttrs, 'property')?.toLowerCase();
    const content = getAttribute(metaAttrs, 'content');

    if (!name || !content) continue;
    const cleanContent = decodeHtmlEntities(content.trim());

    if (name === 'description') result.description = cleanContent;
    else if (name === 'og:title') result.ogTitle = cleanContent;
    else if (name === 'og:description') result.ogDescription = cleanContent;
    else if (name === 'og:image') result.ogImage = cleanContent;
    else if (name === 'og:url') result.ogUrl = cleanContent;
    else if (name === 'og:site_name') result.ogSiteName = cleanContent;
    else if (name === 'og:type') result.ogType = cleanContent;
    else if (name === 'twitter:title') result.twitterTitle = cleanContent;
    else if (name === 'twitter:description') result.twitterDescription = cleanContent;
    else if (name === 'article:published_time') result.publishedTime = cleanContent;
    else if (name === 'article:modified_time') result.modifiedTime = cleanContent;
    else if (name === 'keywords') {
      result.keywords = cleanContent.split(',').map((k) => k.trim()).filter(Boolean);
    }
  }

  return result;
}

function getAttribute(tagString: string, attrName: string): string | null {
  const regex = new RegExp(`${attrName}=["']([^"']*)["']`, 'i');
  const match = tagString.match(regex);
  return match ? match[1] : null;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
