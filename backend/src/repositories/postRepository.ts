import Post, { IPost } from '../models/Post';

export interface CreatePostData {
  title: string;
  content: string;
  author: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
}

/**
 * Data access layer for Post documents.
 * Each method performs a single database operation and nothing else.
 */
export const postRepository = {
  findAll(): Promise<IPost[]> {
    return Post.find().sort({ createdAt: -1 });
  },

  findById(id: string): Promise<IPost | null> {
    return Post.findById(id);
  },

  create(data: CreatePostData): Promise<IPost> {
    return Post.create(data);
  },

  update(id: string, data: UpdatePostData): Promise<IPost | null> {
    return Post.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string): Promise<IPost | null> {
    return Post.findByIdAndDelete(id);
  }
};

export default postRepository;
