import { PostgrestBuilder, PostgrestFilterBuilder } from '@supabase/postgrest-js';

// Override Supabase type definitions to fix TypeScript errors
declare module '@supabase/postgrest-js' {
  // Fix for PostgrestFilterBuilder
  interface PostgrestFilterBuilder<Schema, Row, Relationships, Table, RelationName> {
    // Add missing methods
    order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): PostgrestFilterBuilder<Schema, Row, Relationships, Table, RelationName>;
    select(columns?: string): PostgrestFilterBuilder<Schema, Row, Relationships, Table, RelationName>;
    single(): PostgrestFilterBuilder<Schema, Row, Relationships, Table, RelationName>;
    
    // Add missing properties
    error: any;
    data: any;
  }

  // Fix for PostgrestBuilder
  interface PostgrestBuilder<T> {
    order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): PostgrestBuilder<T>;
  }
}
