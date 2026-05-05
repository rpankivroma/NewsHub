import React from 'react';
import { Newspaper, Target, Users, Award, Mail, Phone, MapPin } from 'lucide-react';
import { newsService } from '../services/newsService';

export default function About() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAbout = async () => {
      try {
        const aboutData = await newsService.getAbout();
        setData(aboutData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (isLoading) return <div className="py-24 text-center">Loading about info...</div>;
  if (!data) return <div className="py-24 text-center">Failed to load about information.</div>;

  const missionItems = [
    { icon: Target, title: "Our Mission", text: data.mission_statement },
    { icon: Users, title: "Our Team", text: data.team_description },
    { icon: Award, title: "Our Values", text: data.values_description }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
           <Newspaper className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{data.title}</h1>
        <p className="text-xl text-gray-500 font-medium">{data.subtitle}</p>
      </div>

      <div className="bg-white rounded-[2rem] p-10 md:p-16 border border-gray-100 shadow-sm mb-16">
        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-8">
           {data.main_content.split('\n\n').map((para: string, i: number) => (
             <p key={i}>{para}</p>
           ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {missionItems.map((item, i) => (
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
                <p className="text-blue-600 font-medium">{data.email}</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Phone</p>
                <p className="text-gray-600 font-medium">{data.phone}</p>
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
                {data.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
