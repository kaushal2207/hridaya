import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo-meta";
export const generateMetadata = () => pageMetadata("/privacy-policy", "Privacy Policy", "How HRIDAYA IT SOLUTIONS collects, uses and protects your personal data.");
export default function Page() {
  return (
    <LegalPage title="Privacy Policy" path="/privacy-policy" updated="17 November 2026">
      <p>HRIDAYA IT SOLUTIONS (“we”, “us”) respects your privacy. This policy explains what personal data we collect through this website, why, and your rights under India’s Digital Personal Data Protection Act, 2023.</p>
      <h2>What we collect</h2>
      <ul><li>Details you submit in enquiry forms: name, business name, email, phone, city, website and project information, and any files you upload.</li><li>Your email address if you subscribe to our newsletter.</li><li>Website addresses you enter in our SEO tools, and the results generated.</li><li>Technical data such as a one-way hash of your IP address (used only for spam and abuse prevention) and your browser type.</li></ul>
      <h2>Why we use it</h2>
      <ul><li>To respond to your enquiry and prepare quotes or proposals.</li><li>To send newsletters you asked for (you can unsubscribe at any time).</li><li>To protect the website from spam and misuse.</li></ul>
      <p>We do not sell your personal data.</p>
      <h2>Who we share it with</h2>
      <p>We use trusted service providers to operate the website: Supabase (database and file storage), Resend (email delivery), and, for the SEO tools, an AI provider that receives only the public page data being analysed. These providers process data on our behalf.</p>
      <h2>How long we keep it</h2>
      <p>Enquiries are kept for as long as needed to manage our business relationship and meet legal obligations. SEO tool reports expire after 30 days.</p>
      <h2>Your rights</h2>
      <p>You can ask to access, correct or delete your personal data, or withdraw consent, by emailing <a href="mailto:kaushalkumar2207@gmail.com">kaushalkumar2207@gmail.com</a>.</p>
      <h2>Cookies</h2>
      <p>We use essential cookies to operate the site and the admin area. We will only use analytics cookies with your consent.</p>
      <h2>Contact</h2>
      <p>HRIDAYA IT SOLUTIONS, Noida, Uttar Pradesh, India. Email: kaushalkumar2207@gmail.com.</p>
    </LegalPage>
  );
}
