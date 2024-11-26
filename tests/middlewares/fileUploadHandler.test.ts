import { Request, Response, NextFunction } from 'express';
import { handleFileUpload, FileUploadRequest } from '../../src/middlewares/fileUploadHandler';
import fs from 'fs';
import path from 'path';

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

  test('should process a single file upload correctly', () => {
    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary123456789',
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const fileContent = Buffer.from('Hello World!');
    const boundary = '----WebKitFormBoundary123456789';
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="test.txt"\r\n'),
      Buffer.from('Content-Type: text/plain\r\n\r\n'),
      fileContent,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    eventHandlers.req['data'](body);
    eventHandlers.req['end']();

    expect(mockReq.files).toHaveLength(1);
    const uploadedFile = mockReq.files![0];
    expect(uploadedFile.filename).toBe('test.txt');
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(fs.createWriteStream).toHaveBeenCalledWith(uploadedFile.path);
    expect(mockFileStream.write).toHaveBeenCalledWith(fileContent);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test('should handle errors during directory creation', () => {
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----BoundaryDirError',
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const boundary = '----BoundaryDirError';
    const fileContent = Buffer.from('Content');

    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="test.txt"\r\n'),
      Buffer.from('Content-Type: text/plain\r\n\r\n'),
      fileContent,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    eventHandlers.req['data'](body);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    const error = mockNext.mock.calls[0][0] as unknown as Error;
    expect(error.message).toBe('Permission denied');
    expect(mockReq.files).toHaveLength(0);
  });

  test('should handle errors during file writing', () => {
    mockFileStream.write.mockImplementation(() => {
      throw new Error('Stream write error');
    });

    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----BoundaryWriteError',
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const boundary = '----BoundaryWriteError';
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="error.txt"\r\n'),
      Buffer.from('Content-Type: text/plain\r\n\r\n'),
      Buffer.from('test content'),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    eventHandlers.req['data'](body);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    const error = mockNext.mock.calls[0][0] as unknown as Error;
    expect(error.message).toBe('Stream write error');
  });

  test('should handle request errors', () => {
    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----BoundaryReqError',
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const error = new Error('Request error');
    eventHandlers.req['error'](error);

    expect(mockNext).toHaveBeenCalledWith(error);
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  test('should finalize file if request ends unexpectedly', () => {
    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----BoundaryUnexpectedEnd',
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    const boundary = '----BoundaryUnexpectedEnd';
    const header = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="incomplete.txt"\r\n'),
      Buffer.from('Content-Type: text/plain\r\n\r\n'),
    ]);

    const fileContent = Buffer.from('Partial content');

    eventHandlers.req['data'](header);
    eventHandlers.req['data'](fileContent);
    eventHandlers.req['end']();

    expect(mockReq.files).toHaveLength(1);
    expect(mockReq.files![0].filename).toBe('incomplete.txt');
    expect(mockFileStream.end).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test('should handle missing boundary in content-type header', () => {
    mockReq.headers = {
      'content-type': 'multipart/form-data',
    };

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    const error = mockNext.mock.calls[0][0] as unknown as Error;
    expect(error.message).toBe('No boundary found in content-type');
  });

  test('should handle unexpected errors gracefully', () => {
    mockReq.headers = {
      'content-type': 'multipart/form-data; boundary=----BoundaryUnexpected',
    };

    (Buffer.concat as any) = jest.fn().mockImplementation(() => {
      throw 'Unexpected error';
    });

    handleFileUpload(mockReq as FileUploadRequest, mockRes as Response, mockNext);

    eventHandlers.req['data'](Buffer.from('Some data'));
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    const error = mockNext.mock.calls[0][0] as unknown as Error;
    expect(error.message).toBe('Unexpected error');
  });
});
