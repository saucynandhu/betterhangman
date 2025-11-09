// Quick verification script to check if environment variables are loaded
// Run with: npx tsx scripts/verify-setup.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking environment variables...\n');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing!');
  process.exit(1);
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set');
  console.log(`   URL: ${supabaseUrl}\n`);
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!');
  process.exit(1);
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set');
  console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...\n`);
}

console.log('✅ All environment variables are configured correctly!');
console.log('\n📝 Next steps:');
console.log('   1. Make sure you\'ve run the SQL schema in Supabase');
console.log('   2. Restart your Next.js dev server');
console.log('   3. Visit http://localhost:3000');

