import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo-meta";
export const generateMetadata = () => pageMetadata("/terms", "Terms & Conditions", "Terms for using the HRIDAYA IT SOLUTIONS website and services.");
export default function Page() {
  return (
    <LegalPage title="Terms & Conditions" path="/terms" updated="17 November 2026">
      <p>By using this website you agree to these terms. If you do not agree, please do not use the site.</p>
      <h2>Services</h2><p>Information on this website describes our services in general terms. The scope, deliverables, timelines, fees and payment terms of any engagement are set out in a separate written proposal or agreement, which takes precedence over this page.</p>
      <h2>Quotes and payments</h2><p>Quotes are valid for the period stated in them. Projects are typically billed in milestones; ongoing services are billed monthly. Third-party costs such as domains, hosting, advertising spend and marketplace fees are paid by the client unless agreed otherwise.</p>
      <h2>Intellectual property</h2><p>On full payment, final deliverables created specifically for you are transferred to you, except third-party assets (fonts, stock images, plugins) which remain under their own licences. Website content on this site is owned by HRIDAYA IT SOLUTIONS.</p>
      <h2>Free SEO tools</h2><p>Our SEO tools are provided “as is” for general guidance. Do not submit pages you are not authorised to analyse. We may limit usage to prevent abuse.</p>
      <h2>Acceptable use</h2><p>You must not misuse the website, attempt to gain unauthorised access, submit spam or upload malicious files.</p>
      <h2>Limitation of liability</h2><p>To the extent permitted by law, we are not liable for indirect or consequential losses arising from use of this website.</p>
      <h2>Governing law</h2><p>These terms are governed by the laws of India, with courts at Gautam Buddh Nagar (Noida), Uttar Pradesh having jurisdiction.</p>
    </LegalPage>
  );
}
