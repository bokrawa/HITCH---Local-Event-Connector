import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Compass className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">HITCH</span>
            </div>
            <p className="text-gray-600 mb-4">
              Discover and join local events, connect with your community, and create memorable experiences.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-gray-400 hover:text-gray-600">
                <Github className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-gray-600">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-gray-600">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/events" className="text-gray-600 hover:text-indigo-600">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/create-event" className="text-gray-600 hover:text-indigo-600">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/feed" className="text-gray-600 hover:text-indigo-600">
                  Event Feed
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-indigo-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-indigo-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-indigo-600">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-400 text-sm text-center">
            © {currentYear} HITCH. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}