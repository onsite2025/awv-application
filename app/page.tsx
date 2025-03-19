import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6">
          <nav className="flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">AWV Platform</div>
            <div className="space-x-4">
              <Link 
                href="/login" 
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <div className="py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Transform Your Annual Wellness Visits
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A powerful platform designed for healthcare providers to streamline 
                Annual Wellness Visits with customizable templates and patient-centered care.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  href="/register" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-center"
                >
                  Start Free Trial
                </Link>
                <Link 
                  href="/demo" 
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium text-center"
                >
                  See Demo
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              {/* Placeholder for hero image */}
              <div className="bg-blue-100 h-96 rounded-lg flex items-center justify-center">
                <p className="text-blue-800 font-medium">AWV Platform Screenshot</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-white rounded-xl shadow-sm">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to conduct efficient and effective Annual Wellness Visits
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Template Builder",
                description: "Create customizable assessment templates with skip logic and pre-assigned recommendations."
              },
              {
                title: "Patient Management",
                description: "Easily add, search, and manage patient records with secure data storage."
              },
              {
                title: "Visit History",
                description: "Access and download past visits as PDF documents for record-keeping."
              },
              {
                title: "Personalized Plans",
                description: "Generate customized wellness plans based on patient responses."
              },
              {
                title: "Multi-User Access",
                description: "Role-based permissions for providers, admins, and staff members."
              },
              {
                title: "Mobile Compatible",
                description: "Fully responsive design for use on tablets and smartphones."
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 md:py-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to improve your AWV workflow?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join healthcare providers who are streamlining their Annual Wellness Visits
            with our platform.
          </p>
          <Link 
            href="/register" 
            className="px-8 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium inline-block"
          >
            Get Started Today
          </Link>
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-bold text-blue-600 mb-4">AWV Platform</div>
              <p className="text-gray-600">
                Modern solution for Annual Wellness Visits
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-600 hover:text-blue-600">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-blue-600">Pricing</Link></li>
                <li><Link href="/demo" className="text-gray-600 hover:text-blue-600">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/support" className="text-gray-600 hover:text-blue-600">Support</Link></li>
                <li><Link href="/documentation" className="text-gray-600 hover:text-blue-600">Documentation</Link></li>
                <li><Link href="/faq" className="text-gray-600 hover:text-blue-600">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 hover:text-blue-600">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-600 hover:text-blue-600">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} AWV Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
} 