'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import {
  Upload, CheckCircle, Shield, Search, BarChart3, Download,
  ChevronDown, ChevronUp, FileImage, Camera, BookOpen, Newspaper,
  AlertTriangle, ArrowRight, Users, Target, Globe
} from 'lucide-react';
import { useState } from 'react';

const features = [
  { icon: Upload, title: 'Easy Upload', description: 'Guided multi-step upload with drag-and-drop, auto-validation, and draft saving' },
  { icon: CheckCircle, title: 'Quality Control', description: 'Automatic checks for resolution, blur, duplicates, and format compliance' },
  { icon: Shield, title: 'Secure & Private', description: 'Role-based access, encrypted storage, and consent tracking for all documents' },
  { icon: Search, title: 'Smart Review', description: 'Reviewer dashboard with advanced filters and batch approval workflows' },
  { icon: BarChart3, title: 'Analytics', description: 'Track data gaps, contributor quality, and collection coverage in real-time' },
  { icon: Download, title: 'Export Pipeline', description: 'Generate OCR training manifests in CSV and JSON formats for model training' },
];

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up with your college email and basic details' },
  { num: '02', title: 'Verify Email', desc: 'Click the verification link sent to your email' },
  { num: '03', title: 'Complete Profile', desc: 'Fill in your district, institute, and preferences' },
  { num: '04', title: 'Upload Scans', desc: 'Select category, upload images, fill metadata, submit' },
  { num: '05', title: 'Get Reviewed', desc: 'Reviewers check quality and approve your submissions' },
];

const goodExamples = [
  'Clear flatbed scan of textbook page',
  'Well-lit mobile photo of printed notice',
  'Clean photocopy of church bulletin',
  'Sharp scan of community document',
];

const badExamples = [
  'Blurry or out-of-focus images',
  'Fingers covering text in the photo',
  'Heavy shadows across the page',
  'Low resolution or tiny text',
  'Handwritten documents (not for v1)',
  'Non-Khasi language pages',
];

const faqs = [
  { q: 'What kind of documents should I upload?', a: 'We need scanned or photographed printed Khasi language documents — textbooks, newspapers, notices, church bulletins, community documents, forms, archive material, etc. Focus on pages with clear Khasi text.' },
  { q: 'Do I need a scanner?', a: 'No! You can use your mobile phone camera. Just make sure the page is well-lit, flat, and fully visible. A flatbed scanner gives the best results, but a good phone photo works too.' },
  { q: 'Is my data private?', a: 'Yes. All uploads are stored securely. Only authorized reviewers and admins can see your submissions. Personally sensitive documents should be flagged during upload.' },
  { q: 'Can I upload handwritten documents?', a: 'Not in this version. We are currently collecting only printed/scanned documents. Handwritten data support will be added in future versions.' },
  { q: 'How many pages can I upload at once?', a: 'You can upload multiple images in a single batch. Each image should be one page. There is a 20MB size limit per file.' },
  { q: 'Who reviews my uploads?', a: 'Trained reviewers from the project team check each submission for quality, accuracy, and completeness before approving it for the OCR training dataset.' },
  { q: 'Will I get credit?', a: 'Yes! Every approved submission is credited to your contributor profile. Your contribution stats are tracked on your dashboard.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8 animate-fade-in">
            <Globe className="w-4 h-4" />
            A Student-Led Initiative from Meghalaya
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 animate-slide-up">
            Building the{' '}
            <span className="gradient-text">Khasi OCR</span>
            <br />Training Dataset
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 animate-slide-up">
            Help us collect high-quality scanned Khasi documents so that computers can learn to read our language.
            Every scanned page you contribute brings us closer to a working Khasi OCR system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25">
              Start Contributing <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#about" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">12</div>
              <div className="text-sm text-slate-500">Doc Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">11</div>
              <div className="text-sm text-slate-500">Districts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">∞</div>
              <div className="text-sm text-slate-500">Pages Needed</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What We&apos;re Building</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              An OCR (Optical Character Recognition) system for Khasi language. To train this system,
              we need thousands of high-quality scanned document pages with proper metadata.
            </p>
          </div>

          {/* Document types needed */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
            {[
              { icon: BookOpen, label: 'Textbooks', desc: 'School and college books' },
              { icon: Newspaper, label: 'Newspapers', desc: 'Khasi news & magazines' },
              { icon: FileImage, label: 'Notices', desc: 'Official circulars' },
              { icon: Camera, label: 'Community Docs', desc: 'Dorbar, church records' },
            ].map(item => (
              <div key={item.label} className="p-6 rounded-2xl bg-slate-50 text-center card-hover">
                <item.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-1">{item.label}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Good vs Bad Examples */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
              <h3 className="flex items-center gap-2 font-semibold text-emerald-700 mb-4">
                <CheckCircle className="w-5 h-5" /> Good Uploads
              </h3>
              <ul className="space-y-2">
                {goodExamples.map(ex => (
                  <li key={ex} className="flex items-start gap-2 text-sm text-emerald-600">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {ex}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-red-50 border border-red-100">
              <h3 className="flex items-center gap-2 font-semibold text-red-700 mb-4">
                <AlertTriangle className="w-5 h-5" /> Avoid These
              </h3>
              <ul className="space-y-2">
                {badExamples.map(ex => (
                  <li key={ex} className="flex items-start gap-2 text-sm text-red-600">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {ex}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Platform Features</h2>
            <p className="text-lg text-slate-600">Everything you need to collect OCR training data efficiently</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feat => (
              <div key={feat.title} className="p-6 rounded-2xl bg-white border card-hover">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <feat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contributor Flow */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How to Contribute</h2>
            <p className="text-lg text-slate-600">Five simple steps to start helping</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.num} className="flex-1 relative">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border card-hover text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">{step.num}</div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-slate-300">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scan Tips */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Tips for Best Scans</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Use good, even lighting — avoid shadows',
                'Capture the full page — no cropping',
                'Keep the page flat and unwrinkled',
                'Use landscape orientation if needed',
                'Keep your fingers away from the text',
                'Avoid using camera filters',
                'Ensure text is sharp and readable',
                'One page per image is ideal',
              ].map(tip => (
                <div key={tip} className="flex items-start gap-2 text-blue-100">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-300" />
                  <span className="text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Consent */}
      <section id="privacy" className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Privacy & Data Usage</h2>
          </div>
          <div className="prose prose-slate max-w-none space-y-4 text-sm leading-relaxed text-slate-600">
            <div className="p-6 rounded-2xl bg-white border">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Data Privacy</h3>
              <p>All uploaded documents are stored securely on encrypted cloud storage. Only authorized reviewers and administrators have access to submitted materials. We do not share raw uploads with third parties.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Consent</h3>
              <p>By uploading a document, you confirm that you have the right to share it for research and model training purposes. If a document contains personally sensitive information, you must flag it during upload.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Terms of Contribution</h3>
              <p>Contributions are voluntary and credited to your profile. Approved data becomes part of the Khasi OCR training dataset, which may be used for academic research and language technology development. You may request removal of your data by contacting the admin team.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-3 mb-6">
            <Users className="w-8 h-8 text-blue-600" />
            <Target className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Help Build Khasi OCR?</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join fellow students from across Meghalaya in building the first comprehensive OCR dataset for the Khasi language.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25">
            Create Your Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Khasi OCR Platform. A student-led open data initiative from Meghalaya.</p>
          <p className="mt-2">For support, contact: <a href="mailto:support@khasiocr.org" className="text-blue-600 hover:underline">support@khasiocr.org</a></p>
        </div>
      </footer>
    </div>
  );
}
