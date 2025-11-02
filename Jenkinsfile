pipeline {
  agent any

  environment {
    DOCKER_IMAGE = "abhigovil1408/adhd-game"
    TAG = "latest"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        sh "docker build -t ${DOCKER_IMAGE}:${TAG} ."
      }
    }

    stage('Login to Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo "$DOCKER_PASS" | docker login --username "$DOCKER_USER" --password-stdin'
        }
      }
    }

    stage('Push Image') {
      steps {
        sh "docker push ${DOCKER_IMAGE}:${TAG}"
      }
    }

    stage('Deploy (local)') {
      steps {
        sh "docker stop adhd-game || true"
        sh "docker rm adhd-game || true"
        sh "docker run -d --name adhd-game -p 80:80 --restart unless-stopped ${DOCKER_IMAGE}:${TAG}"
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
    }
  }
}
