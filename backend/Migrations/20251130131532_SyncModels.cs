using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SyncModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "Device_Users_Id",
                table: "Measurements",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "DeviceUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    Device_Id = table.Column<string>(type: "character varying(17)", maxLength: 17, nullable: false),
                    User_Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApiKeyHash = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceUsers_Devices_Device_Id",
                        column: x => x.Device_Id,
                        principalTable: "Devices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DeviceUsers_Users_User_Id",
                        column: x => x.User_Id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Measurements_Device_Users_Id_Timestamp",
                table: "Measurements",
                columns: new[] { "Device_Users_Id", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_DeviceUsers_Device_Id_User_Id",
                table: "DeviceUsers",
                columns: new[] { "Device_Id", "User_Id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceUsers_User_Id",
                table: "DeviceUsers",
                column: "User_Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Measurements_DeviceUsers_Device_Users_Id",
                table: "Measurements",
                column: "Device_Users_Id",
                principalTable: "DeviceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Measurements_DeviceUsers_Device_Users_Id",
                table: "Measurements");

            migrationBuilder.DropTable(
                name: "DeviceUsers");

            migrationBuilder.DropIndex(
                name: "IX_Measurements_Device_Users_Id_Timestamp",
                table: "Measurements");

            migrationBuilder.DropColumn(
                name: "Device_Users_Id",
                table: "Measurements");
        }
    }
}
