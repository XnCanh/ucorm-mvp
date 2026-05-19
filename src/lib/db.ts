import { supabase, isSupabaseConfigured } from './supabase';
import fs from 'fs';
import path from 'path';

export interface Review {
  id: string;
  place_id: string;
  author_name: string;
  author_photo_url?: string;
  rating: number;
  text: string;
  publish_time: string;
  status: 'pending' | 'resolved';
  ai_responses?: {
    standard: string;
    friendly: string;
    constructive: string;
  };
  selected_response?: string;
  created_at?: string;
}

// In-memory fallback for serverless / Vercel
const globalRef = global as any;
if (!globalRef._mockReviewsDb) {
  globalRef._mockReviewsDb = [];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'reviews.json');

// Helper to read reviews from local JSON file
function readLocalDb(): Review[] {
  try {
    if (typeof window === 'undefined') {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        globalRef._mockReviewsDb = JSON.parse(fileContent);
      }
    }
  } catch (error) {
    console.warn('Failed to read from local file DB, using memory fallback:', error);
  }
  return globalRef._mockReviewsDb;
}

// Helper to write reviews to local JSON file
function writeLocalDb(reviews: Review[]): void {
  globalRef._mockReviewsDb = reviews;
  try {
    if (typeof window === 'undefined') {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
    }
  } catch (error) {
    console.warn('Failed to write to local file DB:', error);
  }
}

// Unified Database Access Functions
export const db = {
  /**
   * Get all reviews, optionally filtered by placeId
   */
  async getReviews(placeId?: string): Promise<Review[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (placeId) {
        query = query.eq('place_id', placeId);
      }
      const { data, error } = await query;
      if (error) {
        console.error('Supabase getReviews error:', error);
        throw error;
      }
      return data as Review[];
    } else {
      const localReviews = readLocalDb();
      if (placeId) {
        return localReviews.filter(r => r.place_id === placeId);
      }
      // Sort by publish_time desc or created_at desc
      return [...localReviews].sort((a, b) => {
        const dateA = new Date(a.created_at || a.publish_time).getTime();
        const dateB = new Date(b.created_at || b.publish_time).getTime();
        return dateB - dateA;
      });
    }
  },

  /**
   * Get a single review by its ID
   */
  async getReviewById(id: string): Promise<Review | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('reviews').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Supabase getReviewById error:', error);
        throw error;
      }
      return data as Review;
    } else {
      const localReviews = readLocalDb();
      return localReviews.find(r => r.id === id) || null;
    }
  },

  /**
   * Add or update reviews (upsert)
   */
  async upsertReviews(reviews: Review[]): Promise<Review[]> {
    const nowStr = new Date().toISOString();
    const formattedReviews = reviews.map(r => ({
      ...r,
      created_at: r.created_at || nowStr,
    }));

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('reviews').upsert(formattedReviews).select();
      if (error) {
        console.error('Supabase upsertReviews error:', error);
        throw error;
      }
      return data as Review[];
    } else {
      const localReviews = readLocalDb();
      const reviewMap = new Map<string, Review>();
      
      // Load current reviews
      localReviews.forEach(r => reviewMap.set(r.id, r));
      
      // Update with new reviews (merging properties so we don't lose AI responses)
      formattedReviews.forEach(newR => {
        const existing = reviewMap.get(newR.id);
        if (existing) {
          reviewMap.set(newR.id, {
            ...existing,
            ...newR,
            ai_responses: newR.ai_responses || existing.ai_responses,
            selected_response: newR.selected_response || existing.selected_response,
          });
        } else {
          reviewMap.set(newR.id, newR);
        }
      });

      const updatedList = Array.from(reviewMap.values());
      writeLocalDb(updatedList);
      return formattedReviews;
    }
  },

  /**
   * Update the status and selected response of a review
   */
  async updateReviewStatus(
    id: string,
    status: 'pending' | 'resolved',
    selectedResponse?: string
  ): Promise<Review | null> {
    if (isSupabaseConfigured && supabase) {
      const updateData: Partial<Review> = { status };
      if (selectedResponse !== undefined) {
        updateData.selected_response = selectedResponse;
      }

      const { data, error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase updateReviewStatus error:', error);
        throw error;
      }
      return data as Review;
    } else {
      const localReviews = readLocalDb();
      const reviewIndex = localReviews.findIndex(r => r.id === id);
      if (reviewIndex === -1) return null;

      const updatedReview = {
        ...localReviews[reviewIndex],
        status,
        ...(selectedResponse !== undefined ? { selected_response: selectedResponse } : {}),
      };

      localReviews[reviewIndex] = updatedReview;
      writeLocalDb(localReviews);
      return updatedReview;
    }
  },
};
