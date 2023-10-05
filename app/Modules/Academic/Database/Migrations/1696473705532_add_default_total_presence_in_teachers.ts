import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "academic.teachers";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer("total_mengajar");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("total_mengajar");
    });
  }
}
