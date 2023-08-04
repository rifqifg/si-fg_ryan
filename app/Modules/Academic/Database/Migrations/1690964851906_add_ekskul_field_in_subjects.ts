import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "academic.subjects";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean("is_extracurricular").defaultTo(false);
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("is_extracurricular");
    });
  }
}
