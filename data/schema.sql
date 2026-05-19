-- Create reviews table
create table if not exists public.reviews (
  id text primary key,                     -- Google Review ID or Custom UUID
  place_id text not null,                  -- Google Maps Place ID
  author_name text not null,               -- Customer author name
  author_photo_url text,                   -- Customer avatar URL
  rating integer not null check (rating >= 1 and rating <= 5), -- Rating (1-5 stars)
  text text,                               -- Review content
  publish_time timestamp with time zone,   -- Review publish timestamp
  status text not null default 'pending',  -- Status: 'pending' or 'resolved'
  ai_responses jsonb,                      -- JSON containing: { "standard": "...", "friendly": "...", "constructive": "..." }
  selected_response text,                  -- Approved response
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.reviews enable row level security;

-- Create policy to allow all actions for anonymous/public client (ideal for PoC/MVP)
create policy "Allow public full access"
on public.reviews
for all
to public
using (true)
with check (true);

-- Indexes for performance optimization
create index if not exists idx_reviews_place_id on public.reviews(place_id);
create index if not exists idx_reviews_status on public.reviews(status);
