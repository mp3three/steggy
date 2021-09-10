export class EndpointGroupCreatePayloadDTO {
  /**
   * List of endpoint identifiers that will be part of this group
   */
  public associatedEndpoints?: number[];
  public description?: string;
  /**
   * @example my-endpoint-group
   */
  public name: string;
  public tagIds?: number[];
}
