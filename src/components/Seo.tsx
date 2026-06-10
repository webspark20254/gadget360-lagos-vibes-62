import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "product";
  robots?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SITE = "https://gadget360.ng";

const Seo = ({ title, description, canonical, image = "/favicon.png", type = "website", robots = "index, follow, max-image-preview:large", jsonLd }: SeoProps) => {
  const url = canonical?.startsWith("http") ? canonical : `${SITE}${canonical || ""}`;
  const absImage = image.startsWith("http") ? image : `${SITE}${image.startsWith("/") ? image : `/${image}`}`;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Gadget360.ng" />
      <meta property="og:locale" content="en_NG" />
      <meta property="og:image" content={absImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absImage} />
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
      ))}
    </Helmet>
  );
};

export default Seo;
