
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import { AuthContext } from "@/context/AuthContext";
import { AuthContextType } from "@/types/auth";

// Mock the AuthContext
const mockAuthContext: Partial<AuthContextType> = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
};

// Mock the AuthRedirect component
jest.mock("@/components/auth/AuthRedirect", () => ({
  AuthRedirect: () => <div data-testid="auth-redirect" />
}));

// Mock the AuthForm component
jest.mock("@/components/auth/AuthForm", () => ({
  AuthForm: ({ type }: { type: string }) => (
    <div data-testid="auth-form">Auth Form ({type})</div>
  ),
}));

describe("LoginPage", () => {
  const renderLoginPage = (contextOverrides = {}) => {
    const authContextValue = { ...mockAuthContext, ...contextOverrides };
    
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authContextValue as AuthContextType}>
          <LoginPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  test("renders the login page", () => {
    renderLoginPage();
    
    // Check that the auth redirect component is rendered
    expect(screen.getByTestId("auth-redirect")).toBeInTheDocument();
    
    // Check that the auth form is rendered with the correct type
    const authForm = screen.getByTestId("auth-form");
    expect(authForm).toBeInTheDocument();
    expect(authForm.textContent).toContain("login");
  });

  test("renders with correct styling", () => {
    renderLoginPage();
    
    // Check for animation class on the container
    const animatedContainer = screen.getByText(/Auth Form/i).closest(".animate-scale-fade-in");
    expect(animatedContainer).toBeInTheDocument();
  });

  test("handles loading state correctly", () => {
    renderLoginPage({ isLoading: true });
    
    // Even in loading state, the components should be rendered
    expect(screen.getByTestId("auth-form")).toBeInTheDocument();
  });
});
