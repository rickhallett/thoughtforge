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

export const handleFileUpload = (req: FileUploadRequest, res: Response, next: NextFunction): void => {
  const contentType = req.headers['content-type'];
  if (!contentType?.includes('multipart/form-data')) {
    return next();
  }

  let body = '';
  req.files = [];
  const files: UploadedFile[] = [];
  let currentFile: UploadedFile | null = null;
  let fileStream: fs.WriteStream | null = null;
  const boundary = req.headers['content-type']?.split('boundary=')[1];

  req.on('data', (chunk: Buffer) => {
    if (fileStream) {
      const chunkString = chunk.toString();
      if (boundary && chunkString.includes(boundary)) {
        fileStream.end();
        files.push(currentFile!);
        currentFile = null;
        fileStream = null;
        body = chunkString;
      } else {
        fileStream.write(chunk);
        return;
      }
    } else {
      body += chunk.toString();
    }
    
    if (body.includes('Content-Disposition: form-data; name="') && !currentFile) {
      const headerEnd = body.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;
      
      const header = body.slice(0, headerEnd);
      const filenameMatch = header.match(/filename="([^"]+)"/);
      const fieldNameMatch = header.match(/name="([^"]+)"/);
      
      if (filenameMatch && fieldNameMatch) {
        currentFile = {
          fieldName: fieldNameMatch[1],
          filename: filenameMatch[1],
          path: path.join(__dirname, 'uploads', `${Date.now()}-${filenameMatch[1]}`)
        };
        
        if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
          fs.mkdirSync(path.join(__dirname, 'uploads'));
        }
        
        fileStream = fs.createWriteStream(currentFile.path);
        
        const remaining = body.slice(headerEnd + 4);
        fileStream.write(remaining);
        
        body = '';
      }
    }
  });

  req.on('end', () => {
    if (fileStream && currentFile) {
      fileStream.end();
      files.push(currentFile);
    }
    
    req.files = files;
    next();
  });

  req.on('error', (err: Error) => {
    if (fileStream && currentFile) {
      fileStream.end();
      fs.unlinkSync(currentFile.path);
    }
    next(err);
  });
};

