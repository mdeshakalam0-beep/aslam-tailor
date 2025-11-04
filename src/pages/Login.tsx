import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect } from 'react';
import { getAppSettings } from '@/utils/appSettings';

const Login = () => {
  const [loginBgImageUrl, setLoginBgImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoginBgImage = async () => {
      const settings = await getAppSettings();
      const bgImageSetting = settings.find(setting => setting.key === 'login_bg_image_url');
      if (bgImageSetting && bgImageSetting.value) {
        setLoginBgImageUrl(bgImageSetting.value);
      }
    };
    fetchLoginBgImage();
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
      <div className="w-full max-w-md z-10 relative"> {/* Removed p-6 rounded-lg shadow-lg bg-background/80 backdrop-blur-sm */}
        <h1 className="text-3xl font-bold text-center text-foreground mb-6">Welcome to ASLAM TAILOR</h1>
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