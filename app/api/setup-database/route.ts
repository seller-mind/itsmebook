import { NextResponse } from "next/server";

// One-time database setup endpoint - DELETE after running
export async function GET() {
  try {
    const { Client } = await import("pg");
    
    // Try multiple connection methods
    const connectionConfigs = [
      // Method 1: Session mode pooler
      {
        connectionString: `postgresql://postgres.lhxrauqvqvehhqbzvzjr:8Jt97lv9eWDbYN71@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`,
        ssl: { rejectUnauthorized: false },
      },
      // Method 2: Transaction mode pooler
      {
        connectionString: `postgresql://postgres.lhxrauqvqvehhqbzvzjr:8Jt97lv9eWDbYN71@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
        ssl: { rejectUnauthorized: false },
      },
      // Method 3: Direct connection
      {
        host: "db.lhxrauqvqvehhqbzvzjr.supabase.co",
        port: 5432,
        database: "postgres",
        user: "postgres",
        password: "8Jt97lv9eWDbYN71",
        ssl: { rejectUnauthorized: false },
      },
    ];

    let client: any = null;
    let connected = false;
    let lastError = "";

    for (const config of connectionConfigs) {
      try {
        client = new Client(config);
        await client.connect();
        connected = true;
        break;
      } catch (err: any) {
        lastError = err.message;
        try { await client?.end(); } catch {}
        client = null;
        continue;
      }
    }

    if (!connected || !client) {
      return NextResponse.json(
        { success: false, error: `Could not connect to database: ${lastError}` },
        { status: 500 }
      );
    }

    const sql = `
      CREATE TABLE IF NOT EXISTS books (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        character_name TEXT NOT NULL,
        character_age INTEGER NOT NULL,
        theme TEXT NOT NULL,
        style TEXT NOT NULL,
        pages JSONB DEFAULT '[]'::jsonb,
        status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_photos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE books ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;

      DO $$ BEGIN
        CREATE POLICY "Users can view own books" ON books FOR SELECT USING (user_id = auth.uid()::text);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE POLICY "Users can insert own books" ON books FOR INSERT WITH CHECK (user_id = auth.uid()::text);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE POLICY "Users can update own books" ON books FOR UPDATE USING (user_id = auth.uid()::text);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE POLICY "Users can delete own books" ON books FOR DELETE USING (user_id = auth.uid()::text);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE POLICY "Users can view own photos" ON user_photos FOR SELECT USING (user_id = auth.uid()::text);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE POLICY "Users can insert own photos" ON user_photos FOR INSERT WITH CHECK (user_id = auth.uid()::text);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE POLICY "Users can delete own photos" ON user_photos FOR DELETE USING (user_id = auth.uid()::text);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('user-photos', 'user-photos', true) 
      ON CONFLICT (id) DO NOTHING;

      DO $$ BEGIN
        CREATE POLICY "Users can upload own photos" ON storage.objects 
        FOR INSERT WITH CHECK (bucket_id = 'user-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE POLICY "Anyone can view photos" ON storage.objects 
        FOR SELECT USING (bucket_id = 'user-photos');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE POLICY "Users can delete own photos" ON storage.objects 
        FOR DELETE USING (bucket_id = 'user-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await client.query(sql);

    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public';");
    
    await client.end();

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully!",
      tables: tables.rows.map((r: any) => r.tablename),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
