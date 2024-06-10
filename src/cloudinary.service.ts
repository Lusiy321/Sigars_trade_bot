/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { createReadStream } from 'fs';

@Injectable()
export class CloudinaryService {
  private readonly cloudinaryConfig: any;

  constructor() {
    this.cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };
  }

  async uploadImages(images: Express.Multer.File[]): Promise<string[]> {
    const validImages = images.filter((image) => image && image.path);
    const uploadPromises = validImages.map((image) => this.uploadImage(image));
    const urls = await Promise.all(uploadPromises);
    return urls;
  }

  private async uploadImage(image: Express.Multer.File): Promise<string> {
    if (!image || !image.path) {
      console.error('Invalid image:', image);
      return null;
    }

    const stream = createReadStream(image.path);

    return new Promise((resolve, reject) => {
      const cloudinaryStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          public_id: image.filename,
          ...this.cloudinaryConfig,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            const url = result.secure_url;
            resolve(url);
          }
        },
      );

      stream.pipe(cloudinaryStream);
    });
  }
}
