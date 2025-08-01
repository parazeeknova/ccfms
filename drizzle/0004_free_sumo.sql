CREATE INDEX "alerts_type_created_at_idx" ON "alerts" USING btree ("alert_type","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "alerts_severity_created_at_idx" ON "alerts" USING btree ("severity","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "alerts_resolved_created_at_idx" ON "alerts" USING btree ("resolved","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "alerts_type_severity_idx" ON "alerts" USING btree ("alert_type","severity");--> statement-breakpoint
CREATE INDEX "alerts_recent_idx" ON "alerts" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "telemetry_vin_timestamp_desc_idx" ON "telemetry" USING btree ("vehicle_vin","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "telemetry_recent_timestamp_idx" ON "telemetry" USING btree ("timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "telemetry_fuel_level_idx" ON "telemetry" USING btree ("fuel_battery_level");--> statement-breakpoint
CREATE INDEX "telemetry_speed_idx" ON "telemetry" USING btree ("speed");--> statement-breakpoint
CREATE INDEX "telemetry_odometer_timestamp_idx" ON "telemetry" USING btree ("vehicle_vin","odometer_reading","timestamp" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "vehicles_fleet_id_idx" ON "vehicles" USING btree ("fleet_id");--> statement-breakpoint
CREATE INDEX "vehicles_registration_status_idx" ON "vehicles" USING btree ("registration_status");