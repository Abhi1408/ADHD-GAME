# Jenkins Setup Instructions

## Prerequisites
Ensure these plugins are installed in Jenkins:
- Git Plugin (usually pre-installed)
- Credentials Plugin (usually pre-installed)
- Pipeline Plugin (for scripted pipelines)

## Step 1: Create Docker Hub Credentials
1. Go to Jenkins → Manage Jenkins → Manage Credentials
2. Click on "Global" domain
3. Click "Add Credentials"
4. Select "Username with password"
5. Set ID as: `dockerhub-creds`
6. Enter your Docker Hub username and password
7. Click "OK"

## Step 2: Create Jenkins Job

### Option A: Pipeline from SCM (Recommended)
1. Go to Jenkins Dashboard
2. Click "New Item"
3. Enter job name: `ADHD-Game-Deploy`
4. Select "Pipeline" and click "OK"
5. In the Pipeline section:
   - Definition: "Pipeline script from SCM"
   - SCM: "Git"
   - Repository URL: `https://github.com/Abhi1408/ADHD-GAME.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
6. Click "Save"

### Option B: Direct Pipeline Script (If SCM doesn't work)
1. Go to Jenkins Dashboard
2. Click "New Item"
3. Enter job name: `ADHD-Game-Deploy`
4. Select "Pipeline" and click "OK"
5. In the Pipeline section:
   - Definition: "Pipeline script"
   - Copy and paste the entire Jenkinsfile content into the Script box
6. Click "Save"

## Step 3: Run the Pipeline
1. Go to your job dashboard
2. Click "Build Now"
3. The pipeline will automatically:
   - Clone your repo
   - Build Docker image
   - Push to Docker Hub
   - Deploy locally on port 80

## Step 4: Fix Docker Permissions (REQUIRED)
Run these commands on your EC2 instance:
```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins service
sudo systemctl restart jenkins

# Or if using Docker for Jenkins:
sudo docker restart jenkins
```

## Troubleshooting
- Ensure Docker is installed and running on Jenkins agent
- Verify Docker Hub credentials are correct
- Check that port 80 is available on your EC2 instance
- If still getting permission errors, try: `sudo chmod 666 /var/run/docker.sock`