import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getComplaintSolution, updateComplaint, getComplaint } from '../../services/api';
import type { Complaint } from '../../services/api';

const AdminSuggestion: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [aiSolution, setAiSolution] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [complaint, setComplaint] = useState<Complaint | null>(null);

    useEffect(() => {
        if (id) {
            init(parseInt(id));
        }
    }, [id]);

    const init = async (complaintId: number) => {
        setIsLoading(true);
        try {
            const [solutionData, complaintData] = await Promise.all([
                getComplaintSolution(complaintId),
                getComplaint(complaintId)
            ]);
            setAiSolution(solutionData.suggestion);
            setComplaint(complaintData);
        } catch (err) {
            console.error("Failed to fetch data", err);
            setError("Failed to load details.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!id || !aiSolution) return;
        try {
            await updateComplaint(parseInt(id), {
                status: 'Resolved',
                resolution: aiSolution
            });
            navigate('/admin/dashboard');
        } catch (err) {
            console.error("Failed to resolve complaint", err);
            setError("Failed to update status.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Same Nav and Back Button Code */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Support<span className="text-indigo-600">Flow</span> <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Admin</span></h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
                                <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                            </div>
                            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Logout">
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
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">AI Recommended Solution</h2>
                            <p className="text-sm text-purple-700">Complaint ID: #{id}</p>
                        </div>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-500 font-medium">Analyzing complaint...</p>
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">{error}</div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {/* Only show existing history if there is one */}
                                {complaint?.resolution && (
                                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Previous Solutions</h3>
                                        <div className="prose prose-sm max-w-none text-gray-700 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                                            {complaint.resolution}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {complaint?.resolution ? 'Add New Update / Solution' : 'Proposed Solution'}
                                    </label>
                                    <textarea
                                        value={aiSolution || ""}
                                        onChange={(e) => setAiSolution(e.target.value)}
                                        className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                                        placeholder="Generating solution..."
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        This text will be sent to the customer via email and dashboard.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleResolve}
                            disabled={isLoading || !!error}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Send / Update Solution
                        </button>
                    </div>
                </div >
            </main >
        </div >
    );
};

export default AdminSuggestion;
