#!/bin/bash
# Configure Supabase auth redirect for CultureFirst deployment

VERCEL_URL="https://culturefirst-oei88koo3-ael8.vercel.app"
SUPABASE_PROJECT_ID="phgwoovwshpfhaqlopgk"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoZ3dvb3Z3c2hwZmhhcWxvcGdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTc4OTczOSwiZXhwIjoyMTA3MzY1NzM5fQ.NHPUTCTI_WMFEzg7svR_XGx2VKQkUtDpAxKrEuJh6R4"

echo "🔐 Configuring Supabase auth redirect..."
echo "Project ID: $SUPABASE_PROJECT_ID"
echo "Redirect URL: $VERCEL_URL/auth/callback"

# Update auth configuration
curl -X PUT \
  "https://api.supabase.com/api/v1/projects/$SUPABASE_PROJECT_ID/auth/config" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"site_url\": \"$VERCEL_URL\",
    \"redirect_urls\": [\"$VERCEL_URL/auth/callback\"]
  }" 2>&1

echo ""
echo "✅ Configuration completed!"
