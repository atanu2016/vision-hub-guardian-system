import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

const AuthImageSettings = () => {
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('auth_logo_url') || '');
  const [backgroundUrl, setBackgroundUrl] = useState(localStorage.getItem('auth_background_url') || '');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('logo');
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    try {
      // Save URLs to localStorage
      localStorage.setItem('auth_logo_url', logoUrl);
      localStorage.setItem('auth_background_url', backgroundUrl);
      
      // Save to the database - using advanced_settings table
      const { error } = await supabase
        .from('advanced_settings')
        .update({
          auth_logo_url: logoUrl,
          auth_background_url: backgroundUrl
        })
        .eq('id', '1');
        
      if (error) throw error;
      
      toast.success('Auth images updated successfully');
    } catch (error) {
      console.error('Error saving auth images:', error);
      toast.error('Failed to update auth images');
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Handle the file upload
    handleImageUpload(file, 'logo');
  };

  const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Handle the file upload
    handleImageUpload(file, 'background');
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'background') => {
    setIsUploading(true);
    
    // In a production app, you'd upload to Supabase Storage or another service
    // For demo, we'll use a simulated upload and convert to data URL
    try {
      // Convert file to data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        
        if (type === 'logo') {
          setLogoUrl(dataUrl);
        } else {
          setBackgroundUrl(dataUrl);
        }
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
      
      // In a real implementation, upload to storage:
      /*
      const { data, error } = await supabase
        .storage
        .from('auth-images')
        .upload(`${type}-${Date.now()}`, file);
        
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('auth-images')
        .getPublicUrl(data.path);
        
      if (type === 'logo') {
        setLogoUrl(publicUrl);
      } else {
        setBackgroundUrl(publicUrl);
      }
      */
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setIsUploading(false);
    }
  };

  const clearImage = (type: 'logo' | 'background') => {
    if (type === 'logo') {
      setLogoUrl('');
      if (logoInputRef.current) logoInputRef.current.value = '';
    } else {
      setBackgroundUrl('');
      if (bgInputRef.current) bgInputRef.current.value = '';
    }
  };

  const openFileDialog = (type: 'logo' | 'background') => {
    if (type === 'logo' && logoInputRef.current) {
      logoInputRef.current.click();
    } else if (type === 'background' && bgInputRef.current) {
      bgInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Auth Screen Images
        </CardTitle>
        <CardDescription>
          Customize the login and registration screen appearance
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logo" className="space-y-4">
            <div className="flex flex-col items-center justify-center">
              <div className="w-32 h-32 border rounded-md flex items-center justify-center overflow-hidden mb-4 bg-muted">
                {logoUrl ? (
                  <div className="relative w-full h-full">
                    <AspectRatio ratio={1/1}>
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </AspectRatio>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => clearImage('logo')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              
              <input 
                type="file" 
                ref={logoInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleLogoUpload}
              />
              
              <Button 
                variant="outline"
                onClick={() => openFileDialog('logo')}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload Logo'}
              </Button>
              
              <p className="text-sm text-muted-foreground mt-2">
                Recommended size: 256x256px (square)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (optional)</Label>
              <Input 
                id="logoUrl"
                value={logoUrl} 
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Enter a direct URL to your logo image, or upload above
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="background" className="space-y-4">
            <div className="flex flex-col items-center justify-center">
              <div className="w-full h-48 border rounded-md flex items-center justify-center overflow-hidden mb-4 bg-muted">
                {backgroundUrl ? (
                  <div className="relative w-full h-full">
                    <AspectRatio ratio={16/9}>
                      <img src={backgroundUrl} alt="Background" className="w-full h-full object-cover" />
                    </AspectRatio>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => clearImage('background')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              
              <input 
                type="file" 
                ref={bgInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleBgUpload}
              />
              
              <Button 
                variant="outline"
                onClick={() => openFileDialog('background')}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload Background'}
              </Button>
              
              <p className="text-sm text-muted-foreground mt-2">
                Recommended size: 1920x1080px (16:9 ratio)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backgroundUrl">Background URL (optional)</Label>
              <Input 
                id="backgroundUrl"
                value={backgroundUrl} 
                onChange={(e) => setBackgroundUrl(e.target.value)}
                placeholder="https://example.com/background.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Enter a direct URL to your background image, or upload above
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter>
        <Button onClick={handleSave} className="ml-auto">
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthImageSettings;
