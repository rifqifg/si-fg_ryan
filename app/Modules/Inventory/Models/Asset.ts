import { DateTime } from 'luxon'
import { afterCreate, BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Model from './Model'
import AssetLocation from './AssetLocation'
import Supplier from './Supplier'
import AssetStatus from './AssetStatus'
let newId = ""
export default class Asset extends BaseModel {
  public static table = 'inventory.assets';

  @column({ isPrimary: true })
  public id: string

  @column()
  public modelId: string

  @belongsTo(() => Model)
  public model: BelongsTo<typeof Model>

  @column()
  public assetLocationId: string

  @belongsTo(() => AssetLocation)
  public assetLocation: BelongsTo<typeof AssetLocation>

  @column()
  public assetSupplierId: string

  @belongsTo(() => Supplier)
  public supplier: BelongsTo<typeof Supplier>

  @column()
  public assetStatusId: string

  @belongsTo(() => AssetStatus)
  public assetStatus: BelongsTo<typeof AssetStatus>

  @column()
  public serial: string

  @column()
  public tag: string

  @column()
  public purchaseDate: string

  @column()
  public orderNumber: string

  @column()
  public price: string

  @column()
  public warranty: string

  @column()
  public notes: string

  @column()
  public image: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(asset: Asset) {
    newId = uuidv4()
    asset.id = newId
  }

  @afterCreate()
  public static setNewId(asset: Asset) {
    asset.id = newId
  }
} 