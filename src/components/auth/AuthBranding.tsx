
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export const AuthBranding = () => {
  const [logoUrl, setLogoUrl] = useState('/logo.svg');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  
  // Load custom branding
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data: settings } = await supabase
          .from('advanced_settings')
          .select('*')
          .single();
        
        if (settings) {
          // Check for auth branding fields
          if (settings.auth_logo_url) setLogoUrl(settings.auth_logo_url);
          if (settings.auth_background_url) setBackgroundUrl(settings.auth_background_url);
          
          // Backward compatibility
          const customLogoUrl = localStorage.getItem('auth_logo_url');
          const customBackgroundUrl = localStorage.getItem('auth_background_url');
          
          if (customLogoUrl && !settings.auth_logo_url) setLogoUrl(customLogoUrl);
          if (customBackgroundUrl && !settings.auth_background_url) setBackgroundUrl(customBackgroundUrl);
        }
      } catch (error) {
        console.error('Error loading branding:', error);
      }
    };
    
    fetchBranding();
  }, []);
  
  return {
    logoUrl,
    backgroundUrl,
    LogoComponent: () => (
      <div className="flex items-center gap-2">
        <div className="bg-vision-blue-500 p-1.5 rounded">
          {logoUrl ? (
            <div className="w-6 h-6">
              <AspectRatio ratio={1/1}>
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </AspectRatio>
            </div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M15.24 2.042a10 10 0 0 1 4.958 13.17M10.66 5.22a7.5 7.5 0 1 1-5.88 13.82"/>
              <circle cx="12" cy="12" r="2.5"/>
              <path d="M20 17.607a10 10 0 0 0-16.465-11"/>
            </svg>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white">Vision Hub</h1>
      </div>
    )
  };
};
