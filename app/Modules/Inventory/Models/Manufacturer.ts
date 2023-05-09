import { DateTime } from 'luxon'
import { afterCreate, afterFetch, BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
let newId = ""

import Drive from '@ioc:Adonis/Core/Drive'
export default class Manufacturer extends BaseModel {
  public static table = 'inventory.manufacturers';

  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public url: string

  @column()
  public supportPhone: string

  @column()
  public supportEmail: string

  @column()
  public image: any

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(manufacturer: Manufacturer) {
    newId = uuidv4()
    manufacturer.id = newId
  }

  @afterCreate()
  public static setNewId(manufacturer: Manufacturer) {
    manufacturer.id = newId
  }


  // TIPS : upload file. ini untuk serialize field image menjadi signedUrl instead of filename aja
  @afterFetch()
  public static afterFetchHook(manufacturers: Manufacturer[]) {
    manufacturers.forEach(async manuf => {
      if (manuf.image) {
        const signedUrl = await Drive.use('inventory').getSignedUrl('manufacturers/' + manuf.image, { expiresIn: '30mins' })
        manuf.image = [manuf.image, signedUrl] //ini array karena signedUrl dipake untuk client, fileName nya dipake untuk hapus file
      }
    })
  }
}
