export interface BookMeta {
  title: string;
  author: string;
  coverImage?: string;
  rating: number;
  readDate: string;
  tags?: string[];
  excerpt: string;
}

export interface Book extends BookMeta {
  slug: string;
  content: string;
}
