import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getComplaint } from '../../services/api';
import type { Complaint } from '../../services/api';

const ComplaintDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadComplaint(parseInt(id));
        }
    }, [id]);

    const loadComplaint = async (complaintId: number) => {
        setIsLoading(true);
        try {
            const data = await getComplaint(complaintId);
            setComplaint(data);
        } catch (err) {
            console.error("Failed to load complaint", err);
            setError("Failed to load complaint details.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col">
                <div className="text-red-500 mb-4">{error || "Complaint not found"}</div>
                <button onClick={() => navigate('/customer/dashboard')} className="text-indigo-600 hover:text-indigo-800">Return to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Support<span className="text-indigo-600">Flow</span></h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
                                <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Logout"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/customer/dashboard')}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>

                {/* Complaint Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="px-6 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                    ${complaint.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-100' :
                                        complaint.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                    {complaint.status}
                                </span>
                                <span className="text-xs text-gray-400">ID: #{complaint.id}</span>
                                <span className="text-xs text-gray-400">• {new Date(complaint.created_at).toLocaleDateString()}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{complaint.title}</h2>
                            <span className="inline-flex mt-2 items-center px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">
                                {complaint.category}
                            </span>
                        </div>
                        {/* Severity Badge */}
                        {complaint.ai_severity_score !== undefined && (
                            <div className={`px-4 py-2 rounded-lg border flex flex-col items-center ${complaint.ai_severity_score >= 8 ? 'bg-red-50 border-red-100 text-red-700' :
                                complaint.ai_severity_score >= 5 ? 'bg-orange-50 border-orange-100 text-orange-700' :
                                    'bg-blue-50 border-blue-100 text-blue-700'
                                }`}>
                                <span className="text-xs font-semibold uppercase tracking-wider">Severity</span>
                                <span className="text-2xl font-bold">{complaint.ai_severity_score}/10</span>
                            </div>
                        )}
                    </div>
                    <div className="px-6 py-6 bg-white">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
                    </div>
                </div>

                {/* Resolution Section */}
                {/* Resolution Section */}
                {complaint.resolution || complaint.status === 'Resolved' ? (
                    <div className="bg-white rounded-xl shadow-lg border-l-4 border-green-500 overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
                        <div className="bg-green-50 px-6 py-5 border-b border-green-100 flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-full shadow-sm">
                                <svg className="h-6 w-6 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Resolution Provided
                                </h2>
                                <p className="text-sm text-green-700 font-medium">Official response from Your Support Agent</p>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="prose prose-green max-w-none text-gray-800 leading-relaxed font-medium">
                                <div className="whitespace-pre-wrap bg-green-50/50 p-6 rounded-lg border border-green-100/50">
                                    {complaint.resolution || <span className="italic text-gray-500">No details provided.</span>}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                    Case closed on {new Date(complaint.updated_at || new Date()).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Pending Resolution</h3>
                        <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                            Our team is currently reviewing your request. You will be notified once a resolution is provided.
                        </p>
                        {complaint.ai_predicted_resolution_time && (
                            <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                                Estimated Resolution: {complaint.ai_predicted_resolution_time}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ComplaintDetails;
