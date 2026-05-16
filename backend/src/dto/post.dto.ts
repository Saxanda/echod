// posts/dto/post.dto.ts
import { IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @MaxLength(280)
    text!: string;
}