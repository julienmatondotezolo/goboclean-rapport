#!/bin/bash

# GobloClean Rapport - Environment Setup Helper Script
# This script helps you configure your environment variables

echo "🔧 GobloClean Rapport - Environment Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}Error: .env.local not found!${NC}"
    exit 1
fi

# Check if backend .env exists
if [ ! -f "../goboclean-rapport-backend/.env" ]; then
    echo -e "${RED}Error: Backend .env not found!${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Supabase Configuration${NC}"
echo "Go to: https://app.supabase.com/project/_/settings/api"
echo ""
echo -e "${YELLOW}Enter your Supabase Project URL:${NC}"
echo "(e.g., https://xxxxx.supabase.co)"
read -p "> " SUPABASE_URL

echo ""
echo -e "${YELLOW}Enter your Supabase Anon/Public Key:${NC}"
echo "(Starts with eyJhbGciOiJIUzI1NiIs...)"
read -p "> " SUPABASE_ANON_KEY

echo ""
echo -e "${YELLOW}Enter your Supabase Service Role Key (for backend):${NC}"
echo "(Starts with eyJhbGciOiJIUzI1NiIs... - Keep this secret!)"
read -p "> " SUPABASE_SERVICE_KEY

echo ""
echo -e "${BLUE}Step 2: Email Configuration${NC}"
echo "Choose your email provider:"
echo "1) Resend (Recommended)"
echo "2) SendGrid"
echo "3) Gmail (Testing only)"
read -p "Enter choice (1-3): " EMAIL_CHOICE

case $EMAIL_CHOICE in
    1)
        SMTP_HOST="smtp.resend.com"
        SMTP_PORT="587"
        SMTP_USER="resend"
        echo ""
        echo -e "${YELLOW}Enter your Resend API Key:${NC}"
        echo "(Starts with re_...)"
        read -p "> " SMTP_PASSWORD
        ;;
    2)
        SMTP_HOST="smtp.sendgrid.net"
        SMTP_PORT="587"
        SMTP_USER="apikey"
        echo ""
        echo -e "${YELLOW}Enter your SendGrid API Key:${NC}"
        echo "(Starts with SG....)"
        read -p "> " SMTP_PASSWORD
        ;;
    3)
        SMTP_HOST="smtp.gmail.com"
        SMTP_PORT="587"
        echo ""
        echo -e "${YELLOW}Enter your Gmail address:${NC}"
        read -p "> " SMTP_USER
        echo ""
        echo -e "${YELLOW}Enter your Gmail App Password:${NC}"
        echo "(16-character password from Google App Passwords)"
        read -p "> " SMTP_PASSWORD
        ;;
    *)
        echo -e "${RED}Invalid choice!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}Enter your sender email address:${NC}"
echo "(e.g., noreply@goboclean.be)"
read -p "> " SMTP_FROM

echo ""
echo -e "${GREEN}Updating configuration files...${NC}"

# Update frontend .env.local
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# Update backend .env
cat > ../goboclean-rapport-backend/.env << EOF
# Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# SMTP Configuration
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_USER=$SMTP_USER
SMTP_PASSWORD=$SMTP_PASSWORD
SMTP_FROM=$SMTP_FROM

# Server Configuration
PORT=3001
NODE_ENV=development
EOF

echo ""
echo -e "${GREEN}✅ Configuration complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Restart your development servers:"
echo "   Frontend: yarn dev"
echo "   Backend: npm run start:dev"
echo ""
echo "2. Read ENV_SETUP.md for more details and troubleshooting"
echo ""
echo -e "${YELLOW}⚠️  Remember: Never commit .env files to git!${NC}"
