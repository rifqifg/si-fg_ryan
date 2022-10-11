import { DateTime } from 'luxon'
import { afterCreate, afterFetch, BaseModel, beforeCreate, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Model from './Model'
import AssetLocation from './AssetLocation'
import Supplier from './Supplier'
import AssetStatus from './AssetStatus'
import Drive from '@ioc:Adonis/Core/Drive'
import AssetLoan from './AssetLoan'

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
  public supplierId: string

  @belongsTo(() => Supplier)
  public supplier: BelongsTo<typeof Supplier>

  @column()
  public assetStatusId: string

  @belongsTo(() => AssetStatus)
  public assetStatus: BelongsTo<typeof AssetStatus>

  @hasMany(() => AssetLoan)
  public assetLoan: HasMany<typeof AssetLoan>

  @column()
  public serial: string

  @column()
  public tag: string

  @column.date()
  public purchaseDate: DateTime

  @column()
  public orderNumber: string

  @column()
  public price: string

  @column()
  public warranty: string

  @column()
  public notes: string

  @column()
  public image: any

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
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

  @afterFetch()
  public static afterFetchHook(assets: Asset[]) {
    assets.forEach(async asset => {
      if (asset.image) {
        const signedUrl = await Drive.use('inventory').getSignedUrl('assets/' + asset.image, { expiresIn: '30mins' })
        asset.image = [asset.image, signedUrl] //ini array karena signedUrl dipake untuk client, fileName nya dipake untuk hapus file
      }
    })
  }
} 