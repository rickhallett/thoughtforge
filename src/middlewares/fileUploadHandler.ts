import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

export interface UploadedFile {
  fieldName: string;
  filename: string;
  path: string;
}

export interface FileUploadRequest extends Request {
  files?: UploadedFile[];
}

interface FileUploadState {
  buffer: Buffer;
  boundaryBuffer: Buffer;
  files: UploadedFile[];
  currentFile: UploadedFile | null;
  fileStream: fs.WriteStream | null;
  isReadingHeader: boolean;
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const RAW_UPLOAD_DIR = process.cwd();



export const handleFileUpload = (
  req: FileUploadRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!isFileUploadRequest(req)) {
    return next();
  }

  const boundary = extractBoundary(req);
  if (!boundary) {
    return next(new Error('No boundary found in content-type'));
  }

  const state = initializeState(boundary);
  setupEventHandlers(req, state, next);
};

function isFileUploadRequest(req: Request): boolean {
  const contentType = req.headers['content-type'];
  return contentType?.includes('multipart/form-data') ?? false;
}

function extractBoundary(req: Request): string | undefined {
  const match = req.headers['content-type']?.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match?.[1] || match?.[2];
}

function initializeState(boundary: string): FileUploadState {
  return {
    buffer: Buffer.alloc(0),
    boundaryBuffer: Buffer.from(`\r\n--${boundary}`),
    files: [],
    currentFile: null,
    fileStream: null,
    isReadingHeader: true,
    rawBody: Buffer.alloc(0) // Initialize rawBody
  };
}

function setupEventHandlers(
  req: FileUploadRequest,
  state: FileUploadState,
  next: NextFunction
): void {
  req.files = state.files;

  req.on('data', (chunk: Buffer) => {
    // Accumulate raw data
    state.rawBody = Buffer.concat([state.rawBody, chunk]);
    handleChunk(chunk, state, next);
  });

  req.on('end', () => {
    try {
      // Store the raw body before parsing and get the path
      const rawBodyPath = storeRawBody(state.rawBody);
      console.log(`Raw body stored at: ${rawBodyPath}`);
      handleEnd(req, state, next);
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  });
  req.on('error', (err) => handleError(state, err, next));
}

function handleChunk(
  chunk: Buffer,
  state: FileUploadState,
  next: NextFunction
): void {
  try {
    // Append new chunk to existing buffer
    state.buffer = Buffer.concat([state.buffer, chunk]);

    // Process buffer while we can find boundaries
    while (state.buffer.length > 0) {
      if (state.isReadingHeader) {
        const headerEnd = findSequence(state.buffer, Buffer.from('\r\n\r\n'));
        if (headerEnd === -1) break; // Wait for more data

        const header = state.buffer.slice(0, headerEnd).toString();
        const fileInfo = extractFileInfo(header);

        if (fileInfo) {
          createNewFileUpload(state, fileInfo, next);
        }

        state.buffer = state.buffer.slice(headerEnd + 4);
        state.isReadingHeader = false;
        continue;
      }

      const boundaryPos = findSequence(state.buffer, state.boundaryBuffer);
      if (boundaryPos === -1) {
        // No boundary found, write all but the last boundary length bytes
        // (in case we have a partial boundary)
        if (state.fileStream && state.buffer.length > state.boundaryBuffer.length) {
          const safeLength = state.buffer.length - state.boundaryBuffer.length;
          state.fileStream.write(state.buffer.slice(0, safeLength));
          state.buffer = state.buffer.slice(safeLength);
        }
        break; // Wait for more data
      }

      // Write the remaining data before boundary
      if (state.fileStream && boundaryPos > 0) {
        state.fileStream.write(state.buffer.slice(0, boundaryPos));
      }

      // Finish current file
      finishCurrentFile(state);

      // Remove boundary and prepare for next header
      state.buffer = state.buffer.slice(boundaryPos + state.boundaryBuffer.length);
      state.isReadingHeader = true;
    }
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
}

function findSequence(buffer: Buffer, sequence: Buffer): number {
  for (let i = 0; i <= buffer.length - sequence.length; i++) {
    let found = true;
    for (let j = 0; j < sequence.length; j++) {
      if (buffer[i + j] !== sequence[j]) {
        found = false;
        break;
      }
    }
    if (found) return i;
  }
  return -1;
}

function extractFileInfo(header: string): { fieldName: string; filename: string } | null {
  const filenameMatch = header.match(/filename="([^"]+)"/);
  const fieldNameMatch = header.match(/name="([^"]+)"/);

  if (filenameMatch && fieldNameMatch) {
    return {
      fieldName: fieldNameMatch[1],
      filename: filenameMatch[1]
    };
  }
  return null;
}

function createNewFileUpload(
  state: FileUploadState,
  fileInfo: { fieldName: string; filename: string },
  next: NextFunction
): void {
  try {
    ensureUploadDirectoryExists();

    state.currentFile = {
      fieldName: fileInfo.fieldName,
      filename: fileInfo.filename,
      path: path.join(UPLOAD_DIR, `${Date.now()}-${fileInfo.filename}`),
    };

    state.fileStream = fs.createWriteStream(state.currentFile.path);

    // **Add error handler to fileStream**
    state.fileStream.on('error', (err: Error) => {
      handleFileStreamError(state, err, next);
    });
  } catch (error) {
    state.currentFile = null;
    state.fileStream = null;
    next(error instanceof Error ? error : new Error(String(error)));
  }
}

function handleFileStreamError(
  state: FileUploadState,
  err: Error,
  next: NextFunction
): void {
  if (state.fileStream) {
    state.fileStream.end();
  }
  if (state.currentFile) {
    fs.unlink(state.currentFile.path, () => {
      // Ignore errors during unlink
    });
  }
  state.currentFile = null;
  state.fileStream = null;
  next(err);
}

function ensureUploadDirectoryExists(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function finishCurrentFile(state: FileUploadState): void {
  if (state.fileStream && state.currentFile) {
    state.fileStream.end();
    state.files.push(state.currentFile);
    state.currentFile = null;
    state.fileStream = null;
  }
}

function handleEnd(
  req: FileUploadRequest,
  state: FileUploadState,
  next: NextFunction
): void {
  finishCurrentFile(state);
  req.files = state.files;
  next();
}

function handleError(
  state: FileUploadState,
  err: Error,
  next: NextFunction
): void {
  if (state.fileStream && state.currentFile) {
    state.fileStream.end();
    fs.unlink(state.currentFile.path, () => { });
  }
  next(err);
}

function storeRawBody(rawBody: Buffer): string {
  const rawBodyPath = path.join(RAW_UPLOAD_DIR, `raw-${Date.now()}.bin`);
  fs.writeFileSync(rawBodyPath, rawBody);
  return rawBodyPath;
}
