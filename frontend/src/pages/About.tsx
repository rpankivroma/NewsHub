import React from 'react';
import { Newspaper, Target, Users, Award, Mail, Phone, MapPin } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
           <Newspaper className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">About NewsHub</h1>
        <p className="text-xl text-gray-500 font-medium">Your trusted source for quality journalism</p>
      </div>

      <div className="bg-white rounded-[2rem] p-10 md:p-16 border border-gray-100 shadow-sm mb-16">
        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-8">
          <p>
            NewsHub is a leading digital news platform dedicated to delivering accurate, timely, and comprehensive news coverage. 
            Founded in 2020, we are committed to journalistic integrity and providing our readers with the information they need to stay informed about the world around them.
          </p>
          <p>
            Our team of experienced journalists and editors work around the clock to bring you the latest breaking news, in-depth analysis, and thoughtful commentary on the issues that matter most.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: Target, title: "Our Mission", text: "To deliver accurate, unbiased news that empowers our readers to make informed decisions." },
          { icon: Users, title: "Our Team", text: "A diverse group of experienced journalists, editors, and analysts dedicated to quality reporting." },
          { icon: Award, title: "Our Values", text: "Integrity, transparency, and accountability guide everything we do." }
        ].map((item, i) => (
          <div key={i} className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <item.icon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50/50 rounded-[2rem] border border-blue-100 p-10 md:p-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Contact Us</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Email</p>
                <p className="text-blue-600 font-medium">contact@newshub.com</p>
                <p className="text-blue-600 font-medium mt-1">newsroom@newshub.com</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Phone</p>
                <p className="text-gray-600 font-medium">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">Address</p>
              <p className="text-gray-600 font-medium leading-relaxed">
                123 News Street, Media City, MC 12345<br />
                United States
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
