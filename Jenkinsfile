node {
    def dockerImage = "abhigovil1408/adhd-game:latest"
    
    try {
        stage('Checkout') {
            git branch: 'main', url: 'https://github.com/Abhi1408/ADHD-GAME.git'
        }
        
        stage('Build Docker Image') {
            sh "docker build -t ${dockerImage} ."
        }
        
        stage('Login to Docker Hub') {
            withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                sh 'echo "$DOCKER_PASS" | docker login --username "$DOCKER_USER" --password-stdin'
            }
        }
        
        stage('Push Image') {
            sh "docker push ${dockerImage}"
        }
        
        stage('Deploy Local') {
            sh "docker stop adhd-game || true"
            sh "docker rm adhd-game || true"
            sh "docker run -d --name adhd-game -p 80:80 --restart unless-stopped ${dockerImage}"
        }
        
    } catch (Exception e) {
        currentBuild.result = 'FAILURE'
        throw e
    } finally {
        sh 'docker logout || true'
    }
}