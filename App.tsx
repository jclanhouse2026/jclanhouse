
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PdvDashboardPage from './pages/PdvDashboardPage';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminHomeSettingsPage from './pages/admin/AdminHomeSettingsPage';
import AdminServicesSettingsPage from './pages/admin/AdminServicesSettingsPage';
import AdminCurriculumsPage from './pages/admin/AdminCurriculumsPage';
import ThemeSelectionPage from './pages/ThemeSelectionPage';
import ProductCustomizationPage from './pages/ProductCustomizationPage';
import SchoolStickersPage from './pages/SchoolStickersPage';
import SchoolThemesPage from './pages/SchoolThemesPage';
import PremiumStickersPage from './pages/PremiumStickersPage';
import BusinessCardsPage from './pages/BusinessCardsPage';
import FlyersPage from './pages/FlyersPage';
import SmartPrintingPage from './pages/SmartPrintingPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminPortfolioPage from './pages/admin/AdminPortfolioPage';
import AdminImagesPage from './pages/admin/AdminImagesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminThemesPage from './pages/admin/AdminThemesPage';
import AdminSchoolThemesPage from './pages/admin/AdminSchoolThemesPage';
import AdminMyWorksPage from './pages/admin/AdminMyWorksPage';
import { PortfolioProvider } from './context/PortfolioContext';
import { CategoryProvider } from './context/CategoryContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { CompanyProvider } from './context/CompanyContext';
import { SalesProvider } from './context/SalesContext';
import { ExpensesProvider } from './context/ExpensesContext';
import { CustomerProvider } from './context/CustomerContext';
import { AuthProvider } from './context/AuthContext';
import { HomeSettingsProvider } from './context/HomeSettingsContext';
import { ServiceSettingsProvider } from './context/ServiceSettingsContext';
import { ServicePricingProvider } from './context/ServicePricingContext';
import { ResumeProvider } from './context/ResumeContext';
import { PrinterProvider } from './context/PrinterContext';
import { MyWorksProvider } from './context/MyWorksContext';
import { ApostilaProvider } from './context/ApostilaContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import FinancialReportPage from './pages/admin/FinancialReportPage';
import CustomerPanelPage from './pages/CustomerPanelPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import CustomerAddressPage from './pages/CustomerAddressPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import CurriculoPage from './pages/CurriculoPage';
import CustomerResumesPage from './pages/customer/CustomerResumesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import ModeratorPanelPage from './pages/moderator/ModeratorPanelPage';
import AdminPdvAuthPage from './pages/admin/AdminPdvAuthPage';
import ApostilaPage from './pages/ApostilaPage';
import AdminApostilaPage from './pages/admin/AdminApostilaPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CompanyProvider>
        <HomeSettingsProvider>
          <ServiceSettingsProvider>
            <ServicePricingProvider>
              <ApostilaProvider>
                <PortfolioProvider>
                  <MyWorksProvider>
                    <CategoryProvider>
                      <ThemeProvider>
                        <CartProvider>
                          <ResumeProvider>
                            <SalesProvider>
                              <ExpensesProvider>
                                <CustomerProvider>
                                  <PrinterProvider>
                                    <HashRouter>
                                      <Routes>
                                        {/* Public Routes */}
                                        <Route path="/" element={<HomePage />} />
                                        <Route path="/servicos" element={<ServicesPage />} />
                                        <Route path="/portfolio" element={<PortfolioPage />} />
                                        <Route path="/produto/:productId" element={<ProductDetailPage />} />
                                        <Route path="/carrinho" element={<CartPage />} />
                                        <Route path="/login" element={<LoginPage />} />
                                        <Route path="/register" element={<RegisterPage />} />
                                        <Route path="/curriculo" element={<CurriculoPage />} />
                                        <Route path="/apostila" element={<ApostilaPage />} />
                                        
                                        {/* Product Customization Flow (Public) */}
                                        <Route path="/caderneta" element={<ThemeSelectionPage />} />
                                        <Route path="/caderneta/:themeId" element={<ProductCustomizationPage />} />
                                        <Route path="/temas-escolares" element={<SchoolThemesPage />} />
                                        <Route path="/adesivos-escolares/:themeId" element={<SchoolStickersPage />} />
                                        <Route path="/adesivos-personalizados" element={<PremiumStickersPage />} />
                                        <Route path="/cartoes-visita" element={<BusinessCardsPage />} />
                                        <Route path="/cartoes-de-visita" element={<BusinessCardsPage />} />
                                        <Route path="/panfletos" element={<FlyersPage />} />
                                        <Route path="/impressao" element={<SmartPrintingPage />} />

                                        {/* PDV Protected Route */}
                                        <Route element={<ProtectedRoute role={['admin', 'moderator']} />}>
                                          <Route path="/pdv" element={<PdvDashboardPage />} />
                                        </Route>

                                        {/* Moderator Protected Routes */}
                                        <Route element={<ProtectedRoute role={'moderator'} />}>
                                          <Route path="/moderador" element={<ModeratorPanelPage />} />
                                        </Route>

                                        {/* Admin Protected Routes */}
                                        <Route element={<ProtectedRoute role="admin" />}>
                                          <Route path="/admin" element={<AdminLayout />}>
                                            <Route index element={<Navigate to="dashboard" replace />} />
                                            <Route path="dashboard" element={<AdminDashboardPage />} />
                                            <Route path="clientes" element={<AdminCustomersPage />} />
                                            <Route path="servicos" element={<AdminServicesPage />} />
                                            <Route path="portfolio" element={<AdminPortfolioPage />} />
                                            <Route path="meus-trabalhos" element={<AdminMyWorksPage />} />
                                            <Route path="categorias" element={<AdminCategoriesPage />} />
                                            <Route path="temas" element={<AdminThemesPage />} />
                                            <Route path="temas-escolares" element={<AdminSchoolThemesPage />} />
                                            <Route path="imagens" element={<AdminImagesPage />} />
                                            <Route path="relatorios" element={<AdminReportsPage />} />
                                            <Route path="curriculos" element={<AdminCurriculumsPage />} />
                                            <Route path="users" element={<AdminUsersPage />} />
                                            <Route path="pdv-auth" element={<AdminPdvAuthPage />} />
                                            <Route path="relatorios-financeiros" element={<FinancialReportPage />} />
                                            <Route path="configuracoes" element={<AdminSettingsPage />} />
                                            <Route path="configuracoes-home" element={<AdminHomeSettingsPage />} />
                                            <Route path="configuracoes-servicos" element={<AdminServicesSettingsPage />} />
                                            <Route path="apostila" element={<AdminApostilaPage />} />
                                          </Route>
                                        </Route>
                                        
                                        {/* Client Protected Routes */}
                                        <Route element={<ProtectedRoute role={'client'} />}>
                                          <Route path="/cliente" element={<CustomerPanelPage />}>
                                            <Route index element={<Navigate to="dashboard" replace />} />
                                            <Route path="dashboard" element={<CustomerDashboardPage />} />
                                            <Route path="pedidos" element={<CustomerOrdersPage />} />
                                            <Route path="endereco" element={<CustomerAddressPage />} />
                                            <Route path="perfil" element={<CustomerProfilePage />} />
                                            <Route path="curriculos" element={<CustomerResumesPage />} />
                                          </Route>
                                        </Route>

                                      </Routes>
                                    </HashRouter>
                                  </PrinterProvider>
                                </CustomerProvider>
                              </ExpensesProvider>
                            </SalesProvider>
                          </ResumeProvider>
                        </CartProvider>
                      </ThemeProvider>
                    </CategoryProvider>
                  </MyWorksProvider>
                </PortfolioProvider>
              </ApostilaProvider>
            </ServicePricingProvider>
          </ServiceSettingsProvider>
        </HomeSettingsProvider>
      </CompanyProvider>
    </AuthProvider>
  );
};

export default App;
