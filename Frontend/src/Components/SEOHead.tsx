import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  type?: 'website' | 'article';
  image?: string;
  noindex?: boolean;
}

/**
 * Reusable SEO head component for per-page meta tags.
 * Overrides the default index.html meta tags on a per-page basis.
 */
export default function SEOHead({
  title,
  description,
  keywords,
  path = '/',
  type = 'website',
  image = 'https://skillforge-ai.com/og-image.png',
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title.includes('SkillForge') ? title : `${title} | SkillForge AI`;
  const url = `https://skillforge-ai.com${path}`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="SkillForge AI" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
