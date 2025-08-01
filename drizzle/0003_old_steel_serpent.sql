CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_vin" varchar(10) NOT NULL,
	"telemetry_id" integer,
	"alert_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"resolved_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_vehicle_vin_vehicles_vin_fk" FOREIGN KEY ("vehicle_vin") REFERENCES "public"."vehicles"("vin") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_telemetry_id_telemetry_id_fk" FOREIGN KEY ("telemetry_id") REFERENCES "public"."telemetry"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alerts_vin_type_idx" ON "alerts" USING btree ("vehicle_vin","alert_type");--> statement-breakpoint
CREATE INDEX "alerts_severity_idx" ON "alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "alerts_resolved_idx" ON "alerts" USING btree ("resolved");--> statement-breakpoint
CREATE INDEX "alerts_created_at_idx" ON "alerts" USING btree ("created_at");