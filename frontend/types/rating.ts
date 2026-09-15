export interface Rating {
  id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  photo_url: string | null;
  user_name: string;
  user_pic: string | null;
  created_at: string;
  updated_at: string;
}

export interface RatingInput {
  product_id: string;
  rating: number;
  comment: string;
  photo?: File | null;
}