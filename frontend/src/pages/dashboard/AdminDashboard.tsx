import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchComplaints } from '../../services/api';
import type { Complaint } from '../../services/api';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            const data = await fetchComplaints();
            setComplaints(data);
        } catch (error) {
            console.error("Failed to load complaints", error);
        }
    };



    const filteredComplaints = filter === 'All'
        ? complaints
        : complaints.filter(c => c.status === filter);

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
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Support<span className="text-indigo-600">Flow</span> <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Admin</span></h1>
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

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">Admin Console</h2>
                        <p className="mt-1 text-gray-500">Manage support tickets and oversee system status.</p>
                    </div>
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                        {['All', 'Pending', 'In Progress', 'Resolved'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${filter === status
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaint</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Analysis</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredComplaints.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-sm font-medium text-gray-900">No complaints found</h3>
                                            <p className="mt-1 text-xs text-gray-500">There are no complaints matching this filter.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredComplaints.map((complaint) => (
                                        <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs" title={complaint.title}>
                                                            {complaint.title}
                                                        </div>
                                                        <div className="text-xs text-gray-500 line-clamp-1 max-w-xs" title={complaint.description}>
                                                            {complaint.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{complaint.user_name || 'Unknown'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                    {complaint.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                    ${complaint.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        complaint.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                            'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                                    {complaint.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                    ${complaint.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        complaint.priority === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                            'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                    {complaint.priority || 'Low'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    {complaint.ai_severity_score !== undefined && (
                                                        <span className={`flex items-center gap-1 text-xs font-medium ${complaint.ai_severity_score >= 8 ? 'text-red-600' :
                                                            complaint.ai_severity_score >= 5 ? 'text-orange-600' : 'text-blue-600'
                                                            }`}>
                                                            Severity: {complaint.ai_severity_score}/10
                                                        </span>
                                                    )}
                                                    {complaint.ai_predicted_resolution_time && (
                                                        <span className="text-xs text-gray-500">
                                                            Est: {complaint.ai_predicted_resolution_time}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(complaint.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => navigate(`/admin/dashboard/suggestions/${complaint.id}`)}
                                                    className={`inline-flex items-center justify-center px-3 py-1.5 border text-xs font-medium rounded-md transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
                                                        ${complaint.status === 'Resolved'
                                                            ? 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                                                            : 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100'}`}
                                                >
                                                    {complaint.status === 'Resolved' ? 'View / Update' : 'See Solution'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


            </main>
        </div>
    );
};

export default AdminDashboard;
