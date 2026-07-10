import { IPost } from '../models/Post';
import postRepository, {
  CreatePostData,
  UpdatePostData
} from '../repositories/postRepository';

/**
 * Business logic layer for Posts.
 * Calls the repository for persistence and applies business rules.
 * Contains no HTTP or database-specific code.
 */
export const postService = {
  getAllPosts(): Promise<IPost[]> {
    return postRepository.findAll();
  },

  getPostById(id: string): Promise<IPost | null> {
    return postRepository.findById(id);
  },

  createPost(data: CreatePostData): Promise<IPost> {
    return postRepository.create(data);
  },

  updatePost(id: string, data: UpdatePostData): Promise<IPost | null> {
    return postRepository.update(id, data);
  },

  deletePost(id: string): Promise<IPost | null> {
    return postRepository.delete(id);
  }
};

export default postService;
