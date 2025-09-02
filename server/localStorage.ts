import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class LocalStorage {
  async generateUploadUrl(filename?: string): Promise<{ uploadUrl: string; objectKey: string }> {
    const objectKey = `${randomUUID()}-${filename || 'image.jpg'}`;
    // For local storage, we'll use a simple identifier
    const uploadUrl = `/api/upload/${objectKey}`;
    
    return {
      uploadUrl,
      objectKey
    };
  }

  async saveFile(objectKey: string, buffer: Buffer): Promise<string> {
    const filePath = path.join(UPLOAD_DIR, objectKey);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  async getFile(objectKey: string): Promise<Buffer | null> {
    const filePath = path.join(UPLOAD_DIR, objectKey);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath);
  }

  async deleteFile(objectKey: string): Promise<boolean> {
    const filePath = path.join(UPLOAD_DIR, objectKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  getPublicUrl(objectKey: string): string {
    // Return a URL that can be used to access the file
    return `/api/files/${objectKey}`;
  }
}

export const localStorage = new LocalStorage();
