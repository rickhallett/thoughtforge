import { Request, Response, NextFunction } from 'express';
import { handleFileUpload, FileUploadRequest } from '../../src/middlewares/fileUploadHandler';
import fs from 'fs';
import path from 'path';

jest.mock('fs');
jest.mock('path');

describe('handleFileUpload', () => {
  let mockReq: Partial<FileUploadRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let eventHandlers: { [key: string]: Function };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock event handlers
    eventHandlers = {};
    
    // Mock request object
    mockReq = {
      headers: {},
      on: jest.fn().mockImplementation((event, handler) => {
        eventHandlers[event] = handler;
        return mockReq;
      }),
      files: undefined
    };

    // Mock response and next
    mockRes = {};
    mockNext = jest.fn();

    // Mock fs methods
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
    (fs.createWriteStream as jest.Mock).mockReturnValue({
      write: jest.fn(),
      end: jest.fn()
    });
  });

  it('should skip processing if content-type is not multipart/form-data', () => {
    mockReq.headers = { 'content-type': 'application/json' };
    
    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.files).toBeUndefined();
  });

  it('should process a single file upload correctly', () => {
    // Mock multipart form-data request
    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    // Simulate file upload data chunks
    const fileData = Buffer.from(
      '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n' +
      'Content-Disposition: form-data; name="files"; filename="test.txt"\r\n' +
      'Content-Type: text/plain\r\n\r\n' +
      'Hello, World!\r\n' +
      '------WebKitFormBoundary7MA4YWxkTrZu0gW--'
    );

    eventHandlers['data'](fileData);
    eventHandlers['end']();

    expect(mockReq.files).toBeDefined();
    expect(mockReq.files?.length).toBe(1);
    expect(mockReq.files?.[0].filename).toBe('test.txt');
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.createWriteStream).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle multiple file uploads', () => {
    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    // Simulate multiple file uploads
    // TODO: look into what WebKitFormBoundary7MA4YWxkTrZu0gW is
    const file1Data = Buffer.from(
      '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n' +
      'Content-Disposition: form-data; name="files"; filename="test1.txt"\r\n' +
      'Content-Type: text/plain\r\n\r\n' +
      'Hello, World 1!\r\n'
    );

    const file2Data = Buffer.from(
      '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n' +
      'Content-Disposition: form-data; name="files"; filename="test2.txt"\r\n' +
      'Content-Type: text/plain\r\n\r\n' +
      'Hello, World 2!\r\n' +
      '------WebKitFormBoundary7MA4YWxkTrZu0gW--'
    );

    eventHandlers['data'](file1Data);
    eventHandlers['data'](file2Data);
    eventHandlers['end']();

    expect(mockReq.files).toBeDefined();
    expect(mockReq.files?.length).toBe(2);
    expect(mockReq.files?.[0].filename).toBe('test1.txt');
    expect(mockReq.files?.[1].filename).toBe('test2.txt');
  });

  it('should handle upload errors', () => {
    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    // Simulate file upload start
    const fileData = Buffer.from(
      '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n' +
      'Content-Disposition: form-data; name="files"; filename="test.txt"\r\n' +
      'Content-Type: text/plain\r\n\r\n'
    );

    eventHandlers['data'](fileData);

    // Simulate error
    const error = new Error('Upload failed');
    eventHandlers['error'](error);

    expect(fs.unlinkSync).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should handle empty file uploads', () => {
    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);
    eventHandlers['end']();

    expect(mockReq.files).toBeDefined();
    expect(mockReq.files?.length).toBe(0);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle malformed content-disposition headers', () => {
    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const malformedData = Buffer.from(
      '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n' +
      'Content-Disposition: form-data;\r\n' + // Missing name and filename
      'Content-Type: text/plain\r\n\r\n' +
      'Hello, World!\r\n' +
      '------WebKitFormBoundary7MA4YWxkTrZu0gW--'
    );

    eventHandlers['data'](malformedData);
    eventHandlers['end']();

    expect(mockReq.files?.length).toBe(0);
  });

  it('should handle large files in multiple chunks', () => {
    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    // Send header chunk
    const headerChunk = Buffer.from(
      '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n' +
      'Content-Disposition: form-data; name="files"; filename="large.txt"\r\n' +
      'Content-Type: text/plain\r\n\r\n'
    );

    // Send multiple data chunks
    const dataChunk1 = Buffer.from('Hello');
    const dataChunk2 = Buffer.from('World');
    const endChunk = Buffer.from('\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--');

    eventHandlers['data'](headerChunk);
    eventHandlers['data'](dataChunk1);
    eventHandlers['data'](dataChunk2);
    eventHandlers['data'](endChunk);
    eventHandlers['end']();

    expect(mockReq.files).toBeDefined();
    expect(mockReq.files?.length).toBe(1);
    expect(mockReq.files?.[0].filename).toBe('large.txt');
  });

  it('should handle files with special characters in filename', () => {
    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const fileData = Buffer.from(
      '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n' +
      'Content-Disposition: form-data; name="files"; filename="test@#$%.txt"\r\n' +
      'Content-Type: text/plain\r\n\r\n' +
      'Hello, World!\r\n' +
      '------WebKitFormBoundary7MA4YWxkTrZu0gW--'
    );

    eventHandlers['data'](fileData);
    eventHandlers['end']();

    expect(mockReq.files?.[0].filename).toBe('test@#$%.txt');
  });

  it('should handle uploads directory creation failure', () => {
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const fileData = Buffer.from(
      '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n' +
      'Content-Disposition: form-data; name="files"; filename="test.txt"\r\n' +
      'Content-Type: text/plain\r\n\r\n' +
      'Hello, World!\r\n' +
      '------WebKitFormBoundary7MA4YWxkTrZu0gW--'
    );

    eventHandlers['data'](fileData);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    const error = mockNext.mock.calls[0][0] as unknown as Error;
    expect(error.message).toBe('Permission denied');
    expect(mockReq.files?.length).toBe(0);
  });

  it('should handle write stream errors', () => {
    const mockWriteStream = {
      write: jest.fn().mockImplementation(() => {
        throw new Error('Write error');
      }),
      end: jest.fn()
    };
    (fs.createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const fileData = Buffer.from(
      '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n' +
      'Content-Disposition: form-data; name="files"; filename="test.txt"\r\n' +
      'Content-Type: text/plain\r\n\r\n' +
      'Hello, World!\r\n' +
      '------WebKitFormBoundary7MA4YWxkTrZu0gW--'
    );

    eventHandlers['data'](fileData);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
}); 