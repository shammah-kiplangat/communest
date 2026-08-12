import Footer from '../components/Footer'

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: '1. Introduction',
      content: 'Communest ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Communest platform — including our website, mobile applications, and related services (collectively, the "Platform"). By using the Platform, you consent to the data practices described in this policy.',
    },
    {
      title: '2. Information We Collect',
      content: 'We collect information you provide directly to us, including: full name, email address, phone number, profile photograph, and any other information you choose to provide. We also collect information automatically when you use the Platform, such as your IP address, device information, browser type, and usage data. For estate listings, we collect property information, management details, title deed numbers, and photos.',
    },
    {
      title: '3. How We Use Your Information',
      content: 'We use the information we collect to: (a) provide, maintain, and improve the Platform; (b) process rental applications and estate listings; (c) communicate with you about your account, transactions, and platform updates; (d) send notifications and announcements from estate managers; (e) verify your identity and prevent fraud; (f) comply with legal obligations; and (g) improve our services and develop new features.',
    },
    {
      title: '4. Information Sharing',
      content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with: (a) estate managers when you submit a rental application; (b) tenants of an estate when you are an estate manager; (c) service providers who assist in our operations under strict confidentiality obligations; (d) law enforcement or government authorities when required by law; and (e) with your explicit consent for any other purpose.',
    },
    {
      title: '5. Data Security',
      content: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption of data in transit and at rest, secure authentication systems, regular security assessments, and strict access controls. While we strive to use commercially acceptable means to protect your information, no method of transmission over the internet or electronic storage is 100% secure.',
    },
    {
      title: '6. Data Retention',
      content: 'We retain your personal information for as long as your account is active or as needed to provide you services. If you request deletion of your account, we will delete your personal information within 30 days, except where we are required to retain it for legal, regulatory, or legitimate business purposes. Estate-related records may be retained for up to 7 years for legal compliance.',
    },
    {
      title: '7. Your Rights',
      content: 'You have the right to: (a) access and receive a copy of your personal information; (b) correct inaccurate or incomplete information; (c) request deletion of your personal information (subject to legal obligations); (d) object to or restrict certain types of processing; (e) data portability; and (f) withdraw consent at any time. To exercise these rights, contact us at support@communest.co.ke.',
    },
    {
      title: '8. Cookies and Tracking',
      content: 'We use cookies and similar tracking technologies to enhance your experience on the Platform. These include essential cookies necessary for platform functionality, and analytical cookies to understand how users interact with our platform. You can control cookies through your browser settings, though disabling certain cookies may affect platform functionality.',
    },
    {
      title: '9. Children\'s Privacy',
      content: 'The Platform is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have inadvertently collected personal information from a minor, we will take steps to delete that information promptly.',
    },
    {
      title: '10. Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the effective date. Your continued use of the Platform after such changes constitutes your acceptance of the updated policy.',
    },
    {
      title: '11. Contact Us',
      content: 'If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at: support@communest.co.ke or by writing to Communest, Nairobi, Kenya.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <section className="pt-28 pb-12 px-4 max-w-3xl mx-auto w-full">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Privacy Policy</h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          Effective Date: January 1, 2024 · Last Updated: July 1, 2024
        </p>
      </section>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 pb-16">
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-8">
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
