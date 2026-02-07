import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
    // Animation state for the fake dashboard
    const [activeTickers, setActiveTickers] = useState<number[]>([1, 2, 3]);

    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly toggle "activity" indicators
            setActiveTickers(prev => prev.map(n => Math.random() > 0.5 ? 1 : 0));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-white overflow-hidden selection:bg-indigo-500 selection:text-white">

            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 border-b border-slate-800/50 backdrop-blur-md bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight">Support<span className="text-indigo-400">Flow</span></span>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                            <Link to="/register" className="px-5 py-2.5 text-sm font-bold bg-white text-slate-900 rounded-full hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-20 pb-32">

                {/* Hero Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        New: OpenRouter LLM Integration
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        Customer Support, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient">Reimagined by AI</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed">
                        Stop drowning in tickets. SupportFlow uses advanced LLMs to categorize, prioritize, and draft responses to customer complaints instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.6)] hover:-translate-y-1">
                            Start Free Trial
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-lg border border-slate-700 transition-all hover:-translate-y-1">
                            Live Demo
                        </Link>
                    </div>
                </div>

                {/* 3D Dashboard Mockup */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 perspective-1000">
                    <div className="relative group transition-all duration-700 transform hover:rotate-x-0 rotate-x-6 scale-95 hover:scale-100">
                        {/* Glow behind dashboard */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-1000"></div>

                        {/* Dashboard Container */}
                        <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex h-[600px]">

                            {/* Fake Sidebar */}
                            <div className="w-20 border-r border-slate-800 bg-slate-900/50 flex flex-col items-center py-8 gap-6">
                                <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></div>
                                <div className="w-10 h-10 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></div>
                                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg></div>
                                <div className="w-10 h-10 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 bg-slate-900 flex flex-col">
                                {/* Fake Topbar */}
                                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-8">
                                    <div className="text-slate-400 text-sm font-medium">Dashboard / Overview</div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-xs text-green-500 font-medium">System Operational</span>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                                    </div>
                                </div>

                                {/* Dashboard Content */}
                                <div className="p-8">
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Live Support Overview</h2>
                                            <p className="text-slate-400 text-sm">Real-time AI analysis active</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 rounded-md bg-slate-800 text-xs text-slate-300 border border-slate-700">Last 24h</span>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-6 mb-8">
                                        <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10"><svg className="w-16 h-16 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg></div>
                                            <div className="text-slate-400 text-sm font-medium mb-1">Total Tickets</div>
                                            <div className="text-3xl font-bold text-white">1,248</div>
                                            <div className="text-green-400 text-xs font-medium mt-2 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                +12.5% from yesterday
                                            </div>
                                        </div>
                                        <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                            <div className="text-slate-400 text-sm font-medium mb-1">Avg Resolution Time</div>
                                            <div className="text-3xl font-bold text-white">1h 42m</div>
                                            <div className="text-indigo-400 text-xs font-medium mt-2">
                                                ↓ 35% faster with AI
                                            </div>
                                        </div>
                                        <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                            <div className="text-slate-400 text-sm font-medium mb-1">AI Automation Rate</div>
                                            <div className="text-3xl font-bold text-white">68%</div>
                                            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[68%]"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activity List */}
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Live Activity Feed</h3>
                                    <div className="space-y-3">
                                        {[
                                            { title: "Billing Discrepancy detected", user: "Alice M.", status: "Resolved", color: "green", time: "2m ago" },
                                            { title: "Login Failure (Error 503)", user: "Bob D.", status: "High Priority", color: "red", time: "5m ago" },
                                            { title: "Feature Request: Dark Mode", user: "Charlie", status: "AI Drafting", color: "purple", time: "Just now" },
                                            { title: "Subscription Cancellation", user: "Sarah J.", status: "Escalated", color: "orange", time: "12m ago" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-800 hover:bg-slate-800/50 transition cursor-default group">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-2 h-2 rounded-full bg-${item.color}-500 shadow-[0_0_10px_currentColor] text-${item.color}-500`}></div>
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-200 group-hover:text-white transition">{item.title}</div>
                                                        <div className="text-xs text-slate-500">{item.user} • {item.time}</div>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium bg-${item.color}-500/10 text-${item.color}-400 border border-${item.color}-500/20`}>
                                                    {item.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Powered by Next-Gen Intelligence</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Our stack combines local ML classifiers with state-of-the-art LLMs via OpenRouter.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 transition group">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Instant Severity Scoring</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Incoming tickets are analyzed in milliseconds using our local NLP engine to detect urgency and sentiment.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 transition group">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Generative Drafts</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Connect OpenRouter to generate empathetic, policy-aware email drafts for your agents to review.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-green-500/50 transition group">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Resolution Tracking</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Full history of every resolution provided, ensuring consistent communication across your team.
                            </p>
                        </div>
                    </div>
                </div>

            </main>

            {/* Simple Footer */}
            <footer className="border-t border-slate-800 py-12 bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
                    <p>&copy; 2026 SupportFlow AI. Built with React & Python.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
