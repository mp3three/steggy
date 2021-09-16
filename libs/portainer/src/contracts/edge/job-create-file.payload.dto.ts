export class JobCreateFilePayloadDTO {
  public cronExpression?: string;
  public endpoints?: number[];
  public file?: number[];
  public name?: string;
  public recurring?: boolean;
}
