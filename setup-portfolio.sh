#!/bin/bash
#
# Portfolio Setup Script
#
# This script helps you quickly set up a new portfolio from the template
# Usage: ./setup-portfolio.sh
#

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║     Portfolio Template Setup Wizard           ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Get user information
echo -e "${BLUE}Let's set up your portfolio! Please provide the following information:${NC}\n"

read -p "Full Name: " FULL_NAME
read -p "Professional Title (e.g., Software Engineer): " JOB_TITLE
read -p "Email Address: " EMAIL
read -p "Phone Number (optional): " PHONE
read -p "GitHub Username: " GITHUB_USER
read -p "LinkedIn Username (just the username part): " LINKEDIN_USER
read -p "Location (City, State): " LOCATION

echo ""
echo -e "${BLUE}Color Scheme (leave blank to keep current teal/beige theme):${NC}"
read -p "Primary Color (e.g., #154D57): " PRIMARY_COLOR
read -p "Secondary Color (e.g., #B7A08B): " SECONDARY_COLOR
read -p "Background Color (e.g., #FEFAF7): " BG_COLOR

# Set defaults if not provided
PRIMARY_COLOR=${PRIMARY_COLOR:-#154D57}
SECONDARY_COLOR=${SECONDARY_COLOR:-#B7A08B}
BG_COLOR=${BG_COLOR:-#FEFAF7}
PHONE=${PHONE:-+1 (XXX) XXX-XXXX}

echo ""
echo -e "${GREEN}✓ Information collected!${NC}"
echo ""

# Update profile.json
echo -e "${BLUE}Updating profile information...${NC}"
cat > data/profile.json << EOF
{
  "profile": {
    "name": "${FULL_NAME}",
    "title": "${JOB_TITLE}",
    "bio": "Professional with expertise in ${JOB_TITLE}. Update this in data/profile.json."
  },
  "contact": {
    "email": "${EMAIL}",
    "phone": "${PHONE}",
    "githubUsername": "${GITHUB_USER}",
    "linkedin": "https://linkedin.com/in/${LINKEDIN_USER}",
    "location": "${LOCATION}"
  },
  "siteConfig": {
    "domain": "",
    "title": "${FULL_NAME} | ${JOB_TITLE}",
    "description": "Professional portfolio of ${FULL_NAME}, ${JOB_TITLE}",
    "repositoryName": "${GITHUB_USER}.github.io"
  }
}
EOF

# Update HTML meta tags
echo -e "${BLUE}Updating HTML with your information...${NC}"
sed -i.bak "s/Your Full Name/${FULL_NAME}/g" index.html
sed -i.bak "s/Your Professional Title/${JOB_TITLE}/g" index.html
sed -i.bak "s/your.email@example.com/${EMAIL}/g" index.html
sed -i.bak "s/your-github-username/${GITHUB_USER}/g" index.html
sed -i.bak "s/your-linkedin/${LINKEDIN_USER}/g" index.html

# Update package.json
echo -e "${BLUE}Updating package.json...${NC}"
cat > package.json << EOF
{
  "name": "${GITHUB_USER}-portfolio",
  "version": "1.0.0",
  "description": "Professional portfolio website for ${FULL_NAME}",
  "main": "index.html",
  "scripts": {
    "start": "python -m http.server 8000",
    "dev": "npx http-server -p 8000 -o"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/${GITHUB_USER}/${GITHUB_USER}.github.io.git"
  },
  "author": "${FULL_NAME} <${EMAIL}>",
  "license": "MIT"
}
EOF

# Update colors if provided
if [[ "$PRIMARY_COLOR" != "#154D57" ]] || [[ "$SECONDARY_COLOR" != "#B7A08B" ]] || [[ "$BG_COLOR" != "#FEFAF7" ]]; then
    echo -e "${BLUE}Updating color scheme...${NC}"
    sed -i.bak "s/--primary-color: #154D57/--primary-color: ${PRIMARY_COLOR}/g" assets/css/styles.css
    sed -i.bak "s/--secondary-color: #B7A08B/--secondary-color: ${SECONDARY_COLOR}/g" assets/css/styles.css
    sed -i.bak "s/--bg-primary: #FEFAF7/--bg-primary: ${BG_COLOR}/g" assets/css/styles.css
fi

# Clean up backup files
rm -f index.html.bak assets/css/styles.css.bak

echo ""
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║          ✓ Setup Complete!                    ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${GREEN}Your portfolio has been configured!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Edit the JSON files in data/ folder to add your:"
echo "   - Work experience (data/experience.json)"
echo "   - Skills (data/skills.json)"
echo "   - Projects (data/projects.json)"
echo "   - Education (data/education.json)"
echo ""
echo "2. Add your resume PDF to the documents/ folder"
echo ""
echo "3. Test locally:"
echo "   python -m http.server 8000"
echo "   Then visit: http://localhost:8000"
echo ""
echo "4. When ready, deploy to GitHub Pages:"
echo "   git init"
echo "   git add -A"
echo "   git commit -m 'Initial commit: My portfolio'"
echo "   git remote add origin https://github.com/${GITHUB_USER}/${GITHUB_USER}.github.io.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo -e "${GREEN}Happy portfolio building! 🚀${NC}"
