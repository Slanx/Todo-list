import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ParseStringLowPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const val = value.toLowerCase();
    return val;
  }
}
