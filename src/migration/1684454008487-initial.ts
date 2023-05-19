import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1684454008487 implements MigrationInterface {
    name = 'Initial1684454008487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "issue" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL DEFAULT (''), "state" varchar CHECK( "state" IN ('NEW','REFUSED','INPROGRESS','BLOCKED','REVIEW','DONE') ) NOT NULL DEFAULT ('NEW'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "ownerId" integer)`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "email" varchar, "privilege" varchar CHECK( "privilege" IN ('OWNER','ADMIN','USER') ) NOT NULL DEFAULT ('USER'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`);
        await queryRunner.query(`CREATE TABLE "temporary_issue" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL DEFAULT (''), "state" varchar CHECK( "state" IN ('NEW','REFUSED','INPROGRESS','BLOCKED','REVIEW','DONE') ) NOT NULL DEFAULT ('NEW'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "ownerId" integer, CONSTRAINT "FK_0948bd74a185a1ca7e178f41fc5" FOREIGN KEY ("ownerId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_issue"("id", "name", "description", "state", "createdAt", "updatedAt", "ownerId") SELECT "id", "name", "description", "state", "createdAt", "updatedAt", "ownerId" FROM "issue"`);
        await queryRunner.query(`DROP TABLE "issue"`);
        await queryRunner.query(`ALTER TABLE "temporary_issue" RENAME TO "issue"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "issue" RENAME TO "temporary_issue"`);
        await queryRunner.query(`CREATE TABLE "issue" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL DEFAULT (''), "state" varchar CHECK( "state" IN ('NEW','REFUSED','INPROGRESS','BLOCKED','REVIEW','DONE') ) NOT NULL DEFAULT ('NEW'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "ownerId" integer)`);
        await queryRunner.query(`INSERT INTO "issue"("id", "name", "description", "state", "createdAt", "updatedAt", "ownerId") SELECT "id", "name", "description", "state", "createdAt", "updatedAt", "ownerId" FROM "temporary_issue"`);
        await queryRunner.query(`DROP TABLE "temporary_issue"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "issue"`);
    }

}
