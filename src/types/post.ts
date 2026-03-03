export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  background?: string;
  problem?: string;
  conclusion?: string;
  audience?: string;
}

export interface PostMeta {
  title: string;
  date: string;
  excerpt: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  background?: string;
  problem?: string;
  conclusion?: string;
  audience?: string;
}
