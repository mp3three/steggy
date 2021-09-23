import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class EnumContainsPipe implements PipeTransform {
  constructor(private readonly type: Record<string, string>) {}

  public async transform(value: string): Promise<string> {
    const values = Object.values(this.type);
    if (!values.includes(value)) {
      throw new BadRequestException(`Invalid enum value`);
    }
    return value;
  }
}
