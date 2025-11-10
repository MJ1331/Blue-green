pipeline {
    agent any
    environment {
        IMAGE = 'junaidh1331/my-node-app'
        DOCKER_CREDS = credentials('docker-hub-creds')
        DEPLOY_DIR = 'C:/blue-green-deploy'
    }
    parameters {
        string(name: 'VERSION', defaultValue: 'v2', description: 'Docker image tag')
        choice(name: 'TARGET_ENV', choices: ['green', 'blue'], description: 'Deploy to inactive env')
    }
    stages {
        stage('Build & Push') {
    steps {
        script {
            bat "docker build -t ${IMAGE}:${params.VERSION} ."
            withCredentials([usernamePassword(credentialsId: 'docker-pas', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                bat "echo %PASS% | docker login -u %USER% --password-stdin"
                bat "docker push ${IMAGE}:${params.VERSION}"
            }
        }
    }
}
        stage('Deploy to Target') {
            steps {
                script {
                    def port = params.TARGET_ENV == 'blue' ? '3001' : '3002'
                    bat """
                        docker stop ${params.TARGET_ENV} || exit 0
                        docker rm ${params.TARGET_ENV} || exit 0
                        docker run -d --name ${params.TARGET_ENV} -p ${port}:3000 ${IMAGE}:${params.VERSION}
                    """
                }
            }
        }
        stage('Health Check') {
            steps {
                script {
                    def port = params.TARGET_ENV == 'blue' ? '3001' : '3002'
                    bat "curl -f http://localhost:${port} || exit 1"
                    echo "${params.TARGET_ENV} is healthy!"
                }
            }
        }
        stage('Switch Traffic') {
            steps {
                script {
                    def target = params.TARGET_ENV == 'blue' ? 'blue:3000' : 'green:3000'
                    bat """
                        powershell -Command "(Get-Content ${DEPLOY_DIR}\\nginx.conf) -replace 'server .*;', 'server ${target};' | Set-Content ${DEPLOY_DIR}\\nginx.conf"
                        docker restart nginx
                    """
                    echo "Traffic switched to ${params.TARGET_ENV} (${params.VERSION})"
                }
            }
        }
    }
    post {
        failure {
            echo "Deployment failed! Rolling back..."
            // Optional: switch back to old env
        }
    }
}