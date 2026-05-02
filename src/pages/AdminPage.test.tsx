import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminPage } from './AdminPage';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockLogout = vi.fn();
let mockUser = { role: 'admin' };

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        logout: mockLogout,
    }),
}));

const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AdminPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = { role: 'admin' };
    });

    describe('【前端元素】', () => {
        it('畫面應包含必要的標題、返回連結與登出按鈕', () => {
            renderWithRouter(<AdminPage />);
            expect(screen.getByText('← 返回')).toBeInTheDocument();
            expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
        });
    });

    describe('【AuthContext 與狀態呈現】', () => {
        it('當角色為 admin 時應顯示管理員標籤', () => {
            mockUser = { role: 'admin' };
            renderWithRouter(<AdminPage />);
            const badge = screen.getByText('管理員');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('admin');
        });

        it('當角色非 admin 時應顯示一般用戶標籤', () => {
            mockUser = { role: 'user' };
            renderWithRouter(<AdminPage />);
            const badge = screen.getByText('一般用戶');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('user');
        });
    });

    describe('【互動邏輯】', () => {
        it('點擊登出按鈕時應呼叫 logout 並導向 login 頁面', () => {
            renderWithRouter(<AdminPage />);
            const logoutButton = screen.getByRole('button', { name: '登出' });
            fireEvent.click(logoutButton);

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });
});
