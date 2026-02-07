import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminSuggestion from '../pages/dashboard/AdminSuggestion';
import * as api from '../services/api';

// Mock AuthContext
const mockLogout = vi.fn();
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: { name: 'Admin User', role: 'admin' },
        logout: mockLogout,
    }),
}));

// Mock API
vi.mock('../services/api', () => ({
    getComplaintSolution: vi.fn(),
    getComplaint: vi.fn(),
    updateComplaint: vi.fn(),
}));

// Mock Router params
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ id: '123' }),
        useNavigate: () => vi.fn(), // Return dummy navigate
    };
});

describe('AdminSuggestion Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders and fetches data on mount', async () => {
        // Setup API mocks
        (api.getComplaintSolution as any).mockResolvedValue({ suggestion: 'AI Suggested Solution' });
        (api.getComplaint as any).mockResolvedValue({
            id: 123,
            title: 'Test Complaint',
            description: 'Test Desc',
            status: 'Pending',
            created_at: '2023-01-01',
            resolution: 'Previous Resolution'
        });

        render(
            <BrowserRouter>
                <AdminSuggestion />
            </BrowserRouter>
        );

        // Verify Loading state initially (might be too fast to catch without valid act, but let's check final state)
        expect(screen.getByText(/Analyzing complaint/i)).toBeInTheDocument();

        // Verify loaded data
        await waitFor(() => {
            expect(screen.getByText(/Complaint ID: #123/i)).toBeInTheDocument();
        });

        expect(screen.getByDisplayValue('AI Suggested Solution')).toBeInTheDocument();
        expect(screen.getByText('Previous Resolution')).toBeInTheDocument();
    });

    it('handles resolution update', async () => {
        (api.getComplaintSolution as any).mockResolvedValue({ suggestion: 'AI Sug' });
        (api.getComplaint as any).mockResolvedValue({ id: 123 }); // Min data

        render(
            <BrowserRouter>
                <AdminSuggestion />
            </BrowserRouter>
        );

        await waitFor(() => screen.getByDisplayValue('AI Sug'));

        const textarea = screen.getByDisplayValue('AI Sug');
        fireEvent.change(textarea, { target: { value: 'Updated Solution' } });

        const sendButton = screen.getByRole('button', { name: /Send \/ Update Solution/i });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(api.updateComplaint).toHaveBeenCalledWith(123, {
                status: 'Resolved',
                resolution: 'Updated Solution'
            });
        });
    });
});
