import { Injectable, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Injectable()
export class FileValidationInterceptor extends FileInterceptor('photo', {
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestException('Formato de imagem inválido. Use JPG, PNG, WEBP ou GIF'), false);
        }
    },
    storage: diskStorage({
        destination: './uploads/photos',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = file.originalname.split('.').pop();
            cb(null, `${uniqueSuffix}.${ext}`);
        },
    }),
}) {}
