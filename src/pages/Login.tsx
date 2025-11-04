import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import React, { useState, useEffect } from 'react'; // Import React and hooks
import { getAppSettings } from '@/utils/appSettings'; // Import getAppSettings

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
        <div className="absolute inset-0 bg-background opacity-70 z-0"></div> {/* Overlay for opacity */}
      )}
      <div className="w-full max-w-md z-10 relative"> {/* Ensure content is above overlay */}
        <h1 className="text-3xl font-bold text-center text-foreground mb-6">Welcome to ASLAM TAILOR</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]} // You can add 'google', 'github', etc. here if needed
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--accent))',
                },
              },
            },
          }}
          theme="light" // Use 'dark' if your app supports dark mode
          redirectTo={window.location.origin} // Redirects to the home page after login
        />
      </div>
    </div>
  );
};

export default Login;