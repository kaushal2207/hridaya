import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo-meta";
export const generateMetadata = () => pageMetadata("/disclaimer", "Disclaimer", "Disclaimer for the HRIDAYA IT SOLUTIONS website and free tools.");
export default function Page() {
  return (
    <LegalPage title="Disclaimer" path="/disclaimer" updated="17 November 2026">
      <p>The information on this website is for general information only and may change without notice.</p>
      <h2>No guaranteed results</h2><p>Search rankings, advertising performance and marketplace sales depend on many factors outside our control, including platform algorithms, competition and market conditions. We do not guarantee specific rankings, traffic, leads or sales.</p>
      <h2>SEO tool results</h2><p>Scores from our free tools are calculated automatically from the page at the time of the check and are indicative only. AI-generated text is clearly labelled and may contain mistakes. Keyword ideas do not include search volume data.</p>
      <h2>Third-party platforms</h2><p>Amazon, Myntra, Flipkart, Shopify, Google, Meta, WordPress and other names are trademarks of their respective owners. HRIDAYA IT SOLUTIONS is an independent service provider and is not affiliated with or endorsed by these companies unless explicitly stated.</p>
      <h2>External links</h2><p>We are not responsible for the content of external websites linked from this site.</p>
    </LegalPage>
  );
}
