import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-8">
          Last updated: November 28, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p className="mb-4">
            These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and Pound of Cure LLC (&quot;Grail,&quot; &quot;Grail Digital Health,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) governing your use of our AI-powered clinical documentation platform and related services.
          </p>
          <p className="mb-4">
            By accessing or using Grail, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Eligibility</h2>
          <p className="mb-4">
            Grail is intended for use by licensed healthcare professionals and authorized staff members. By using our service, you represent that you:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Are a licensed healthcare provider or authorized by one to use the service</li>
            <li>Have the authority to enter into these Terms on behalf of yourself or your organization</li>
            <li>Will use the service in compliance with all applicable laws and regulations</li>
            <li>Are at least 18 years of age</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
          <p className="mb-4">
            Grail provides AI-powered ambient clinical documentation services, including:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Real-time audio transcription of clinical encounters</li>
            <li>AI-generated clinical notes based on transcribed conversations</li>
            <li>Integration with Electronic Medical Record (EMR) systems</li>
            <li>Custom note templates and formatting options</li>
            <li>In-app support through our ticketing system</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Account Registration</h2>
          <p className="mb-4">
            To use Grail, you must create an account and provide accurate, complete information. You are responsible for:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
            <li>Ensuring your account information remains current and accurate</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Subscription and Payment</h2>
          
          <h3 className="text-xl font-semibold mb-3">Free Trial</h3>
          <p className="mb-4">
            We offer a 7-day free trial for new users. A credit card is required to start the trial. At the end of the trial period, you will be automatically subscribed unless you cancel before the trial ends.
          </p>

          <h3 className="text-xl font-semibold mb-3">Subscription Plans</h3>
          <p className="mb-4">
            Subscription fees are billed in advance on a monthly or annual basis depending on your selected plan. All fees are non-refundable except as expressly stated in these Terms or required by law.
          </p>

          <h3 className="text-xl font-semibold mb-3">Cancellation</h3>
          <p className="mb-4">
            You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period. You will retain access to the service until then.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
          <p className="mb-4">
            You agree to use Grail only for lawful purposes and in accordance with these Terms. You agree NOT to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Use the service for any purpose other than clinical documentation</li>
            <li>Record conversations without proper consent from all parties</li>
            <li>Share your account credentials with unauthorized individuals</li>
            <li>Attempt to reverse engineer, decompile, or extract our AI models</li>
            <li>Use the service to store or transmit malicious code</li>
            <li>Interfere with or disrupt the service or its infrastructure</li>
            <li>Violate any applicable laws, including HIPAA regulations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Patient Consent</h2>
          <p className="mb-4">
            You are solely responsible for obtaining appropriate consent from patients before recording clinical encounters. This includes:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Informing patients that the encounter will be recorded</li>
            <li>Explaining how the recording will be used for documentation purposes</li>
            <li>Obtaining consent in accordance with applicable state and federal laws</li>
            <li>Documenting consent as required by your organization&apos;s policies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">AI-Generated Content</h2>
          <p className="mb-4">
            Grail uses artificial intelligence to generate clinical documentation. You acknowledge and agree that:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>AI-generated notes are a starting point and require professional review</li>
            <li>You are responsible for reviewing, editing, and approving all generated content before use</li>
            <li>AI may occasionally produce errors or omissions</li>
            <li>Final clinical documentation decisions rest with the healthcare provider</li>
            <li>You should not rely solely on AI-generated content for clinical decision-making</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p className="mb-4">
            <strong>Our Property:</strong> Grail, including its software, AI models, user interface, and documentation, is owned by Pound of Cure LLC and protected by intellectual property laws.
          </p>
          <p className="mb-4">
            <strong>Your Content:</strong> You retain ownership of all clinical notes and documentation generated using our service. You grant us a limited license to process your content solely for the purpose of providing the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">HIPAA Compliance</h2>
          <p className="mb-4">
            Grail is designed to support HIPAA compliance. For covered entities, we will execute a Business Associate Agreement (BAA) upon request. You remain responsible for:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Ensuring your use of the service complies with HIPAA</li>
            <li>Implementing appropriate administrative safeguards within your organization</li>
            <li>Training your staff on proper use of the service</li>
            <li>Reporting any suspected breaches or security incidents</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WRITE GREAT NOTES AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR PATIENT RELATIONSHIPS, ARISING FROM YOUR USE OF THE SERVICE.
          </p>
          <p className="mb-4">
            OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM THESE TERMS OR YOUR USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
          <p className="mb-4">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
          </p>
          <p className="mb-4">
            WRITE GREAT NOTES IS A DOCUMENTATION TOOL AND DOES NOT PROVIDE MEDICAL ADVICE. ALL CLINICAL DECISIONS REMAIN THE RESPONSIBILITY OF THE HEALTHCARE PROVIDER.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
          <p className="mb-4">
            You agree to indemnify and hold harmless Grail Digital Health, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the service, your violation of these Terms, or your violation of any rights of a third party.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account immediately, without prior notice, if you breach these Terms or engage in conduct that we determine, in our sole discretion, to be harmful to the service or other users.
          </p>
          <p className="mb-4">
            Upon termination, your right to use the service will immediately cease. You may export your data before termination. We will retain your data for 30 days after termination to allow for data export, after which it will be deleted.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the state or federal courts located in Delaware.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the service after changes constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            For questions about these Terms of Service, please submit a support ticket through the app or use our{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact form
            </Link>.
          </p>
          <p className="text-muted-foreground">
            Pound of Cure LLC<br />
            Grail Digital Health
          </p>
        </section>
      </div>
    </div>
  );
}
