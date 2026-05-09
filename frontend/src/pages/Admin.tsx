import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { 
  LayoutDashboard, FileText, Send, Users as UsersIcon, Heart,
  TrendingUp, Clock, MessageSquare, Plus, Edit2, Trash2, Star,
  AlertCircle, Check, X, CheckCircle, Search, Filter, Upload, Image as ImageIcon, Loader2,
  Mail, Shield, Download, PieChart as PieChartIcon, UserCheck, Activity, Globe, Monitor, Smartphone,
  ExternalLink, BarChart2, Briefcase, Settings, TrendingDown, Eye, Newspaper, User as UserIcon, DollarSign, Pencil
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { cn } from '../lib/utils';
import { adminService } from '../services/adminService';
import { User, Article, Category } from '../types';

import { AdminStats } from '../components/Admin/AdminStats/index';
import { ArticleManager } from '../components/Admin/ArticleManager';
import { SubmissionManager } from '../components/Admin/SubmissionManager';
import { UserManager } from '../components/Admin/UserManager';
import { CategoryManager } from '../components/Admin/CategoryManager';
import { DonationManager } from '../components/Admin/DonationManager';
import { AboutPageManager } from '../components/Admin/AboutPageManager';
import { Journal } from '../components/Admin/Journal';
import { AdminManager } from '../components/Admin/AdminManager';

interface AdminProps {
  user: User | null;
}

interface Stats {
  content: {
    totalArticles: number;
    avgReadingTime: number;
    avgViews: number;
    totalViews: number;
    topViewed: any[];
    leastViewed: any[];
  };
  engagement: {
    totalUsers: number;
    activeUsers: number;
    avgLikes: number;
    avgComments: number;
    newUsersTrend: any[];
  };
  traffic: {
    todayVisits: number;
    totalVisits: number;
    newUsers: number;
    returningUsers: number;
    trafficTrend: any[];
    deviceDist: any[];
    returningDist: any[];
    geoDist?: any[];
  };
  categories: {
    distribution: any[];
    popular: any[];
  };
  authors: {
    count: number;
    avgArticles: number;
    avgViews: number;
    top: any[];
  };
  system: {
    pendingArticles: number;
    rejectedArticles: number;
    lastPublished: { title: string; time: string };
    recentLogs: any[];
  };
  business: {
    ctr: number;
    impressions: number;
    topConverting: any[];
  };
}

export default function Admin({ user }: AdminProps) {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [donations, setDonations] = React.useState<any[]>([]);
  const [donationSettings, setDonationSettings] = React.useState<any>(null);
  const [aboutPage, setAboutPage] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Statistics Filters
  const [statsFilters, setStatsFilters] = React.useState({
    days: 30,
    topLimit: 5,
    sectionFilter: 'All'
  });
  const [engagementTrendPeriod, setEngagementTrendPeriod] = React.useState('Daily');
  const [trafficTrendDays, setTrafficTrendDays] = React.useState(7);
  const [convertingMetric, setConvertingMetric] = React.useState('Total Engagement');

  // Article Management State
  const [isEditingArticle, setIsEditingArticle] = React.useState(false);
  const [currentArticle, setCurrentArticle] = React.useState<Partial<Article> | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  // New Category State
  const [newCategory, setNewCategory] = React.useState({ name: '', description: '' });
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);

  const handleToggleUserBlock = async (userId: number) => {
    try {
      await adminService.toggleUserStatus(userId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await adminService.uploadImage(file);
      setCurrentArticle(prev => prev ? { ...prev, image_url: url } : null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    try {
      await adminService.createCategory(newCategory);
      setNewCategory({ name: '', description: '' });
      setIsAddingCategory(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure? This will fail if there are articles in this category.')) return;
    try {
      await adminService.deleteCategory(id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'dashboard') {
        const [statsData, categoriesData] = await Promise.all([
          adminService.getStats({
            days: statsFilters.days,
            topLimit: statsFilters.topLimit,
            trafficTrendDays: trafficTrendDays
          }),
          adminService.getCategories()
        ]);
        setStats(statsData);
        setCategories(categoriesData);
      } else if (activeTab === 'articles') {
        const data = await adminService.getCategories();
        setCategories(data);
      } else if (activeTab === 'categories') {
        const data = await adminService.getCategories();
        setCategories(data);
      } else if (activeTab === 'donations') {
        const data = await adminService.getDonations();
        setDonations(data);
        const settings = await adminService.getDonationSettings();
        setDonationSettings(settings);
      } else if (activeTab === 'about') {
        const data = await adminService.getAboutPage();
        setAboutPage(data);
      }
      
      // Always refresh stats for the submission count badge
      if (activeTab !== 'dashboard') {
        const data = await adminService.getStats();
        setStats(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, statsFilters.days, statsFilters.topLimit, trafficTrendDays]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData, statsFilters.days, statsFilters.topLimit, trafficTrendDays]);

  const exportPDF = async () => {
    const element = document.getElementById('analytics-dashboard');
    if (!element) return;
    
    // Create a loading overlay if needed, but for now just run
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#f9fafb' // bg-gray-50
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`NewsHub-Analytics-Report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentArticle) return;
    try {
      if (currentArticle.id) {
        await adminService.updateArticle(currentArticle.id, currentArticle);
      } else {
        await adminService.createArticle(currentArticle);
      }
      setIsEditingArticle(false);
      setCurrentArticle(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditArticle = (article: Article) => {
    setCurrentArticle({
      ...article,
      image_url: article.image_url || article.imageUrl,
      is_featured: !!article.is_featured
    });
    // Find category ID
    const cat = categories.find(c => c.name === article.category);
    if (cat) {
      setCurrentArticle(prev => ({ ...prev, category_id: cat.id }));
    }
    setIsEditingArticle(true);
  };

  const handleNewArticle = () => {
    setCurrentArticle({
      title: '',
      excerpt: '',
      content: '',
      image_url: '',
      category_id: categories[0]?.id || 1,
      is_featured: false
    });
    setIsEditingArticle(true);
  };

  const handleDeleteArticle = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await adminService.deleteArticle(id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateSubmission = async (id: number, status: string) => {
    try {
      await adminService.updateSubmissionStatus(id, status);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateDonationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.updateDonationSettings(donationSettings);
      alert('Donation settings updated successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateAboutPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.updateAboutPage(aboutPage);
      alert('About page updated successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!user || !user.is_admin) {
    return <div className="max-w-6xl mx-auto px-4 py-24 text-center">Unauthorized. You must be an admin to view this page.</div>;
  }

  const adminTabs = [
    { id: 'dashboard', label: 'Statistics', icon: BarChart2 },
    { id: 'articles', label: 'Articles', icon: Newspaper },
    { id: 'submissions', label: `Submissions ${stats?.system.pendingArticles ? `(${stats.system.pendingArticles})` : ''}`, icon: UserIcon },
    { id: 'categories', label: 'Categories', icon: LayoutDashboard },
    { id: 'journal', label: 'Journal', icon: Activity },
    { id: 'users', label: 'Users', icon: Shield },
    ...(user.is_super_admin ? [{ id: 'admins', label: 'Admins', icon: UserCheck }] : []),
    { id: 'donations', label: 'Donations', icon: DollarSign },
    { id: 'about', label: 'About', icon: Pencil },
  ];

  const downloadPDFReport = async () => {
    if (!stats) return;
    
    try {
      setIsLoading(true);
      const doc = new jsPDF('p', 'mm', 'a4');
      const now = new Date().toLocaleString();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title Page
      doc.setFontSize(24);
      doc.setTextColor(15, 23, 42); // #0f172a
      doc.text('NewsHub Analytics', 14, 30);
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text('Comprehensive Performance Report', 14, 40);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${now}`, 14, 55);
      doc.text(`Time Range: Last ${statsFilters.days} days`, 14, 60);

      // Section 1: Content Performance
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text('1. Content Performance', 14, 75);
      autoTable(doc, {
        startY: 80,
        head: [['Metric', 'Value']],
        body: [
          ['Total Articles', stats.content.totalArticles],
          ['Avg Reading Time', `${stats.content.avgReadingTime} min`],
          ['Avg Views per Article', stats.content.avgViews],
          ['Total Page Views', stats.content.totalViews],
        ],
        headStyles: { fillColor: [37, 99, 235] }
      });

      // Section 2: User Engagement
      doc.setFontSize(16);
      doc.text('2. User Engagement', 14, (doc as any).lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Metric', 'Value']],
        body: [
          ['Total Registered Users', stats.engagement.totalUsers],
          ['Active Users (30d)', stats.engagement.activeUsers],
          ['Avg Likes per Article', stats.engagement.avgLikes],
          ['Avg Comments per Article', stats.engagement.avgComments],
        ],
        headStyles: { fillColor: [37, 99, 235] }
      });

      doc.addPage();
      doc.setFontSize(16);
      doc.text('3. Traffic Analytics', 14, 20);
      autoTable(doc, {
        startY: 25,
        head: [['Metric', 'Value']],
        body: [
          ['Total Overall Views', stats.traffic.totalVisits],
          ['New Registered Users (Period)', stats.traffic.newUsers],
          ['Returning Visitors', stats.traffic.returningUsers],
        ],
        headStyles: { fillColor: [37, 99, 235] }
      });

      // Section 4: Geographic Hubs
      doc.setFontSize(16);
      doc.text('4. Geographic Distribution (Unique Visitors)', 14, (doc as any).lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Country', 'Unique Visitors', 'Market Share']],
        body: (stats.traffic.geoDist || [])
          .filter((d: any) => d.country !== 'Unknown')
          .slice(0, 15)
          .map(d => [
            d.country, 
            d.count, 
            `${((d.count / (stats.traffic.totalVisits || 1)) * 100).toFixed(1)}%`
          ]),
        headStyles: { fillColor: [37, 99, 235] }
      });

      doc.addPage();
      doc.setFontSize(16);
      doc.text('5. Category Performance', 14, 20);
      autoTable(doc, {
        startY: 25,
        head: [['Category', 'Articles Published', 'Cumulative Views']],
        body: stats.categories.popular.map(c => [c.name, c.articles, c.views]),
        headStyles: { fillColor: [37, 99, 235] }
      });

      doc.setFontSize(16);
      doc.text('6. Author Performance', 14, (doc as any).lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Author', 'Total Articles', 'Total Views']],
        body: stats.authors.top.map(a => [a.name, a.articles, a.views]),
        headStyles: { fillColor: [37, 99, 235] }
      });

      doc.save(`newshub-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
      await adminService.trackPdfDownload().catch(console.error);
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF report: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmptyState = (message: string) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
      <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
      <p className="text-gray-500 font-medium text-lg">{message}</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-10 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#0f172a]">Admin Panel</h1>
        {isLoading && <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />}
      </div>

      <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
         {adminTabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-[#3b82f6] text-white shadow-md shadow-blue-100" 
                  : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
              )}
            >
               <tab.icon className="w-5 h-5 flex-shrink-0" />
               <span>{tab.label}</span>
            </button>
         ))}
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {activeTab === 'dashboard' && stats && (
        <AdminStats 
          stats={stats}
          statsFilters={statsFilters}
          setStatsFilters={setStatsFilters}
          engagementTrendPeriod={engagementTrendPeriod}
          setEngagementTrendPeriod={setEngagementTrendPeriod}
          trafficTrendDays={trafficTrendDays}
          setTrafficTrendDays={setTrafficTrendDays}
          convertingMetric={convertingMetric}
          setConvertingMetric={setConvertingMetric}
          downloadPDFReport={downloadPDFReport}
        />
      )}


      {activeTab === 'articles' && (
        <ArticleManager 
          categories={categories}
          user={user}
          isEditingArticle={isEditingArticle}
          setIsEditingArticle={setIsEditingArticle}
          currentArticle={currentArticle}
          setCurrentArticle={setCurrentArticle}
          handleSaveArticle={handleSaveArticle}
          handleEditArticle={handleEditArticle}
          handleDeleteArticle={handleDeleteArticle}
          handleFileUpload={handleFileUpload}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
        />
      )}

      {activeTab === 'submissions' && (
        <SubmissionManager 
          handleUpdateSubmission={handleUpdateSubmission}
        />
      )}

      {activeTab === 'users' && (
        <UserManager 
          user={user}
          handleToggleUserBlock={handleToggleUserBlock}
          totalUsersCount={stats?.engagement.totalUsers || 0}
        />
      )}

      {activeTab === 'categories' && (
        <CategoryManager 
          categories={categories}
          isAddingCategory={isAddingCategory}
          setIsAddingCategory={setIsAddingCategory}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          handleCreateCategory={handleCreateCategory}
          handleDeleteCategory={handleDeleteCategory}
        />
      )}

      {activeTab === 'donations' && (
        <DonationManager 
          donationSettings={donationSettings}
          setDonationSettings={setDonationSettings}
          handleUpdateDonationSettings={handleUpdateDonationSettings}
          donations={donations}
          renderEmptyState={renderEmptyState}
        />
      )}

      {activeTab === 'about' && (
        <AboutPageManager 
          aboutPage={aboutPage}
          setAboutPage={setAboutPage}
          handleUpdateAboutPage={handleUpdateAboutPage}
        />
      )}

      {activeTab === 'admins' && <AdminManager />}

      {activeTab === 'journal' && <Journal />}
    </div>
  );
}
