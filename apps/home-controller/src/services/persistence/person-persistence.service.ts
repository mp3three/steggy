import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AutoLogService, CastResult } from '@steggy/boilerplate';
import {
  PERSON_UPDATE,
  PersonDocument,
  PersonDTO,
} from '@steggy/controller-shared';
import {
  BaseMongoService,
  BaseSchemaDTO,
  EncryptionService,
} from '@steggy/persistence';
import { is, ResultControlDTO } from '@steggy/utilities';
import EventEmitter from 'eventemitter3';
import { Model } from 'mongoose';

@Injectable()
export class PersonPersistenceService extends BaseMongoService {
  constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly logger: AutoLogService,
    @InjectModel(PersonDTO.name)
    private readonly PersonModel: Model<PersonDocument>,
    private readonly encryptService: EncryptionService,
  ) {
    super();
  }

  @CastResult(PersonDTO)
  public async create(
    person: Omit<PersonDTO, keyof BaseSchemaDTO>,
  ): Promise<PersonDTO> {
    // eslint-disable-next-line unicorn/no-await-expression-member
    person = (await this.PersonModel.create(person)).toObject();
    this.eventEmitter.emit(PERSON_UPDATE);
    return person;
  }

  public async delete(state: PersonDTO | string): Promise<boolean> {
    const query = this.merge(is.string(state) ? state : state._id);
    this.logger.debug({ query }, `delete query`);
    delete query.deleted;
    const result = await this.PersonModel.updateOne(query, {
      deleted: Date.now(),
    }).exec();
    this.eventEmitter.emit(PERSON_UPDATE);
    return result.acknowledged;
  }

  @CastResult(PersonDTO)
  public async findById(
    state: string,
    { control }: { control?: ResultControlDTO } = {},
  ): Promise<PersonDTO> {
    const query = this.merge(state, control);
    const out = await this.modifyQuery(control, this.PersonModel.findOne(query))
      .lean()
      .exec();
    return out;
  }

  @CastResult(PersonDTO)
  public async findMany(control: ResultControlDTO = {}): Promise<PersonDTO[]> {
    const query = this.merge(control);
    const out = await this.modifyQuery(control, this.PersonModel.find(query))
      .lean()
      .exec();
    return out;
  }

  public async update(
    state: Omit<Partial<PersonDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<PersonDTO> {
    const query = this.merge(id);
    const result = await this.PersonModel.updateOne(query, state).exec();
    if (result.acknowledged) {
      this.eventEmitter.emit(PERSON_UPDATE);
      return await this.findById(id);
    }
  }
}
