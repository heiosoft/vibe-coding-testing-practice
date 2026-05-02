import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { BrowserRouter } from 'react-router-dom';
import { productApi } from '../api/productApi';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockLogout = vi.fn();
let mockUser: any = { username: 'TestUser', role: 'user' };

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        logout: mockLogout,
    }),
}));

vi.mock('../api/productApi', () => ({
    productApi: {
        getProducts: vi.fn(),
    },
}));

const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = { username: 'TestUser', role: 'user' };
    });

    describe('【前端元素與初始渲染】', () => {
        it('畫面初始載入時應顯示載入中狀態', () => {
            // Delay resolution to capture loading state
            (productApi.getProducts as any).mockImplementation(() => new Promise(() => {}));
            
            renderWithRouter(<DashboardPage />);
            
            expect(screen.getByText('載入商品中...')).toBeInTheDocument();
        });
    });

    describe('【用戶資訊呈現】', () => {
        it('應正確顯示使用者的名稱與頭像首字母', async () => {
            (productApi.getProducts as any).mockResolvedValue([]);
            renderWithRouter(<DashboardPage />);
            
            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });

            expect(screen.getByText('Welcome, TestUser 👋')).toBeInTheDocument();
            expect(screen.getByText('T')).toBeInTheDocument();
        });

        it('當角色為 admin 時應顯示管理後台連結與管理員標籤', async () => {
            mockUser = { username: 'AdminUser', role: 'admin' };
            (productApi.getProducts as any).mockResolvedValue([]);
            renderWithRouter(<DashboardPage />);
            
            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });

            expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();
            expect(screen.getByText('管理員')).toBeInTheDocument();
        });

        it('當角色為一般用戶時不應顯示管理後台連結', async () => {
            mockUser = { username: 'NormalUser', role: 'user' };
            (productApi.getProducts as any).mockResolvedValue([]);
            renderWithRouter(<DashboardPage />);
            
            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });

            expect(screen.queryByText('🛠️ 管理後台')).not.toBeInTheDocument();
            expect(screen.getByText('一般用戶')).toBeInTheDocument();
        });
    });

    describe('【Mock API 與 商品列表】', () => {
        it('API 請求成功時應隱藏載入狀態並渲染商品', async () => {
            const mockProducts = [
                { id: 1, name: 'Product A', description: 'Desc A', price: 100 },
                { id: 2, name: 'Product B', description: 'Desc B', price: 200 }
            ];
            (productApi.getProducts as any).mockResolvedValue(mockProducts);
            
            renderWithRouter(<DashboardPage />);
            
            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });

            expect(screen.getByText('Product A')).toBeInTheDocument();
            expect(screen.getByText('Desc A')).toBeInTheDocument();
            expect(screen.getByText('NT$ 100')).toBeInTheDocument();
            
            expect(screen.getByText('Product B')).toBeInTheDocument();
            expect(screen.getByText('Desc B')).toBeInTheDocument();
            expect(screen.getByText('NT$ 200')).toBeInTheDocument();
        });

        it('API 請求失敗時 (非401) 應顯示錯誤訊息', async () => {
            (productApi.getProducts as any).mockRejectedValue({
                response: {
                    status: 500,
                    data: { message: '伺服器錯誤' }
                }
            });
            
            renderWithRouter(<DashboardPage />);
            
            await waitFor(() => {
                expect(screen.getByText('伺服器錯誤')).toBeInTheDocument();
            });
            expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
        });

        it('API 請求發生 401 錯誤時不應顯示錯誤訊息', async () => {
            (productApi.getProducts as any).mockRejectedValue({
                response: {
                    status: 401,
                    data: { message: '未授權' }
                }
            });
            
            renderWithRouter(<DashboardPage />);
            
            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });
            
            expect(screen.queryByText('未授權')).not.toBeInTheDocument();
            expect(screen.queryByText('無法載入商品資料')).not.toBeInTheDocument();
        });
    });

    describe('【互動邏輯】', () => {
        it('點擊登出按鈕時應呼叫 logout 並導向 login 頁面', async () => {
            (productApi.getProducts as any).mockResolvedValue([]);
            renderWithRouter(<DashboardPage />);
            
            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });

            const logoutButton = screen.getByRole('button', { name: '登出' });
            fireEvent.click(logoutButton);

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });
});
