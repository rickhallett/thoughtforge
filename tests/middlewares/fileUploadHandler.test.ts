import { Request, Response, NextFunction } from 'express';
import { handleFileUpload } from '@thoughtforge/backend/src/middlewares/fileUploadHandler';
import { FileUploadRequest } from '@thoughtforge/shared/src/types/fileUpload';
import { FileValidationError } from '@thoughtforge/shared/utils/fileValidation';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

describe('handleFileUpload Middleware', () => {
  let mockReq: Partial<FileUploadRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let eventHandlers: any;
  let mockFileStream: any;

  beforeEach(() => {
    jest.clearAllMocks();

    eventHandlers = {
      req: {},
      fileStream: {}
    };

    mockReq = {
      headers: {},
      on: jest.fn().mockImplementation(function (this: any, event, handler) {
        eventHandlers.req[event] = handler;
        return this;
      }),
      files: [],
    };

    mockRes = {};
    mockNext = jest.fn();

    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => { });
    mockFileStream = {
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn().mockImplementation(function (this: typeof mockFileStream, event, handler) {
        if (!eventHandlers.fileStream[event]) {
          eventHandlers.fileStream[event] = [];
        }
        eventHandlers.fileStream[event].push(handler);
        return this;
      }),
      emit: jest.fn().mockImplementation(function (this: typeof mockFileStream, event, ...args) {
        const handlers = eventHandlers.fileStream[event] || [];
        handlers.forEach((handler: Function) => handler.apply(this, args));
        return true;
      }),
    };
    (fs.createWriteStream as jest.Mock).mockReturnValue(mockFileStream);
    (fs.unlink as unknown as jest.Mock).mockImplementation(() => { });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should skip processing if content-type is not multipart/form-data', () => {
    mockReq.headers = { 'content-type': 'application/json' };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockReq.files).toEqual([]);
  });

  test.only('should process and validate a single file upload correctly', async () => {
    const boundary = 'WebKitFormBoundary123456789';
    mockReq.headers = {
      'content-type': `multipart/form-data; boundary=${boundary}`,
    };

    // Create a promise that resolves when mockNext is called
    const nextCalled = new Promise<void>((resolve) => {
      mockNext.mockImplementation(() => {
        resolve();
      });
    });

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const fileContent = Buffer.from('Hello World!');

    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="test.txt"\r\n'),
      Buffer.from('Content-Type: text/plain\r\n\r\n'),
      fileContent,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    // Emit data and end events
    eventHandlers.req['data'](body);
    eventHandlers.req['end']();

    // Wait until next() is called
    await nextCalled;

    // Now perform assertions
    expect(mockReq.files).toHaveLength(1);
    const uploadedFile = mockReq.files![0];
    expect(uploadedFile.filename).toBe('test.txt');
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(fs.createWriteStream).toHaveBeenCalledWith(uploadedFile.path);
    expect(mockFileStream.write).toHaveBeenCalledWith(fileContent);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test('should handle errors during directory creation', async () => {
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    const nextCalled = new Promise<void>((resolve) => {
      mockNext.mockImplementation(() => {
        resolve();
      });
    });

    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=--BoundaryDirError',
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const boundary = 'BoundaryDirError';
    const fileContent = Buffer.from('Content');

    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="test.txt"\r\n'),
      Buffer.from('Content-Type: text/plain\r\n\r\n'),
      fileContent,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    eventHandlers.req['data'](body);

    await nextCalled;

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    const error = mockNext.mock.calls[0][0] as unknown as Error;
    expect(error.message).toBe('Permission denied');
    expect(mockReq.files).toHaveLength(0);
  });

  test('should handle errors during file writing', async () => {
    const nextCalled = new Promise<void>((resolve) => {
      mockNext.mockImplementation(() => {
        resolve();
      });
    });

    mockFileStream.write.mockImplementation(() => {
      throw new Error('Stream write error');
    });

    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=BoundaryWriteError',
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const boundary = '--BoundaryWriteError';
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="error.txt"\r\n'),
      Buffer.from('Content-Type: text/plain\r\n\r\n'),
      Buffer.from('test content'),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    eventHandlers.req['data'](body);

    await nextCalled;

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    const error = mockNext.mock.calls[0][0] as unknown as Error;
    expect(error.message).toBe('Stream write error');
  });

  test('should handle request errors', async () => {
    const nextCalled = new Promise<void>((resolve) => {
      mockNext.mockImplementation(() => {
        resolve();
      });
    });

    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=BoundaryReqError',
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const error = new Error('Request error');
    eventHandlers.req['error'](error);

    await nextCalled;

    expect(mockNext).toHaveBeenCalledWith(error);
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  // TODO: Fix this test
  test.skip('should finalize file if request ends unexpectedly', async () => {
    const nextCalled = new Promise<void>((resolve) => {
      mockNext.mockImplementation(() => {
        resolve();
      });
    });

    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=BoundaryUnexpectedEnd',
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const boundary = '--BoundaryUnexpectedEnd';
    const header = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="incomplete.txt"\r\n'),
      Buffer.from('Content-Type: text/plain\r\n\r\n'),
    ]);

    const fileContent = Buffer.from('Partial content');

    // Emit data events
    eventHandlers.req['data'](header);
    eventHandlers.req['data'](fileContent);

    // Emit end event
    eventHandlers.req['end']();


    // Wait until next() is called
    await nextCalled;

    // Assertions
    expect(mockReq.files).toHaveLength(1);
    expect(mockReq.files![0].filename).toBe('incomplete.txt');
    expect(mockFileStream.end).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test('should handle missing boundary in content-type header', async () => {
    const nextCalled = new Promise<void>((resolve) => {
      mockNext.mockImplementation(() => {
        resolve();
      });
    });

    mockReq.headers = {
      'content-type': 'multipart/form-data',
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    await nextCalled;

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    const error = mockNext.mock.calls[0][0] as unknown as Error;
    expect(error.message).toBe('No boundary found in content-type');
  });

  test('should handle unexpected errors gracefully', async () => {
    const nextCalled = new Promise<void>((resolve) => {
      mockNext.mockImplementation(() => {
        resolve();
      });
    });

    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=BoundaryUnexpected',
    };

    // Make fs.createWriteStream throw an error                                                                                                                                 
    (fs.createWriteStream as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const boundary = '--BoundaryUnexpected';
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="test.txt"\r\n'),
      Buffer.from('Content-Type: text/plain\r\n\r\n'),
      Buffer.from('test content'),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    eventHandlers.req['data'](body);
    eventHandlers.req['end']();

    await nextCalled;

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    const error = mockNext.mock.calls[0][0] as unknown as Error;
    expect(error.message).toBe('Unexpected error');
  });
  test('should reject files with invalid extensions', async () => {
    const boundary = 'boundary123';
    mockReq.headers = {
      'content-type': `multipart/form-data; boundary=${boundary}`,
    };

    const nextCalled = new Promise<void>((resolve) => {
      mockNext.mockImplementation(() => {
        resolve();
      });
    });

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="test.exe"\r\n'),
      Buffer.from('Content-Type: application/octet-stream\r\n\r\n'),
      Buffer.from('test content'),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    eventHandlers.req['data'](body);
    eventHandlers.req['end']();

    await nextCalled;

    expect(mockNext).toHaveBeenCalledWith(expect.any(FileValidationError));
    expect(mockNext.mock.calls[0][0].message).toContain('File type not allowed');
  });

  test('should enforce maximum file count', async () => {
    const boundary = 'boundary123';
    mockReq.headers = {
      'content-type': `multipart/form-data; boundary=${boundary}`,
    };

    const nextCalled = new Promise<void>((resolve) => {
      mockNext.mockImplementation(() => {
        resolve();
      });
    });

    // Create 11 files (exceeding the default max of 10)
    const files = Array(11).fill(null).map((_, i) => ({
      header: Buffer.concat([
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from(`Content-Disposition: form-data; name="file${i}"; filename="test${i}.jpg"\r\n`),
        Buffer.from('Content-Type: image/jpeg\r\n\r\n'),
      ]),
      content: Buffer.from('test content'),
    }));

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    // Send all files
    for (const file of files) {
      eventHandlers.req['data'](file.header);
      eventHandlers.req['data'](file.content);
      eventHandlers.req['data'](Buffer.from('\r\n'));
    }
    
    eventHandlers.req['data'](Buffer.from(`--${boundary}--\r\n`));
    eventHandlers.req['end']();

    await nextCalled;

    expect(mockNext).toHaveBeenCalledWith(expect.any(FileValidationError));
    expect(mockNext.mock.calls[0][0].message).toContain('Maximum number of files');
  });
});
