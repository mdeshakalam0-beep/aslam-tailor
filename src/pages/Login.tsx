import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect } from 'react';
import { getAppSettings } from '@/utils/appSettings';

// 'selection' matlab buttons wala screen, 'sign_in' matlab login, 'sign_up' matlab signup
type AuthView = 'selection' | 'sign_in' | 'sign_up';

const Login = () => {
  const [loginBgImageUrl, setLoginBgImageUrl] = useState<string | null>(null);
  const [shopLogoUrl, setShopLogoUrl] = useState<string | null>(null);
  const [authView, setAuthView] = useState<AuthView>('selection');

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getAppSettings();
      const bgImageSetting = settings.find(setting => setting.key === 'login_bg_image_url');
      if (bgImageSetting && bgImageSetting.value) {
        setLoginBgImageUrl(bgImageSetting.value);
      }
      const logoSetting = settings.find(setting => setting.key === 'shop_logo_url');
      if (logoSetting && logoSetting.value) {
        setShopLogoUrl(logoSetting.value);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-off-white-page-bg p-4 relative overflow-hidden"
      style={loginBgImageUrl ? {
        backgroundImage: `url(${loginBgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : {}}
    >
      {loginBgImageUrl && (
        <div className="absolute inset-0 bg-off-white-page-bg opacity-70 z-0"></div>
      )}
      
      <div className="w-full max-w-md z-10 relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-card-border">
        {/* Logo and Header Section */}
        <div className="flex flex-col items-center mb-8">
          {shopLogoUrl ? (
            <img src={shopLogoUrl} alt="Shop Logo" className="w-20 h-20 object-contain mb-4" />
          ) : (
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl mb-4 shadow-lg">
              A
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-text-primary-heading text-center leading-tight tracking-tight">
            ASLAM TAILOR
          </h1>
          <span className="text-lg font-medium text-text-secondary-body text-center leading-none mt-1">
            & Clothes
          </span>
        </div>

        {/* Selection Screen (Initial View) */}
        {authView === 'selection' && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-accent-rose">Hello!</h2>
              <p className="text-lg text-text-primary-heading font-semibold">
                Welcome to Aslam Tailor & Clothes
              </p>
              <p className="text-sm text-text-secondary-body">Please choose an option to continue</p>
            </div>
            
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={() => setAuthView('sign_in')}
                className="w-full py-3 px-4 bg-accent-rose text-white font-bold rounded-lg hover:bg-accent-dark transition-colors shadow-md"
              >
                Login
              </button>
              <button
                onClick={() => setAuthView('sign_up')}
                className="w-full py-3 px-4 bg-white border-2 border-accent-rose text-accent-rose font-bold rounded-lg hover:bg-rose-50 transition-colors shadow-sm"
              >
                SignUp
              </button>
            </div>
          </div>
        )}

        {/* Supabase Auth Component (Login/SignUp View) */}
        {authView !== 'selection' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setAuthView('selection')}
              className="mb-4 text-sm font-medium text-accent-rose hover:underline flex items-center gap-1"
            >
              ← Back to Welcome
            </button>
            
            <Auth
              supabaseClient={supabase}
              view={authView}
              providers={[]}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--accent-rose))',
                      brandAccent: 'hsl(var(--accent-dark))',
                      foreground: 'hsl(var(--text-primary-heading))',
                      inputBackground: 'hsl(0 0% 100% / 0.8)',
                      inputBorder: 'hsl(var(--card-border))',
                      inputFocusBorder: 'hsl(var(--accent-rose))',
                    },
                  },
                },
              }}
              theme="light"
              redirectTo={window.location.origin}
              showLinks={true} // Taaki Auth UI ke andar bhi links kaam karein
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;