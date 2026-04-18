pipeline {

    agent any

    environment {
        registryCredential = 'dockerhub_id'
        DOCKER_REGISTRY = 'https://registry.hub.docker.com'
        NODEJS_HOME = tool 'node18'
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"
        NODE_OPTIONS = "--openssl-legacy-provider"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_USER = "antoniosreda"
    }

    stages {

        stage('Git Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/Antonios-Reda/Team2.git'
            }
        }

        stage('Install dependencies') {
            steps {
                sh '''
                set -e
                cd Backend && npm ci
                cd ../Ng-frontend && npm ci
                cd ../WebRTC_Signaling_Server && npm ci
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                set -e
                cd Backend
                cp .env_test .env
                export NODE_ENV=test
                npm test
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                set -e
                cd Backend
                cp .env_deploy .env

                cd ../Ng-frontend
                npx ng build --configuration production

                cd ../WebRTC_Signaling_Server
                npm run build || true
                '''
            }
        }

        stage('Remove Previous Docker Images If Exists') {
            steps {
                sh '''
                docker rmi telemedicine_webrtc_server telemedicine_frontend telemedicine_backend 2>/dev/null || true
                docker rmi antoniosreda/telemedicine-webrtc_server 2>/dev/null || true
                docker rmi antoniosreda/telemedicine-frontend 2>/dev/null || true
                docker rmi antoniosreda/telemedicine-backend 2>/dev/null || true
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                docker build -t telemedicine-backend:latest ./Backend
                docker build -t telemedicine-frontend:latest ./Ng-frontend
                docker build -t telemedicine-webrtc_server:latest ./WebRTC_Signaling_Server
                '''
            }
        }

        stage('Tag Docker Images') {
            steps {
                sh '''
                docker tag telemedicine-webrtc_server:latest $DOCKER_USER/telemedicine-webrtc_server:$IMAGE_TAG
                docker tag telemedicine-frontend:latest $DOCKER_USER/telemedicine-frontend:$IMAGE_TAG
                docker tag telemedicine-backend:latest $DOCKER_USER/telemedicine-backend:$IMAGE_TAG
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh '''
                echo $DOCKERHUB_PASS | docker login -u $DOCKER_USER --password-stdin

                docker push $DOCKER_USER/telemedicine-webrtc_server:$IMAGE_TAG
                docker push $DOCKER_USER/telemedicine-frontend:$IMAGE_TAG
                docker push $DOCKER_USER/telemedicine-backend:$IMAGE_TAG
                '''
            }
        }

        stage('Deploy with Ansible') {
            steps {
                ansiblePlaybook(
                    installation: 'Ansible',
                    inventory: './ansible_deployment/ansible_inventory',
                    playbook: './ansible_deployment/ansible_deploy.yml',
                    colorized: true,
                    disableHostKeyChecking: true
                )
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}