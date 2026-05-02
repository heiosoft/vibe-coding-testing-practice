import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from './LoginPage';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockLogin = vi.fn();
const mockClearAuthExpiredMessage = vi.fn();

let mockUseAuthValues = {
    login: mockLogin,
    isAuthenticated: false,
    authExpiredMessage: '',
    clearAuthExpiredMessage: mockClearAuthExpiredMessage,
};

vi.mock('../context/AuthContext', () => ({
    useAuth: () => mockUseAuthValues,
}));

const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuthValues = {
            login: mockLogin,
            isAuthenticated: false,
            authExpiredMessage: '',
            clearAuthExpiredMessage: mockClearAuthExpiredMessage,
        };
    });

    describe('【前端元素】', () => {
        it('畫面應包含必要的輸入框與按鈕', () => {
            renderWithRouter(<LoginPage />);
            expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
            expect(screen.getByLabelText('密碼')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
        });
    });

    describe('【表單驗證邏輯】', () => {
        it('Email 格式不正確時應顯示錯誤訊息', async () => {
            renderWithRouter(<LoginPage />);
            const emailInput = screen.getByLabelText('電子郵件');
            const submitButton = screen.getByRole('button', { name: '登入' });

            await userEvent.type(emailInput, 'invalid-email');
            await userEvent.click(submitButton);

            expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('密碼長度不足時應顯示錯誤訊息', async () => {
            renderWithRouter(<LoginPage />);
            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(passwordInput, 'abc12');
            await userEvent.click(submitButton);

            expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('密碼未包含英數字時應顯示錯誤訊息', async () => {
            renderWithRouter(<LoginPage />);
            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(passwordInput, '12345678');
            await userEvent.click(submitButton);

            expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();

            await userEvent.clear(passwordInput);
            await userEvent.type(passwordInput, 'abcdefgh');
            await userEvent.click(submitButton);

            expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    describe('【Mock API 與 狀態邏輯】', () => {
        it('送出表單時應顯示「登入中...」且停用輸入框', async () => {
            // Delay mockLogin to check loading state
            mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
            
            renderWithRouter(<LoginPage />);
            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(passwordInput, 'password123');
            
            fireEvent.click(submitButton); // fireEvent doesn't wait for state updates like userEvent

            expect(screen.getByRole('button', { name: '登入中...' })).toBeInTheDocument();
            expect(submitButton).toBeDisabled();
            expect(emailInput).toBeDisabled();
            expect(passwordInput).toBeDisabled();

            await waitFor(() => {
                expect(submitButton).not.toBeDisabled();
            });
        });

        it('登入失敗時應顯示 API 回傳的錯誤訊息', async () => {
            mockLogin.mockRejectedValue({
                response: {
                    data: {
                        message: '登入失敗，請稍後再試',
                    },
                },
            });

            renderWithRouter(<LoginPage />);
            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(passwordInput, 'password123');
            await userEvent.click(submitButton);

            expect(await screen.findByText('登入失敗，請稍後再試')).toBeInTheDocument();
        });

        it('登入成功時應導向至 dashboard', async () => {
            mockLogin.mockResolvedValue(true);

            renderWithRouter(<LoginPage />);
            const emailInput = screen.getByLabelText('電子郵件');
            const passwordInput = screen.getByLabelText('密碼');
            const submitButton = screen.getByRole('button', { name: '登入' });

            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(passwordInput, 'password123');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });
    });

    describe('【AuthContext 整合】', () => {
        it('當 authExpiredMessage 有值時應顯示錯誤並清除訊息', () => {
            mockUseAuthValues.authExpiredMessage = '您的登入已過期';

            renderWithRouter(<LoginPage />);

            expect(screen.getByText('您的登入已過期')).toBeInTheDocument();
            expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
        });

        it('當已經登入時應自動導向 dashboard', () => {
            mockUseAuthValues.isAuthenticated = true;

            renderWithRouter(<LoginPage />);

            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });
});
