<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Make checked_in_at nullable for all databases
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->timestamp('checked_in_at')->nullable()->change();
        });
        
        // For PostgreSQL, Laravel uses check constraints for enums
        if (DB::getDriverName() === 'pgsql') {
            // Drop existing check constraint if it exists
            DB::statement("
                DO \$\$ 
                DECLARE
                    r RECORD;
                BEGIN
                    FOR r IN (
                        SELECT constraint_name 
                        FROM information_schema.table_constraints 
                        WHERE table_name = 'attendance_records' 
                        AND constraint_type = 'CHECK'
                        AND constraint_name LIKE '%status%'
                    ) LOOP
                        EXECUTE 'ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
                    END LOOP;
                END \$\$;
            ");
            
            // Add new check constraint with 'absent'
            DB::statement("
                ALTER TABLE attendance_records 
                ADD CONSTRAINT attendance_records_status_check 
                CHECK (status IN ('present', 'late', 'absent'))
            ");
        } else {
            // For MySQL/MariaDB, modify the enum
            DB::statement("ALTER TABLE attendance_records MODIFY COLUMN status ENUM('present', 'late', 'absent') DEFAULT 'present'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            // Make checked_in_at NOT NULL again
            DB::statement('ALTER TABLE attendance_records ALTER COLUMN checked_in_at SET NOT NULL');
            
            // Note: PostgreSQL doesn't support removing enum values easily
            // This would require recreating the enum, which is complex
            // For now, we'll leave 'absent' in the enum
        } else {
            Schema::table('attendance_records', function (Blueprint $table) {
                $table->timestamp('checked_in_at')->nullable(false)->change();
            });
            
            DB::statement("ALTER TABLE attendance_records MODIFY COLUMN status ENUM('present', 'late') DEFAULT 'present'");
        }
    }
};

