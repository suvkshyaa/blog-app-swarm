import { Request, Response } from 'express';
import * as postController from './postController';
import postService from '../services/postService';

// Mock the service layer
jest.mock('../services/postService');

describe('Post Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObj: any = {};

  beforeEach(() => {
    mockRequest = {};
    responseObj = {
      statusCode: 0,
      json: jest.fn().mockReturnThis()
    };
    mockResponse = {
      status: jest.fn().mockImplementation((code) => {
        responseObj.statusCode = code;
        return responseObj;
      })
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should return all posts sorted by createdAt', async () => {
      const mockPosts = [
        { _id: '1', title: 'Post 1', content: 'Content 1', author: 'Author 1' },
        { _id: '2', title: 'Post 2', content: 'Content 2', author: 'Author 2' }
      ];

      (postService.getAllPosts as jest.Mock).mockResolvedValue(mockPosts);

      await postController.getPosts(mockRequest as Request, mockResponse as Response);

      expect(postService.getAllPosts).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObj.json).toHaveBeenCalledWith(mockPosts);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (postService.getAllPosts as jest.Mock).mockRejectedValue(error);

      await postController.getPosts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObj.json).toHaveBeenCalledWith({ message: 'Error fetching posts', error });
    });
  });

  describe('getPost', () => {
    it('should return a post by ID', async () => {
      const mockPost = { _id: '1', title: 'Post 1', content: 'Content 1', author: 'Author 1' };
      mockRequest.params = { id: '1' };
      (postService.getPostById as jest.Mock).mockResolvedValue(mockPost);

      await postController.getPost(mockRequest as Request, mockResponse as Response);

      expect(postService.getPostById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObj.json).toHaveBeenCalledWith(mockPost);
    });

    it('should return 404 when post not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      (postService.getPostById as jest.Mock).mockResolvedValue(null);

      await postController.getPost(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObj.json).toHaveBeenCalledWith({ message: 'Post not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };
      (postService.getPostById as jest.Mock).mockRejectedValue(error);

      await postController.getPost(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObj.json).toHaveBeenCalledWith({ message: 'Error fetching post', error });
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const postData = { title: 'New Post', content: 'New Content', author: 'Author' };
      const mockPost = { _id: '1', ...postData };
      mockRequest.body = postData;
      (postService.createPost as jest.Mock).mockResolvedValue(mockPost);

      await postController.createPost(mockRequest as Request, mockResponse as Response);

      expect(postService.createPost).toHaveBeenCalledWith(postData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObj.json).toHaveBeenCalledWith(mockPost);
    });

    it('should handle errors', async () => {
      const error = new Error('Validation error');
      mockRequest.body = { title: 'New Post' };
      (postService.createPost as jest.Mock).mockRejectedValue(error);

      await postController.createPost(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObj.json).toHaveBeenCalledWith({ message: 'Error creating post', error });
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const updateData = { title: 'Updated Title', content: 'Updated Content' };
      const mockPost = { _id: '1', ...updateData };
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      (postService.updatePost as jest.Mock).mockResolvedValue(mockPost);

      await postController.updatePost(mockRequest as Request, mockResponse as Response);

      expect(postService.updatePost).toHaveBeenCalledWith('1', updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObj.json).toHaveBeenCalledWith(mockPost);
    });

    it('should return 404 when post not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      mockRequest.body = { title: 'Updated Title' };
      (postService.updatePost as jest.Mock).mockResolvedValue(null);

      await postController.updatePost(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObj.json).toHaveBeenCalledWith({ message: 'Post not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated Title' };
      (postService.updatePost as jest.Mock).mockRejectedValue(error);

      await postController.updatePost(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObj.json).toHaveBeenCalledWith({ message: 'Error updating post', error });
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const mockPost = { _id: '1', title: 'Post 1' };
      mockRequest.params = { id: '1' };
      (postService.deletePost as jest.Mock).mockResolvedValue(mockPost);

      await postController.deletePost(mockRequest as Request, mockResponse as Response);

      expect(postService.deletePost).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObj.json).toHaveBeenCalledWith({ message: 'Post deleted successfully' });
    });

    it('should return 404 when post not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      (postService.deletePost as jest.Mock).mockResolvedValue(null);

      await postController.deletePost(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObj.json).toHaveBeenCalledWith({ message: 'Post not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };
      (postService.deletePost as jest.Mock).mockRejectedValue(error);

      await postController.deletePost(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObj.json).toHaveBeenCalledWith({ message: 'Error deleting post', error });
    });
  });
});
