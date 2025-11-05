import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect } from 'react';
import { getAppSettings } from '@/utils/appSettings';

const Login = () => {
  const [loginBgImageUrl, setLoginBgImageUrl] = useState<string | null>(null);
  const [shopLogoUrl, setShopLogoUrl] = useState<string | null>(null);

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
      className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden"
      style={loginBgImageUrl ? {
        backgroundImage: `url(${loginBgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : {}}
    >
      {loginBgImageUrl && (
        <div className="absolute inset-0 bg-background opacity-70 z-0"></div>
      )}
      <div className="w-full max-w-md z-10 relative">
        <div className="flex flex-col items-center mb-6">
          {shopLogoUrl ? (
            <img src={shopLogoUrl} alt="Shop Logo" className="w-20 h-20 object-contain mb-2" />
          ) : (
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl mb-2">
              A
            </div>
          )}
          <h1 className="text-3xl font-bold text-center text-foreground leading-none">ASLAM TAILOR</h1>
          <span className="text-lg text-muted-foreground leading-none mt-1">& Clothes</span>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--accent))',
                  foreground: 'hsl(0 0% 0%)', // Ensuring foreground text is black
                  inputBackground: 'hsl(0 0% 100% / 0.8)', // Semi-transparent white background for inputs
                  inputBorder: 'hsl(var(--border))',
                  inputFocusBorder: 'hsl(var(--primary))',
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default Login;