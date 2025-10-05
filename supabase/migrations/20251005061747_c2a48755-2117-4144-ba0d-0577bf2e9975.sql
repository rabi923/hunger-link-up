-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('food_giver', 'food_receiver');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create food_listings table
CREATE TABLE public.food_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  quantity TEXT NOT NULL,
  pickup_time TIMESTAMPTZ NOT NULL,
  photo_url TEXT,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  food_type TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on food_listings
ALTER TABLE public.food_listings ENABLE ROW LEVEL SECURITY;

-- Food listings policies
CREATE POLICY "Anyone can view available food listings"
  ON public.food_listings FOR SELECT
  USING (is_available = true);

CREATE POLICY "Food givers can view their own listings"
  ON public.food_listings FOR SELECT
  USING (auth.uid() = giver_id);

CREATE POLICY "Food givers can create listings"
  ON public.food_listings FOR INSERT
  WITH CHECK (auth.uid() = giver_id);

CREATE POLICY "Food givers can update their own listings"
  ON public.food_listings FOR UPDATE
  USING (auth.uid() = giver_id);

CREATE POLICY "Food givers can delete their own listings"
  ON public.food_listings FOR DELETE
  USING (auth.uid() = giver_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    new.id,
    (new.raw_user_meta_data->>'role')::user_role,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for food photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-photos', 'food-photos', true);

-- Storage policies for food photos
CREATE POLICY "Anyone can view food photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'food-photos');

CREATE POLICY "Authenticated users can upload food photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'food-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own food photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own food photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'food-photos' AND auth.uid()::text = (storage.foldername(name))[1]);