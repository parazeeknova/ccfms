CREATE TABLE "telemetry" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_vin" varchar(10) NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"speed" numeric(5, 2) NOT NULL,
	"engine_status" varchar(10) NOT NULL,
	"fuel_battery_level" numeric(5, 2) NOT NULL,
	"odometer_reading" numeric(10, 2) NOT NULL,
	"diagnostic_codes" jsonb,
	"timestamp" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "vin" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_vehicle_vin_vehicles_vin_fk" FOREIGN KEY ("vehicle_vin") REFERENCES "public"."vehicles"("vin") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "telemetry_vin_timestamp_idx" ON "telemetry" USING btree ("vehicle_vin","timestamp");--> statement-breakpoint
CREATE INDEX "telemetry_timestamp_idx" ON "telemetry" USING btree ("timestamp");