import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                CF
              </div>
              <span className="text-white font-bold text-lg tracking-tight">CampusFix</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Automated Campus Maintenance & AI-Powered Complaint Routing Platform. Bridging students, faculty, and maintenance crews with zero delays.
            </p>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-0.5 bg-gray-800 text-blue-400 rounded">React 19</span>
              <span className="px-2 py-0.5 bg-gray-800 text-emerald-400 rounded">Spring Boot 3</span>
              <span className="px-2 py-0.5 bg-gray-800 text-purple-400 rounded">MySQL 8</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Access</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/complaints" className="hover:text-white transition">All Complaints</Link>
              </li>
              <li>
                <Link to="/new-complaint" className="hover:text-white transition">Report New Issue</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition">Public Ticket Tracker</Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-white transition">Campus Notices</Link>
              </li>
            </ul>
          </div>

          {/* Support Departments */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Departments</h4>
            <ul className="space-y-2 text-sm">
              <li>Electrical & Power Supply (SLA: 12h)</li>
              <li>Plumbing & Water Systems (SLA: 18h)</li>
              <li>IT, Systems & Campus WiFi (SLA: 24h)</li>
              <li>Civil & Carpentry Support (SLA: 36h)</li>
              <li>Estate & Emergency Safety (SLA: 6h)</li>
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Emergency Helpdesk</h4>
            <p className="text-sm text-gray-400 mb-2">Campus Estate Office, Ground Floor Administrative Block</p>
            <p className="text-sm font-semibold text-white">Emergency Hotline: +91 (80) 2345-6789</p>
            <p className="text-sm text-blue-400">helpdesk@campusfix.edu</p>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>© 2026 CampusFix Platform. Full Stack Java Capstone Project (Weeks 1 to 15).</p>
          <div className="flex gap-4">
            <span className="text-emerald-500">● System Operational (Actuator Healthy)</span>
            <span>REST API v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
