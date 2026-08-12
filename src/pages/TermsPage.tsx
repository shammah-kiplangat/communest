import Footer from '../components/Footer'

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using the Communest platform ("Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, do not use the Platform. These Terms constitute a legally binding agreement between you and Communest. Communest reserves the right to modify these Terms at any time, and your continued use of the Platform constitutes acceptance of the modified Terms.',
    },
    {
      title: '2. Platform Description',
      content: 'Communest is an online platform that facilitates connections between estate managers and individuals seeking housing in Kenya. The Platform allows estate managers to list properties and manage tenants, and allows individuals to search for and apply for rental housing. Communest acts solely as an intermediary platform and is not a party to any rental agreements entered into between estate managers and tenants.',
    },
    {
      title: '3. User Accounts',
      content: 'To use certain features of the Platform, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information when creating your account and to update your information to keep it accurate. You must be at least 18 years old to create an account.',
    },
    {
      title: '4. Estate Listings',
      content: 'Estate managers who list properties on the Platform represent and warrant that: (a) they have the legal right and authority to list the property; (b) all information provided about the property is accurate and complete; (c) they possess valid legal documentation for the property, including title deeds; (d) the property complies with all applicable laws and regulations; and (e) they will manage the property in a professional and lawful manner.',
    },
    {
      title: '5. Limitation of Liability',
      content: 'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, COMMUNEST AND ITS OWNERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO: (a) LOSS OF DATA, PROFITS, OR BUSINESS; (b) UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA; (c) ANY THIRD-PARTY CONDUCT ON THE PLATFORM; (d) ANY CONTENT OR INFORMATION POSTED ON THE PLATFORM; OR (e) ANY OTHER MATTERS RELATING TO THE PLATFORM, EVEN IF COMMUNEST HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.',
    },
    {
      title: '6. No Liability for Data Breaches',
      content: 'WHILE COMMUNEST IMPLEMENTS INDUSTRY-STANDARD SECURITY MEASURES, THE OWNER AND OPERATORS OF COMMUNEST CANNOT BE HELD ACCOUNTABLE OR LIABLE FOR ANY UNAUTHORIZED ACCESS TO, DISCLOSURE OF, OR THEFT OF USER DATA RESULTING FROM HACKING, CYBERATTACKS, DATA BREACHES, OR OTHER SECURITY INCIDENTS BEYOND COMMUNEST\'S REASONABLE CONTROL. USERS ACKNOWLEDGE THAT NO ONLINE PLATFORM CAN GUARANTEE ABSOLUTE SECURITY AND USE THE PLATFORM AT THEIR OWN RISK.',
    },
    {
      title: '7. Disclaimer of Warranties',
      content: 'THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. COMMUNEST DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. COMMUNEST MAKES NO WARRANTY REGARDING THE QUALITY, ACCURACY, OR COMPLETENESS OF ANY ESTATE LISTINGS OR INFORMATION ON THE PLATFORM.',
    },
    {
      title: '8. Third-Party Services',
      content: 'The Platform may integrate with third-party services including payment processors (such as M-Pesa and Paystack). Communest is not responsible for the availability, accuracy, or content of such third-party services. Your use of third-party services is governed by their respective terms and privacy policies. Communest is not liable for any losses arising from your use of third-party payment services.',
    },
    {
      title: '9. Intellectual Property',
      content: 'All content on the Platform, including but not limited to text, graphics, logos, and software, is the property of Communest or its content suppliers and is protected by Kenyan and international copyright laws. You may not reproduce, distribute, modify, or create derivative works from any content on the Platform without express written permission from Communest.',
    },
    {
      title: '10. Termination',
      content: 'Communest reserves the right to suspend or terminate your account and access to the Platform at any time, with or without notice, for conduct that Communest believes violates these Terms or is harmful to other users, Communest, or third parties, or for any other reason at Communest\'s sole discretion.',
    },
    {
      title: '11. Governing Law',
      content: 'These Terms shall be governed by and construed in accordance with the laws of Kenya. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts of Kenya. You agree to submit to the personal jurisdiction of such courts.',
    },
    {
      title: '12. Contact Information',
      content: 'For questions about these Terms and Conditions, please contact Communest at: support@communest.co.ke. We aim to respond to all inquiries within 2 business days.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <section className="pt-28 pb-12 px-4 max-w-3xl mx-auto w-full">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Terms & Conditions</h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          Effective Date: January 1, 2024 · Last Updated: July 1, 2024
        </p>
      </section>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 pb-16">
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-8">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-300 leading-relaxed">
              <strong>Important:</strong> Please read these terms carefully. By using Communest, you agree to be bound by these terms. Section 5 and 6 contain important limitations on our liability.
            </p>
          </div>
          {sections.map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-base font-bold text-white mb-3">{title}</h2>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
