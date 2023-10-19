import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "academic.teacher_attendances";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string("catatan_kelas");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("catatan_kelas");
    });
  }
}
