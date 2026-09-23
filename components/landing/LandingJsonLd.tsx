import { FAQS } from "./faqs";

const SITE = "https://appcon-lumiere-linawai.vercel.app";
const DESCRIPTION =
  "Linaw adapts a message to the reader's detail, wording, and delivery, then checks that critical meaning is still intact.";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Linaw AI",
      url: SITE,
      description: DESCRIPTION,
      applicationCategory: "EducationalApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "PHP",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ],
};

/** Invisible structured data. The visible FAQ stays in Faq.tsx. */
export function LandingJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
